"""
AI Co-Pilot Service
Handles AI-powered project management features including:
- Progress digest generation
- GitHub activity analysis
- Chat/message summarization
- Blocker detection and next steps recommendation
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
import requests
from openai import OpenAI

from app.models.models import (
    Project, User, ProofOfBuild, ProjectMessage, AISummary,
    SummaryType, ProofStatus, ProjectStatus
)
from app.schemas.schemas import SummaryInsights

logger = logging.getLogger(__name__)


class AICopilotService:
    """Service for AI-powered project management and insights"""

    def __init__(self, db: Session):
        self.db = db
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            logger.warning("OPENAI_API_KEY not set - AI features will be limited")
        self.client = OpenAI(api_key=self.openai_api_key) if self.openai_api_key else None
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # Default to cost-effective model

    async def generate_project_summary(
        self,
        project_id: int,
        user_id: int,
        period_days: int = 7,
        summary_type: SummaryType = SummaryType.ON_DEMAND,
        include_github: bool = True,
        include_messages: bool = True
    ) -> AISummary:
        """
        Generate an AI-powered project summary analyzing multiple data sources

        Args:
            project_id: Project to analyze
            user_id: User requesting the summary (None for automated)
            period_days: Number of days to analyze
            summary_type: Type of summary (weekly, on_demand, milestone)
            include_github: Include GitHub activity
            include_messages: Include project messages

        Returns:
            AISummary object with insights
        """
        start_time = datetime.utcnow()

        # Validate project exists
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        # Calculate time period
        period_end = datetime.utcnow()
        period_start = period_end - timedelta(days=period_days)

        # Gather data from multiple sources
        github_data = []
        github_commits_count = 0
        github_prs_count = 0

        if include_github:
            github_data, github_commits_count, github_prs_count = await self._gather_github_activity(
                project, period_start, period_end
            )

        messages_data = []
        messages_count = 0

        if include_messages:
            messages_data, messages_count = await self._gather_project_messages(
                project_id, period_start, period_end
            )

        # Generate AI insights
        insights = await self._generate_ai_insights(
            project=project,
            github_data=github_data,
            messages_data=messages_data,
            period_start=period_start,
            period_end=period_end
        )

        # Calculate generation time
        generation_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        # Create summary record
        summary = AISummary(
            project_id=project_id,
            generated_by_user_id=user_id,
            summary_type=summary_type,
            title=f"{summary_type.value.replace('_', ' ').title()} Summary - {period_end.strftime('%b %d, %Y')}",
            summary=insights.summary,
            tasks_completed=insights.tasks_completed,
            blockers=insights.blockers,
            next_steps=insights.next_steps,
            key_metrics=insights.key_metrics,
            github_commits_analyzed=github_commits_count,
            github_prs_analyzed=github_prs_count,
            messages_analyzed=messages_count,
            period_start=period_start,
            period_end=period_end,
            ai_model_used=self.model,
            tokens_used=insights.key_metrics.get("tokens_used", 0),
            generation_time_ms=generation_time_ms,
            is_published=True,
            is_archived=False
        )

        self.db.add(summary)
        self.db.commit()
        self.db.refresh(summary)

        logger.info(f"Generated summary {summary.id} for project {project_id} in {generation_time_ms}ms")

        return summary

    async def _gather_github_activity(
        self,
        project: Project,
        start_date: datetime,
        end_date: datetime
    ) -> Tuple[List[Dict], int, int]:
        """Gather GitHub activity (commits, PRs) for the project"""
        github_data = []
        commits_count = 0
        prs_count = 0

        try:
            # Get proofs of build related to GitHub
            proofs = self.db.query(ProofOfBuild).filter(
                and_(
                    ProofOfBuild.project_id == project.id,
                    ProofOfBuild.verified_at >= start_date,
                    ProofOfBuild.verified_at <= end_date,
                    ProofOfBuild.status == ProofStatus.VERIFIED
                )
            ).all()

            for proof in proofs:
                if proof.github_commit_hash:
                    commits_count += 1
                    github_data.append({
                        "type": "commit",
                        "hash": proof.github_commit_hash,
                        "repo": proof.github_repo_name,
                        "date": proof.verified_at.isoformat(),
                        "description": proof.description or "Commit verified"
                    })

                if proof.github_pr_number:
                    prs_count += 1
                    github_data.append({
                        "type": "pull_request",
                        "pr_number": proof.github_pr_number,
                        "repo": proof.github_repo_name,
                        "url": proof.github_pr_url,
                        "date": proof.verified_at.isoformat(),
                        "description": proof.description or "PR verified"
                    })

            logger.info(f"Gathered {commits_count} commits and {prs_count} PRs for project {project.id}")

        except Exception as e:
            logger.error(f"Error gathering GitHub activity: {e}")

        return github_data, commits_count, prs_count

    async def _gather_project_messages(
        self,
        project_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Tuple[List[Dict], int]:
        """Gather project messages/chat for analysis"""
        messages_data = []

        try:
            messages = self.db.query(ProjectMessage).filter(
                and_(
                    ProjectMessage.project_id == project_id,
                    ProjectMessage.created_at >= start_date,
                    ProjectMessage.created_at <= end_date,
                    ProjectMessage.deleted_at.is_(None)
                )
            ).order_by(ProjectMessage.created_at).all()

            for msg in messages:
                # Get sender info
                sender = self.db.query(User).filter(User.id == msg.sender_id).first()
                sender_name = f"{sender.email}" if sender else "Unknown"

                messages_data.append({
                    "sender": sender_name,
                    "message": msg.message,
                    "date": msg.created_at.isoformat(),
                    "type": msg.message_type
                })

            logger.info(f"Gathered {len(messages)} messages for project {project_id}")

        except Exception as e:
            logger.error(f"Error gathering messages: {e}")

        return messages_data, len(messages_data)

    async def _generate_ai_insights(
        self,
        project: Project,
        github_data: List[Dict],
        messages_data: List[Dict],
        period_start: datetime,
        period_end: datetime
    ) -> SummaryInsights:
        """Generate AI insights from collected data using OpenAI"""

        if not self.client:
            # Fallback to basic summary if OpenAI not configured
            return self._generate_fallback_summary(project, github_data, messages_data, period_start, period_end)

        try:
            # Prepare context for AI
            context = self._prepare_ai_context(project, github_data, messages_data, period_start, period_end)

            # Create prompt
            prompt = f"""You are an AI Project Manager analyzing a software project. Generate a comprehensive progress digest.

