from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import hashlib
import hmac
import uuid
import requests
import logging

from app.db.database import get_db
from app.models.models import User, ProofOfBuild, BuildCertificate, ProofArtifact, Project, ProofType, ProofStatus, CertificateStatus
from app.schemas.schemas import (
    ProofOfBuildCreate, ProofOfBuildResponse, BuildCertificateResponse,
    GitHubCommitVerifyRequest, GitHubPRVerifyRequest, GitHubRepoVerifyRequest,
    FileVerifyRequest, GenerateCertificateRequest, ProofArtifactCreate, ProofArtifactResponse,
    GitHubCommitInfo, GitHubPRInfo, GitHubRepoInfo
)
from app.api.dependencies import get_current_user
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/proofs", tags=["proof-of-build"])


# Helper Functions
def get_github_headers(user: User) -> dict:
    """Get GitHub API headers with user's access token"""
    if not user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account not connected. Please connect your GitHub account first."
        )
    return {
        "Authorization": f"Bearer {user.github_access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }


def calculate_file_hash(content: bytes) -> str:
    """Calculate SHA-256 hash of file content"""
    return hashlib.sha256(content).hexdigest()


def sign_data(data: str) -> str:
    """Sign data using HMAC-SHA256"""
    key = settings.PROOF_SIGNATURE_KEY.encode()
    message = data.encode()
    signature = hmac.new(key, message, hashlib.sha256).hexdigest()
    return signature


def verify_signature(data: str, signature: str) -> bool:
    """Verify HMAC-SHA256 signature"""
    expected_signature = sign_data(data)
    return hmac.compare_digest(expected_signature, signature)


# GitHub Verification Endpoints
@router.post("/verify/github/commit", response_model=ProofOfBuildResponse)
def verify_github_commit(
    request: GitHubCommitVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify a GitHub commit and create proof"""
    try:
        headers = get_github_headers(current_user)

        # Get commit info from GitHub API
        api_url = f"https://api.github.com/repos/{request.repo_name}/commits/{request.commit_hash}"
        response = requests.get(api_url, headers=headers)

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Commit not found or repository not accessible"
            )
        elif response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"GitHub API error: {response.text}"
            )

        commit_data = response.json()

        # Extract commit information
        commit_sha = commit_data["sha"]
        commit_message = commit_data["commit"]["message"]
        author = commit_data["commit"]["author"]["name"]
        commit_date = datetime.fromisoformat(commit_data["commit"]["author"]["date"].replace("Z", "+00:00"))

        # Create verification metadata
        verification_metadata = {
            "commit_message": commit_message,
            "author": author,
            "author_email": commit_data["commit"]["author"]["email"],
            "commit_date": commit_date.isoformat(),
            "verified": commit_data["commit"].get("verification", {}).get("verified", False),
            "additions": commit_data["stats"].get("additions", 0),
            "deletions": commit_data["stats"].get("deletions", 0),
            "total_changes": commit_data["stats"].get("total", 0),
            "files_changed": len(commit_data.get("files", []))
        }

        # Create data string for signature
        signature_data = f"{current_user.id}:{request.repo_name}:{commit_sha}:{commit_date.isoformat()}"
        signature = sign_data(signature_data)

        # Create proof
        proof = ProofOfBuild(
            user_id=current_user.id,
            project_id=request.project_id,
            proof_type=ProofType.COMMIT,
            status=ProofStatus.VERIFIED,
            github_repo_url=f"https://github.com/{request.repo_name}",
            github_repo_name=request.repo_name,
            github_commit_hash=commit_sha,
            description=request.description or commit_message,
            milestone_name=request.milestone_name,
            verified_at=datetime.utcnow(),
            verification_signature=signature,
            verification_metadata=verification_metadata,
            proof_metadata={"github_api_response": commit_data}
        )

        db.add(proof)
        db.commit()
        db.refresh(proof)

        logger.info(f"Created commit proof {proof.id} for user {current_user.id}")
        return proof

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify GitHub commit: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify commit: {str(e)}"
        )


@router.post("/verify/github/pr", response_model=ProofOfBuildResponse)
def verify_github_pr(
    request: GitHubPRVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify a GitHub pull request and create proof"""
    try:
        headers = get_github_headers(current_user)

        # Get PR info from GitHub API
        api_url = f"https://api.github.com/repos/{request.repo_name}/pulls/{request.pr_number}"
        response = requests.get(api_url, headers=headers)

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pull request not found or repository not accessible"
            )
        elif response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"GitHub API error: {response.text}"
            )

        pr_data = response.json()

        # Extract PR information
        pr_number = pr_data["number"]
        pr_title = pr_data["title"]
        pr_state = pr_data["state"]
        author = pr_data["user"]["login"]
        created_at = datetime.fromisoformat(pr_data["created_at"].replace("Z", "+00:00"))
        merged_at = datetime.fromisoformat(pr_data["merged_at"].replace("Z", "+00:00")) if pr_data.get("merged_at") else None

        # Create verification metadata
        verification_metadata = {
            "pr_title": pr_title,
            "pr_state": pr_state,
            "author": author,
            "created_at": created_at.isoformat(),
            "merged_at": merged_at.isoformat() if merged_at else None,
            "merged": pr_data.get("merged", False),
            "commits": pr_data.get("commits", 0),
            "additions": pr_data.get("additions", 0),
            "deletions": pr_data.get("deletions", 0),
            "changed_files": pr_data.get("changed_files", 0)
        }

        # Create data string for signature
        signature_data = f"{current_user.id}:{request.repo_name}:pr-{pr_number}:{created_at.isoformat()}"
        signature = sign_data(signature_data)

        # Create proof
        proof = ProofOfBuild(
            user_id=current_user.id,
            project_id=request.project_id,
            proof_type=ProofType.PULL_REQUEST,
            status=ProofStatus.VERIFIED,
            github_repo_url=f"https://github.com/{request.repo_name}",
            github_repo_name=request.repo_name,
            github_pr_number=pr_number,
            github_pr_url=pr_data["html_url"],
            description=request.description or pr_title,
            milestone_name=request.milestone_name,
            verified_at=datetime.utcnow(),
            verification_signature=signature,
            verification_metadata=verification_metadata,
            proof_metadata={"github_api_response": pr_data}
        )

        db.add(proof)
        db.commit()
        db.refresh(proof)

        logger.info(f"Created PR proof {proof.id} for user {current_user.id}")
        return proof

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify GitHub PR: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify pull request: {str(e)}"
        )


