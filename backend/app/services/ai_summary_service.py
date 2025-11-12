"""
AI Summary Service

Generates AI-powered summaries of commit batches, proofs, and milestone work
using OpenAI API.
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)


class AISummaryService:
    """Service for generating AI summaries of proof of build data"""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4"  # or "gpt-3.5-turbo" for cost savings

    def generate_commit_summary(
        self,
        commits: List[Dict],
        context: Optional[str] = None
    ) -> str:
        """
        Generate a summary of multiple commits.

        Args:
            commits: List of commit dictionaries containing message, hash, author, date, etc.
            context: Optional context about the project or milestone

        Returns:
            AI-generated summary of the commits
        """
        if not self.api_key:
            logger.warning("OpenAI API key not configured, returning basic summary")
            return self._generate_basic_summary(commits)

        try:
            import openai
            openai.api_key = self.api_key

            # Prepare commit data for AI
            commit_texts = []
            for commit in commits:
                commit_msg = commit.get("message", "")
                commit_hash = commit.get("hash", "")[:7]
                author = commit.get("author", "")
                date = commit.get("date", "")
                changes = commit.get("changes", {})

                additions = changes.get("additions", 0)
                deletions = changes.get("deletions", 0)
                files_changed = changes.get("files_changed", 0)

                commit_text = f"[{commit_hash}] {commit_msg}\n"
                commit_text += f"  Author: {author}, Date: {date}\n"
                commit_text += f"  Changes: +{additions}/-{deletions} across {files_changed} files"

                commit_texts.append(commit_text)

            # Create prompt
            commits_str = "\n\n".join(commit_texts)

            prompt = f"""You are a technical project manager reviewing work delivery for a freelance project.
Analyze the following commits and provide a concise, professional summary.

{f"Project Context: {context}" if context else ""}

Commits ({len(commits)} total):

{commits_str}

Please provide:
1. A brief overview of the work completed (2-3 sentences)
2. Key technical changes or features implemented
3. Overall assessment of the code quality and completeness

Keep the summary professional, concise, and focused on deliverables."""

            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a technical project manager reviewing freelance developer work."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )

            summary = response.choices[0].message.content.strip()
            logger.info(f"Generated AI summary for {len(commits)} commits")
            return summary

        except Exception as e:
            logger.error(f"Failed to generate AI summary: {str(e)}", exc_info=True)
            return self._generate_basic_summary(commits)

    def generate_milestone_summary(
        self,
        milestone_data: Dict,
        proofs: List[Dict]
    ) -> str:
        """
        Generate a summary for a milestone based on its proofs.

        Args:
            milestone_data: Dictionary containing milestone info (title, description, etc.)
            proofs: List of proof dictionaries

        Returns:
            AI-generated summary of the milestone work
        """
        if not self.api_key:
            logger.warning("OpenAI API key not configured, returning basic summary")
            return self._generate_basic_milestone_summary(milestone_data, proofs)

        try:
            import openai
            openai.api_key = self.api_key

            # Prepare proof data
            proof_texts = []
            for proof in proofs:
                proof_type = proof.get("proof_type", "")
                description = proof.get("description", "")
                verified_at = proof.get("verified_at", "")
                status = proof.get("status", "")

                metadata = proof.get("verification_metadata", {})

                proof_text = f"[{proof_type}] {description}"
                if proof_type == "commit" and metadata.get("commit_message"):
                    proof_text += f"\n  Commit: {metadata.get('commit_message')}"
                    proof_text += f"\n  Changes: +{metadata.get('additions', 0)}/-{metadata.get('deletions', 0)}"
                elif proof_type == "huggingface_model" and metadata.get("model_id"):
                    proof_text += f"\n  Model: {metadata.get('model_id')}"
                    proof_text += f"\n  Downloads: {metadata.get('downloads', 0)}, Likes: {metadata.get('likes', 0)}"

                proof_text += f"\n  Status: {status}, Verified: {verified_at}"
                proof_texts.append(proof_text)

            proofs_str = "\n\n".join(proof_texts)

            milestone_title = milestone_data.get("title", "")
            milestone_desc = milestone_data.get("description", "")

            prompt = f"""You are reviewing a completed milestone for a freelance project.
Analyze the following proofs of work and provide a professional summary.

Milestone: {milestone_title}
Description: {milestone_desc}

Submitted Proofs ({len(proofs)} total):

{proofs_str}

Please provide:
1. Summary of deliverables completed
2. Technical highlights and key achievements
3. Recommendation on whether the milestone requirements are met

Keep it professional and concise (3-4 paragraphs)."""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a technical project manager reviewing milestone deliverables."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                temperature=0.7
            )

            summary = response.choices[0].message.content.strip()
            logger.info(f"Generated AI milestone summary for: {milestone_title}")
            return summary

        except Exception as e:
            logger.error(f"Failed to generate milestone AI summary: {str(e)}", exc_info=True)
            return self._generate_basic_milestone_summary(milestone_data, proofs)

    def _generate_basic_summary(self, commits: List[Dict]) -> str:
        """Generate a basic summary when AI is not available"""
        if not commits:
            return "No commits to summarize."

        total_additions = sum(c.get("changes", {}).get("additions", 0) for c in commits)
        total_deletions = sum(c.get("changes", {}).get("deletions", 0) for c in commits)
        total_files = sum(c.get("changes", {}).get("files_changed", 0) for c in commits)

        unique_authors = len(set(c.get("author", "Unknown") for c in commits))

        summary = f"Summary of {len(commits)} commits:\n\n"
        summary += f"- Total changes: +{total_additions}/-{total_deletions}\n"
        summary += f"- Files modified: {total_files}\n"
        summary += f"- Contributors: {unique_authors}\n\n"

        # List first 3 commit messages
        summary += "Key commits:\n"
        for i, commit in enumerate(commits[:3], 1):
            msg = commit.get("message", "").split("\n")[0][:80]  # First line, max 80 chars
            summary += f"{i}. {msg}\n"

        if len(commits) > 3:
            summary += f"... and {len(commits) - 3} more commits"

        return summary

    def _generate_basic_milestone_summary(
        self,
        milestone_data: Dict,
        proofs: List[Dict]
    ) -> str:
        """Generate a basic milestone summary when AI is not available"""
        title = milestone_data.get("title", "Milestone")

        summary = f"Milestone: {title}\n\n"
        summary += f"Total proofs submitted: {len(proofs)}\n\n"

        # Count proof types
        proof_types = {}
        verified_count = 0

        for proof in proofs:
            proof_type = proof.get("proof_type", "unknown")
            proof_types[proof_type] = proof_types.get(proof_type, 0) + 1

            if proof.get("status") == "verified":
                verified_count += 1

        summary += "Proof types:\n"
        for ptype, count in proof_types.items():
            summary += f"- {ptype}: {count}\n"

        summary += f"\nVerified proofs: {verified_count}/{len(proofs)}\n"

        if verified_count == len(proofs):
            summary += "\n✅ All proofs are verified and ready for approval."
        else:
            summary += f"\n⚠️ {len(proofs) - verified_count} proofs pending verification."

        return summary


# Global instance
ai_summary_service = AISummaryService()
