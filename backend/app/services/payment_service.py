"""
Payment Service - Handles Stripe integration and payment processing
"""
import stripe
from decimal import Decimal
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.config import settings
from app.models.models import Payment, PaymentStatus, User, Project
from app.schemas.schemas import PaymentIntentCreate, PaymentConfirm


class PaymentService:
    """Service for handling payment operations with Stripe"""

    def __init__(self, db: Session):
        self.db = db
        stripe.api_key = settings.STRIPE_SECRET_KEY

    def calculate_fees(self, amount: float) -> tuple[float, float]:
        """
        Calculate platform fee and net amount
        Platform fee: 0.1% of total amount

        Args:
            amount: Total payment amount

        Returns:
            tuple: (platform_fee, net_amount)
        """
        platform_fee = Decimal(str(amount)) * Decimal('0.001')  # 0.1% fee
        net_amount = Decimal(str(amount)) - platform_fee
        return float(platform_fee), float(net_amount)

    def create_payment_intent(
        self,
        project_id: int,
        amount: float,
        payer_id: int,
        payee_id: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> tuple[Payment, str]:
        """
        Create a Stripe payment intent and Payment record

        Args:
            project_id: ID of the project
            amount: Payment amount in USD
            payer_id: ID of the user making the payment
            payee_id: ID of the user receiving the payment
            metadata: Additional metadata for Stripe

        Returns:
            tuple: (Payment object, client_secret for frontend)
        """
        # Verify project exists
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        # Verify users exist
        payer = self.db.query(User).filter(User.id == payer_id).first()
        payee = self.db.query(User).filter(User.id == payee_id).first()
        if not payer or not payee:
            raise ValueError("Invalid payer or payee")

        # Calculate fees
        platform_fee, net_amount = self.calculate_fees(amount)

        # Create Stripe payment intent
        intent_metadata = {
            "project_id": project_id,
            "payer_id": payer_id,
            "payee_id": payee_id,
            **(metadata or {})
        }

        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency="usd",
                metadata=intent_metadata,
                description=f"Payment for project: {project.title}",
                automatic_payment_methods={"enabled": True}
            )
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")

        # Create Payment record
        payment = Payment(
            project_id=project_id,
            payer_id=payer_id,
            payee_id=payee_id,
            amount=amount,
            platform_fee=platform_fee,
            stripe_payment_intent_id=intent.id,
            status=PaymentStatus.PENDING
        )

        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)

        return payment, intent.client_secret

    def confirm_payment(
        self,
        payment_id: int,
        payment_method_id: str
    ) -> Payment:
        """
        Confirm a payment with Stripe

        Args:
            payment_id: ID of the Payment record
            payment_method_id: Stripe payment method ID

        Returns:
            Updated Payment object
        """
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise ValueError(f"Payment {payment_id} not found")

        if payment.status != PaymentStatus.PENDING:
            raise ValueError(f"Payment is not in PENDING status")

        try:
            # Confirm with Stripe
            intent = stripe.PaymentIntent.confirm(
                payment.stripe_payment_intent_id,
                payment_method=payment_method_id
            )

            # Update payment status
            if intent.status == "succeeded":
                payment.status = PaymentStatus.COMPLETED
                payment.processed_at = datetime.utcnow()
            elif intent.status == "processing":
                payment.status = PaymentStatus.PROCESSING
            else:
                payment.status = PaymentStatus.PENDING

            self.db.commit()
            self.db.refresh(payment)

        except stripe.error.StripeError as e:
            payment.status = PaymentStatus.FAILED
            self.db.commit()
            raise ValueError(f"Payment confirmation failed: {str(e)}")

        return payment

    def get_payment_status(self, payment_intent_id: str) -> str:
        """
        Check payment status with Stripe

        Args:
            payment_intent_id: Stripe payment intent ID

        Returns:
            Payment status string
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent.status
        except stripe.error.StripeError as e:
            raise ValueError(f"Failed to retrieve payment status: {str(e)}")

    def update_payment_from_webhook(
        self,
        payment_intent_id: str,
        status: str
    ) -> Optional[Payment]:
        """
        Update payment status based on Stripe webhook event

        Args:
            payment_intent_id: Stripe payment intent ID
            status: New status from Stripe

        Returns:
            Updated Payment object or None if not found
        """
        payment = self.db.query(Payment).filter(
            Payment.stripe_payment_intent_id == payment_intent_id
        ).first()

        if not payment:
            return None

        # Map Stripe status to PaymentStatus
        if status == "succeeded":
            payment.status = PaymentStatus.COMPLETED
            payment.processed_at = datetime.utcnow()
        elif status == "processing":
            payment.status = PaymentStatus.PROCESSING
        elif status == "payment_failed":
            payment.status = PaymentStatus.FAILED

        self.db.commit()
        self.db.refresh(payment)

        return payment

    def refund_payment(
        self,
        payment_id: int,
        amount: Optional[float] = None,
        reason: Optional[str] = None
    ) -> Payment:
        """
        Refund a payment through Stripe

        Args:
            payment_id: ID of the Payment record
            amount: Amount to refund (None for full refund)
            reason: Reason for refund

        Returns:
            Updated Payment object
        """
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise ValueError(f"Payment {payment_id} not found")

        if payment.status != PaymentStatus.COMPLETED:
            raise ValueError("Can only refund completed payments")

        try:
            refund_amount = int((amount or payment.amount) * 100)  # Convert to cents

            refund = stripe.Refund.create(
                payment_intent=payment.stripe_payment_intent_id,
                amount=refund_amount,
                reason=reason or "requested_by_customer"
            )

            if refund.status == "succeeded":
                payment.status = PaymentStatus.FAILED  # Mark as failed after refund
                self.db.commit()
                self.db.refresh(payment)

        except stripe.error.StripeError as e:
            raise ValueError(f"Refund failed: {str(e)}")

        return payment

    def get_payment_by_id(self, payment_id: int) -> Optional[Payment]:
        """Get payment by ID"""
        return self.db.query(Payment).filter(Payment.id == payment_id).first()

    def get_user_payments(
        self,
        user_id: int,
        as_payer: bool = True,
        as_payee: bool = True
    ) -> list[Payment]:
        """
        Get all payments for a user

        Args:
            user_id: User ID
            as_payer: Include payments where user is payer
            as_payee: Include payments where user is payee

        Returns:
            List of Payment objects
        """
        query = self.db.query(Payment)

        if as_payer and as_payee:
            query = query.filter(
                (Payment.payer_id == user_id) | (Payment.payee_id == user_id)
            )
        elif as_payer:
            query = query.filter(Payment.payer_id == user_id)
        elif as_payee:
            query = query.filter(Payment.payee_id == user_id)

        return query.order_by(Payment.created_at.desc()).all()

    def get_project_payments(self, project_id: int) -> list[Payment]:
        """Get all payments for a project"""
        return self.db.query(Payment).filter(
            Payment.project_id == project_id
        ).order_by(Payment.created_at.desc()).all()