@router.post("/verify/github/repo", response_model=ProofOfBuildResponse)
def verify_github_repo(
    request: GitHubRepoVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify a GitHub repository and create proof"""
    try:
        headers = get_github_headers(current_user)

        # Get repo info from GitHub API
        api_url = f"https://api.github.com/repos/{request.repo_name}"
        response = requests.get(api_url, headers=headers)

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found or not accessible"
            )
        elif response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"GitHub API error: {response.text}"
            )

        repo_data = response.json()

        # Extract repo information
        repo_name = repo_data["name"]
        full_name = repo_data["full_name"]
        created_at = datetime.fromisoformat(repo_data["created_at"].replace("Z", "+00:00"))

        # Create verification metadata
        verification_metadata = {
            "repo_name": repo_name,
            "full_name": full_name,
            "description": repo_data.get("description"),
            "owner": repo_data["owner"]["login"],
            "created_at": created_at.isoformat(),
            "updated_at": repo_data["updated_at"],
            "language": repo_data.get("language"),
            "stars": repo_data.get("stargazers_count", 0),
            "forks": repo_data.get("forks_count", 0),
            "watchers": repo_data.get("watchers_count", 0),
            "open_issues": repo_data.get("open_issues_count", 0)
        }

        # Create data string for signature
        signature_data = f"{current_user.id}:{full_name}:{created_at.isoformat()}"
        signature = sign_data(signature_data)

        # Create proof
        proof = ProofOfBuild(
            user_id=current_user.id,
            project_id=request.project_id,
            proof_type=ProofType.REPOSITORY,
            status=ProofStatus.VERIFIED,
            github_repo_url=repo_data["html_url"],
            github_repo_name=full_name,
            description=f"Repository: {full_name}",
            milestone_name=request.milestone_name,
            verified_at=datetime.utcnow(),
            verification_signature=signature,
            verification_metadata=verification_metadata,
            proof_metadata={"github_api_response": repo_data}
        )

        db.add(proof)
        db.commit()
        db.refresh(proof)

        logger.info(f"Created repo proof {proof.id} for user {current_user.id}")
        return proof

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify GitHub repository: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify repository: {str(e)}"
        )


# File/Screenshot Verification
@router.post("/verify/file", response_model=ProofOfBuildResponse)
def verify_file(
    request: FileVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify a file or screenshot and create proof"""
    try:
        # Calculate hash if not provided
        file_hash = request.file_hash
        if not file_hash and request.file_content:
            file_hash = calculate_file_hash(request.file_content.encode())

        if not file_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either file_hash or file_content must be provided"
            )

        # Create verification metadata
        verification_metadata = {
            "file_name": request.file_name,
            "file_size": request.file_size,
            "file_hash": file_hash,
            "artifact_type": request.artifact_type,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Create data string for signature
        signature_data = f"{current_user.id}:{file_hash}:{request.file_size}:{datetime.utcnow().isoformat()}"
        signature = sign_data(signature_data)

        # Determine proof type based on artifact type
        proof_type = ProofType.SCREENSHOT if request.artifact_type == "screenshot" else ProofType.FILE

        # Create proof
        proof = ProofOfBuild(
            user_id=current_user.id,
            project_id=request.project_id,
            proof_type=proof_type,
            status=ProofStatus.VERIFIED,
            file_name=request.file_name,
            file_url=request.file_url,
            file_hash=file_hash,
            file_size=request.file_size,
            description=request.description or f"File: {request.file_name}",
            milestone_name=request.milestone_name,
            verified_at=datetime.utcnow(),
            verification_signature=signature,
            verification_metadata=verification_metadata
        )

        db.add(proof)
        db.commit()
        db.refresh(proof)

        logger.info(f"Created file proof {proof.id} for user {current_user.id}")
        return proof

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify file: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify file: {str(e)}"
        )


