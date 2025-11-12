"""
Timezone-Aware Collaboration API Endpoints
Handles team overlap calculations, timezone information, and scheduling
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from zoneinfo import ZoneInfo
import logging

from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User, Profile, Project, Application
from app.schemas.schemas import (
    UserTimezoneInfo,
    TeamOverlapResponse,
    ProjectTeamRequest,
    CustomTeamRequest,
    OverlapWindow
)
from app.services.timezone_service import TimezoneService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/collaboration", tags=["collaboration"])


def get_user_timezone_info(user: User, db: Session) -> UserTimezoneInfo:
    """Helper function to get user timezone info"""
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user.id}"
        )

    # Get user's display name
    if profile.first_name and profile.last_name:
        name = f"{profile.first_name} {profile.last_name}"
    elif profile.first_name:
        name = profile.first_name
    else:
        name = user.email.split('@')[0]

    return UserTimezoneInfo(
        user_id=user.id,
        name=name,
        timezone=profile.timezone,
        working_hours_start=profile.working_hours_start,
        working_hours_end=profile.working_hours_end,
        working_days=profile.working_days,
        avatar_url=profile.avatar_url
    )


@router.get("/timezones/me", response_model=UserTimezoneInfo)
async def get_my_timezone_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's timezone information"""
    return get_user_timezone_info(current_user, db)


@router.get("/timezones/user/{user_id}", response_model=UserTimezoneInfo)
async def get_user_timezone(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get timezone information for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )

    return get_user_timezone_info(user, db)


@router.post("/overlap/project", response_model=TeamOverlapResponse)
async def calculate_project_team_overlap(
    request: ProjectTeamRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate timezone overlap for a project team

    Includes:
    - Project owner
    - Accepted applicants (freelancers working on the project)
    - Optionally: pending applicants
    """
    # Get project
    project = db.query(Project).filter(Project.id == request.project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {request.project_id} not found"
        )

    # Check if user has access to this project
    # (Owner, or accepted/pending applicant)
    is_owner = project.owner_id == current_user.id
    user_application = db.query(Application).filter(
        Application.project_id == request.project_id,
        Application.applicant_id == current_user.id
    ).first()

    if not is_owner and not user_application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project"
        )

    # Collect team members
    team_user_ids = {project.owner_id}

    # Add accepted applicants
    accepted_applications = db.query(Application).filter(
        Application.project_id == request.project_id,
        Application.status == "accepted"
    ).all()

    for app in accepted_applications:
        team_user_ids.add(app.applicant_id)

    # Optionally add pending applicants
    if request.include_applicants:
        pending_applications = db.query(Application).filter(
            Application.project_id == request.project_id,
            Application.status == "pending"
        ).all()

        for app in pending_applications:
            team_user_ids.add(app.applicant_id)

    # Get timezone info for all team members
    user_timezones = []
    for user_id in team_user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            try:
                user_tz_info = get_user_timezone_info(user, db)
                user_timezones.append(user_tz_info)
            except Exception as e:
                logger.warning(f"Could not get timezone info for user {user_id}: {e}")
                continue

    if len(user_timezones) < 2:
        # Not enough users to calculate overlap
        return TeamOverlapResponse(
            user_timezones=user_timezones,
            overlap_windows=[],
            best_meeting_times=[],
            total_overlap_hours_per_week=0.0,
            timezone_span_hours=0
        )

    # Calculate overlaps
    overlap_windows = TimezoneService.calculate_overlap_windows(user_timezones)
    best_meeting_times = TimezoneService.get_best_meeting_times(overlap_windows, min_duration_hours=1.0, limit=5)
    total_overlap = TimezoneService.calculate_total_overlap_hours_per_week(overlap_windows)
    timezone_span = TimezoneService.calculate_timezone_span(user_timezones)

    return TeamOverlapResponse(
        user_timezones=user_timezones,
        overlap_windows=overlap_windows,
        best_meeting_times=best_meeting_times,
        total_overlap_hours_per_week=total_overlap,
        timezone_span_hours=timezone_span
    )


@router.post("/overlap/custom", response_model=TeamOverlapResponse)
async def calculate_custom_team_overlap(
    request: CustomTeamRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate timezone overlap for a custom list of users

    Useful for:
    - Ad-hoc team formation
    - Checking compatibility before starting a project
    - Finding best collaboration times
    """
    # Always include current user
    user_ids = set(request.user_ids)
    user_ids.add(current_user.id)

    # Get timezone info for all users
    user_timezones = []
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            try:
                user_tz_info = get_user_timezone_info(user, db)
                user_timezones.append(user_tz_info)
            except Exception as e:
                logger.warning(f"Could not get timezone info for user {user_id}: {e}")
                continue

    if len(user_timezones) < 2:
        return TeamOverlapResponse(
            user_timezones=user_timezones,
            overlap_windows=[],
            best_meeting_times=[],
            total_overlap_hours_per_week=0.0,
            timezone_span_hours=0
        )

    # Calculate overlaps
    overlap_windows = TimezoneService.calculate_overlap_windows(user_timezones)
    best_meeting_times = TimezoneService.get_best_meeting_times(overlap_windows, min_duration_hours=1.0, limit=5)
    total_overlap = TimezoneService.calculate_total_overlap_hours_per_week(overlap_windows)
    timezone_span = TimezoneService.calculate_timezone_span(user_timezones)

    return TeamOverlapResponse(
        user_timezones=user_timezones,
        overlap_windows=overlap_windows,
        best_meeting_times=best_meeting_times,
        total_overlap_hours_per_week=total_overlap,
        timezone_span_hours=timezone_span
    )


@router.get("/timezones/current-hour/{user_id}")
async def get_user_current_hour(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current local hour for a specific user (for status display)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user_id}"
        )

    current_hour = TimezoneService.get_user_local_hour(profile.timezone)
    is_working = TimezoneService.is_user_in_working_hours(
        profile.timezone,
        profile.working_hours_start,
        profile.working_hours_end,
        profile.working_days
    )

    current_time = TimezoneService.get_current_time_in_timezone(profile.timezone)

    return {
        "user_id": user_id,
        "timezone": profile.timezone,
        "current_hour": current_hour,
        "current_time": current_time.isoformat(),
        "is_working_hours": is_working,
        "working_hours_start": profile.working_hours_start,
        "working_hours_end": profile.working_hours_end,
        "working_days": profile.working_days
    }


