from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.models.models import (
    CandidateProject,
    ProjectUpdate,
    ProjectAction,
    User,
    Notification,
    UserRole,
    CandidateProjectStatus,
    ProjectActionStatus
)
from app.schemas.schemas import (
    CandidateProjectCreate,
    CandidateProjectUpdate,
    CandidateProjectResponse,
    CandidateProjectDetailResponse,
    ProjectUpdateCreate,
    ProjectUpdateUpdate,
    ProjectUpdateResponse,
    ProjectActionCreate,
    ProjectActionUpdate,
    ProjectActionResponse
)
from app.api.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/candidate-projects", tags=["candidate-projects"])


# ============================================================================
# EMAIL NOTIFICATION ENDPOINTS (for Firebase-created projects)
# ============================================================================

class EmailNotificationRequest(BaseModel):
    """Request model for triggering email notifications"""
    candidate_email: str
    candidate_name: str
    agent_name: str
    project_title: str
    project_description: str
    project_id: str  # Firebase project ID (string)
    platform: Optional[str] = None


class ProjectUpdateEmailRequest(BaseModel):
    """Request model for project update email notifications"""
    candidate_email: str
    candidate_name: str
    agent_name: str
    project_title: str
    project_id: str  # Firebase project ID (string)
    update_summary: Optional[str] = None


@router.options("/send-creation-email", status_code=status.HTTP_200_OK)
def send_creation_email_preflight():
    """Handle CORS preflight for send-creation-email endpoint"""
    return {}


