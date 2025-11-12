"""
Reviews API endpoints - Handles post-project feedback and ratings
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import logging

from app.db.database import get_db
from app.models.models import Review, User, Project, Application, ApplicationStatus, Profile
from app.schemas.schemas import ReviewCreate, ReviewResponse, ReviewSummary
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])
logger = logging.getLogger(__name__)


def update_user_rating(user_id: int, db: Session):
    """
    Update user profile with average rating and total reviews

    Args:
        user_id: ID of the user to update
        db: Database session
    """
    result = db.query(
        func.avg(Review.rating),
        func.count(Review.id)
    ).filter(Review.reviewee_id == user_id).first()

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile:
        profile.average_rating = float(result[0]) if result[0] else 0.0
        profile.total_reviews = result[1] or 0
        db.commit()


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a review after project completion
    User must be involved in the project (as owner or worker)
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == review_data.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verify reviewee exists
    reviewee = db.query(User).filter(User.id == review_data.reviewee_id).first()
    if not reviewee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User to review not found"
        )

    # Prevent self-review
    if current_user.id == review_data.reviewee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot review yourself"
        )

    # Verify reviewer was involved in the project
    is_owner = project.owner_id == current_user.id
    is_worker = db.query(Application).filter(
        Application.project_id == review_data.project_id,
        Application.applicant_id == current_user.id,
        Application.status == ApplicationStatus.ACCEPTED
    ).first() is not None

    if not (is_owner or is_worker):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be involved in the project to leave a review"
        )

    # Verify reviewee was involved in the project
    reviewee_is_owner = project.owner_id == review_data.reviewee_id
    reviewee_is_worker = db.query(Application).filter(
        Application.project_id == review_data.project_id,
        Application.applicant_id == review_data.reviewee_id,
        Application.status == ApplicationStatus.ACCEPTED
    ).first() is not None

    if not (reviewee_is_owner or reviewee_is_worker):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The person you're trying to review was not involved in this project"
        )

    # Prevent duplicate reviews
    existing_review = db.query(Review).filter(
        Review.project_id == review_data.project_id,
        Review.reviewer_id == current_user.id,
        Review.reviewee_id == review_data.reviewee_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this user for this project"
        )

    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )

    # Create review
    review = Review(
        project_id=review_data.project_id,
        reviewer_id=current_user.id,
        reviewee_id=review_data.reviewee_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    db.add(review)

    # Update reviewee's average rating
    update_user_rating(review_data.reviewee_id, db)

    db.commit()
    db.refresh(review)

    # Create notification for reviewee
    from app.models.models import Notification

    notification = Notification(
        user_id=review_data.reviewee_id,
        title="New Review Received",
        message=f"You received a {review_data.rating}-star review for project: {project.title}",
        type="review",
        notification_data={"review_id": review.id, "project_id": project.id, "rating": review_data.rating}
    )
    db.add(notification)
    db.commit()

    return review


@router.get("/user/{user_id}", response_model=List[ReviewResponse])
async def get_user_reviews(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get all reviews for a user (as reviewee)
    Public endpoint - anyone can see reviews
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    reviews = db.query(Review).filter(
        Review.reviewee_id == user_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

    return reviews


@router.get("/user/{user_id}/summary", response_model=ReviewSummary)
async def get_review_summary(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get review summary statistics for a user
    Public endpoint
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    summary = db.query(
        func.avg(Review.rating).label("average_rating"),
        func.count(Review.id).label("total_reviews"),
        func.min(Review.rating).label("min_rating"),
        func.max(Review.rating).label("max_rating")
    ).filter(Review.reviewee_id == user_id).first()

    return {
        "average_rating": float(summary.average_rating or 0),
        "total_reviews": summary.total_reviews or 0,
        "min_rating": summary.min_rating,
        "max_rating": summary.max_rating
    }


@router.get("/project/{project_id}", response_model=List[ReviewResponse])
async def get_project_reviews(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all reviews for a project
    Public endpoint
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    reviews = db.query(Review).filter(
        Review.project_id == project_id
    ).order_by(Review.created_at.desc()).all()

    return reviews


@router.get("/given", response_model=List[ReviewResponse])
async def get_reviews_given(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all reviews given by current user
    """
    reviews = db.query(Review).filter(
        Review.reviewer_id == current_user.id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

    return reviews


@router.get("/received", response_model=List[ReviewResponse])
async def get_reviews_received(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all reviews received by current user
    """
    reviews = db.query(Review).filter(
        Review.reviewee_id == current_user.id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

    return reviews


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific review
    Public endpoint
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a review
    Only the reviewer can delete their own review
    """
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    # Verify user is the reviewer
    if review.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews"
        )

    reviewee_id = review.reviewee_id
    db.delete(review)

    # Update reviewee's rating after deletion
    update_user_rating(reviewee_id, db)

    db.commit()

    return None


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a review
    Only the reviewer can update their own review
    """
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    # Verify user is the reviewer
    if review.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own reviews"
        )

    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )

    # Update review
    review.rating = review_data.rating
    review.comment = review_data.comment

    # Update reviewee's average rating
    update_user_rating(review.reviewee_id, db)

    db.commit()
    db.refresh(review)

    return review
