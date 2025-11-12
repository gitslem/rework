"""
GitHub Webhooks for Automatic Proof Creation
Handles GitHub push events to automatically create proofs when commits contain project ID tags
"""

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import hmac
import hashlib
import logging
import re
from datetime import datetime

from app.db.database import get_db
from app.models.models import (
    User, Project, ProofOfBuild, Application, ApplicationStatus,
    ProofType, ProofStatus
)
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def verify_github_signature(payload_body: bytes, signature_header: str, secret: str) -> bool:
    """Verify GitHub webhook signature"""
    if not signature_header:
        return False

    hash_algorithm, github_signature = signature_header.split('=')
    algorithm = hashlib.sha256 if hash_algorithm == 'sha256' else hashlib.sha1

    mac = hmac.new(secret.encode(), msg=payload_body, digestmod=algorithm)
    expected_signature = mac.hexdigest()

    return hmac.compare_digest(expected_signature, github_signature)


def extract_project_ids_from_commit(commit_message: str) -> List[int]:
    """
    Extract project IDs from commit message
    Supports formats:
    - #relay-123
    - #project-123
    - #proj-123
    - [relay-123]
    - [project-123]
    """
    patterns = [
        r'#relay-(\d+)',
        r'#project-(\d+)',
        r'#proj-(\d+)',
        r'\[relay-(\d+)\]',
        r'\[project-(\d+)\]',
        r'\[proj-(\d+)\]'
    ]

    project_ids = []
    for pattern in patterns:
        matches = re.findall(pattern, commit_message, re.IGNORECASE)
        project_ids.extend([int(m) for m in matches])

    # Remove duplicates while preserving order
    return list(dict.fromkeys(project_ids))


def get_user_by_github_username(db: Session, github_username: str) -> Optional[User]:
    """Find user by GitHub username from their profile"""
    from app.models.models import Profile

    profile = db.query(Profile).filter(Profile.github_username == github_username).first()
    if profile:
        return db.query(User).filter(User.id == profile.user_id).first()
    return None


def create_proof_from_commit(
    db: Session,
    user: User,
    project_id: int,
    commit_data: Dict[str, Any],
    repo_name: str
) -> Optional[ProofOfBuild]:
    """Create a proof of build from commit data"""
    try:
        # Check if user has accepted application for this project
        application = db.query(Application).filter(
            Application.project_id == project_id,
            Application.applicant_id == user.id,
            Application.status == ApplicationStatus.ACCEPTED
        ).first()

        if not application:
            logger.warning(f"User {user.id} has no accepted application for project {project_id}")
            return None

        # Check if proof already exists for this commit
        existing = db.query(ProofOfBuild).filter(
            ProofOfBuild.github_commit_hash == commit_data['id'],
            ProofOfBuild.project_id == project_id
        ).first()

        if existing:
            logger.info(f"Proof already exists for commit {commit_data['id'][:7]}")
            return existing

        # Extract commit metadata
        commit_message = commit_data.get('message', '')
        author_name = commit_data.get('author', {}).get('name', 'Unknown')
        author_email = commit_data.get('author', {}).get('email', '')
        timestamp = commit_data.get('timestamp')
        commit_url = commit_data.get('url', '')

        # Get stats from commit (if available)
        added = commit_data.get('added', [])
        removed = commit_data.get('removed', [])
        modified = commit_data.get('modified', [])

        # Create description
        first_line = commit_message.split('\n')[0][:100]
        description = f"Auto: {first_line}"

        # Create verification metadata
        verification_metadata = {
            'author': author_name,
            'author_email': author_email,
            'commit_message': commit_message,
            'commit_url': commit_url,
            'timestamp': timestamp,
            'files_added': len(added),
            'files_removed': len(removed),
            'files_modified': len(modified),
            'files_changed': len(added) + len(removed) + len(modified),
            'auto_created': True,
            'webhook_processed_at': datetime.utcnow().isoformat()
        }

        # Create the proof
        proof = ProofOfBuild(
            user_id=user.id,
            project_id=project_id,
            proof_type=ProofType.COMMIT,
            status=ProofStatus.VERIFIED,  # Auto-verify webhook proofs
            description=description,
            github_repo_name=repo_name,
            github_commit_hash=commit_data['id'],
            github_repo_url=f"https://github.com/{repo_name}",
            github_branch=commit_data.get('ref', '').replace('refs/heads/', ''),
            verified_at=datetime.utcnow(),
            verification_metadata=verification_metadata
        )

        db.add(proof)
        db.commit()
        db.refresh(proof)

        logger.info(f"Created proof {proof.id} from commit {commit_data['id'][:7]} for project {project_id}")
        return proof

    except Exception as e:
        logger.error(f"Error creating proof from commit: {str(e)}")
        db.rollback()
        return None


