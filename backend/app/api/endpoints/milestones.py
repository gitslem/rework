from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging

from app.db.database import get_db
from app.models.models import (
    User, Project, Milestone, ProofOfBuild, ProofApproval, Escrow,
    MilestoneStatus, ApprovalStatus, ProofStatus, EscrowStatus
)
from app.schemas.schemas import (
    MilestoneCreate, MilestoneUpdate, MilestoneResponse,
    ProofApprovalCreate, ProofApprovalUpdate, ProofApprovalResponse,
    MilestoneReviewRequest, MilestoneApprovalRequest
)
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/milestones", tags=["milestones"])


# Milestone CRUD Operations
@router.post("/", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def create_milestone(
    milestone_data: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new milestone (project owner only)"""
    # Check if project exists and user is owner
    project = db.query(Project).filter(Project.id == milestone_data.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can create milestones"
        )

    # Check if milestone number already exists for this project
    existing = db.query(Milestone).filter(
        Milestone.project_id == milestone_data.project_id,
        Milestone.milestone_number == milestone_data.milestone_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone number {milestone_data.milestone_number} already exists for this project"
        )

    # Calculate budget amount based on project budget
    budget_amount = None
    if milestone_data.budget_percentage > 0:
        budget_amount = (project.budget * milestone_data.budget_percentage) / 100

    # Create milestone
    milestone = Milestone(
        **milestone_data.model_dump(),
        budget_amount=budget_amount,
        status=MilestoneStatus.PENDING
    )

    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    logger.info(f"Created milestone {milestone.id} for project {project.id}")
    return milestone


@router.get("/", response_model=List[MilestoneResponse])
def get_milestones(
    project_id: Optional[int] = None,
    status: Optional[MilestoneStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get milestones with optional filters"""
    query = db.query(Milestone)

    if project_id:
        # Verify user has access to this project
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check if user is project owner or has accepted application
        from app.models.models import Application, ApplicationStatus
        is_owner = project.owner_id == current_user.id
        is_accepted = db.query(Application).filter(
            Application.project_id == project_id,
            Application.applicant_id == current_user.id,
            Application.status == ApplicationStatus.ACCEPTED
        ).first() is not None

        if not is_owner and not is_accepted:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view milestones for this project"
            )

        query = query.filter(Milestone.project_id == project_id)

    if status:
        query = query.filter(Milestone.status == status)

    milestones = query.order_by(Milestone.milestone_number).all()
    return milestones


@router.get("/{milestone_id}", response_model=MilestoneResponse)
def get_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific milestone by ID"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )

    # Check authorization
    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    from app.models.models import Application, ApplicationStatus
    is_owner = project.owner_id == current_user.id
    is_accepted = db.query(Application).filter(
        Application.project_id == milestone.project_id,
        Application.applicant_id == current_user.id,
        Application.status == ApplicationStatus.ACCEPTED
    ).first() is not None

    if not is_owner and not is_accepted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this milestone"
        )

    return milestone


@router.patch("/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(
    milestone_id: int,
    milestone_data: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a milestone (project owner only)"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )

    # Check if user is project owner
    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can update milestones"
        )

    # Update fields
    update_data = milestone_data.model_dump(exclude_unset=True)

    # Recalculate budget amount if budget_percentage changed
    if 'budget_percentage' in update_data and update_data['budget_percentage'] is not None:
        milestone.budget_amount = (project.budget * update_data['budget_percentage']) / 100

    for field, value in update_data.items():
        setattr(milestone, field, value)

    db.commit()
    db.refresh(milestone)

    logger.info(f"Updated milestone {milestone_id}")
    return milestone


@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a milestone (project owner only)"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )

    # Check if user is project owner
    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can delete milestones"
        )

    # Don't allow deletion if milestone has approved proofs
    approved_proofs = db.query(ProofApproval).join(ProofOfBuild).filter(
        ProofOfBuild.milestone_id == milestone_id,
        ProofApproval.status == ApprovalStatus.APPROVED
    ).count()

    if approved_proofs > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete milestone with approved proofs"
        )

    db.delete(milestone)
    db.commit()

    logger.info(f"Deleted milestone {milestone_id}")
    return None


