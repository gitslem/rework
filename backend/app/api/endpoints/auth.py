from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.db.database import get_db
from app.models.models import User, Profile
from app.schemas.schemas import UserCreate, UserLogin, Token, UserResponse, RefreshTokenRequest, GoogleAuthRequest
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
def google_auth(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth"""
    try:
        token = auth_data.token
        role = auth_data.role.value  # Get the string value from the enum

        logger.info(f"Google OAuth attempt with role: {role}")

        if not token:
            logger.error("No token provided in request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is required"
            )

        # Verify the Google token
        try:
            # If GOOGLE_CLIENT_ID is not set, skip verification for development
            if settings.GOOGLE_CLIENT_ID:
                logger.info("Verifying Google token with GOOGLE_CLIENT_ID")
                idinfo = id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID
                )
                logger.info("Google token verified successfully")
            else:
                # For development without Google Client ID, decode the token payload
                logger.warning("GOOGLE_CLIENT_ID not set - using unverified token decoding (DEVELOPMENT ONLY)")
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
            logger.error(f"Google token verification failed: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google token: {str(e)}"
            )

        email = idinfo.get("email")
        google_id = idinfo.get("sub")

        logger.info(f"Token decoded - email: {email}, google_id: {google_id}")

        if not email or not google_id:
            logger.error(f"Missing email or google_id in token payload: {idinfo}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token payload - missing email or sub"
            )

        # Check if user exists by Google ID or email
        try:
            user = db.query(User).filter(
                (User.google_id == google_id) | (User.email == email)
            ).first()
            logger.info(f"Database query completed - user found: {user is not None}")
        except Exception as e:
            logger.error(f"Database query failed: {str(e)}", exc_info=True)
            # Check if it's a column error
            if "google_id" in str(e).lower() or "column" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database schema not updated. Please run migrations: ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE; ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

        if user:
            logger.info(f"Existing user found: {user.email}")
            # Update Google ID if user exists but doesn't have one
            if not user.google_id:
                logger.info("Updating user with google_id")
                user.google_id = google_id
                try:
                    db.commit()
                    db.refresh(user)
                    logger.info("User updated successfully")
                except Exception as e:
                    logger.error(f"Failed to update user: {str(e)}", exc_info=True)
                    db.rollback()
                    raise

            # Verify user is active
            if not user.is_active:
                logger.warning(f"User {user.email} is inactive")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Inactive user"
                )
        else:
            # Create new user with Google OAuth
            logger.info(f"Creating new user: {email}")
            try:
                user = User(
                    email=email,
                    google_id=google_id,
                    role=role,
                    is_verified=True,  # Google accounts are pre-verified
                    is_active=True
                )
                db.add(user)
                db.flush()
                logger.info(f"User created with id: {user.id}")

                # Create profile
                profile = Profile(user_id=user.id)
                db.add(profile)
                logger.info("Profile created")

                db.commit()
                db.refresh(user)
                logger.info(f"Successfully created new user via Google OAuth: {email}")
            except Exception as e:
                logger.error(f"Failed to create user: {str(e)}", exc_info=True)
                db.rollback()
                raise

        # Create tokens
        logger.info(f"Creating tokens for user id: {user.id}")
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        logger.info("Google OAuth successful")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth failed with unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )
