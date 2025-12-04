from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Enum, JSON, Index
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func
from app.db.database import Base
import enum

# Force rebuild: 2025-11-12 enum name and value conversion fix


class UserRole(str, enum.Enum):
    FREELANCER = "freelancer"
    AGENT = "agent"
    BUSINESS = "business"
    ADMIN = "admin"


class ProjectStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SandboxStatus(str, enum.Enum):
    ACTIVE = "active"
    STOPPED = "stopped"
    TERMINATED = "terminated"
    ERROR = "error"


class SandboxLanguage(str, enum.Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"


class ProofType(str, enum.Enum):
    COMMIT = "commit"
    PULL_REQUEST = "pull_request"
    REPOSITORY = "repository"
    FILE = "file"
    SCREENSHOT = "screenshot"
    HUGGINGFACE_MODEL = "huggingface_model"


class ProofStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"
    EXPIRED = "expired"


class CertificateStatus(str, enum.Enum):
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"


class EscrowStatus(str, enum.Enum):
    HELD = "held"
    RELEASED = "released"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class MilestoneStatus(str, enum.Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUESTED = "revision_requested"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    google_id = Column(String, unique=True, nullable=True, index=True)  # Google OAuth ID
    github_id = Column(String, unique=True, nullable=True, index=True)  # GitHub OAuth ID
    github_access_token = Column(String, nullable=True)  # GitHub OAuth access token (encrypted in production)
    huggingface_id = Column(String, unique=True, nullable=True, index=True)  # Hugging Face OAuth ID
    huggingface_access_token = Column(String, nullable=True)  # Hugging Face OAuth access token (encrypted in production)
    role = Column(Enum(UserRole, name="user_role", create_type=False, values_callable=lambda x: [e.value for e in x]), default=UserRole.FREELANCER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @validates('role')
    def normalize_role(self, key, value):
        """Normalize role value to ensure it matches database enum - handles case-insensitive input"""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"[ROLE VALIDATOR] Input value: {value} (type: {type(value)})")

        if isinstance(value, str):
            # Convert string to lowercase to match enum values
            value = value.lower()
            logger.info(f"[ROLE VALIDATOR] After lowercase: {value}")

        # Convert string to UserRole enum if needed
        if isinstance(value, str):
            try:
                result = UserRole(value)
                logger.info(f"[ROLE VALIDATOR] Converted to enum: {result}")
                return result
            except ValueError:
                # If invalid role, default to FREELANCER
                logger.warning(f"[ROLE VALIDATOR] Invalid role '{value}', defaulting to FREELANCER")
                return UserRole.FREELANCER

        logger.info(f"[ROLE VALIDATOR] Returning as-is: {value}")
        return value

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="applicant", cascade="all, delete-orphan")
    agent_assignments = relationship("AgentAssignment", foreign_keys="AgentAssignment.agent_id", back_populates="agent")
    freelancer_assignments = relationship("AgentAssignment", foreign_keys="AgentAssignment.freelancer_id", back_populates="freelancer")
    reviews_given = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="Review.reviewee_id", back_populates="reviewee")
    payments_sent = relationship("Payment", foreign_keys="Payment.payer_id", back_populates="payer")
    payments_received = relationship("Payment", foreign_keys="Payment.payee_id", back_populates="payee")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    proofs = relationship("ProofOfBuild", back_populates="user", cascade="all, delete-orphan")
    certificates = relationship("BuildCertificate", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    skills = Column(JSON, default=[])  # List of skills
    location = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    github_username = Column(String, nullable=True)  # GitHub profile
    huggingface_username = Column(String, nullable=True)  # Hugging Face profile

    # Freelancer specific
    hourly_rate = Column(Float, nullable=True)  # Hourly rate in USD
    verified_skills = Column(JSON, default=[])  # List of {"skill": "Python", "verified": true, "verified_at": "2024-01-01", "verified_by": 1}

    # Timezone and working hours
    timezone = Column(String, default="UTC", nullable=False)  # IANA timezone (e.g., "America/New_York")
    working_hours_start = Column(Integer, default=9, nullable=False)  # Start hour (0-23)
    working_hours_end = Column(Integer, default=17, nullable=False)  # End hour (0-23)
    working_days = Column(JSON, default=[1, 2, 3, 4, 5])  # Days of week (0=Sunday, 6=Saturday), default Mon-Fri

    # Statistics
    total_earnings = Column(Float, default=0.0)
    completed_projects = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)

    # Agent specific
    is_agent_approved = Column(Boolean, default=False)
    agent_multiplier = Column(Float, default=3.0)  # Agents earn 3x

    # Email notification preferences
    email_notifications = Column(
        JSON,
        default={
            "project_created": True,
            "project_updated": True,
            "project_status_changed": True,
            "new_messages": True,
            "payment_updates": True,
            "weekly_summary": True
        }
    )  # User preferences for email notifications

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")
    portfolio_items = relationship("PortfolioItem", back_populates="profile", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # e.g., "evaluation", "transcription", "translation"
    budget = Column(Float, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(ProjectStatus, name="project_status", create_type=False, values_callable=lambda x: [e.value for e in x]), default=ProjectStatus.OPEN)
    requirements = Column(JSON, default={})  # Skills, experience, etc.
    attachments = Column(JSON, default=[])  # File URLs
    
    # Matching
    required_skills = Column(JSON, default=[])
    experience_level = Column(String, nullable=True)  # "beginner", "intermediate", "expert"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    applications = relationship("Application", back_populates="project", cascade="all, delete-orphan")
    agent_assignments = relationship("AgentAssignment", back_populates="project", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="project", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="project", cascade="all, delete-orphan")
    escrows = relationship("Escrow", back_populates="project", cascade="all, delete-orphan")
    proofs = relationship("ProofOfBuild", back_populates="project", cascade="all, delete-orphan")
    certificates = relationship("BuildCertificate", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cover_letter = Column(Text, nullable=True)
    proposed_rate = Column(Float, nullable=True)
    project_duration = Column(String, nullable=True)  # e.g., "2 weeks", "1 month"
    total_cost = Column(Float, nullable=True)
    revisions_included = Column(Integer, nullable=True)
    additional_info = Column(Text, nullable=True)
    status = Column(Enum(ApplicationStatus, name="application_status", create_type=False, values_callable=lambda x: [e.value for e in x]), default=ApplicationStatus.PENDING)
    ai_match_score = Column(Float, nullable=True)  # 0-100 AI matching score

    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="applications")
    applicant = relationship("User", back_populates="applications")


class AgentAssignment(Base):
    __tablename__ = "agent_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # The agent doing the work
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # The freelancer who outsourced
    status = Column(Enum(ProjectStatus, name="project_status", create_type=False, values_callable=lambda x: [e.value for e in x]), default=ProjectStatus.IN_PROGRESS)
    agent_earnings = Column(Float, default=0.0)
    freelancer_passive_earnings = Column(Float, default=0.0)
    
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="agent_assignments")
    agent = relationship("User", foreign_keys=[agent_id], back_populates="agent_assignments")
    freelancer = relationship("User", foreign_keys=[freelancer_id], back_populates="freelancer_assignments")


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="reviews_received")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, default=0.0)  # 0.1% platform fee
    stripe_payment_intent_id = Column(String, nullable=True)
    status = Column(Enum(PaymentStatus, name="payment_status", create_type=False, values_callable=lambda x: [e.value for e in x]), default=PaymentStatus.PENDING)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="payments")
    payer = relationship("User", foreign_keys=[payer_id], back_populates="payments_sent")
    payee = relationship("User", foreign_keys=[payee_id], back_populates="payments_received")
    escrow = relationship("Escrow", back_populates="payment", uselist=False, cascade="all, delete-orphan")


