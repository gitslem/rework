from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.models import UserRole, ProjectStatus, ApplicationStatus, PaymentStatus, SandboxStatus, SandboxLanguage, ProofType, ProofStatus, CertificateStatus


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.FREELANCER

    @field_validator('role', mode='before')
    @classmethod
    def normalize_role(cls, v):
        """Normalize role to handle case-insensitive input"""
        if isinstance(v, str):
            # Convert string to lowercase to match enum values
            return v.lower()
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[int] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    token: str
    role: Optional[UserRole] = UserRole.FREELANCER

    @field_validator('role', mode='before')
    @classmethod
    def normalize_role(cls, v):
        """Normalize role to handle case-insensitive input"""
        if isinstance(v, str):
            # Convert string to lowercase to match enum values
            return v.lower()
        return v


class GitHubAuthRequest(BaseModel):
    code: str  # GitHub OAuth code from callback
    role: Optional[UserRole] = UserRole.FREELANCER

    @field_validator('role', mode='before')
    @classmethod
    def normalize_role(cls, v):
        """Normalize role to handle case-insensitive input"""
        if isinstance(v, str):
            # Convert string to lowercase to match enum values
            return v.lower()
        return v


class GitHubConnectRequest(BaseModel):
    code: str  # GitHub OAuth code to connect account


# Profile Schemas
class ProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    location: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    avatar_url: Optional[str] = None
    resume_url: Optional[str] = None
    total_earnings: float
    completed_projects: int
    average_rating: float
    total_reviews: int
    is_agent_approved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Project Schemas
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    category: str
    budget: float = Field(..., gt=0)
    deadline: Optional[datetime] = None
    required_skills: List[str] = []
    experience_level: Optional[str] = None


class ProjectCreate(ProjectBase):
    requirements: dict = {}


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    deadline: Optional[datetime] = None
    status: Optional[ProjectStatus] = None