# Proof Management
@router.get("/", response_model=List[ProofOfBuildResponse])
def get_proofs(
    project_id: Optional[int] = None,
    proof_type: Optional[ProofType] = None,
    status: Optional[ProofStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all proofs for current user with optional filters"""
    query = db.query(ProofOfBuild).filter(ProofOfBuild.user_id == current_user.id)

    if project_id:
        query = query.filter(ProofOfBuild.project_id == project_id)
    if proof_type:
        query = query.filter(ProofOfBuild.proof_type == proof_type)
    if status:
        query = query.filter(ProofOfBuild.status == status)

    proofs = query.order_by(ProofOfBuild.created_at.desc()).all()
    return proofs


@router.get("/{proof_id}", response_model=ProofOfBuildResponse)
def get_proof(
    proof_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific proof by ID"""
    proof = db.query(ProofOfBuild).filter(
        ProofOfBuild.id == proof_id,
        ProofOfBuild.user_id == current_user.id
    ).first()

    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof not found"
        )

    return proof


@router.delete("/{proof_id}")
def delete_proof(
    proof_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a proof"""
    proof = db.query(ProofOfBuild).filter(
        ProofOfBuild.id == proof_id,
        ProofOfBuild.user_id == current_user.id
    ).first()

    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof not found"
        )

    db.delete(proof)
    db.commit()

    return {"message": "Proof deleted successfully"}


# Proof Artifacts
@router.post("/{proof_id}/artifacts", response_model=ProofArtifactResponse)
def add_proof_artifact(
    proof_id: int,
    artifact: ProofArtifactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an artifact to a proof"""
    # Verify proof ownership
    proof = db.query(ProofOfBuild).filter(
        ProofOfBuild.id == proof_id,
        ProofOfBuild.user_id == current_user.id
    ).first()

    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof not found"
        )

    # Create artifact
    db_artifact = ProofArtifact(
        proof_id=proof_id,
        artifact_type=artifact.artifact_type,
        file_name=artifact.file_name,
        file_url=artifact.file_url,
        file_hash=artifact.file_hash,
        file_size=artifact.file_size,
        mime_type=artifact.mime_type,
        description=artifact.description,
        artifact_metadata=artifact.artifact_metadata
    )

    db.add(db_artifact)
    db.commit()
    db.refresh(db_artifact)

    return db_artifact


@router.get("/{proof_id}/artifacts", response_model=List[ProofArtifactResponse])
def get_proof_artifacts(
    proof_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all artifacts for a proof"""
    # Verify proof ownership
    proof = db.query(ProofOfBuild).filter(
        ProofOfBuild.id == proof_id,
        ProofOfBuild.user_id == current_user.id
    ).first()

    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proof not found"
        )

    artifacts = db.query(ProofArtifact).filter(ProofArtifact.proof_id == proof_id).all()
    return artifacts


# Certificate Generation
@router.post("/certificates", response_model=BuildCertificateResponse)
def generate_certificate(
    request: GenerateCertificateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a signed certificate for verified proofs"""
    try:
        # Verify all proofs exist and belong to user
        proofs = db.query(ProofOfBuild).filter(
            ProofOfBuild.id.in_(request.proof_ids),
            ProofOfBuild.user_id == current_user.id
        ).all()

        if len(proofs) != len(request.proof_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Some proofs not found or do not belong to you"
            )

        # Verify all proofs are verified
        unverified = [p for p in proofs if p.status != ProofStatus.VERIFIED]
        if unverified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"All proofs must be verified. Found {len(unverified)} unverified proofs."
            )

        # Generate unique certificate ID
        certificate_id = f"CERT-{uuid.uuid4().hex[:16].upper()}"

        # Create certificate data
        milestone_date = datetime.utcnow()
        certificate_data = {
            "certificate_id": certificate_id,
            "title": request.title,
            "milestone_name": request.milestone_name,
            "description": request.description,
            "user_id": current_user.id,
            "user_email": current_user.email,
            "project_id": request.project_id,
            "issued_at": milestone_date.isoformat(),
            "proofs": [
                {
                    "proof_id": p.id,
                    "proof_type": p.proof_type.value,
                    "description": p.description,
                    "verified_at": p.verified_at.isoformat() if p.verified_at else None,
                    "github_repo": p.github_repo_name,
                    "github_commit": p.github_commit_hash,
                    "github_pr": p.github_pr_number,
                    "file_name": p.file_name,
                    "file_hash": p.file_hash
                }
                for p in proofs
            ]
        }

        # Create signature
        signature_data = f"{certificate_id}:{current_user.id}:{milestone_date.isoformat()}:{','.join(map(str, request.proof_ids))}"
        signature = sign_data(signature_data)

        # Calculate expiration date if specified
        expires_at = None
        if request.expires_in_days:
            expires_at = milestone_date + timedelta(days=request.expires_in_days)

        # Create certificate
        certificate = BuildCertificate(
            user_id=current_user.id,
            project_id=request.project_id,
            certificate_id=certificate_id,
            title=request.title,
            description=request.description,
            milestone_name=request.milestone_name,
            milestone_date=milestone_date,
            status=CertificateStatus.ACTIVE,
            signature=signature,
            signature_algorithm="HMAC-SHA256",
            certificate_data=certificate_data,
            verification_url=f"{settings.FRONTEND_URL}/verify/{certificate_id}",
            proof_ids=request.proof_ids,
            expires_at=expires_at
        )

        db.add(certificate)
        db.commit()
        db.refresh(certificate)

        logger.info(f"Generated certificate {certificate_id} for user {current_user.id}")
        return certificate

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate certificate: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate certificate: {str(e)}"
        )


