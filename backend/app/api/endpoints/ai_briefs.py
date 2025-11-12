"""
AI Project Brief Generation Endpoints
Smart Project Brief feature
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import User, ProjectBrief
from app.schemas.schemas import ProjectBriefCreate, ProjectBriefResponse, AIBriefGeneration
from app.core.security import get_current_user
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/generate", response_model=AIBriefGeneration)
async def generate_project_brief(
    brief_data: ProjectBriefCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an AI-powered project brief from raw description

    This endpoint:
    1. Takes the user's raw description and project type
    2. Uses AI (GPT-4 or Claude) to generate structured brief
    3. Returns the structured data for preview (doesn't save yet)
    """

    # Only business users can create project briefs
    if current_user.role.value not in ["business", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business users can create project briefs"
        )

    try:
        # Generate brief using AI service
        result = ai_service.generate_project_brief(
            raw_description=brief_data.raw_description,
            project_type=brief_data.project_type,
            reference_context=""  # TODO: Add file parsing in future
        )

        return AIBriefGeneration(**result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate project brief: {str(e)}"
        )


@router.post("/save", response_model=ProjectBriefResponse)
async def save_project_brief(
    brief_create: ProjectBriefCreate,
    ai_data: AIBriefGeneration,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save an AI-generated project brief to database

    This is called after the user reviews and approves the AI-generated brief
    """

    if current_user.role.value not in ["business", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business users can create project briefs"
        )

    try:
        # Create ProjectBrief database record
        db_brief = ProjectBrief(
            user_id=current_user.id,
            raw_description=brief_create.raw_description,
            project_type=brief_create.project_type,
            reference_files=brief_create.reference_files or [],
            goal=ai_data.goal,
            deliverables=ai_data.deliverables,
            tech_stack=ai_data.tech_stack,
            steps=ai_data.steps,
            estimated_timeline=ai_data.estimated_timeline,
            estimated_budget_min=ai_data.estimated_budget_min,
            estimated_budget_max=ai_data.estimated_budget_max,
            required_skills=ai_data.required_skills,
            ai_model_used=ai_data.get("ai_model_used"),
            confidence_score=ai_data.confidence_score,
            status="draft"
        )

        db.add(db_brief)
        db.commit()
        db.refresh(db_brief)

        return db_brief

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save project brief: {str(e)}"
        )


@router.get("/my-briefs", response_model=List[ProjectBriefResponse])
async def get_my_briefs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all project briefs created by the current user"""

    briefs = db.query(ProjectBrief).filter(
        ProjectBrief.user_id == current_user.id
    ).order_by(ProjectBrief.created_at.desc()).all()

    return briefs


@router.get("/{brief_id}", response_model=ProjectBriefResponse)
async def get_brief(
    brief_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project brief by ID"""

    brief = db.query(ProjectBrief).filter(
        ProjectBrief.id == brief_id,
        ProjectBrief.user_id == current_user.id
    ).first()

    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project brief not found"
        )

    return brief


@router.post("/{brief_id}/regenerate", response_model=AIBriefGeneration)
async def regenerate_brief(
    brief_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate AI brief from saved brief data"""

    brief = db.query(ProjectBrief).filter(
        ProjectBrief.id == brief_id,
        ProjectBrief.user_id == current_user.id
    ).first()

    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project brief not found"
        )

    try:
        # Regenerate with AI
        result = ai_service.generate_project_brief(
            raw_description=brief.raw_description,
            project_type=brief.project_type,
            reference_context=""
        )

        # Update the existing brief
        brief.goal = result["goal"]
        brief.deliverables = result["deliverables"]
        brief.tech_stack = result["tech_stack"]
        brief.steps = result["steps"]
        brief.estimated_timeline = result["estimated_timeline"]
        brief.estimated_budget_min = result["estimated_budget_min"]
        brief.estimated_budget_max = result["estimated_budget_max"]
        brief.required_skills = result["required_skills"]
        brief.ai_model_used = result.get("ai_model_used")
        brief.confidence_score = result["confidence_score"]

        db.commit()
        db.refresh(brief)

        return AIBriefGeneration(**result)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate brief: {str(e)}"
        )


@router.delete("/{brief_id}")
async def delete_brief(
    brief_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project brief"""

    brief = db.query(ProjectBrief).filter(
        ProjectBrief.id == brief_id,
        ProjectBrief.user_id == current_user.id
    ).first()

    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project brief not found"
        )

    db.delete(brief)
    db.commit()

    return {"message": "Project brief deleted successfully"}
