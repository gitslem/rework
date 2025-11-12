from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.models.models import User, Profile, PortfolioItem, UserRole
from app.schemas.schemas import (
    PortfolioItemCreate,
    PortfolioItemUpdate,
    PortfolioItemResponse,
    VerifySkillRequest,
    FreelancerFilter,
    FreelancerSearchResponse,
    ProfileResponse
)
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/freelancers", tags=["freelancers"])


# ================== Portfolio Item Endpoints ==================

@router.post("/me/portfolio", response_model=PortfolioItemResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio_item(
    item_data: PortfolioItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new portfolio item for current user"""
    # Get or create profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Create portfolio item
    portfolio_item = PortfolioItem(
        profile_id=profile.id,
        **item_data.model_dump()
    )

    db.add(portfolio_item)
    db.commit()
    db.refresh(portfolio_item)

    return portfolio_item


@router.get("/me/portfolio", response_model=List[PortfolioItemResponse])
def get_my_portfolio_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all portfolio items for current user"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        return []

    items = db.query(PortfolioItem).filter(
        PortfolioItem.profile_id == profile.id
    ).order_by(PortfolioItem.display_order, PortfolioItem.created_at.desc()).all()

    return items


@router.get("/{user_id}/portfolio", response_model=List[PortfolioItemResponse])
def get_user_portfolio_items(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all portfolio items for a specific user"""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    items = db.query(PortfolioItem).filter(
        PortfolioItem.profile_id == profile.id
    ).order_by(PortfolioItem.display_order, PortfolioItem.created_at.desc()).all()

    return items


@router.get("/portfolio/{item_id}", response_model=PortfolioItemResponse)
def get_portfolio_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific portfolio item by ID"""
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )

    return item


@router.patch("/portfolio/{item_id}", response_model=PortfolioItemResponse)
def update_portfolio_item(
    item_id: int,
    item_data: PortfolioItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a portfolio item (only owner can update)"""
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )

    # Check ownership
    profile = db.query(Profile).filter(Profile.id == item.profile_id).first()
    if profile.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own portfolio items"
        )

    # Update fields
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return item


@router.delete("/portfolio/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a portfolio item (only owner can delete)"""
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )

    # Check ownership
    profile = db.query(Profile).filter(Profile.id == item.profile_id).first()
    if profile.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own portfolio items"
        )

    db.delete(item)
    db.commit()

    return None


# ================== Verified Skills Endpoints ==================

