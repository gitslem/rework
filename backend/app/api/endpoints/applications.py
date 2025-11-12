from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Application, User, Project, ApplicationStatus, UserRole, Notification
from app.schemas.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to a project"""
    # Check if project exists
    project = db.query(Project).filter(Project.id == application_data.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user already applied
    existing_application = db.query(Application).filter(
        Application.project_id == application_data.project_id,
        Application.applicant_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this project"
        )
    
    # Create application
    new_application = Application(
        applicant_id=current_user.id,
        **application_data.model_dump()
    )

    # Calculate AI match score (simplified - you'd use actual AI here)
    new_application.ai_match_score = calculate_match_score(current_user, project)

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    # Create notification for project owner
    applicant_name = f"{current_user.profile.first_name or 'A freelancer'}"
    if current_user.profile and current_user.profile.first_name and current_user.profile.last_name:
        applicant_name = f"{current_user.profile.first_name} {current_user.profile.last_name}"

    notification = Notification(
        user_id=project.owner_id,
        title="New Application Received",
        message=f"{applicant_name} has applied to your project: {project.title}",
        type="application",
        notification_data={
            "application_id": new_application.id,
            "project_id": project.id,
            "applicant_id": current_user.id,
            "match_score": new_application.ai_match_score
        }
    )
    db.add(notification)
    db.commit()

    return new_application


@router.get("/", response_model=List[ApplicationResponse])
def get_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all applications for the current user"""
    applications = db.query(Application).filter(
        Application.applicant_id == current_user.id
    ).all()
    
    return applications


@router.get("/project/{project_id}", response_model=List[ApplicationResponse])
def get_project_applications(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all applications for a specific project (project owner only)"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view applications for this project"
        )
    
    applications = db.query(Application).filter(
        Application.project_id == project_id
    ).all()
    
    return applications


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    update_data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update application status (project owner only)"""
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    project = db.query(Project).filter(Project.id == application.project_id).first()
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this application"
        )

    old_status = application.status
    application.status = update_data.status
    db.commit()
    db.refresh(application)

    # Create notification for applicant if status changed
    if old_status != update_data.status:
        status_text = "accepted" if update_data.status == ApplicationStatus.ACCEPTED else "rejected" if update_data.status == ApplicationStatus.REJECTED else "updated"
        notification = Notification(
            user_id=application.applicant_id,
            title=f"Application {status_text.capitalize()}",
            message=f"Your application to '{project.title}' has been {status_text}.",
            type="application_status",
            notification_data={
                "application_id": application.id,
                "project_id": project.id,
                "status": update_data.status.value,
                "project_title": project.title
            }
        )
        db.add(notification)
        db.commit()

    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Withdraw an application"""
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.applicant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to withdraw this application"
        )
    
    application.status = ApplicationStatus.WITHDRAWN
    db.commit()
    
    return None


def calculate_match_score(user: User, project: Project) -> float:
    """
    Calculate AI match score between user skills and project requirements
    This is a simplified version - in production, you'd use actual AI/ML
    """
    if not user.profile or not user.profile.skills:
        return 50.0
    
    user_skills = set(user.profile.skills)
    required_skills = set(project.required_skills)
    
    if not required_skills:
        return 70.0
    
    # Calculate skill overlap
    matching_skills = user_skills.intersection(required_skills)
    match_percentage = (len(matching_skills) / len(required_skills)) * 100
    
    # Add some randomness for demo purposes
    import random
    match_percentage += random.uniform(-10, 10)
    
    return min(max(match_percentage, 0), 100)