class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    status: ProjectStatus
    requirements: dict
    attachments: List[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Application Schemas
class ApplicationBase(BaseModel):
    project_id: int
    cover_letter: Optional[str] = None
    proposed_rate: Optional[float] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(ApplicationBase):
    id: int
    applicant_id: int
    status: ApplicationStatus
    ai_match_score: Optional[float] = None
    applied_at: datetime
    
    class Config:
        from_attributes = True


# Agent Assignment Schemas
class AgentAssignmentBase(BaseModel):
    project_id: int
    agent_id: int


class AgentAssignmentCreate(AgentAssignmentBase):
    pass


class AgentAssignmentResponse(AgentAssignmentBase):
    id: int
    freelancer_id: int
    status: ProjectStatus
    agent_earnings: float
    freelancer_passive_earnings: float
    assigned_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Review Schemas
class ReviewBase(BaseModel):
    project_id: int
    reviewee_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    reviewer_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Payment Schemas
class PaymentBase(BaseModel):
    project_id: int
    amount: float


class PaymentCreate(PaymentBase):
    payee_id: int


class PaymentResponse(PaymentBase):
    id: int
    payer_id: int
    payee_id: int
    platform_fee: float
    status: PaymentStatus
    stripe_payment_intent_id: Optional[str]
    created_at: datetime
    processed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    notification_data: dict  # Renamed from 'metadata' which is SQLAlchemy reserved
    created_at: datetime

    class Config:
        from_attributes = True


# Search and Filter Schemas
class ProjectFilter(BaseModel):
    category: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    status: Optional[ProjectStatus] = None


# Stats Schemas
class DashboardStats(BaseModel):
    total_earnings: float
    active_projects: int
    completed_projects: int
    pending_applications: int
    average_rating: float
    total_reviews: int


# AI Project Brief Schemas
class ProjectBriefCreate(BaseModel):
    raw_description: str = Field(..., min_length=20, max_length=5000)
    project_type: str = Field(..., description="Type of AI project: chatbot, automation, fine-tune, integration, etc.")
    reference_files: Optional[List[str]] = []  # URLs to uploaded files


class ProjectBriefResponse(BaseModel):
    id: int
    user_id: int
    raw_description: str
    project_type: str
    reference_files: List[str]

    # AI-generated fields
    goal: Optional[str]
    deliverables: List[str]
    tech_stack: List[str]
    steps: List[str]
    estimated_timeline: Optional[str]
    estimated_budget_min: Optional[float]
    estimated_budget_max: Optional[float]
    required_skills: List[str]

    # Meta
    ai_model_used: Optional[str]
    confidence_score: Optional[float]
    status: str
    project_id: Optional[int]

    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class AIBriefGeneration(BaseModel):
    """Response from AI brief generation"""
    goal: str
    deliverables: List[str]
    tech_stack: List[str]
    steps: List[str]
    estimated_timeline: str
    estimated_budget_min: float
    estimated_budget_max: float
    required_skills: List[str]
    confidence_score: float
    ai_model_used: Optional[str] = None


# Sandbox Schemas
class SandboxBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    language: SandboxLanguage = SandboxLanguage.PYTHON
    project_id: Optional[int] = None


class SandboxCreate(SandboxBase):
    shared_with: List[int] = []  # List of user IDs
    files: dict = {}  # Initial file structure


class SandboxUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[SandboxStatus] = None
    shared_with: Optional[List[int]] = None
    files: Optional[dict] = None


class SandboxResponse(SandboxBase):
    id: int
    owner_id: int
    shared_with: List[int]
    status: SandboxStatus
    files: dict
    container_id: Optional[str]
    runtime_config: dict
    execution_history: List[dict]
    last_output: Optional[str]
    last_error: Optional[str]
    last_executed_at: Optional[datetime]
    total_executions: int
    total_runtime_ms: int
    version: int
    parent_snapshot_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    last_accessed_at: datetime
    terminated_at: Optional[datetime]

    class Config:
        from_attributes = True


class SandboxExecuteRequest(BaseModel):
    """Request to execute code in sandbox"""
    file_path: str = Field(..., description="Path to file to execute, e.g., 'main.py'")
    code: Optional[str] = Field(None, description="Code to execute (if not using file)")
    timeout: int = Field(30, ge=1, le=300, description="Execution timeout in seconds")


class SandboxExecuteResponse(BaseModel):
    """Response from code execution"""
    success: bool
    output: str
    error: Optional[str] = None
    duration_ms: int
    timestamp: datetime


class SandboxFileOperation(BaseModel):
    """Request to create/update/delete files"""
    operation: str = Field(..., description="Operation: create, update, delete")
    file_path: str = Field(..., description="Path to file")
    content: Optional[str] = Field(None, description="File content (for create/update)")


class SandboxCollaboratorResponse(BaseModel):
    """Collaborator information"""
    id: int
    sandbox_id: int
    user_id: int
    cursor_position: Optional[dict]
    is_typing: bool
    last_activity: datetime
    joined_at: datetime
    left_at: Optional[datetime]

    class Config:
        from_attributes = True


# Proof-of-Build Schemas
class ProofOfBuildBase(BaseModel):
    proof_type: ProofType
    project_id: Optional[int] = None
    description: Optional[str] = None
    milestone_name: Optional[str] = None
    milestone_description: Optional[str] = None


class ProofOfBuildCreate(ProofOfBuildBase):
    # GitHub data (for commit/PR/repo proofs)
    github_repo_url: Optional[str] = None
    github_repo_name: Optional[str] = None
    github_commit_hash: Optional[str] = None
    github_pr_number: Optional[int] = None
    github_pr_url: Optional[str] = None
    github_branch: Optional[str] = None

    # File/Screenshot data (for file proofs)
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    file_hash: Optional[str] = None
    file_size: Optional[int] = None

    proof_metadata: Dict[str, Any] = {}


class ProofOfBuildResponse(ProofOfBuildBase):
    id: int
    user_id: int
    status: ProofStatus

    # GitHub data
    github_repo_url: Optional[str]
    github_repo_name: Optional[str]
    github_commit_hash: Optional[str]
    github_pr_number: Optional[int]
    github_pr_url: Optional[str]
    github_branch: Optional[str]

    # File/Screenshot data
    file_name: Optional[str]
    file_url: Optional[str]
    file_hash: Optional[str]
    file_size: Optional[int]

    # Verification data
    verified_at: Optional[datetime]
    verification_signature: Optional[str]
    verification_metadata: Dict[str, Any]

    timestamp: datetime
    expires_at: Optional[datetime]
    proof_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ProofArtifactCreate(BaseModel):
    artifact_type: str = Field(..., description="Type: screenshot, log, test_result, document")
    file_name: str
    file_url: str
    file_hash: str
    file_size: int
    mime_type: Optional[str] = None
    description: Optional[str] = None
    artifact_metadata: Dict[str, Any] = {}


class ProofArtifactResponse(BaseModel):
    id: int
    proof_id: int
    artifact_type: str
    file_name: str
    file_url: str
    file_hash: str
    file_size: int
    mime_type: Optional[str]
    description: Optional[str]
    artifact_metadata: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


# Build Certificate Schemas
class BuildCertificateCreate(BaseModel):
    project_id: Optional[int] = None
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    milestone_name: str
    milestone_date: datetime
    proof_ids: List[int] = []  # Proofs to include in certificate
    certificate_data: Dict[str, Any]  # Complete certificate data


class BuildCertificateResponse(BaseModel):
    id: int
    user_id: int
    project_id: Optional[int]
    certificate_id: str
    title: str
    description: Optional[str]
    milestone_name: str
    milestone_date: datetime
    status: CertificateStatus
    signature: str
    signature_algorithm: str
    certificate_data: Dict[str, Any]
    badge_url: Optional[str]
    blockchain_tx_hash: Optional[str]
    blockchain_network: Optional[str]
    notarized_at: Optional[datetime]
    verification_url: Optional[str]
    proof_ids: List[int]
    issued_at: datetime
    expires_at: Optional[datetime]
    revoked_at: Optional[datetime]
    revocation_reason: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# GitHub Verification Schemas
class GitHubRepoVerifyRequest(BaseModel):
    repo_name: str = Field(..., description="GitHub repository name (e.g., 'username/repo')")
    project_id: Optional[int] = None
    milestone_name: Optional[str] = None


class GitHubCommitVerifyRequest(BaseModel):
    repo_name: str = Field(..., description="GitHub repository name (e.g., 'username/repo')")
    commit_hash: str = Field(..., min_length=7, max_length=40)
    project_id: Optional[int] = None
    milestone_name: Optional[str] = None
    description: Optional[str] = None


class GitHubPRVerifyRequest(BaseModel):
    repo_name: str = Field(..., description="GitHub repository name (e.g., 'username/repo')")
    pr_number: int = Field(..., gt=0)
    project_id: Optional[int] = None
    milestone_name: Optional[str] = None
    description: Optional[str] = None


class FileVerifyRequest(BaseModel):
    file_name: str
    file_url: str
    file_content: Optional[str] = None  # For hash calculation if not already provided
    file_hash: Optional[str] = None  # Pre-calculated hash
    file_size: int
    project_id: Optional[int] = None
    milestone_name: Optional[str] = None
    description: Optional[str] = None
    artifact_type: str = "file"  # file, screenshot, document, etc.


class VerifyProofRequest(BaseModel):
    proof_id: int


class GenerateCertificateRequest(BaseModel):
    title: str
    milestone_name: str
    proof_ids: List[int]  # List of proof IDs to include
    project_id: Optional[int] = None
    description: Optional[str] = None
    expires_in_days: Optional[int] = None  # Certificate validity period


class GitHubRepoInfo(BaseModel):
    """GitHub repository information"""
    name: str
    full_name: str
    description: Optional[str]
    url: str
    owner: str
    created_at: datetime
    updated_at: datetime
    language: Optional[str]
    stars: int
    forks: int


class GitHubCommitInfo(BaseModel):
    """GitHub commit information"""
    sha: str
    message: str
    author: str
    author_email: str
    date: datetime
    url: str
    verified: bool


class GitHubPRInfo(BaseModel):
    """GitHub pull request information"""
    number: int
    title: str
    state: str
    author: str
    created_at: datetime
    merged_at: Optional[datetime]
    url: str
    commits: int
    changed_files: int
