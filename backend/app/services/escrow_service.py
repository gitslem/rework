"""
Escrow Service - Handles fund holding, release, and dispute management
"""
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.models import (
    Escrow, EscrowStatus, Payment, PaymentStatus, Project,
    User, Profile, ProofOfBuild, AgentAssignment
)
from app.schemas.schemas import EscrowCreate


class EscrowService:
    """Service for handling escrow operations"""

    def __init__(self, db: Session):
        self.db = db

    def calculate_distribution(self, amount: float) -> tuple[float, float]:
        """
        Calculate platform fee and net payout

        Args:
            amount: Total escrow amount

        Returns:
            tuple: (platform_fee, net_amount)
        """
        platform_fee = Decimal(str(amount)) * Decimal('0.001')  # 0.1% fee
        net_amount = Decimal(str(amount)) - platform_fee
        return float(platform_fee), float(net_amount)

    def create_escrow(
        self,
        payment_id: int,
        project_id: int,
        amount: float,
        release_condition: str = "proof_verified"
    ) -> Escrow:
        """
        Hold funds in escrow after payment

        Args:
            payment_id: ID of the associated payment
            project_id: ID of the project
            amount: Amount to hold in escrow
            release_condition: Condition for release ("proof_verified", "completion_confirmed", "manual")

        Returns:
            Created Escrow object
        """
        # Verify payment exists and is completed
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise ValueError(f"Payment {payment_id} not found")

        if payment.status != PaymentStatus.COMPLETED:
            raise ValueError("Payment must be completed before creating escrow")

        # Check if escrow already exists for this payment
        existing_escrow = self.db.query(Escrow).filter(
            Escrow.payment_id == payment_id
        ).first()
        if existing_escrow:
            raise ValueError(f"Escrow already exists for payment {payment_id}")

        # Verify project exists
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        # Calculate distribution
        platform_fee, net_amount = self.calculate_distribution(amount)

        # Check if there's an agent assignment for this project
        agent_assignment = self.db.query(AgentAssignment).filter(
            AgentAssignment.project_id == project_id
        ).first()

        if agent_assignment:
            # Split between agent and freelancer
            agent_amount = net_amount * 0.75  # Agent gets 75%
            freelancer_amount = net_amount * 0.25  # Freelancer gets 25%
        else:
            # All goes to freelancer
            agent_amount = 0.0
            freelancer_amount = net_amount

        # Create escrow record
        escrow = Escrow(
            payment_id=payment_id,
            project_id=project_id,
            amount=amount,
            platform_fee=platform_fee,
            freelancer_amount=freelancer_amount,
            agent_amount=agent_amount,
            status=EscrowStatus.HELD,
            release_condition=release_condition
        )

        self.db.add(escrow)
        self.db.commit()
        self.db.refresh(escrow)

        return escrow

    def release_escrow(
        self,
        escrow_id: int,
        proof_id: Optional[int] = None
    ) -> Escrow:
        """
        Release escrowed funds to payee(s)

        Args:
            escrow_id: ID of the escrow
            proof_id: Optional ID of proof-of-build verification

        Returns:
            Updated Escrow object
        """
        escrow = self.db.query(Escrow).filter(Escrow.id == escrow_id).first()
        if not escrow:
            raise ValueError(f"Escrow {escrow_id} not found")

        if escrow.status != EscrowStatus.HELD:
            raise ValueError(f"Escrow is not in HELD status (current: {escrow.status})")

        if escrow.is_disputed:
            raise ValueError("Cannot release disputed escrow")

        # Verify proof if provided
        if proof_id:
            proof = self.db.query(ProofOfBuild).filter(
                ProofOfBuild.id == proof_id
            ).first()
            if not proof:
                raise ValueError(f"Proof {proof_id} not found")
            escrow.proof_id = proof_id

        # Update escrow status
        escrow.status = EscrowStatus.RELEASED
        escrow.released_at = datetime.utcnow()

        # Update payment status
        payment = self.db.query(Payment).filter(
            Payment.id == escrow.payment_id
        ).first()
        if payment:
            payment.status = PaymentStatus.COMPLETED
            payment.processed_at = datetime.utcnow()

        # Update payee earnings
        if escrow.freelancer_amount > 0:
            freelancer_profile = self.db.query(Profile).filter(
                Profile.user_id == payment.payee_id
            ).first()
            if freelancer_profile:
                freelancer_profile.total_earnings += escrow.freelancer_amount
                freelancer_profile.completed_projects += 1

        # Update agent earnings if applicable
        if escrow.agent_amount > 0:
            agent_assignment = self.db.query(AgentAssignment).filter(
                AgentAssignment.project_id == escrow.project_id
            ).first()
            if agent_assignment:
                agent_profile = self.db.query(Profile).filter(
                    Profile.user_id == agent_assignment.agent_id
                ).first()
                if agent_profile:
                    agent_profile.total_earnings += escrow.agent_amount
                    agent_profile.completed_projects += 1

        # Update project status
        project = self.db.query(Project).filter(
            Project.id == escrow.project_id
        ).first()
        if project:
            from app.models.models import ProjectStatus
            project.status = ProjectStatus.COMPLETED

        self.db.commit()
        self.db.refresh(escrow)

        return escrow

    def dispute_escrow(
        self,
        escrow_id: int,
        reason: str
    ) -> Escrow:
        """
        Open a dispute for escrowed funds

        Args:
            escrow_id: ID of the escrow
            reason: Reason for dispute

        Returns:
            Updated Escrow object
        """
        escrow = self.db.query(Escrow).filter(Escrow.id == escrow_id).first()
        if not escrow:
            raise ValueError(f"Escrow {escrow_id} not found")

        if escrow.status != EscrowStatus.HELD:
            raise ValueError("Can only dispute escrows in HELD status")

        escrow.status = EscrowStatus.DISPUTED
        escrow.is_disputed = True
        escrow.dispute_reason = reason

        self.db.commit()
        self.db.refresh(escrow)

        return escrow

    def refund_escrow(
        self,
        escrow_id: int,
        reason: Optional[str] = None
    ) -> Escrow:
        """
        Refund escrowed funds to payer

        Args:
            escrow_id: ID of the escrow
            reason: Reason for refund

        Returns:
            Updated Escrow object
        """
        escrow = self.db.query(Escrow).filter(Escrow.id == escrow_id).first()
        if not escrow:
            raise ValueError(f"Escrow {escrow_id} not found")

        if escrow.status == EscrowStatus.RELEASED:
            raise ValueError("Cannot refund already released escrow")

        # Update escrow status
        escrow.status = EscrowStatus.REFUNDED
        escrow.dispute_reason = reason

        # Note: Actual Stripe refund should be handled by PaymentService
        # This just updates the escrow status

        self.db.commit()
        self.db.refresh(escrow)

        return escrow

    def get_escrow_by_id(self, escrow_id: int) -> Optional[Escrow]:
        """Get escrow by ID"""
        return self.db.query(Escrow).filter(Escrow.id == escrow_id).first()

    def get_escrow_by_payment(self, payment_id: int) -> Optional[Escrow]:
        """Get escrow by payment ID"""
        return self.db.query(Escrow).filter(Escrow.payment_id == payment_id).first()

    def get_project_escrows(self, project_id: int) -> list[Escrow]:
        """Get all escrows for a project"""
        return self.db.query(Escrow).filter(
            Escrow.project_id == project_id
        ).order_by(Escrow.created_at.desc()).all()

    def get_user_escrows(self, user_id: int) -> list[Escrow]:
        """
        Get all escrows where user is involved (as payer or payee)

        Args:
            user_id: User ID

        Returns:
            List of Escrow objects
        """
        return self.db.query(Escrow).join(Payment).filter(
            (Payment.payer_id == user_id) | (Payment.payee_id == user_id)
        ).order_by(Escrow.created_at.desc()).all()

    def get_held_escrows_for_user(self, user_id: int) -> list[Escrow]:
        """
        Get all held escrows where user is the payee

        Args:
            user_id: User ID

        Returns:
            List of Escrow objects in HELD status
        """
        return self.db.query(Escrow).join(Payment).filter(
            Payment.payee_id == user_id,
            Escrow.status == EscrowStatus.HELD
        ).order_by(Escrow.created_at.desc()).all()