@router.post("/github", status_code=status.HTTP_200_OK)
async def github_webhook(
    request: Request,
    x_github_event: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    GitHub webhook endpoint for automatic proof creation

    Setup instructions:
    1. Go to your GitHub repository settings
    2. Navigate to Webhooks
    3. Add webhook with URL: https://yourdomain.com/api/v1/webhooks/github
    4. Content type: application/json
    5. Secret: Set in GITHUB_WEBHOOK_SECRET env variable
    6. Events: Select "Push events"

    Commit message format:
    - Include project ID tag in commit message: #relay-123, #project-123, or [relay-123]
    - Multiple projects: #relay-123 #relay-456
    """

    # Read request body
    payload_body = await request.body()
    payload = await request.json()

    # Verify signature if secret is configured
    if hasattr(settings, 'GITHUB_WEBHOOK_SECRET') and settings.GITHUB_WEBHOOK_SECRET:
        if not x_hub_signature_256:
            logger.warning("GitHub webhook signature missing")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Signature required"
            )

        if not verify_github_signature(payload_body, x_hub_signature_256, settings.GITHUB_WEBHOOK_SECRET):
            logger.warning("GitHub webhook signature verification failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature"
            )

    # Only handle push events
    if x_github_event != 'push':
        logger.info(f"Ignoring GitHub event: {x_github_event}")
        return {"message": "Event type not supported", "event": x_github_event}

    # Extract data
    repository = payload.get('repository', {})
    repo_name = repository.get('full_name', '')
    commits = payload.get('commits', [])
    pusher = payload.get('pusher', {})
    pusher_name = pusher.get('name', '')

    logger.info(f"Received push event from {repo_name} by {pusher_name} with {len(commits)} commits")

    if not commits:
        return {"message": "No commits in push event"}

    # Find user by GitHub username
    user = get_user_by_github_username(db, pusher_name)
    if not user:
        logger.warning(f"No user found for GitHub username: {pusher_name}")
        return {
            "message": "User not found",
            "hint": "Make sure your GitHub username is set in your Relaywork profile"
        }

    # Process each commit
    proofs_created = []
    processed_projects = set()

    for commit in commits:
        commit_message = commit.get('message', '')
        commit_id = commit.get('id', '')[:7]

        # Extract project IDs from commit message
        project_ids = extract_project_ids_from_commit(commit_message)

        if not project_ids:
            logger.debug(f"No project IDs found in commit {commit_id}")
            continue

        logger.info(f"Found project IDs {project_ids} in commit {commit_id}")

        # Create proof for each project
        for project_id in project_ids:
            # Skip if we already processed this project in this push
            if project_id in processed_projects:
                continue

            # Verify project exists
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project:
                logger.warning(f"Project {project_id} not found")
                continue

            # Create proof
            proof = create_proof_from_commit(db, user, project_id, commit, repo_name)
            if proof:
                proofs_created.append({
                    'proof_id': proof.id,
                    'project_id': project_id,
                    'commit_hash': commit.get('id')[:7],
                    'description': proof.description
                })
                processed_projects.add(project_id)

    response = {
        "message": "Webhook processed successfully",
        "repository": repo_name,
        "commits_processed": len(commits),
        "proofs_created": len(proofs_created),
        "proofs": proofs_created
    }

    logger.info(f"Webhook processing complete: {len(proofs_created)} proofs created")
    return response


@router.get("/github/test")
def test_github_webhook():
    """Test endpoint to verify webhook is accessible"""
    return {
        "status": "ok",
        "message": "GitHub webhook endpoint is active",
        "instructions": {
            "setup": "Configure webhook in GitHub repository settings",
            "url": "/api/v1/webhooks/github",
            "content_type": "application/json",
            "events": ["push"],
            "commit_format": "Include project ID in commit message: #relay-123 or [relay-123]"
        }
    }


@router.post("/github/manual-sync", status_code=status.HTTP_200_OK)
async def manual_sync_commits(
    repository_url: str,
    branch: str = "main",
    since_days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Manually sync commits from a repository
    Useful for backfilling proofs or testing

    Note: Requires GitHub access token in user's profile
    """
    # This is a placeholder for manual sync functionality
    # Would need to implement GitHub API calls to fetch commit history

    return {
        "message": "Manual sync not yet implemented",
        "hint": "Use webhooks for automatic proof creation"
    }
