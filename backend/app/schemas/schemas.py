from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole, ProjectStatus, ApplicationStatus, PaymentStatus


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
