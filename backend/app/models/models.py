from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Enum, JSON
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


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    google_id = Column(String, unique=True, nullable=True, index=True)  # Google OAuth ID
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
    
    # Statistics
    total_earnings = Column(Float, default=0.0)
    completed_projects = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Agent specific
    is_agent_approved = Column(Boolean, default=False)
    agent_multiplier = Column(Float, default=3.0)  # Agents earn 3x
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile")


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


class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cover_letter = Column(Text, nullable=True)
    proposed_rate = Column(Float, nullable=True)
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
