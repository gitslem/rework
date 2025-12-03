"""Celery tasks for sending email notifications"""
from app.core.celery_app import celery_app
from app.services.email_service import email_service
from app.db.database import SessionLocal
from app.models.models import User, CandidateProject, Profile
import logging

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.email_tasks.send_project_created_email")
def send_project_created_email(project_id: int):
    """
    Send email notification when a project is created

    Args:
        project_id: ID of the created project
    """
    db = SessionLocal()
    try:
        # Get project with related data
        project = db.query(CandidateProject).filter(
            CandidateProject.id == project_id
        ).first()

        if not project:
            logger.warning(f"Project {project_id} not found for email notification")
            return

        # Get candidate and agent info
        candidate = db.query(User).filter(User.id == project.candidate_id).first()
        agent = db.query(User).filter(User.id == project.agent_id).first()

        if not candidate or not candidate.email:
            logger.warning(f"Candidate email not found for project {project_id}")
            return

        if not agent:
            logger.warning(f"Agent not found for project {project_id}")
            return

        # Get candidate and agent profiles for names
        candidate_profile = db.query(Profile).filter(Profile.user_id == candidate.id).first()
        agent_profile = db.query(Profile).filter(Profile.user_id == agent.id).first()

        # Check if candidate has email notifications enabled for project creation
        if candidate_profile and candidate_profile.email_notifications:
            if not candidate_profile.email_notifications.get("project_created", True):
                logger.info(f"Candidate {candidate.id} has disabled project_created notifications")
                return

        # Prepare email data
        candidate_name = (
            candidate_profile.first_name if candidate_profile and candidate_profile.first_name
            else candidate.email.split('@')[0]
        )

        agent_name = (
            f"{agent_profile.first_name} {agent_profile.last_name}".strip()
            if agent_profile and agent_profile.first_name
            else agent.email.split('@')[0]
        )

        # Send email
        success = email_service.send_project_created_notification(
            candidate_email=candidate.email,
            candidate_name=candidate_name,
            agent_name=agent_name,
            project_title=project.title,
            project_description=project.description or "No description provided",
            project_id=project.id,
            platform=project.platform
        )

        if success:
            logger.info(f"Project created email sent for project {project_id}")
        else:
            logger.error(f"Failed to send project created email for project {project_id}")

    except Exception as e:
        logger.error(f"Error sending project created email: {str(e)}")
    finally:
        db.close()


@celery_app.task(name="app.tasks.email_tasks.send_project_updated_email")
def send_project_updated_email(project_id: int, update_summary: str = None):
    """
    Send email notification when a project is updated

    Args:
        project_id: ID of the updated project
        update_summary: Optional summary of what was updated
    """
    db = SessionLocal()
    try:
        # Get project with related data
        project = db.query(CandidateProject).filter(
            CandidateProject.id == project_id
        ).first()

        if not project:
            logger.warning(f"Project {project_id} not found for email notification")
            return

        # Get candidate and agent info
        candidate = db.query(User).filter(User.id == project.candidate_id).first()
        agent = db.query(User).filter(User.id == project.agent_id).first()

        if not candidate or not candidate.email:
            logger.warning(f"Candidate email not found for project {project_id}")
            return

        if not agent:
            logger.warning(f"Agent not found for project {project_id}")
            return

        # Get candidate and agent profiles for names
        candidate_profile = db.query(Profile).filter(Profile.user_id == candidate.id).first()
        agent_profile = db.query(Profile).filter(Profile.user_id == agent.id).first()

        # Check if candidate has email notifications enabled for project updates
        if candidate_profile and candidate_profile.email_notifications:
            if not candidate_profile.email_notifications.get("project_updated", True):
                logger.info(f"Candidate {candidate.id} has disabled project_updated notifications")
                return

        # Prepare email data
        candidate_name = (
            candidate_profile.first_name if candidate_profile and candidate_profile.first_name
            else candidate.email.split('@')[0]
        )

        agent_name = (
            f"{agent_profile.first_name} {agent_profile.last_name}".strip()
            if agent_profile and agent_profile.first_name
            else agent.email.split('@')[0]
        )

        # Send email
        success = email_service.send_project_updated_notification(
            candidate_email=candidate.email,
            candidate_name=candidate_name,
            agent_name=agent_name,
            project_title=project.title,
            project_id=project.id,
            update_summary=update_summary
        )

        if success:
            logger.info(f"Project updated email sent for project {project_id}")
        else:
            logger.error(f"Failed to send project updated email for project {project_id}")

    except Exception as e:
        logger.error(f"Error sending project updated email: {str(e)}")
    finally:
        db.close()


@celery_app.task(name="app.tasks.email_tasks.send_project_status_changed_email")
def send_project_status_changed_email(project_id: int, old_status: str, new_status: str):
    """
    Send email notification when project status changes

    Args:
        project_id: ID of the project
        old_status: Previous status
        new_status: New status
    """
    db = SessionLocal()
    try:
        # Get project with related data
        project = db.query(CandidateProject).filter(
            CandidateProject.id == project_id
        ).first()

        if not project:
            logger.warning(f"Project {project_id} not found for email notification")
            return

        # Get candidate and agent info
        candidate = db.query(User).filter(User.id == project.candidate_id).first()
        agent = db.query(User).filter(User.id == project.agent_id).first()

        if not candidate or not candidate.email:
            logger.warning(f"Candidate email not found for project {project_id}")
            return

        if not agent:
            logger.warning(f"Agent not found for project {project_id}")
            return

        # Get candidate and agent profiles for names
        candidate_profile = db.query(Profile).filter(Profile.user_id == candidate.id).first()
        agent_profile = db.query(Profile).filter(Profile.user_id == agent.id).first()

        # Check if candidate has email notifications enabled for status changes
        if candidate_profile and candidate_profile.email_notifications:
            if not candidate_profile.email_notifications.get("project_status_changed", True):
                logger.info(f"Candidate {candidate.id} has disabled project_status_changed notifications")
                return

        # Prepare email data
        candidate_name = (
            candidate_profile.first_name if candidate_profile and candidate_profile.first_name
            else candidate.email.split('@')[0]
        )

        agent_name = (
            f"{agent_profile.first_name} {agent_profile.last_name}".strip()
            if agent_profile and agent_profile.first_name
            else agent.email.split('@')[0]
        )

        # Send email
        success = email_service.send_project_status_changed_notification(
            candidate_email=candidate.email,
            candidate_name=candidate_name,
            agent_name=agent_name,
            project_title=project.title,
            project_id=project.id,
            old_status=old_status,
            new_status=new_status
        )

        if success:
            logger.info(f"Project status changed email sent for project {project_id}")
        else:
            logger.error(f"Failed to send project status changed email for project {project_id}")

    except Exception as e:
        logger.error(f"Error sending project status changed email: {str(e)}")
    finally:
        db.close()