# Milestone Review Workflow
@router.post("/{milestone_id}/submit-for-review", response_model=MilestoneResponse)
def submit_milestone_for_review(
    milestone_id: int,
    review_request: MilestoneReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit milestone for review (freelancer/assigned user only)"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )

    # Check if user is accepted freelancer on this project
    from app.models.models import Application, ApplicationStatus
    is_accepted = db.query(Application).filter(
        Application.project_id == milestone.project_id,
        Application.applicant_id == current_user.id,
        Application.status == ApplicationStatus.ACCEPTED
    ).first() is not None

    if not is_accepted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only assigned freelancers can submit milestones for review"
        )

    # Verify all proofs exist and belong to this project
    proofs = db.query(ProofOfBuild).filter(
        ProofOfBuild.id.in_(review_request.proof_ids),
        ProofOfBuild.project_id == milestone.project_id,
        ProofOfBuild.user_id == current_user.id
    ).all()

    if len(proofs) != len(review_request.proof_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some proofs not found or do not belong to you/this project"
        )

    # Link proofs to milestone
    for proof in proofs:
        proof.milestone_id = milestone_id

    # Update milestone proof_ids
    milestone.proof_ids = review_request.proof_ids
    milestone.status = MilestoneStatus.IN_REVIEW

    db.commit()
    db.refresh(milestone)

    logger.info(f"Milestone {milestone_id} submitted for review")
    return milestone


@router.post("/{milestone_id}/approve-or-reject", response_model=MilestoneResponse)
def approve_or_reject_milestone(
    milestone_id: int,
    approval_request: MilestoneApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve or reject a milestone (project owner only)"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )

    # Check if user is project owner
    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can approve/reject milestones"
        )

    if milestone.status != MilestoneStatus.IN_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Milestone must be in review status"
        )

    if approval_request.approved:
        milestone.status = MilestoneStatus.APPROVED
        milestone.completion_date = datetime.utcnow()

        # Approve all proofs associated with this milestone
        proofs = db.query(ProofOfBuild).filter(ProofOfBuild.milestone_id == milestone_id).all()
        for proof in proofs:
            # Create or update approval record
            approval = db.query(ProofApproval).filter(ProofApproval.proof_id == proof.id).first()
            if not approval:
                approval = ProofApproval(
                    proof_id=proof.id,
                    milestone_id=milestone_id,
                    project_id=milestone.project_id,
                    reviewer_id=current_user.id,
                    status=ApprovalStatus.APPROVED,
                    feedback=approval_request.feedback,
                    approved_at=datetime.utcnow()
                )
                db.add(approval)
            else:
                approval.status = ApprovalStatus.APPROVED
                approval.feedback = approval_request.feedback
                approval.approved_at = datetime.utcnow()

        # Release payment if requested and escrow exists
        if approval_request.release_payment and milestone.escrow_id:
            escrow = db.query(Escrow).filter(Escrow.id == milestone.escrow_id).first()
            if escrow and escrow.status == EscrowStatus.HELD:
                escrow.status = EscrowStatus.RELEASED
                escrow.released_at = datetime.utcnow()
                milestone.payment_released = True
                milestone.payment_released_at = datetime.utcnow()
                logger.info(f"Released escrow {escrow.id} for milestone {milestone_id}")
    else:
        milestone.status = MilestoneStatus.REJECTED

        # Reject all proofs or request revision
        proofs = db.query(ProofOfBuild).filter(ProofOfBuild.milestone_id == milestone_id).all()
        for proof in proofs:
            approval = db.query(ProofApproval).filter(ProofApproval.proof_id == proof.id).first()
            if not approval:
                approval = ProofApproval(
                    proof_id=proof.id,
                    milestone_id=milestone_id,
                    project_id=milestone.project_id,
                    reviewer_id=current_user.id,
                    status=ApprovalStatus.REJECTED,
                    feedback=approval_request.feedback,
                    rejected_at=datetime.utcnow()
                )
                db.add(approval)
            else:
                approval.status = ApprovalStatus.REJECTED
                approval.feedback = approval_request.feedback
                approval.rejected_at = datetime.utcnow()

    db.commit()
    db.refresh(milestone)

    logger.info(f"Milestone {milestone_id} {'approved' if approval_request.approved else 'rejected'}")
    return milestone


