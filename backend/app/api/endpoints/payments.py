"""
Payment API endpoints - Handles Stripe payment processing
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
import stripe
import logging

from app.db.database import get_db
from app.models.models import Payment, User, Project, PaymentStatus
from app.schemas.schemas import (
    PaymentIntentCreate, PaymentConfirm, PaymentResponse
)
from app.api.dependencies import get_current_user
from app.services.payment_service import PaymentService
from app.services.escrow_service import EscrowService
from app.core.config import settings

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-intent", status_code=status.HTTP_201_CREATED)
async def create_payment_intent(
    payment_data: PaymentIntentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe payment intent for a project
    User must be the project owner (payer)
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == payment_data.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verify user is project owner
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can create payment"
        )

    # Get accepted application to determine payee
    from app.models.models import Application, ApplicationStatus
    accepted_app = db.query(Application).filter(
        Application.project_id == payment_data.project_id,
        Application.status == ApplicationStatus.ACCEPTED
    ).first()

    if not accepted_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No accepted application found for this project"
        )

    try:
        payment_service = PaymentService(db)
        payment, client_secret = payment_service.create_payment_intent(
            project_id=payment_data.project_id,
            amount=payment_data.amount,
            payer_id=current_user.id,
            payee_id=accepted_app.applicant_id,
            metadata=payment_data.metadata
        )

        return {
            "payment_id": payment.id,
            "client_secret": client_secret,
            "amount": payment.amount,
            "platform_fee": payment.platform_fee,
            "status": payment.status
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Payment intent creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment intent"
        )


@router.post("/confirm", response_model=PaymentResponse)
async def confirm_payment(
    payment_data: PaymentConfirm,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Confirm a payment and move to PROCESSING/COMPLETED status
    User must be the payer
    """
    payment_service = PaymentService(db)
    payment = payment_service.get_payment_by_id(payment_data.payment_id)

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # Verify user is the payer
    if payment.payer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the payer can confirm this payment"
        )

    try:
        updated_payment = payment_service.confirm_payment(
            payment_id=payment_data.payment_id,
            payment_method_id=payment_data.payment_method_id
        )
        return updated_payment

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Payment confirmation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm payment"
        )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook events
    This endpoint is called by Stripe to notify us of payment events
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid webhook payload")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    payment_service = PaymentService(db)
    escrow_service = EscrowService(db)

    # Handle the event
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        payment = payment_service.update_payment_from_webhook(
            payment_intent["id"],
            "succeeded"
        )

        if payment:
            # Create escrow when payment succeeds
            try:
                escrow = escrow_service.create_escrow(
                    payment_id=payment.id,
                    project_id=payment.project_id,
                    amount=payment.amount,
                    release_condition="proof_verified"
                )
                logger.info(f"Escrow {escrow.id} created for payment {payment.id}")

                # Create notification for payer and payee
                from app.models.models import Notification

                # Notify payer
                payer_notification = Notification(
                    user_id=payment.payer_id,
                    title="Payment Successful",
                    message=f"Your payment of ${payment.amount} has been processed and held in escrow.",
                    type="payment",
                    notification_data={"payment_id": payment.id, "escrow_id": escrow.id}
                )
                db.add(payer_notification)

                # Notify payee
                payee_notification = Notification(
                    user_id=payment.payee_id,
                    title="Payment Received",
                    message=f"Payment of ${payment.amount} has been received and held in escrow. Complete the work and submit proof to release funds.",
                    type="payment",
                    notification_data={"payment_id": payment.id, "escrow_id": escrow.id}
                )
                db.add(payee_notification)
                db.commit()

            except Exception as e:
                logger.error(f"Failed to create escrow: {str(e)}")

    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        payment = payment_service.update_payment_from_webhook(
            payment_intent["id"],
            "payment_failed"
        )

        if payment:
            # Notify payer of failure
            from app.models.models import Notification
            notification = Notification(
                user_id=payment.payer_id,
                title="Payment Failed",
                message=f"Your payment of ${payment.amount} has failed. Please try again or contact support.",
                type="payment",
                notification_data={"payment_id": payment.id}
            )
            db.add(notification)
            db.commit()

    return {"status": "success"}


@router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all payments for current user (as payer or payee)
    """
    payment_service = PaymentService(db)
    payments = payment_service.get_user_payments(
        user_id=current_user.id,
        as_payer=True,
        as_payee=True
    )
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get payment details
    User must be payer or payee
    """
    payment_service = PaymentService(db)
    payment = payment_service.get_payment_by_id(payment_id)

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # Verify user is involved in the payment
    if payment.payer_id != current_user.id and payment.payee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this payment"
        )

    return payment


@router.get("/project/{project_id}", response_model=List[PaymentResponse])
async def get_project_payments(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all payments for a project
    User must be project owner or involved in payments
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verify user has access
    payment_service = PaymentService(db)
    payments = payment_service.get_project_payments(project_id)

    # Filter to only show payments user is involved in
    user_payments = [
        p for p in payments
        if p.payer_id == current_user.id or p.payee_id == current_user.id or project.owner_id == current_user.id
    ]

    return user_payments


@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: int,
    amount: float = None,
    reason: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refund a payment (full or partial)
    Only project owner (payer) can request refund
    """
    payment_service = PaymentService(db)
    payment = payment_service.get_payment_by_id(payment_id)

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # Verify user is the payer
    if payment.payer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the payer can refund this payment"
        )

    try:
        refunded_payment = payment_service.refund_payment(
            payment_id=payment_id,
            amount=amount,
            reason=reason
        )
        return refunded_payment

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Payment refund failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refund payment"
        )