@router.get("/certificates", response_model=List[BuildCertificateResponse])
def get_certificates(
    project_id: Optional[int] = None,
    status: Optional[CertificateStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all certificates for current user"""
    query = db.query(BuildCertificate).filter(BuildCertificate.user_id == current_user.id)

    if project_id:
        query = query.filter(BuildCertificate.project_id == project_id)
    if status:
        query = query.filter(BuildCertificate.status == status)

    certificates = query.order_by(BuildCertificate.issued_at.desc()).all()
    return certificates


@router.get("/certificates/{certificate_id}", response_model=BuildCertificateResponse)
def get_certificate(
    certificate_id: str,
    db: Session = Depends(get_db)
):
    """Get a certificate by ID (public endpoint for verification)"""
    certificate = db.query(BuildCertificate).filter(
        BuildCertificate.certificate_id == certificate_id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    return certificate


@router.post("/certificates/{cert_id}/verify")
def verify_certificate(
    cert_id: int,
    db: Session = Depends(get_db)
):
    """Verify a certificate's authenticity"""
    certificate = db.query(BuildCertificate).filter(BuildCertificate.id == cert_id).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    # Check if certificate is revoked or expired
    if certificate.status == CertificateStatus.REVOKED:
        return {
            "valid": False,
            "reason": "Certificate has been revoked",
            "revoked_at": certificate.revoked_at,
            "revocation_reason": certificate.revocation_reason
        }

    if certificate.expires_at and certificate.expires_at < datetime.utcnow():
        return {
            "valid": False,
            "reason": "Certificate has expired",
            "expired_at": certificate.expires_at
        }

    # Verify signature
    signature_data = f"{certificate.certificate_id}:{certificate.user_id}:{certificate.issued_at.isoformat()}:{','.join(map(str, certificate.proof_ids))}"
    is_valid = verify_signature(signature_data, certificate.signature)

    return {
        "valid": is_valid,
        "certificate_id": certificate.certificate_id,
        "issued_at": certificate.issued_at,
        "expires_at": certificate.expires_at,
        "status": certificate.status,
        "proofs_count": len(certificate.proof_ids)
    }


@router.post("/certificates/{cert_id}/revoke")
def revoke_certificate(
    cert_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revoke a certificate"""
    certificate = db.query(BuildCertificate).filter(
        BuildCertificate.id == cert_id,
        BuildCertificate.user_id == current_user.id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    certificate.status = CertificateStatus.REVOKED
    certificate.revoked_at = datetime.utcnow()
    certificate.revocation_reason = reason

    db.commit()

    return {"message": "Certificate revoked successfully"}


# Hugging Face helper function
def get_huggingface_headers(user: User) -> dict:
    """Get Hugging Face API headers with user's access token"""
    if not user.huggingface_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hugging Face account not connected. Please connect your Hugging Face account first."
        )
    return {
        "Authorization": f"Bearer {user.huggingface_access_token}",
        "Accept": "application/json"
    }


# Hugging Face Model Verification
@router.post("/verify/huggingface/model", response_model=ProofOfBuildResponse)
def verify_huggingface_model(
    model_id: str,
    project_id: Optional[int] = None,
    description: Optional[str] = None,
    milestone_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify a Hugging Face model and create proof.
    
    Args:
        model_id: HF model ID (e.g., "username/model-name" or full URL)
        project_id: Optional project to link proof to
        description: Optional description for the proof
        milestone_name: Optional milestone name
    """
    try:
        headers = get_huggingface_headers(current_user)
        
        # Extract model ID from URL if provided
        if "huggingface.co" in model_id:
            # Extract from URL like https://huggingface.co/username/model-name
            parts = model_id.split("/")
            if len(parts) >= 2:
                model_id = "/".join(parts[-2:])  # Get username/model-name
        
        # Get model info from Hugging Face API
        api_url = f"https://huggingface.co/api/models/{model_id}"
        response = requests.get(api_url, headers=headers)
        
        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Model '{model_id}' not found or not accessible"
            )
        elif response.status_code != 200:
            logger.error(f"Hugging Face API error: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hugging Face API error: {response.text}"
            )
        
        model_data = response.json()
        
        # Extract model information
        model_name = model_data.get("id") or model_data.get("modelId") or model_id
        author = model_data.get("author", "")
        created_at_str = model_data.get("created_at") or model_data.get("createdAt")
        last_modified_str = model_data.get("lastModified") or model_data.get("last_modified")
        
        # Parse dates
        created_at = None
        if created_at_str:
            try:
                created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            except:
                pass
        
        last_modified = None
        if last_modified_str:
            try:
                last_modified = datetime.fromisoformat(last_modified_str.replace("Z", "+00:00"))
            except:
                pass
        
        # Create verification metadata
        verification_metadata = {
            "model_id": model_name,
            "author": author,
            "model_type": model_data.get("pipeline_tag") or model_data.get("pipelineTag"),
            "library_name": model_data.get("library_name") or model_data.get("libraryName"),
            "tags": model_data.get("tags", []),
            "downloads": model_data.get("downloads", 0),
            "likes": model_data.get("likes", 0),
            "created_at": created_at.isoformat() if created_at else None,
            "last_modified": last_modified.isoformat() if last_modified else None,
            "private": model_data.get("private", False),
            "disabled": model_data.get("disabled", False)
        }
        
        # Add card data if available
        if "cardData" in model_data or "card_data" in model_data:
            card_data = model_data.get("cardData") or model_data.get("card_data", {})
            verification_metadata["license"] = card_data.get("license")
            verification_metadata["language"] = card_data.get("language")
            verification_metadata["datasets"] = card_data.get("datasets", [])
        
        # Create data string for signature
        signature_data = f"{current_user.id}:hf-model:{model_name}:{datetime.utcnow().isoformat()}"
        signature = sign_data(signature_data)
        
        # Create model URL
        model_url = f"https://huggingface.co/{model_name}"
        
        # Create proof
        proof = ProofOfBuild(
            user_id=current_user.id,
            project_id=project_id,
            proof_type=ProofType.HUGGINGFACE_MODEL,
            status=ProofStatus.VERIFIED,
            description=description or f"Hugging Face Model: {model_name}",
            milestone_name=milestone_name,
            verified_at=datetime.utcnow(),
            verification_signature=signature,
            verification_metadata=verification_metadata,
            proof_metadata={
                "huggingface_model_id": model_name,
                "huggingface_model_url": model_url,
                "huggingface_api_response": model_data
            }
        )
        
        db.add(proof)
        db.commit()
        db.refresh(proof)
        
        logger.info(f"Created Hugging Face model proof {proof.id} for user {current_user.id}, model: {model_name}")
        return proof
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify Hugging Face model: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify Hugging Face model: {str(e)}"
        )