@router.post("/send-creation-email", status_code=status.HTTP_200_OK)
def send_project_creation_email(
    email_data: EmailNotificationRequest
):
    """
    Send email notification for project created in Firebase
    (No authentication required - called from Firebase frontend)
    """
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"📧 Email creation request received for: {email_data.candidate_email}")
    logger.info(f"   Project: {email_data.project_title}")
    logger.info(f"   Agent: {email_data.agent_name}")

    # Validate required fields
    if not email_data.candidate_email or not email_data.project_title:
        logger.error("❌ Missing required fields")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields: candidate_email and project_title are required"
        )

    try:
        from app.services.email_service import email_service

        logger.info("Calling email service...")
        success = email_service.send_project_created_notification(
            candidate_email=email_data.candidate_email,
            candidate_name=email_data.candidate_name,
            agent_name=email_data.agent_name,
            project_title=email_data.project_title,
            project_description=email_data.project_description,
            project_id=email_data.project_id,
            platform=email_data.platform
        )

        if success:
            logger.info(f"✅ Email sent successfully to {email_data.candidate_email}")
            return {"message": "Email sent successfully", "success": True}
        else:
            logger.error(f"❌ Email sending failed for {email_data.candidate_email}")
            return {"message": "Failed to send email - check backend logs", "success": False}

    except Exception as e:
        logger.error(f"❌ Error sending project creation email: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


@router.options("/send-update-email", status_code=status.HTTP_200_OK)
def send_update_email_preflight():
    """Handle CORS preflight for send-update-email endpoint"""
    return {}


@router.post("/send-update-email", status_code=status.HTTP_200_OK)
def send_project_update_email_endpoint(
    email_data: ProjectUpdateEmailRequest
):
    """
    Send email notification for project updated in Firebase
    (No authentication required - called from Firebase frontend)
    """
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"📧 Email update request received for: {email_data.candidate_email}")
    logger.info(f"   Project: {email_data.project_title}")
    logger.info(f"   Update: {email_data.update_summary}")

    # Validate required fields
    if not email_data.candidate_email or not email_data.project_title:
        logger.error("❌ Missing required fields")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields: candidate_email and project_title are required"
        )

    try:
        from app.services.email_service import email_service

        logger.info("Calling email service...")
        success = email_service.send_project_updated_notification(
            candidate_email=email_data.candidate_email,
            candidate_name=email_data.candidate_name,
            agent_name=email_data.agent_name,
            project_title=email_data.project_title,
            project_id=email_data.project_id,
            update_summary=email_data.update_summary
        )

        if success:
            logger.info(f"✅ Email sent successfully to {email_data.candidate_email}")
            return {"message": "Email sent successfully", "success": True}
        else:
            logger.error(f"❌ Email sending failed for {email_data.candidate_email}")
            return {"message": "Failed to send email - check backend logs", "success": False}

    except Exception as e:
        logger.error(f"❌ Error sending project update email: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


# ============================================================================
# CANDIDATE PROJECT ENDPOINTS
# ============================================================================

@router.post("/", response_model=CandidateProjectResponse, status_code=status.HTTP_201_CREATED)
def create_candidate_project(
    project_data: CandidateProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new candidate project (agents only)"""
    if current_user.role != UserRole.AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents can create candidate projects"
        )

    # Verify the agent_id matches current user (agents can only create projects for themselves)
    if project_data.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create projects assigned to yourself"
        )

    # Verify the candidate exists
    candidate = db.query(User).filter(User.id == project_data.candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    new_project = CandidateProject(
        **project_data.model_dump()
    )

    # Set started_at if status is ACTIVE
    if new_project.status == CandidateProjectStatus.ACTIVE:
        new_project.started_at = datetime.utcnow()

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Send email notification to candidate (direct call - no Celery needed)
    try:
        from app.services.email_service import email_service
        from app.models.models import Profile
        import logging
        logger = logging.getLogger(__name__)

        # Get candidate and agent info for email
        candidate = db.query(User).filter(User.id == new_project.candidate_id).first()
        agent = db.query(User).filter(User.id == current_user.id).first()

        if candidate and candidate.email and agent:
            # Get profiles for names
            candidate_profile = db.query(Profile).filter(Profile.user_id == candidate.id).first()
            agent_profile = db.query(Profile).filter(Profile.user_id == agent.id).first()

            # Check if candidate has email notifications enabled
            send_email = True
            if candidate_profile and candidate_profile.email_notifications:
                send_email = candidate_profile.email_notifications.get("project_created", True)

            if send_email:
                candidate_name = (
                    candidate_profile.first_name if candidate_profile and candidate_profile.first_name
                    else candidate.email.split('@')[0]
                )

                agent_name = (
                    f"{agent_profile.first_name} {agent_profile.last_name}".strip()
                    if agent_profile and agent_profile.first_name
                    else agent.email.split('@')[0]
                )

                # Send email directly
                logger.info(f"📧 Sending project created email to {candidate.email}")

                success = email_service.send_project_created_notification(
                    candidate_email=candidate.email,
                    candidate_name=candidate_name,
                    agent_name=agent_name,
                    project_title=new_project.title,
                    project_description=new_project.description or "No description provided",
                    project_id=str(new_project.id),
                    platform=new_project.platform
                )

                if success:
                    logger.info(f"✅ Project created email sent successfully to {candidate.email}")
                else:
                    logger.warning(f"⚠️ Failed to send project created email to {candidate.email}")
            else:
                logger.info(f"📭 Candidate {candidate.id} has project_created notifications disabled")
    except Exception as e:
        # Log error but don't fail the request
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"❌ Error sending project created email: {str(e)}")
        logger.exception("Full traceback:")

    # Create in-app notification for candidate
    try:
        agent = db.query(User).filter(User.id == new_project.agent_id).first()
        agent_name = agent.email.split('@')[0] if agent else "Your agent"

        notification = Notification(
            user_id=new_project.candidate_id,
            title="New Project Created",
            message=f"{agent_name} has created a new project for you: {new_project.title}",
            type="candidate_project",
            notification_data={
                "project_id": new_project.id,
                "project_title": new_project.title,
                "agent_id": new_project.agent_id,
                "action": "created"
            }
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        # Log error but don't fail the request
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create in-app notification: {str(e)}")

    return new_project


@router.get("/", response_model=List[CandidateProjectResponse])
def get_candidate_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[CandidateProjectStatus] = None,
    candidate_id: Optional[int] = None,
    agent_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get candidate projects (filtered by user role)"""
    query = db.query(CandidateProject)

    # Role-based filtering
    if current_user.role == UserRole.AGENT:
        # Agents only see projects assigned to them
        query = query.filter(CandidateProject.agent_id == current_user.id)
    else:
        # Candidates only see projects they're involved in
        query = query.filter(CandidateProject.candidate_id == current_user.id)

    # Apply additional filters
    if status:
        query = query.filter(CandidateProject.status == status)

    if candidate_id and current_user.role == UserRole.AGENT:
        query = query.filter(CandidateProject.candidate_id == candidate_id)

    if agent_id and current_user.role == UserRole.ADMIN:
        query = query.filter(CandidateProject.agent_id == agent_id)

    projects = query.order_by(CandidateProject.created_at.desc()).offset(skip).limit(limit).all()
    return projects


@router.get("/active", response_model=List[CandidateProjectResponse])
def get_active_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active projects for the current user"""
    query = db.query(CandidateProject).filter(
        CandidateProject.status == CandidateProjectStatus.ACTIVE
    )

    if current_user.role == UserRole.AGENT:
        query = query.filter(CandidateProject.agent_id == current_user.id)
    else:
        query = query.filter(CandidateProject.candidate_id == current_user.id)

    projects = query.order_by(CandidateProject.created_at.desc()).all()
    return projects


@router.get("/pending", response_model=List[CandidateProjectResponse])
def get_pending_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending projects for the current user"""
    query = db.query(CandidateProject).filter(
        CandidateProject.status == CandidateProjectStatus.PENDING
    )

    if current_user.role == UserRole.AGENT:
        query = query.filter(CandidateProject.agent_id == current_user.id)
    else:
        query = query.filter(CandidateProject.candidate_id == current_user.id)

    projects = query.order_by(CandidateProject.created_at.desc()).all()
    return projects


@router.get("/{project_id}", response_model=CandidateProjectDetailResponse)
def get_candidate_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific candidate project with all updates and actions"""
    project = db.query(CandidateProject).filter(CandidateProject.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Authorization check
    if current_user.role == UserRole.AGENT:
        if project.agent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this project"
            )
    else:
        if project.candidate_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this project"
            )

    # Get all updates and actions
    updates = db.query(ProjectUpdate).filter(
        ProjectUpdate.project_id == project_id
    ).order_by(ProjectUpdate.created_at.desc()).all()

    actions = db.query(ProjectAction).filter(
        ProjectAction.project_id == project_id
    ).order_by(ProjectAction.created_at.desc()).all()

    # Calculate totals
    total_hours = sum(update.hours_completed for update in updates)
    total_screen_sharing_hours = sum(update.screen_sharing_hours for update in updates)
    pending_actions_count = sum(1 for action in actions if action.status == ProjectActionStatus.PENDING)
    completed_actions_count = sum(1 for action in actions if action.status == ProjectActionStatus.COMPLETED)

    # Create detailed response
    response_data = {
        **project.__dict__,
        "updates": updates,
        "actions": actions,
        "total_hours": total_hours,
        "total_screen_sharing_hours": total_screen_sharing_hours,
        "pending_actions_count": pending_actions_count,
        "completed_actions_count": completed_actions_count
    }

    return response_data


@router.patch("/{project_id}", response_model=CandidateProjectResponse)
def update_candidate_project(
    project_id: int,
    project_data: CandidateProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a candidate project (agent only)"""
    project = db.query(CandidateProject).filter(CandidateProject.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Only agents can update projects
    if current_user.role != UserRole.AGENT or project.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )

    # Update fields
    update_data_dict = project_data.model_dump(exclude_unset=True)

    # Track old status for email notification
    old_status = project.status.value if project.status else None
    status_changed = 'status' in update_data_dict and update_data_dict.get('status') != project.status
    for field, value in update_data_dict.items():
        setattr(project, field, value)

    # Update timestamps based on status changes
    if 'status' in update_data_dict:
        if update_data_dict['status'] == CandidateProjectStatus.ACTIVE and not project.started_at:
            project.started_at = datetime.utcnow()
        elif update_data_dict['status'] == CandidateProjectStatus.COMPLETED and not project.completed_at:
            project.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(project)

    # Send email notifications (direct call - no Celery needed)
    try:
        from app.services.email_service import email_service
        from app.models.models import Profile
        import logging
        logger = logging.getLogger(__name__)

        # Get candidate and agent info for email
        candidate = db.query(User).filter(User.id == project.candidate_id).first()
        agent = db.query(User).filter(User.id == project.agent_id).first()

        if candidate and candidate.email and agent:
            # Get profiles for names
            candidate_profile = db.query(Profile).filter(Profile.user_id == candidate.id).first()
            agent_profile = db.query(Profile).filter(Profile.user_id == agent.id).first()

            # Check if candidate has email notifications enabled
            send_email = True
            notification_type = "project_status_changed" if status_changed else "project_updated"
            if candidate_profile and candidate_profile.email_notifications:
                send_email = candidate_profile.email_notifications.get(notification_type, True)

            if send_email:
                candidate_name = (
                    candidate_profile.first_name if candidate_profile and candidate_profile.first_name
                    else candidate.email.split('@')[0]
                )

                agent_name = (
                    f"{agent_profile.first_name} {agent_profile.last_name}".strip()
                    if agent_profile and agent_profile.first_name
                    else agent.email.split('@')[0]
                )

                # Send email directly based on update type
                if status_changed:
                    # Send status change email
                    new_status = update_data_dict['status'].value if hasattr(update_data_dict['status'], 'value') else str(update_data_dict['status'])
                    logger.info(f"📧 Sending project status changed email to {candidate.email}")

                    success = email_service.send_project_status_changed_notification(
                        candidate_email=candidate.email,
                        candidate_name=candidate_name,
                        agent_name=agent_name,
                        project_title=project.title,
                        project_id=str(project.id),
                        old_status=old_status,
                        new_status=new_status
                    )

                    if success:
                        logger.info(f"✅ Project status changed email sent successfully to {candidate.email}")
                    else:
                        logger.warning(f"⚠️ Failed to send project status changed email to {candidate.email}")
                else:
                    # Send general update email
                    update_summary = ", ".join([f"{k}: {v}" for k, v in update_data_dict.items()])
                    logger.info(f"📧 Sending project updated email to {candidate.email}")

                    success = email_service.send_project_updated_notification(
                        candidate_email=candidate.email,
                        candidate_name=candidate_name,
                        agent_name=agent_name,
                        project_title=project.title,
                        project_id=str(project.id),
                        update_summary=update_summary
                    )

                    if success:
                        logger.info(f"✅ Project updated email sent successfully to {candidate.email}")
                    else:
                        logger.warning(f"⚠️ Failed to send project updated email to {candidate.email}")
            else:
                logger.info(f"📭 Candidate {candidate.id} has {notification_type} notifications disabled")
    except Exception as e:
        # Log error but don't fail the request
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"❌ Error sending project update email: {str(e)}")
        logger.exception("Full traceback:")

    # Create in-app notification for candidate
    try:
        agent = db.query(User).filter(User.id == project.agent_id).first()
        agent_name = agent.email.split('@')[0] if agent else "Your agent"

        if status_changed:
            new_status = update_data_dict['status'].value if hasattr(update_data_dict['status'], 'value') else str(update_data_dict['status'])
            notification_message = f"{agent_name} changed the status of '{project.title}' to {new_status}"
            notification_title = "Project Status Updated"
        else:
            notification_message = f"{agent_name} updated your project: {project.title}"
            notification_title = "Project Updated"

        notification = Notification(
            user_id=project.candidate_id,
            title=notification_title,
            message=notification_message,
            type="candidate_project",
            notification_data={
                "project_id": project.id,
                "project_title": project.title,
                "agent_id": project.agent_id,
                "action": "updated",
                "status_changed": status_changed,
                "updates": update_data_dict
            }
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        # Log error but don't fail the request
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create in-app notification: {str(e)}")

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a candidate project (agent only)"""
    project = db.query(CandidateProject).filter(CandidateProject.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if current_user.role != UserRole.AGENT or project.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this project"
        )

    db.delete(project)
    db.commit()

    return None


# ============================================================================
# PROJECT UPDATE ENDPOINTS
# ============================================================================

@router.post("/{project_id}/updates", response_model=ProjectUpdateResponse, status_code=status.HTTP_201_CREATED)
def create_project_update(
    project_id: int,
    update_data: ProjectUpdateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project update (agent only)"""
    if current_user.role != UserRole.AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents can create project updates"
        )

    # Verify project exists and agent is assigned
    project = db.query(CandidateProject).filter(CandidateProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if project.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )

    # Ensure project_id matches
    if update_data.project_id != project_id:
        update_data.project_id = project_id

    new_update = ProjectUpdate(
        agent_id=current_user.id,
        **update_data.model_dump()
    )

    db.add(new_update)
    db.commit()
    db.refresh(new_update)

    # Send email notification about project update (direct call - no Celery needed)
    try:
        from app.services.email_service import email_service
        from app.models.models import Profile
        import logging
        logger = logging.getLogger(__name__)

        # Get candidate and agent info for email
        candidate = db.query(User).filter(User.id == project.candidate_id).first()
        agent = db.query(User).filter(User.id == project.agent_id).first()

        if candidate and candidate.email and agent:
            # Get profiles for names
            candidate_profile = db.query(Profile).filter(Profile.user_id == candidate.id).first()
            agent_profile = db.query(Profile).filter(Profile.user_id == agent.id).first()

            # Check if candidate has email notifications enabled
            send_email = True
            if candidate_profile and candidate_profile.email_notifications:
                send_email = candidate_profile.email_notifications.get("project_updated", True)

            if send_email:
                candidate_name = (
                    candidate_profile.first_name if candidate_profile and candidate_profile.first_name
                    else candidate.email.split('@')[0]
                )

                agent_name = (
                    f"{agent_profile.first_name} {agent_profile.last_name}".strip()
                    if agent_profile and agent_profile.first_name
                    else agent.email.split('@')[0]
                )

                # Send email directly
                update_text = new_update.update_text or "New progress update added"
                update_summary = f"New update: {update_text[:100]}..."  # First 100 chars

                logger.info(f"📧 Sending project update email to {candidate.email}")

                success = email_service.send_project_updated_notification(
                    candidate_email=candidate.email,
                    candidate_name=candidate_name,
                    agent_name=agent_name,
                    project_title=project.title,
                    project_id=str(project.id),
                    update_summary=update_summary
                )

                if success:
                    logger.info(f"✅ Project update email sent successfully to {candidate.email}")
                else:
                    logger.warning(f"⚠️ Failed to send project update email to {candidate.email}")
            else:
                logger.info(f"📭 Candidate {candidate.id} has project_updated notifications disabled")
    except Exception as e:
        # Log error but don't fail the request
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"❌ Error sending project update email: {str(e)}")
        logger.exception("Full traceback:")

    return new_update