Project: {project.title}
Description: {project.description}
Status: {project.status.value}
Budget: ${project.budget}
Period: {period_start.strftime('%Y-%m-%d')} to {period_end.strftime('%Y-%m-%d')}

{context}

Generate a JSON response with the following structure:
{{
    "summary": "2-3 paragraph executive summary of project progress",
    "tasks_completed": ["list of completed tasks/milestones"],
    "blockers": ["current blockers or issues identified"],
    "next_steps": ["recommended next steps and priorities"],
    "key_metrics": {{
        "activity_level": "high/medium/low",
        "progress_velocity": "accelerating/steady/slowing",
        "risk_level": "low/medium/high",
        "estimated_completion": "percentage or date estimate"
    }}
}}

Focus on actionable insights and concrete progress indicators."""

            # Call OpenAI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert AI Project Manager. Provide clear, actionable insights in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=1500
            )

            # Parse response
            result = json.loads(response.choices[0].message.content)
            tokens_used = response.usage.total_tokens

            # Add tokens to metrics
            if "key_metrics" not in result:
                result["key_metrics"] = {}
            result["key_metrics"]["tokens_used"] = tokens_used

            return SummaryInsights(
                summary=result.get("summary", ""),
                tasks_completed=result.get("tasks_completed", []),
                blockers=result.get("blockers", []),
                next_steps=result.get("next_steps", []),
                key_metrics=result.get("key_metrics", {})
            )

        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return self._generate_fallback_summary(project, github_data, messages_data, period_start, period_end)

    def _prepare_ai_context(
        self,
        project: Project,
        github_data: List[Dict],
        messages_data: List[Dict],
        period_start: datetime,
        period_end: datetime
    ) -> str:
        """Prepare context string for AI analysis"""
        context_parts = []

        # GitHub activity
        if github_data:
            context_parts.append(f"\n## GitHub Activity ({len(github_data)} events)")
            for item in github_data[:10]:  # Limit to most recent 10
                if item["type"] == "commit":
                    context_parts.append(f"- Commit {item['hash'][:7]} in {item['repo']}: {item['description']}")
                elif item["type"] == "pull_request":
                    context_parts.append(f"- PR #{item['pr_number']} in {item['repo']}: {item['description']}")

        # Messages
        if messages_data:
            context_parts.append(f"\n## Recent Communications ({len(messages_data)} messages)")
            # Summarize message themes
            for msg in messages_data[-5:]:  # Last 5 messages
                context_parts.append(f"- {msg['sender']}: {msg['message'][:100]}...")

        # Project status
        context_parts.append(f"\n## Project Status")
        context_parts.append(f"- Current status: {project.status.value}")
        if project.deadline:
            days_until_deadline = (project.deadline - datetime.utcnow()).days
            context_parts.append(f"- Deadline: {project.deadline.strftime('%Y-%m-%d')} ({days_until_deadline} days remaining)")

        return "\n".join(context_parts)

    def _generate_fallback_summary(
        self,
        project: Project,
        github_data: List[Dict],
        messages_data: List[Dict],
        period_start: datetime,
        period_end: datetime
    ) -> SummaryInsights:
        """Generate basic summary when OpenAI is not available"""

        commits = sum(1 for item in github_data if item["type"] == "commit")
        prs = sum(1 for item in github_data if item["type"] == "pull_request")

        summary = f"""Project '{project.title}' had {commits} commits and {prs} pull requests in the last {(period_end - period_start).days} days.
        {len(messages_data)} messages were exchanged between team members.
        Project status: {project.status.value}."""

        tasks = [f"Verified {commits} commits" if commits > 0 else "No commits this period"]
        blockers = ["OpenAI API key not configured - using basic summary"] if not self.client else []
        next_steps = ["Continue development", "Monitor progress"]

        return SummaryInsights(
            summary=summary,
            tasks_completed=tasks,
            blockers=blockers,
            next_steps=next_steps,
            key_metrics={
                "commits": commits,
                "prs": prs,
                "messages": len(messages_data),
                "activity_level": "high" if commits + prs > 5 else "medium" if commits + prs > 0 else "low"
            }
        )

    def get_project_summaries(
        self,
        project_id: int,
        limit: int = 10,
        include_archived: bool = False
    ) -> List[AISummary]:
        """Get summaries for a project"""
        query = self.db.query(AISummary).filter(AISummary.project_id == project_id)

        if not include_archived:
            query = query.filter(AISummary.is_archived == False)

        return query.order_by(desc(AISummary.created_at)).limit(limit).all()

    def get_latest_summary(self, project_id: int) -> Optional[AISummary]:
        """Get the most recent summary for a project"""
        return self.db.query(AISummary).filter(
            and_(
                AISummary.project_id == project_id,
                AISummary.is_published == True,
                AISummary.is_archived == False
            )
        ).order_by(desc(AISummary.created_at)).first()

    def send_message(
        self,
        project_id: int,
        sender_id: int,
        message: str,
        message_type: str = "text",
        attachments: List[str] = None,
        parent_message_id: Optional[int] = None,
        thread_id: Optional[str] = None
    ) -> ProjectMessage:
        """Send a message in a project"""

        # Validate project exists
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        msg = ProjectMessage(
            project_id=project_id,
            sender_id=sender_id,
            message=message,
            message_type=message_type,
            attachments=attachments or [],
            parent_message_id=parent_message_id,
            thread_id=thread_id,
            is_ai_generated=False,
            message_metadata={}
        )

        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)

        return msg

    def get_project_messages(
        self,
        project_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[ProjectMessage]:
        """Get messages for a project"""
        return self.db.query(ProjectMessage).filter(
            and_(
                ProjectMessage.project_id == project_id,
                ProjectMessage.deleted_at.is_(None)
            )
        ).order_by(desc(ProjectMessage.created_at)).offset(offset).limit(limit).all()

    def mark_message_read(self, message_id: int, user_id: int):
        """Mark a message as read by a user"""
        from app.models.models import MessageReadStatus

        # Check if already marked as read
        existing = self.db.query(MessageReadStatus).filter(
            and_(
                MessageReadStatus.message_id == message_id,
                MessageReadStatus.user_id == user_id
            )
        ).first()

        if not existing:
            read_status = MessageReadStatus(
                message_id=message_id,
                user_id=user_id
            )
            self.db.add(read_status)
            self.db.commit()

    def mark_all_messages_read(self, project_id: int, user_id: int):
        """Mark all messages in a project as read by a user"""
        from app.models.models import MessageReadStatus

        # Get all unread messages in the project
        messages = self.db.query(ProjectMessage).filter(
            and_(
                ProjectMessage.project_id == project_id,
                ProjectMessage.deleted_at.is_(None),
                ProjectMessage.sender_id != user_id  # Don't mark own messages
            )
        ).all()

        for message in messages:
            # Check if already marked as read
            existing = self.db.query(MessageReadStatus).filter(
                and_(
                    MessageReadStatus.message_id == message.id,
                    MessageReadStatus.user_id == user_id
                )
            ).first()

            if not existing:
                read_status = MessageReadStatus(
                    message_id=message.id,
                    user_id=user_id
                )
                self.db.add(read_status)

        self.db.commit()

    def update_online_status(self, user_id: int, is_online: bool):
        """Update user's online status"""
        from app.models.models import UserOnlineStatus
        from datetime import datetime, timezone

        status = self.db.query(UserOnlineStatus).filter(
            UserOnlineStatus.user_id == user_id
        ).first()

        if status:
            status.is_online = is_online
            status.last_seen = datetime.now(timezone.utc)
        else:
            status = UserOnlineStatus(
                user_id=user_id,
                is_online=is_online
            )
            self.db.add(status)

        self.db.commit()
        self.db.refresh(status)
        return status

    def get_online_status(self, user_id: int):
        """Get user's online status"""
        from app.models.models import UserOnlineStatus
        from datetime import datetime, timezone

        status = self.db.query(UserOnlineStatus).filter(
            UserOnlineStatus.user_id == user_id
        ).first()

        if not status:
            # Return default offline status
            return UserOnlineStatus(
                user_id=user_id,
                is_online=False,
                last_seen=datetime.now(timezone.utc)
            )

        return status

    def start_typing(self, project_id: int, user_id: int):
        """Start typing indicator for a user in a project"""
        from app.models.models import TypingIndicator
        from datetime import datetime, timezone

        indicator = self.db.query(TypingIndicator).filter(
            and_(
                TypingIndicator.project_id == project_id,
                TypingIndicator.user_id == user_id
            )
        ).first()

        if indicator:
            indicator.updated_at = datetime.now(timezone.utc)
        else:
            indicator = TypingIndicator(
                project_id=project_id,
                user_id=user_id
            )
            self.db.add(indicator)

        self.db.commit()

    def stop_typing(self, project_id: int, user_id: int):
        """Stop typing indicator for a user in a project"""
        from app.models.models import TypingIndicator

        self.db.query(TypingIndicator).filter(
            and_(
                TypingIndicator.project_id == project_id,
                TypingIndicator.user_id == user_id
            )
        ).delete()

        self.db.commit()

    def get_typing_indicators(self, project_id: int, exclude_user_id: int):
        """Get list of users currently typing in a project (excluding specified user)"""
        from app.models.models import TypingIndicator, User
        from datetime import datetime, timezone, timedelta

        # Only show typing indicators updated within last 10 seconds
        cutoff_time = datetime.now(timezone.utc) - timedelta(seconds=10)

        indicators = self.db.query(TypingIndicator, User).join(
            User, TypingIndicator.user_id == User.id
        ).filter(
            and_(
                TypingIndicator.project_id == project_id,
                TypingIndicator.user_id != exclude_user_id,
                TypingIndicator.updated_at >= cutoff_time
            )
        ).all()

        return [
            {
                "user_id": indicator.user_id,
                "user_name": user.full_name or user.username,
                "started_typing_at": indicator.started_typing_at
            }
            for indicator, user in indicators
        ]