@router.post("/verify-skill", response_model=ProfileResponse)
def verify_freelancer_skill(
    verify_data: VerifySkillRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify a freelancer's skill (admin only)"""
    # Check if current user is admin
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can verify skills"
        )

    # Get the user's profile
    profile = db.query(Profile).filter(Profile.user_id == verify_data.user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Get or initialize verified_skills
    verified_skills = profile.verified_skills or []

    # Check if skill already exists in verified_skills
    skill_found = False
    for i, vs in enumerate(verified_skills):
        if vs.get("skill") == verify_data.skill:
            # Update existing skill
            verified_skills[i] = {
                "skill": verify_data.skill,
                "verified": verify_data.verified,
                "verified_at": datetime.utcnow().isoformat() if verify_data.verified else None,
                "verified_by": current_user.id if verify_data.verified else None
            }
            skill_found = True
            break

    # If skill not found, add it
    if not skill_found:
        verified_skills.append({
            "skill": verify_data.skill,
            "verified": verify_data.verified,
            "verified_at": datetime.utcnow().isoformat() if verify_data.verified else None,
            "verified_by": current_user.id if verify_data.verified else None
        })

    profile.verified_skills = verified_skills
    db.commit()
    db.refresh(profile)

    return profile


# ================== Freelancer Search Endpoints ==================

@router.get("/search", response_model=List[FreelancerSearchResponse])
def search_freelancers(
    skills: Optional[str] = Query(None, description="Comma-separated list of skills"),
    location: Optional[str] = Query(None, description="Location filter"),
    min_hourly_rate: Optional[float] = Query(None, ge=0),
    max_hourly_rate: Optional[float] = Query(None, ge=0),
    timezone: Optional[str] = Query(None, description="Timezone filter"),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    verified_skills_only: bool = Query(False, description="Only show freelancers with verified skills"),
    search_query: Optional[str] = Query(None, description="Search in name, bio, skills"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search for freelancers with filters"""
    # Start with freelancers only
    query = db.query(Profile, User).join(User, Profile.user_id == User.id).filter(
        User.role == UserRole.FREELANCER,
        User.is_active == True
    )

    # Apply filters
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        # Filter profiles that have any of the specified skills
        skill_filters = []
        for skill in skill_list:
            skill_filters.append(func.json_contains(Profile.skills, f'"{skill}"'))
        if skill_filters:
            query = query.filter(or_(*skill_filters))

    if location:
        query = query.filter(Profile.location.ilike(f"%{location}%"))

    if min_hourly_rate is not None:
        query = query.filter(Profile.hourly_rate >= min_hourly_rate)

    if max_hourly_rate is not None:
        query = query.filter(Profile.hourly_rate <= max_hourly_rate)

    if timezone:
        query = query.filter(Profile.timezone == timezone)

    if min_rating is not None:
        query = query.filter(Profile.average_rating >= min_rating)

    if search_query:
        search_pattern = f"%{search_query}%"
        query = query.filter(
            or_(
                Profile.first_name.ilike(search_pattern),
                Profile.last_name.ilike(search_pattern),
                Profile.bio.ilike(search_pattern)
            )
        )

    # Apply pagination
    results = query.order_by(Profile.average_rating.desc(), Profile.completed_projects.desc()).offset(offset).limit(limit).all()

    # Build response
    response = []
    for profile, user in results:
        # Count portfolio items
        portfolio_count = db.query(PortfolioItem).filter(PortfolioItem.profile_id == profile.id).count()

        # Convert verified_skills to proper format
        verified_skills_list = []
        if profile.verified_skills:
            for vs in profile.verified_skills:
                if isinstance(vs, dict):
                    verified_skills_list.append(vs)

        # Skip if verified_skills_only is True and user has no verified skills
        if verified_skills_only and not any(vs.get("verified", False) for vs in verified_skills_list):
            continue

        response.append(FreelancerSearchResponse(
            user_id=user.id,
            profile_id=profile.id,
            first_name=profile.first_name,
            last_name=profile.last_name,
            bio=profile.bio,
            avatar_url=profile.avatar_url,
            skills=profile.skills or [],
            verified_skills=verified_skills_list,
            location=profile.location,
            hourly_rate=profile.hourly_rate,
            timezone=profile.timezone,
            average_rating=profile.average_rating,
            total_reviews=profile.total_reviews,
            completed_projects=profile.completed_projects,
            portfolio_items_count=portfolio_count,
            github_username=profile.github_username,
            huggingface_username=profile.huggingface_username
        ))

    return response


@router.get("/featured", response_model=List[FreelancerSearchResponse])
def get_featured_freelancers(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get featured freelancers (top-rated with verified skills)"""
    # Get top freelancers with at least one verified skill
    query = db.query(Profile, User).join(User, Profile.user_id == User.id).filter(
        User.role == UserRole.FREELANCER,
        User.is_active == True,
        Profile.average_rating >= 4.0,
        Profile.total_reviews > 0
    ).order_by(
        Profile.average_rating.desc(),
        Profile.completed_projects.desc()
    ).limit(limit)

    results = query.all()

    response = []
    for profile, user in results:
        portfolio_count = db.query(PortfolioItem).filter(PortfolioItem.profile_id == profile.id).count()

        verified_skills_list = []
        if profile.verified_skills:
            for vs in profile.verified_skills:
                if isinstance(vs, dict):
                    verified_skills_list.append(vs)

        response.append(FreelancerSearchResponse(
            user_id=user.id,
            profile_id=profile.id,
            first_name=profile.first_name,
            last_name=profile.last_name,
            bio=profile.bio,
            avatar_url=profile.avatar_url,
            skills=profile.skills or [],
            verified_skills=verified_skills_list,
            location=profile.location,
            hourly_rate=profile.hourly_rate,
            timezone=profile.timezone,
            average_rating=profile.average_rating,
            total_reviews=profile.total_reviews,
            completed_projects=profile.completed_projects,
            portfolio_items_count=portfolio_count,
            github_username=profile.github_username,
            huggingface_username=profile.huggingface_username
        ))

    return response