# Proof Approval Operations
@router.post("/approvals", response_model=ProofApprovalResponse, status_code=status.HTTP_201_CREATED)
def create_proof_approval(
    approval_data: ProofApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a proof approval record (project owner only)"""
    # Verify proof exists
    proof = db.query(ProofOfBuild).filter(ProofOfBuild.id == approval_data.proof_id).first()
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof not found"
        )

    # Check if user is project owner
    project = db.query(Project).filter(Project.id == proof.project_id).first()
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can create proof approvals"
        )

    # Check if approval already exists
    existing = db.query(ProofApproval).filter(ProofApproval.proof_id == approval_data.proof_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approval already exists for this proof. Use update endpoint instead."
        )

    # Create approval
    approval = ProofApproval(
        proof_id=approval_data.proof_id,
        milestone_id=approval_data.milestone_id,
        project_id=proof.project_id,
        reviewer_id=current_user.id,
        status=ApprovalStatus[approval_data.status.upper()],
        feedback=approval_data.feedback,
        revision_notes=approval_data.revision_notes
    )

    # Set timestamps based on status
    if approval.status == ApprovalStatus.APPROVED:
        approval.approved_at = datetime.utcnow()
    elif approval.status == ApprovalStatus.REJECTED:
        approval.rejected_at = datetime.utcnow()

    db.add(approval)
    db.commit()
    db.refresh(approval)

    logger.info(f"Created approval {approval.id} for proof {proof.id}")
    return approval


@router.get("/approvals/{proof_id}", response_model=ProofApprovalResponse)
def get_proof_approval(
    proof_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get approval for a specific proof"""
    approval = db.query(ProofApproval).filter(ProofApproval.proof_id == proof_id).first()
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval not found for this proof"
        )

    # Check authorization
    proof = db.query(ProofOfBuild).filter(ProofOfBuild.id == proof_id).first()
    project = db.query(Project).filter(Project.id == proof.project_id).first()

    from app.models.models import Application, ApplicationStatus
    is_owner = project.owner_id == current_user.id
    is_proof_owner = proof.user_id == current_user.id
    is_accepted = db.query(Application).filter(
        Application.project_id == proof.project_id,
        Application.applicant_id == current_user.id,
        Application.status == ApplicationStatus.ACCEPTED
    ).first() is not None

    if not (is_owner or is_proof_owner or is_accepted):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this approval"
        )

    return approval


