from pydantic_settings import BaseSettings
from typing import List, Union
import os
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Remote Works API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    # Default to SQLite for easy local development
    DATABASE_URL: str = "sqlite:///./remoteworks.db"

    # Security
    # Default secret key for development (change in production!)
    SECRET_KEY: str = "dev-secret-key-change-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS - Support both string (JSON) and list format
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000"]

    # Email
    MAILERSEND_API_KEY: str = "mlsn.9889284d06ac747a2b60c558f1c8df50a4dfd177281ee966fd9740c109ce49fe"
    FROM_EMAIL: str = "noreply@remote-works.io"
    FROM_NAME: str = "Remote-Works"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_BUCKET_NAME: str = ""
    AWS_REGION: str = "us-east-1"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # GitHub OAuth
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_WEBHOOK_SECRET: str = ""  # Secret for verifying GitHub webhook signatures

    # Hugging Face OAuth
    HUGGINGFACE_CLIENT_ID: str = ""
    HUGGINGFACE_CLIENT_SECRET: str = ""

    # Proof-of-Build
    PROOF_SIGNATURE_KEY: str = "proof-signature-key-change-in-production"  # Key for signing certificates

    # Environment
    ENVIRONMENT: str = "development"

    # Frontend URL (for production CORS)
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from string or list"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            try:
                return json.loads(self.BACKEND_CORS_ORIGINS)
            except json.JSONDecodeError:
                return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]
        return self.BACKEND_CORS_ORIGINS


settings = Settings()
