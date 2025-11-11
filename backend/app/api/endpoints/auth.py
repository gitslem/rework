from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.db.database import get_db
from app.models.models import User, Profile
from app.schemas.schemas import UserCreate, UserLogin, Token, UserResponse, RefreshTokenRequest
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    import logging
    logger = logging.getLogger(__name__)

    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user and profile in a transaction
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role
        )
        db.add(new_user)
        db.flush()  # Flush to get the user ID without committing

        # Create empty profile
        profile = Profile(user_id=new_user.id)
        db.add(profile)

        # Commit both together
        db.commit()
        db.refresh(new_user)

        logger.info(f"Successfully registered user: {user_data.email} with role: {user_data.role}")
        return new_user

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Registration failed for {user_data.email}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    # Find user
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(token_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    from app.core.security import decode_token

    payload = decode_token(token_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create new tokens
    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/google", response_model=Token)
def google_auth(auth_data: dict, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth"""
    try:
        token = auth_data.get("token")
        role = auth_data.get("role", "freelancer")

        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is required"
            )

        # Verify the Google token
        try:
            # If GOOGLE_CLIENT_ID is not set, skip verification for development
            if settings.GOOGLE_CLIENT_ID:
                idinfo = id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID
                )
            else:
                # For development without Google Client ID, decode the token payload
                import json
                import base64
                # JWT tokens have 3 parts separated by dots
                parts = token.split('.')
                if len(parts) != 3:
                    raise ValueError("Invalid token format")
                # Decode the payload (second part)
                payload = parts[1]
                # Add padding if needed
                padding = 4 - len(payload) % 4
                if padding != 4:
                    payload += '=' * padding
                idinfo = json.loads(base64.urlsafe_b64decode(payload))
                logger.warning("Google token verification skipped - GOOGLE_CLIENT_ID not configured")
        except Exception as e:
            logger.error(f"Google token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google token: {str(e)}"
            )

        email = idinfo.get("email")
        google_id = idinfo.get("sub")

        if not email or not google_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token payload"
            )

        # Check if user exists by Google ID or email
        user = db.query(User).filter(
            (User.google_id == google_id) | (User.email == email)
        ).first()

        if user:
            # Update Google ID if user exists but doesn't have one
            if not user.google_id:
                user.google_id = google_id
                db.commit()
                db.refresh(user)

            # Verify user is active
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Inactive user"
                )
        else:
            # Create new user with Google OAuth
            user = User(
                email=email,
                google_id=google_id,
                role=role,
                is_verified=True,  # Google accounts are pre-verified
                is_active=True
            )
            db.add(user)
            db.flush()

            # Create profile
            profile = Profile(user_id=user.id)
            db.add(profile)

            db.commit()
            db.refresh(user)
            logger.info(f"Created new user via Google OAuth: {email}")

        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )
