"""
Celery tasks for AI Co-Pilot features
"""

import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.celery_app import celery_app
from app.db.database import SessionLocal
from app.models.models import Project, AISummary, SummaryType, ProjectStatus
from app.services.ai_copilot_service import AICopilotService

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.ai_tasks.generate_weekly_summaries")
def generate_weekly_summaries():
    """
    Generate weekly AI summaries for all active projects.
    Runs every Monday at 9 AM UTC.
    """
    db = SessionLocal()
    try:
        logger.info("Starting weekly summary generation task")

        # Get all active projects
        active_projects = db.query(Project).filter(
            Project.status.in_([ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS])
        ).all()

        logger.info(f"Found {len(active_projects)} active projects")

        generated_count = 0
        failed_count = 0

        for project in active_projects:
            try:
                service = AICopilotService(db)

                # Generate weekly summary
                # Use async workaround for sync context
                import asyncio
                summary = asyncio.run(service.generate_project_summary(
                    project_id=project.id,
                    user_id=None,  # Automated generation
                    period_days=7,
                    summary_type=SummaryType.WEEKLY,
                    include_github=True,
                    include_messages=True
                ))

                generated_count += 1
                logger.info(f"Generated weekly summary {summary.id} for project {project.id}")

            except Exception as e:
                failed_count += 1
                logger.error(f"Failed to generate summary for project {project.id}: {e}")

        logger.info(f"Weekly summary generation completed. Generated: {generated_count}, Failed: {failed_count}")

        return {
            "status": "completed",
            "generated": generated_count,
            "failed": failed_count,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Weekly summary generation task failed: {e}")
        return {
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.ai_tasks.cleanup_old_summaries")
def cleanup_old_summaries(days_to_keep: int = 90):
    """
    Archive old AI summaries older than specified days.
    Runs every Sunday at midnight.

    Args:
        days_to_keep: Number of days to keep summaries before archiving (default: 90)
    """
    db = SessionLocal()
    try:
        logger.info(f"Starting cleanup of summaries older than {days_to_keep} days")

        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)

        # Archive old summaries
        archived_count = db.query(AISummary).filter(
            AISummary.created_at < cutoff_date,
            AISummary.is_archived == False
        ).update({"is_archived": True})

        db.commit()

        logger.info(f"Archived {archived_count} old summaries")

        return {
            "status": "completed",
            "archived": archived_count,
            "cutoff_date": cutoff_date.isoformat(),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Summary cleanup task failed: {e}")
        db.rollback()
        return {
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
    finally:
        db.close()


@celery_app.task(name="app.tasks.ai_tasks.generate_summary_for_project")
def generate_summary_for_project(
    project_id: int,
    user_id: int = None,
    period_days: int = 7,
    summary_type: str = "on_demand"
):
    """
    Generate an AI summary for a specific project (async task).
    This can be triggered via webhook or API.

    Args:
        project_id: ID of the project
        user_id: ID of the user requesting the summary
        period_days: Number of days to analyze
        summary_type: Type of summary to generate
    """
    db = SessionLocal()
    try:
        logger.info(f"Generating {summary_type} summary for project {project_id}")

        service = AICopilotService(db)

        # Convert summary_type string to enum
        from app.models.models import SummaryType
        summary_type_enum = SummaryType(summary_type)

        # Generate summary
        import asyncio
        summary = asyncio.run(service.generate_project_summary(
            project_id=project_id,
            user_id=user_id,
            period_days=period_days,
            summary_type=summary_type_enum,
            include_github=True,
            include_messages=True
        ))

        logger.info(f"Generated summary {summary.id} for project {project_id}")

        return {
            "status": "completed",
            "summary_id": summary.id,
            "project_id": project_id,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Failed to generate summary for project {project_id}: {e}")
        return {
            "status": "failed",
            "error": str(e),
            "project_id": project_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    finally:
        db.close()