@router.patch("/approvals/{proof_id}", response_model=ProofApprovalResponse)
def update_proof_approval(
    proof_id: int,
    approval_data: ProofApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update proof approval (project owner only)"""
    approval = db.query(ProofApproval).filter(ProofApproval.proof_id == proof_id).first()
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval not found"
        )

    # Check if user is project owner
    project = db.query(Project).filter(Project.id == approval.project_id).first()
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can update approvals"
        )

    # Update fields
    update_data = approval_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == 'status' and value:
            approval.status = ApprovalStatus[value.upper()]
            # Update timestamps
            if approval.status == ApprovalStatus.APPROVED:
                approval.approved_at = datetime.utcnow()
                approval.rejected_at = None
            elif approval.status == ApprovalStatus.REJECTED:
                approval.rejected_at = datetime.utcnow()
                approval.approved_at = None
        else:
            setattr(approval, field, value)

    db.commit()
    db.refresh(approval)

    logger.info(f"Updated approval {approval.id} for proof {proof_id}")
    return approval


# AI Summary Generation
@router.get("/{milestone_id}/ai-summary")
def generate_milestone_ai_summary(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate an AI-powered summary of a milestone's work based on proofs.
    Useful for milestone review and approval.
    """
    from app.services.ai_summary_service import ai_summary_service

    # Get milestone
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()

    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )

    # Get project to check authorization
    project = db.query(Project).filter(Project.id == milestone.project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check authorization: must be project owner or assigned freelancer
    is_owner = project.company_id == current_user.id
    is_freelancer = project.freelancer_id == current_user.id

    if not is_owner and not is_freelancer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this milestone"
        )

    # Get all proofs for this milestone
    proofs = db.query(ProofOfBuild).filter(
        ProofOfBuild.milestone_id == milestone_id
    ).all()

    if not proofs:
        return {
            "milestone_id": milestone_id,
            "summary": f"No proofs submitted yet for milestone: {milestone.title}",
            "proof_count": 0
        }

    # Convert proofs to dictionaries
    proof_dicts = []
    for proof in proofs:
        proof_dict = {
            "id": proof.id,
            "proof_type": proof.proof_type.value,
            "description": proof.description,
            "status": proof.status.value,
            "verified_at": proof.verified_at.isoformat() if proof.verified_at else None,
            "verification_metadata": proof.verification_metadata or {}
        }
        proof_dicts.append(proof_dict)

    # Prepare milestone data
    milestone_data = {
        "id": milestone.id,
        "title": milestone.title,
        "description": milestone.description,
        "milestone_number": milestone.milestone_number,
        "status": milestone.status.value
    }

    # Generate AI summary
    try:
        summary = ai_summary_service.generate_milestone_summary(
            milestone_data=milestone_data,
            proofs=proof_dicts
        )

        logger.info(f"Generated AI summary for milestone {milestone_id}")

        return {
            "milestone_id": milestone_id,
            "milestone_title": milestone.title,
            "summary": summary,
            "proof_count": len(proofs),
            "verified_count": sum(1 for p in proofs if p.status == ProofStatus.VERIFIED),
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Failed to generate milestone AI summary: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI summary: {str(e)}"
        )


@router.post("/proofs/{proof_id}/ai-summary")
def generate_commit_ai_summary(
    proof_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate an AI-powered summary of a commit proof.
    Useful for understanding individual commits in context.
    """
    from app.services.ai_summary_service import ai_summary_service

    # Get proof
    proof = db.query(ProofOfBuild).filter(ProofOfBuild.id == proof_id).first()

    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof not found"
        )

    # Check authorization
    if proof.user_id != current_user.id:
        # Check if user is project owner
        if proof.project_id:
            project = db.query(Project).filter(Project.id == proof.project_id).first()
            if not project or project.company_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this proof"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this proof"
            )

    # Only generate summaries for commit type proofs
    if proof.proof_type.value != "commit":
        return {
            "proof_id": proof_id,
            "message": f"AI summaries are only available for commit proofs. This is a {proof.proof_type.value} proof.",
            "description": proof.description
        }

    # Prepare commit data
    metadata = proof.verification_metadata or {}

    commit_data = {
        "hash": proof.github_commit_hash,
        "message": metadata.get("commit_message", proof.description),
        "author": metadata.get("author", ""),
        "date": metadata.get("commit_date", ""),
        "changes": {
            "additions": metadata.get("additions", 0),
            "deletions": metadata.get("deletions", 0),
            "files_changed": metadata.get("files_changed", 0)
        }
    }

    # Get project context if available
    context = None
    if proof.project_id:
        project = db.query(Project).filter(Project.id == proof.project_id).first()
        if project:
            context = f"Project: {project.title} - {project.description}"

    try:
        summary = ai_summary_service.generate_commit_summary(
            commits=[commit_data],
            context=context
        )

        logger.info(f"Generated AI summary for proof {proof_id}")

        return {
            "proof_id": proof_id,
            "commit_hash": proof.github_commit_hash,
            "summary": summary,
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Failed to generate commit AI summary: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI summary: {str(e)}"
        )
