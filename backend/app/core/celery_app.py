"""
Celery configuration for background tasks
"""

import os
from celery import Celery
from celery.schedules import crontab

# Get Redis URL from environment or use default
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery instance
celery_app = Celery(
    "remote_works",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.ai_tasks", "app.tasks.email_tasks"]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

# Periodic tasks schedule
celery_app.conf.beat_schedule = {
    # Generate weekly summaries every Monday at 9 AM UTC
    "generate-weekly-summaries": {
        "task": "app.tasks.ai_tasks.generate_weekly_summaries",
        "schedule": crontab(hour=9, minute=0, day_of_week=1),  # Monday 9 AM
    },
    # Clean up old summaries every Sunday at midnight
    "cleanup-old-summaries": {
        "task": "app.tasks.ai_tasks.cleanup_old_summaries",
        "schedule": crontab(hour=0, minute=0, day_of_week=0),  # Sunday midnight
    },
}
