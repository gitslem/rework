from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, Profile
from app.schemas.schemas import (
    ProfileResponse, ProfileUpdate, UserResponse, DashboardStats
)
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.get("/me/profile", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        # Create profile if it doesn't exist
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile


@router.patch("/me/profile", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    # Update fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    return profile


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/{user_id}/profile", response_model=ProfileResponse)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user profile by user ID"""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


@router.get("/me/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for current user"""
    from app.models.models import Application, Project, ProjectStatus, ApplicationStatus
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # Get active projects
    if current_user.role.value == "business":
        active_projects = db.query(Project).filter(
            Project.owner_id == current_user.id,
            Project.status == ProjectStatus.IN_PROGRESS
        ).count()
    else:
        # For freelancers, count accepted applications
        active_projects = db.query(Application).filter(
            Application.applicant_id == current_user.id,
            Application.status == ApplicationStatus.ACCEPTED
        ).count()
    
    # Get pending applications
    pending_applications = db.query(Application).filter(
        Application.applicant_id == current_user.id,
        Application.status == ApplicationStatus.PENDING
    ).count()
    
    return DashboardStats(
        total_earnings=profile.total_earnings if profile else 0,
        active_projects=active_projects,
        completed_projects=profile.completed_projects if profile else 0,
        pending_applications=pending_applications,
        average_rating=profile.average_rating if profile else 0,
        total_reviews=profile.total_reviews if profile else 0
    )


@router.post("/me/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile avatar (placeholder - implement S3 upload in production)"""
    # In production, upload to S3 and store URL
    # For now, just return success
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    # Placeholder URL - in production, upload to S3
    profile.avatar_url = f"https://placeholder-url.com/avatars/{current_user.id}"
    db.commit()
    
    return {"message": "Avatar uploaded successfully", "url": profile.avatar_url}


@router.post("/me/profile/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload resume (placeholder - implement S3 upload in production)"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    # Placeholder URL - in production, upload to S3
    profile.resume_url = f"https://placeholder-url.com/resumes/{current_user.id}"
    db.commit()
    
    return {"message": "Resume uploaded successfully", "url": profile.resume_url}