@router.get("/timezones/working-status/{user_id}")
async def get_user_working_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get whether a user is currently in working hours (for presence indicators)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if not profile:
        return {
            "user_id": user_id,
            "is_working_hours": False,
            "timezone": "UTC"
        }

    is_working = TimezoneService.is_user_in_working_hours(
        profile.timezone,
        profile.working_hours_start,
        profile.working_hours_end,
        profile.working_days
    )

    return {
        "user_id": user_id,
        "is_working_hours": is_working,
        "timezone": profile.timezone
    }


@router.get("/timezones/list")
async def get_common_timezones():
    """Get a list of common timezones for the timezone selector"""
    timezones = [
        # North America
        {"value": "America/New_York", "label": "Eastern Time (New York)", "offset": "UTC-5/-4"},
        {"value": "America/Chicago", "label": "Central Time (Chicago)", "offset": "UTC-6/-5"},
        {"value": "America/Denver", "label": "Mountain Time (Denver)", "offset": "UTC-7/-6"},
        {"value": "America/Los_Angeles", "label": "Pacific Time (Los Angeles)", "offset": "UTC-8/-7"},
        {"value": "America/Anchorage", "label": "Alaska Time", "offset": "UTC-9/-8"},
        {"value": "America/Toronto", "label": "Eastern Time (Toronto)", "offset": "UTC-5/-4"},
        {"value": "America/Vancouver", "label": "Pacific Time (Vancouver)", "offset": "UTC-8/-7"},
        {"value": "America/Mexico_City", "label": "Central Time (Mexico City)", "offset": "UTC-6/-5"},

        # South America
        {"value": "America/Sao_Paulo", "label": "Brasília Time (São Paulo)", "offset": "UTC-3"},
        {"value": "America/Argentina/Buenos_Aires", "label": "Argentina Time", "offset": "UTC-3"},
        {"value": "America/Santiago", "label": "Chile Time", "offset": "UTC-4/-3"},
        {"value": "America/Bogota", "label": "Colombia Time", "offset": "UTC-5"},

        # Europe
        {"value": "Europe/London", "label": "London (GMT/BST)", "offset": "UTC+0/+1"},
        {"value": "Europe/Paris", "label": "Central European Time (Paris)", "offset": "UTC+1/+2"},
        {"value": "Europe/Berlin", "label": "Central European Time (Berlin)", "offset": "UTC+1/+2"},
        {"value": "Europe/Madrid", "label": "Central European Time (Madrid)", "offset": "UTC+1/+2"},
        {"value": "Europe/Rome", "label": "Central European Time (Rome)", "offset": "UTC+1/+2"},
        {"value": "Europe/Amsterdam", "label": "Central European Time (Amsterdam)", "offset": "UTC+1/+2"},
        {"value": "Europe/Stockholm", "label": "Central European Time (Stockholm)", "offset": "UTC+1/+2"},
        {"value": "Europe/Athens", "label": "Eastern European Time (Athens)", "offset": "UTC+2/+3"},
        {"value": "Europe/Moscow", "label": "Moscow Time", "offset": "UTC+3"},

        # Asia
        {"value": "Asia/Dubai", "label": "Gulf Standard Time (Dubai)", "offset": "UTC+4"},
        {"value": "Asia/Kolkata", "label": "India Standard Time", "offset": "UTC+5:30"},
        {"value": "Asia/Singapore", "label": "Singapore Time", "offset": "UTC+8"},
        {"value": "Asia/Hong_Kong", "label": "Hong Kong Time", "offset": "UTC+8"},
        {"value": "Asia/Shanghai", "label": "China Standard Time", "offset": "UTC+8"},
        {"value": "Asia/Tokyo", "label": "Japan Standard Time", "offset": "UTC+9"},
        {"value": "Asia/Seoul", "label": "Korea Standard Time", "offset": "UTC+9"},

        # Australia & Pacific
        {"value": "Australia/Sydney", "label": "Australian Eastern Time (Sydney)", "offset": "UTC+10/+11"},
        {"value": "Australia/Melbourne", "label": "Australian Eastern Time (Melbourne)", "offset": "UTC+10/+11"},
        {"value": "Australia/Perth", "label": "Australian Western Time", "offset": "UTC+8"},
        {"value": "Pacific/Auckland", "label": "New Zealand Time", "offset": "UTC+12/+13"},

        # Africa
        {"value": "Africa/Cairo", "label": "Egypt Time", "offset": "UTC+2"},
        {"value": "Africa/Johannesburg", "label": "South Africa Time", "offset": "UTC+2"},
        {"value": "Africa/Lagos", "label": "West Africa Time", "offset": "UTC+1"},

        # UTC
        {"value": "UTC", "label": "Coordinated Universal Time (UTC)", "offset": "UTC+0"},
    ]

    return timezones
