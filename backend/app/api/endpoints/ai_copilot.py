"""
AI Co-Pilot API Endpoints
Handles AI-powered project management features
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User, SummaryType
from app.schemas.schemas import (
    GenerateSummaryRequest,
    AISummaryResponse,
    ProjectMessageCreate,
    ProjectMessageResponse
)
from app.services.ai_copilot_service import AICopilotService

router = APIRouter(prefix="/ai-copilot", tags=["AI Co-Pilot"])


@router.post("/summary/generate", response_model=AISummaryResponse, status_code=status.HTTP_201_CREATED)
async def generate_project_summary(
    request: GenerateSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an AI-powered project summary.
    Analyzes GitHub activity, messages, and other data sources to provide insights.

    **Requirements:**
    - User must be authenticated
    - User must have access to the project (owner, freelancer, or agent)

    **Returns:**
    - Comprehensive AI-generated summary with:
        - Executive summary
        - Tasks completed
        - Current blockers
        - Recommended next steps
        - Key metrics
    """
    service = AICopilotService(db)

    try:
        summary = await service.generate_project_summary(
            project_id=request.project_id,
            user_id=current_user.id,
            period_days=request.period_days,
            summary_type=request.summary_type,
            include_github=request.include_github,
            include_messages=request.include_messages
        )

        return summary

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )


@router.get("/summaries/{project_id}", response_model=List[AISummaryResponse])
async def get_project_summaries(
    project_id: int,
    limit: int = 10,
    include_archived: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all AI summaries for a project.

    **Query Parameters:**
    - limit: Maximum number of summaries to return (default: 10)
    - include_archived: Include archived summaries (default: false)

    **Returns:**
    - List of summaries ordered by creation date (newest first)
    """
    service = AICopilotService(db)

    try:
        summaries = service.get_project_summaries(
            project_id=project_id,
            limit=limit,
            include_archived=include_archived
        )

        return summaries

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve summaries: {str(e)}"
        )


@router.get("/summary/latest/{project_id}", response_model=Optional[AISummaryResponse])
async def get_latest_summary(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the most recent AI summary for a project.

    **Returns:**
    - Latest published summary, or null if none exists
    """
    service = AICopilotService(db)

    try:
        summary = service.get_latest_summary(project_id)
        return summary

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve latest summary: {str(e)}"
        )


@router.post("/messages", response_model=ProjectMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message: ProjectMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message in a project chat.

    **Requirements:**
    - User must be authenticated
    - User must have access to the project

    **Returns:**
    - Created message object
    """
    service = AICopilotService(db)

    try:
        msg = service.send_message(
            project_id=message.project_id,
            sender_id=current_user.id,
            message=message.message,
            message_type=message.message_type,
            attachments=message.attachments,
            parent_message_id=message.parent_message_id,
            thread_id=message.thread_id
        )

        return msg

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )


@router.get("/messages/{project_id}", response_model=List[ProjectMessageResponse])
async def get_project_messages(
    project_id: int,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages for a project.

    **Query Parameters:**
    - limit: Maximum number of messages to return (default: 50)
    - offset: Number of messages to skip (default: 0)

    **Returns:**
    - List of messages ordered by creation date (newest first)
    """
    service = AICopilotService(db)

    try:
        messages = service.get_project_messages(
            project_id=project_id,
            limit=limit,
            offset=offset
        )

        return messages

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve messages: {str(e)}"
        )