class Escrow(Base):
    __tablename__ = "escrows"

    id = Column(Integer, primary_key=True, index=True)

    # Relationships
    payment_id = Column(Integer, ForeignKey("payments.id"), unique=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # Fund management
    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, default=0.0)
    freelancer_amount = Column(Float, default=0.0)
    agent_amount = Column(Float, default=0.0)

    # Status
    status = Column(
        Enum(EscrowStatus, name="escrow_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=EscrowStatus.HELD
    )

    # Release conditions
    release_condition = Column(String, nullable=True)  # "proof_verified", "completion_confirmed", "manual"
    proof_id = Column(Integer, ForeignKey("proofs_of_build.id"), nullable=True)

    # Dispute tracking
    is_disputed = Column(Boolean, default=False)
    dispute_reason = Column(Text, nullable=True)

    # Timestamps
    held_at = Column(DateTime(timezone=True), server_default=func.now())
    released_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    payment = relationship("Payment", back_populates="escrow")
    project = relationship("Project", back_populates="escrows")
    proof = relationship("ProofOfBuild", foreign_keys=[proof_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # "application", "payment", "review", etc.
    is_read = Column(Boolean, default=False)
    notification_data = Column(JSON, default={})  # Renamed from 'metadata' which is reserved

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")


class ProjectBrief(Base):
    """AI-generated project briefs - Smart Project Brief feature"""
    __tablename__ = "project_briefs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Raw input
    raw_description = Column(Text, nullable=False)  # What the user typed
    project_type = Column(String, nullable=False)  # "chatbot", "automation", "fine-tune", etc.
    reference_files = Column(JSON, default=[])  # URLs to uploaded reference files

    # AI-generated structured data
    goal = Column(Text, nullable=True)  # Main objective
    deliverables = Column(JSON, default=[])  # List of deliverables
    tech_stack = Column(JSON, default=[])  # Recommended technologies/tools
    steps = Column(JSON, default=[])  # Implementation steps
    estimated_timeline = Column(String, nullable=True)  # e.g., "2-3 weeks"
    estimated_budget_min = Column(Float, nullable=True)
    estimated_budget_max = Column(Float, nullable=True)
    required_skills = Column(JSON, default=[])  # Skills needed

    # Meta
    ai_model_used = Column(String, nullable=True)  # e.g., "gpt-4", "claude-3"
    confidence_score = Column(Float, nullable=True)  # 0-1 confidence
    status = Column(String, default="draft")  # "draft", "approved", "converted_to_project"
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)  # If converted

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SandboxSession(Base):
    """Shared Sandbox for AI Build/Test Environment"""
    __tablename__ = "sandbox_sessions"

    id = Column(Integer, primary_key=True, index=True)

    # Ownership & Access
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shared_with = Column(JSON, default=[])  # Array of user IDs who can access

    # Session metadata
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    language = Column(
        Enum(SandboxLanguage, name="sandbox_language", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=SandboxLanguage.PYTHON
    )
    status = Column(
        Enum(SandboxStatus, name="sandbox_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=SandboxStatus.ACTIVE
    )

    # File system state
    files = Column(JSON, default={})  # File tree structure

    # Execution environment
    container_id = Column(String, nullable=True)
    runtime_config = Column(JSON, default={})  # CPU, memory limits, timeout

    # Execution history & results
    execution_history = Column(JSON, default=[])  # Array of execution records
    last_output = Column(Text, nullable=True)
    last_error = Column(Text, nullable=True)
    last_executed_at = Column(DateTime(timezone=True), nullable=True)

    # Resource tracking
    total_executions = Column(Integer, default=0)
    total_runtime_ms = Column(Integer, default=0)

    # AI Testing metadata (for future)
    ai_test_results = Column(JSON, default={})

    # Version control (for future snapshots)
    version = Column(Integer, default=1)
    parent_snapshot_id = Column(Integer, ForeignKey("sandbox_sessions.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_accessed_at = Column(DateTime(timezone=True), server_default=func.now())
    terminated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    project = relationship("Project", foreign_keys=[project_id])
    collaborators = relationship("SandboxCollaborator", back_populates="sandbox", cascade="all, delete-orphan")
    parent_snapshot = relationship("SandboxSession", remote_side=[id], foreign_keys=[parent_snapshot_id])


class SandboxCollaborator(Base):
    """Tracks active users in real-time sandbox collaboration"""
    __tablename__ = "sandbox_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    sandbox_id = Column(Integer, ForeignKey("sandbox_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Collaboration metadata
    cursor_position = Column(JSON, nullable=True)  # {line, column, file}
    is_typing = Column(Boolean, default=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())

    # Session tracking
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    left_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    sandbox = relationship("SandboxSession", back_populates="collaborators")
    user = relationship("User")


class ProofOfBuild(Base):
    """Proof-of-Build verification records - tracks verified work delivery"""
    __tablename__ = "proofs_of_build"

    id = Column(Integer, primary_key=True, index=True)

    # Ownership & Project linking
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    milestone_id = Column(Integer, ForeignKey("milestones.id"), nullable=True)  # Link to milestone

    # Proof metadata
    proof_type = Column(
        Enum(ProofType, name="proof_type", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    status = Column(
        Enum(ProofStatus, name="proof_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=ProofStatus.PENDING
    )

    # GitHub data (for commits, PRs, repos)
    github_repo_url = Column(String, nullable=True)
    github_repo_name = Column(String, nullable=True)  # e.g., "username/repo"
    github_commit_hash = Column(String, nullable=True, index=True)
    github_pr_number = Column(Integer, nullable=True)
    github_pr_url = Column(String, nullable=True)
    github_branch = Column(String, nullable=True)

    # File/Screenshot verification
    file_name = Column(String, nullable=True)
    file_url = Column(String, nullable=True)  # S3 or storage URL
    file_hash = Column(String, nullable=True, index=True)  # SHA-256 hash
    file_size = Column(Integer, nullable=True)

    # Verification data
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verification_signature = Column(Text, nullable=True)  # Cryptographic signature
    verification_metadata = Column(JSON, default={})  # Additional verification data

    # Milestone tracking
    milestone_name = Column(String, nullable=True)
    milestone_description = Column(Text, nullable=True)

    # Timestamps
    timestamp = Column(DateTime(timezone=True), server_default=func.now())  # When proof was created
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Optional expiration

    # Additional metadata
    description = Column(Text, nullable=True)
    proof_metadata = Column(JSON, default={})  # Flexible metadata storage

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="proofs")
    project = relationship("Project", back_populates="proofs")
    milestone = relationship("Milestone", back_populates="proofs", foreign_keys=[milestone_id])
    artifacts = relationship("ProofArtifact", back_populates="proof", cascade="all, delete-orphan")
    approval = relationship("ProofApproval", back_populates="proof", uselist=False, cascade="all, delete-orphan")


class ProofArtifact(Base):
    """Additional artifacts attached to proofs (screenshots, logs, test results)"""
    __tablename__ = "proof_artifacts"

    id = Column(Integer, primary_key=True, index=True)
    proof_id = Column(Integer, ForeignKey("proofs_of_build.id"), nullable=False)

    # Artifact data
    artifact_type = Column(String, nullable=False)  # "screenshot", "log", "test_result", "document"
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_hash = Column(String, nullable=False, index=True)  # SHA-256 hash
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=True)

    # Metadata
    description = Column(Text, nullable=True)
    artifact_metadata = Column(JSON, default={})

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    proof = relationship("ProofOfBuild", back_populates="artifacts")


class BuildCertificate(Base):
    """Signed certificates/badges for verified milestones"""
    __tablename__ = "build_certificates"

    id = Column(Integer, primary_key=True, index=True)

    # Ownership
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    # Certificate data
    certificate_id = Column(String, unique=True, nullable=False, index=True)  # Unique certificate identifier
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Milestone info
    milestone_name = Column(String, nullable=False)
    milestone_date = Column(DateTime(timezone=True), nullable=False)

    # Verification
    status = Column(
        Enum(CertificateStatus, name="certificate_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=CertificateStatus.ACTIVE
    )
    signature = Column(Text, nullable=False)  # Cryptographic signature
    signature_algorithm = Column(String, default="HMAC-SHA256")

    # Certificate content
    certificate_data = Column(JSON, nullable=False)  # Complete certificate data
    badge_url = Column(String, nullable=True)  # URL to badge image

    # Blockchain/notarization (for future)
    blockchain_tx_hash = Column(String, nullable=True, index=True)
    blockchain_network = Column(String, nullable=True)  # "polygon", "ethereum", etc.
    notarized_at = Column(DateTime(timezone=True), nullable=True)

    # Verification URL
    verification_url = Column(String, nullable=True)  # Public verification URL

    # Proof references
    proof_ids = Column(JSON, default=[])  # Array of proof IDs included in this certificate

    # Expiration
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revocation_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="certificates")
    project = relationship("Project", back_populates="certificates")


class Milestone(Base):
    """Project milestones with budget allocation and proof tracking"""
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # Milestone info
    milestone_number = Column(Integer, nullable=False)  # Order in project (1, 2, 3, etc.)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Budget allocation
    budget_percentage = Column(Float, default=0)  # Percentage of total project budget (0-100)
    budget_amount = Column(Float, nullable=True)  # Calculated amount

    # Status and dates
    status = Column(
        Enum(MilestoneStatus, name="milestone_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=MilestoneStatus.PENDING
    )
    due_date = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)

    # Requirements
    required_deliverables = Column(JSON, default=[])  # Array of required deliverable descriptions
    acceptance_criteria = Column(JSON, default=[])  # Array of acceptance criteria

    # Proof tracking
    proof_ids = Column(JSON, default=[])  # Array of associated proof IDs

    # Payment tracking
    escrow_id = Column(Integer, ForeignKey("escrows.id"), nullable=True)
    payment_released = Column(Boolean, default=False)
    payment_released_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="milestones")
    escrow = relationship("Escrow", foreign_keys=[escrow_id])
    proofs = relationship("ProofOfBuild", back_populates="milestone", foreign_keys="ProofOfBuild.milestone_id")
    approvals = relationship("ProofApproval", back_populates="milestone", cascade="all, delete-orphan")


class ProofApproval(Base):
    """Approval tracking for proofs by project owners"""
    __tablename__ = "proof_approvals"

    id = Column(Integer, primary_key=True, index=True)
    proof_id = Column(Integer, ForeignKey("proofs_of_build.id"), nullable=False, unique=True)
    milestone_id = Column(Integer, ForeignKey("milestones.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # Reviewer (project owner/company)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Approval status
    status = Column(
        Enum(ApprovalStatus, name="approval_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=ApprovalStatus.PENDING
    )

    # Feedback
    feedback = Column(Text, nullable=True)
    revision_notes = Column(Text, nullable=True)

    # Approval/rejection details
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    proof = relationship("ProofOfBuild", back_populates="approval")
    milestone = relationship("Milestone", back_populates="approvals")
    project = relationship("Project", foreign_keys=[project_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])


class SummaryType(str, enum.Enum):
    WEEKLY = "weekly"
    ON_DEMAND = "on_demand"
    MILESTONE = "milestone"


class ProjectMessage(Base):
    """Chat messages between project stakeholders"""
    __tablename__ = "project_messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Message content
    message = Column(Text, nullable=False)
    message_type = Column(String, default="text")  # "text", "file", "system"

    # Attachments
    attachments = Column(JSON, default=[])  # File URLs, screenshots, etc.

    # Threading
    parent_message_id = Column(Integer, ForeignKey("project_messages.id"), nullable=True)
    thread_id = Column(String, nullable=True)  # Group related messages

    # Metadata
    is_ai_generated = Column(Boolean, default=False)
    message_metadata = Column(JSON, default={})  # Renamed from 'metadata' which is reserved

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    project = relationship("Project", foreign_keys=[project_id])
    sender = relationship("User", foreign_keys=[sender_id])
    parent_message = relationship("ProjectMessage", remote_side=[id], foreign_keys=[parent_message_id])
    read_by = relationship("MessageReadStatus", back_populates="message", cascade="all, delete-orphan")


class MessageReadStatus(Base):
    """Track read status of messages for real-time chat features"""
    __tablename__ = "message_read_status"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("project_messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    read_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    message = relationship("ProjectMessage", back_populates="read_by")
    user = relationship("User")

    # Unique constraint: one read status per user per message
    __table_args__ = (
        Index('idx_message_user', 'message_id', 'user_id', unique=True),
    )


class UserOnlineStatus(Base):
    """Track user online/offline status for chat"""
    __tablename__ = "user_online_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User")


class TypingIndicator(Base):
    """Track who is currently typing in a project chat"""
    __tablename__ = "typing_indicators"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_typing_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project")
    user = relationship("User")

    # Unique constraint: one typing indicator per user per project
    __table_args__ = (
        Index('idx_project_user_typing', 'project_id', 'user_id', unique=True),
    )


class AISummary(Base):
    """AI-generated project summaries and progress digests"""
    __tablename__ = "ai_summaries"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    generated_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Who requested (null for auto)

    # Summary metadata
    summary_type = Column(
        Enum(SummaryType, name="summary_type", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=SummaryType.ON_DEMAND
    )
    title = Column(String, nullable=False)

    # Summary content
    summary = Column(Text, nullable=False)  # Main AI-generated summary

    # Structured insights
    tasks_completed = Column(JSON, default=[])  # List of completed tasks
    blockers = Column(JSON, default=[])  # Current blockers/issues
    next_steps = Column(JSON, default=[])  # Recommended next steps
    key_metrics = Column(JSON, default={})  # {"commits": 5, "prs_merged": 2, "messages": 15}

    # Data sources analyzed
    github_commits_analyzed = Column(Integer, default=0)
    github_prs_analyzed = Column(Integer, default=0)
    messages_analyzed = Column(Integer, default=0)

    # Time period
    period_start = Column(DateTime(timezone=True), nullable=True)
    period_end = Column(DateTime(timezone=True), nullable=True)

    # AI metadata
    ai_model_used = Column(String, nullable=True)  # "gpt-4", "gpt-3.5-turbo", etc.
    tokens_used = Column(Integer, nullable=True)
    generation_time_ms = Column(Integer, nullable=True)

    # Status
    is_published = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", foreign_keys=[project_id])
    generated_by = relationship("User", foreign_keys=[generated_by_user_id])


class PortfolioItemType(str, enum.Enum):
    SCREENSHOT = "screenshot"
    GITHUB_REPO = "github_repo"
    HUGGINGFACE_MODEL = "huggingface_model"
    LINK = "link"
    PROJECT = "project"


class PortfolioItem(Base):
    """Portfolio items for freelancer profiles"""
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)

    # Item metadata
    item_type = Column(
        Enum(PortfolioItemType, name="portfolio_item_type", create_type=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Content
    thumbnail_url = Column(String, nullable=True)  # For screenshots/previews
    url = Column(String, nullable=True)  # GitHub repo URL, Hugging Face model URL, or external link

    # GitHub specific
    github_repo_name = Column(String, nullable=True)  # e.g., "username/repo"
    github_stars = Column(Integer, nullable=True)
    github_language = Column(String, nullable=True)

    # Hugging Face specific
    huggingface_model_id = Column(String, nullable=True)  # e.g., "username/model-name"
    huggingface_downloads = Column(Integer, nullable=True)
    huggingface_likes = Column(Integer, nullable=True)

    # Metadata
    tags = Column(JSON, default=[])  # Technologies/skills used
    display_order = Column(Integer, default=0)  # For ordering items
    is_featured = Column(Boolean, default=False)  # Highlight on profile

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    profile = relationship("Profile", back_populates="portfolio_items")


class CandidateProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProjectActionStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProjectActionPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class CandidateProject(Base):
    """Projects managed by agents for candidates"""
    __tablename__ = "candidate_projects"

    id = Column(Integer, primary_key=True, index=True)

    # Ownership
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # The candidate
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # The assigned agent

    # Project details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    platform = Column(String, nullable=True)  # e.g., "Upwork", "Freelancer", "Internal"
    project_url = Column(String, nullable=True)  # External project URL if applicable

    # Status
    status = Column(
        Enum(CandidateProjectStatus, name="candidate_project_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=CandidateProjectStatus.PENDING
    )

    # Budget and timeline
    budget = Column(Float, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    tags = Column(JSON, default=[])  # Technologies, skills, categories
    project_metadata = Column(JSON, default={})  # Additional flexible data

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidate = relationship("User", foreign_keys=[candidate_id])
    agent = relationship("User", foreign_keys=[agent_id])
    updates = relationship("ProjectUpdate", back_populates="project", cascade="all, delete-orphan")
    actions = relationship("ProjectAction", back_populates="project", cascade="all, delete-orphan")


class ProjectUpdate(Base):
    """Weekly updates from agents on project progress"""
    __tablename__ = "project_updates"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("candidate_projects.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Update details
    week_number = Column(Integer, nullable=True)  # Week number (optional)
    update_title = Column(String, nullable=False)
    update_content = Column(Text, nullable=False)

    # Work tracking
    hours_completed = Column(Float, default=0.0)  # Hours worked this update
    screen_sharing_hours = Column(Float, default=0.0)  # Hours of screen sharing with candidate

    # Progress indicators
    progress_percentage = Column(Float, default=0.0)  # Overall project progress (0-100)

    # Issues and blockers
    blockers = Column(JSON, default=[])  # List of blocking issues
    concerns = Column(Text, nullable=True)  # General concerns

    # Next steps
    next_steps = Column(JSON, default=[])  # Planned next steps

    # Attachments
    attachments = Column(JSON, default=[])  # Screenshots, files, links

    # Metadata
    update_metadata = Column(JSON, default={})

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("CandidateProject", back_populates="updates")
    agent = relationship("User", foreign_keys=[agent_id])


class ProjectAction(Base):
    """Actions needed from candidates or scheduled tasks for agents"""
    __tablename__ = "project_actions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("candidate_projects.id"), nullable=False)

    # Who is responsible
    assigned_to_candidate = Column(Boolean, default=False)  # True if candidate needs to do it
    assigned_to_agent = Column(Boolean, default=False)  # True if agent needs to do it
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who created the action

    # Action details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    action_type = Column(String, nullable=True)  # "signup", "verification", "exam", "meeting", "document", etc.

    # Status and priority
    status = Column(
        Enum(ProjectActionStatus, name="project_action_status", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=ProjectActionStatus.PENDING
    )
    priority = Column(
        Enum(ProjectActionPriority, name="project_action_priority", create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=ProjectActionPriority.MEDIUM
    )

    # Scheduling
    due_date = Column(DateTime(timezone=True), nullable=True)
    scheduled_time = Column(DateTime(timezone=True), nullable=True)  # For meetings, exams, etc.
    duration_minutes = Column(Integer, nullable=True)  # Expected duration

    # Platform-specific actions (for pending projects)
    platform = Column(String, nullable=True)  # e.g., "Upwork", "LinkedIn", "Google"
    platform_url = Column(String, nullable=True)  # Link to signup/verification page

    # Completion tracking
    completed_at = Column(DateTime(timezone=True), nullable=True)
    completion_notes = Column(Text, nullable=True)

    # Attachments
    attachments = Column(JSON, default=[])  # Instructions, forms, screenshots

    # Metadata
    action_metadata = Column(JSON, default={})

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("CandidateProject", back_populates="actions")
    creator = relationship("User", foreign_keys=[creator_id])