@router.get("/{project_id}/updates", response_model=List[ProjectUpdateResponse])
def get_project_updates(
    project_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all updates for a specific project"""
    # Verify project exists and user has access
    project = db.query(CandidateProject).filter(CandidateProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Authorization check
    if current_user.role == UserRole.AGENT:
        if project.agent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view updates for this project"
            )
    else:
        if project.candidate_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view updates for this project"
            )

    updates = db.query(ProjectUpdate).filter(
        ProjectUpdate.project_id == project_id
    ).order_by(ProjectUpdate.created_at.desc()).offset(skip).limit(limit).all()

    return updates


@router.patch("/updates/{update_id}", response_model=ProjectUpdateResponse)
def update_project_update(
    update_id: int,
    update_data: ProjectUpdateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a project update (agent only)"""
    update = db.query(ProjectUpdate).filter(ProjectUpdate.id == update_id).first()

    if not update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found"
        )

    if current_user.role != UserRole.AGENT or update.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this update"
        )

    # Update fields
    update_fields = update_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(update, field, value)

    db.commit()
    db.refresh(update)

    return update


@router.delete("/updates/{update_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_update(
    update_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a project update (agent only)"""
    update = db.query(ProjectUpdate).filter(ProjectUpdate.id == update_id).first()

    if not update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Update not found"
        )

    if current_user.role != UserRole.AGENT or update.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this update"
        )

    db.delete(update)
    db.commit()

    return None


# ============================================================================
# PROJECT ACTION ENDPOINTS
# ============================================================================

@router.post("/{project_id}/actions", response_model=ProjectActionResponse, status_code=status.HTTP_201_CREATED)
def create_project_action(
    project_id: int,
    action_data: ProjectActionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project action (agent or candidate)"""
    # Verify project exists
    project = db.query(CandidateProject).filter(CandidateProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Authorization check - both agent and candidate can create actions
    if current_user.role == UserRole.AGENT:
        if project.agent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create actions for this project"
            )
    else:
        if project.candidate_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create actions for this project"
            )

    # Ensure project_id matches
    if action_data.project_id != project_id:
        action_data.project_id = project_id

    new_action = ProjectAction(
        creator_id=current_user.id,
        **action_data.model_dump()
    )

    db.add(new_action)
    db.commit()
    db.refresh(new_action)

    return new_action


