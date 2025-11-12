"""
Escrow API endpoints - Handles escrow fund management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.db.database import get_db
from app.models.models import Escrow, User, Project, Payment
from app.schemas.schemas import (
    EscrowCreate, EscrowResponse, EscrowRelease,
    EscrowDispute, EscrowRefund
)
from app.api.dependencies import get_current_user
from app.services.escrow_service import EscrowService
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/escrows", tags=["escrows"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=EscrowResponse, status_code=status.HTTP_201_CREATED)
async def create_escrow(
    escrow_data: EscrowCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create escrow (usually called automatically after payment)
    Manual creation allowed for admins
    """
    # Verify payment exists
    payment = db.query(Payment).filter(Payment.id == escrow_data.payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # Verify user is payer or admin
    from app.models.models import UserRole
    if payment.payer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only payer or admin can create escrow"
        )

    try:
        escrow_service = EscrowService(db)
        escrow = escrow_service.create_escrow(
            payment_id=escrow_data.payment_id,
            project_id=escrow_data.project_id,
            amount=escrow_data.amount,
            release_condition=escrow_data.release_condition
        )
        return escrow

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Escrow creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create escrow"
        )


@router.get("/", response_model=List[EscrowResponse])
async def list_escrows(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all escrows for current user
    """
    escrow_service = EscrowService(db)
    escrows = escrow_service.get_user_escrows(current_user.id)
    return escrows


@router.get("/held", response_model=List[EscrowResponse])
async def list_held_escrows(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all held escrows where user is payee
    Useful for seeing pending payments awaiting release
    """
    escrow_service = EscrowService(db)
    escrows = escrow_service.get_held_escrows_for_user(current_user.id)
    return escrows


@router.get("/{escrow_id}", response_model=EscrowResponse)
async def get_escrow(
    escrow_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get escrow details
    User must be involved in the payment
    """
    escrow_service = EscrowService(db)
    escrow = escrow_service.get_escrow_by_id(escrow_id)

    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )

    # Verify user has access
    payment = db.query(Payment).filter(Payment.id == escrow.payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated payment not found"
        )

    if payment.payer_id != current_user.id and payment.payee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this escrow"
        )

    return escrow


@router.post("/{escrow_id}/release", response_model=EscrowResponse)
async def release_escrow(
    escrow_id: int,
    release_data: EscrowRelease,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Release escrowed funds to payee
    Can be triggered by project owner after proof verification
    """
    escrow_service = EscrowService(db)
    escrow = escrow_service.get_escrow_by_id(escrow_id)

    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )

    # Verify user is the payer (project owner)
    payment = db.query(Payment).filter(Payment.id == escrow.payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated payment not found"
        )

    if payment.payer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the payer can release escrow"
        )

    try:
        released_escrow = escrow_service.release_escrow(
            escrow_id=escrow_id,
            proof_id=release_data.proof_id
        )

        # Create notifications
        from app.models.models import Notification

        # Notify payee
        notification = Notification(
            user_id=payment.payee_id,
            title="Funds Released",
            message=f"Escrow funds of ${released_escrow.freelancer_amount + released_escrow.agent_amount} have been released to you.",
            type="payment",
            notification_data={"escrow_id": escrow_id, "payment_id": payment.id}
        )
        db.add(notification)
        db.commit()

        return released_escrow

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Escrow release failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to release escrow"
        )


@router.post("/{escrow_id}/dispute", response_model=EscrowResponse)
async def dispute_escrow(
    escrow_id: int,
    dispute_data: EscrowDispute,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Open a dispute for escrowed funds
    Can be done by payer or payee
    """
    escrow_service = EscrowService(db)
    escrow = escrow_service.get_escrow_by_id(escrow_id)

    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )

    # Verify user is involved in the payment
    payment = db.query(Payment).filter(Payment.id == escrow.payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated payment not found"
        )

    if payment.payer_id != current_user.id and payment.payee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only payer or payee can dispute escrow"
        )

    try:
        disputed_escrow = escrow_service.dispute_escrow(
            escrow_id=escrow_id,
            reason=dispute_data.reason
        )

        # Create notifications for both parties
        from app.models.models import Notification

        # Notify payer
        payer_notification = Notification(
            user_id=payment.payer_id,
            title="Escrow Disputed",
            message=f"Escrow for payment ${escrow.amount} has been disputed. Reason: {dispute_data.reason}",
            type="dispute",
            notification_data={"escrow_id": escrow_id, "payment_id": payment.id}
        )
        db.add(payer_notification)

        # Notify payee
        payee_notification = Notification(
            user_id=payment.payee_id,
            title="Escrow Disputed",
            message=f"Escrow for payment ${escrow.amount} has been disputed. Reason: {dispute_data.reason}",
            type="dispute",
            notification_data={"escrow_id": escrow_id, "payment_id": payment.id}
        )
        db.add(payee_notification)
        db.commit()

        return disputed_escrow

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Escrow dispute failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to dispute escrow"
        )


@router.post("/{escrow_id}/refund", response_model=EscrowResponse)
async def refund_escrow(
    escrow_id: int,
    refund_data: EscrowRefund,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refund escrowed funds to payer
    Can be done by payer or admin
    Note: This also triggers a Stripe refund
    """
    escrow_service = EscrowService(db)
    escrow = escrow_service.get_escrow_by_id(escrow_id)

    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow not found"
        )

    # Verify user is payer or admin
    payment = db.query(Payment).filter(Payment.id == escrow.payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated payment not found"
        )

    from app.models.models import UserRole
    if payment.payer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only payer or admin can refund escrow"
        )

    try:
        # Refund through Stripe first
        payment_service = PaymentService(db)
        payment_service.refund_payment(
            payment_id=payment.id,
            reason=refund_data.reason
        )

        # Then update escrow status
        refunded_escrow = escrow_service.refund_escrow(
            escrow_id=escrow_id,
            reason=refund_data.reason
        )

        # Notify both parties
        from app.models.models import Notification

        # Notify payer
        payer_notification = Notification(
            user_id=payment.payer_id,
            title="Escrow Refunded",
            message=f"Escrow of ${escrow.amount} has been refunded to you.",
            type="payment",
            notification_data={"escrow_id": escrow_id, "payment_id": payment.id}
        )
        db.add(payer_notification)

        # Notify payee
        payee_notification = Notification(
            user_id=payment.payee_id,
            title="Escrow Refunded",
            message=f"Escrow of ${escrow.amount} has been refunded to the payer.",
            type="payment",
            notification_data={"escrow_id": escrow_id, "payment_id": payment.id}
        )
        db.add(payee_notification)
        db.commit()

        return refunded_escrow

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Escrow refund failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refund escrow"
        )


@router.get("/project/{project_id}", response_model=List[EscrowResponse])
async def get_project_escrows(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all escrows for a project
    User must be project owner or involved in payments
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    escrow_service = EscrowService(db)
    escrows = escrow_service.get_project_escrows(project_id)

    # Filter to only show escrows user is involved in
    user_escrows = []
    for escrow in escrows:
        payment = db.query(Payment).filter(Payment.id == escrow.payment_id).first()
        if payment and (payment.payer_id == current_user.id or payment.payee_id == current_user.id or project.owner_id == current_user.id):
            user_escrows.append(escrow)

    return user_escrows