@router.get("/{project_id}/actions", response_model=List[ProjectActionResponse])
def get_project_actions(
    project_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[ProjectActionStatus] = None,
    assigned_to_me: bool = Query(False, description="Filter actions assigned to current user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all actions for a specific project"""
    # Verify project exists and user has access
    project = db.query(CandidateProject).filter(CandidateProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Authorization check
    if current_user.role == UserRole.AGENT:
        if project.agent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view actions for this project"
            )
    else:
        if project.candidate_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view actions for this project"
            )

    query = db.query(ProjectAction).filter(ProjectAction.project_id == project_id)

    # Apply filters
    if status:
        query = query.filter(ProjectAction.status == status)

    if assigned_to_me:
        if current_user.role == UserRole.AGENT:
            query = query.filter(ProjectAction.assigned_to_agent == True)
        else:
            query = query.filter(ProjectAction.assigned_to_candidate == True)

    actions = query.order_by(ProjectAction.created_at.desc()).offset(skip).limit(limit).all()

    return actions


@router.patch("/actions/{action_id}", response_model=ProjectActionResponse)
def update_project_action(
    action_id: int,
    action_data: ProjectActionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a project action"""
    action = db.query(ProjectAction).filter(ProjectAction.id == action_id).first()

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action not found"
        )

    # Get the project to verify authorization
    project = db.query(CandidateProject).filter(CandidateProject.id == action.project_id).first()

    # Authorization check - both agent and candidate can update actions
    authorized = False
    if current_user.role == UserRole.AGENT and project.agent_id == current_user.id:
        authorized = True
    elif project.candidate_id == current_user.id:
        authorized = True

    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this action"
        )

    # Update fields
    update_fields = action_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(action, field, value)

    # Update completed_at timestamp if status changed to COMPLETED
    if 'status' in update_fields and update_fields['status'] == ProjectActionStatus.COMPLETED:
        if not action.completed_at:
            action.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(action)

    return action


@router.delete("/actions/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_action(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a project action"""
    action = db.query(ProjectAction).filter(ProjectAction.id == action_id).first()

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action not found"
        )

    # Only the creator or the agent can delete actions
    project = db.query(CandidateProject).filter(CandidateProject.id == action.project_id).first()

    if action.creator_id != current_user.id:
        if current_user.role != UserRole.AGENT or project.agent_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this action"
            )

    db.delete(action)
    db.commit()

    return None
