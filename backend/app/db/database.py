from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging
import time

logger = logging.getLogger(__name__)

# Configure engine with appropriate settings for SQLite or PostgreSQL
connect_args = {}
pool_size = 5
max_overflow = 10

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    pool_size = 1  # SQLite doesn't support connection pooling
    max_overflow = 0
elif "supabase" in settings.DATABASE_URL or "pooler" in settings.DATABASE_URL:
    # Special configuration for Supabase pooler with extended timeouts for cloud environments
    connect_args = {
        "connect_timeout": 30,  # Increased from 10 to handle cloud environment latency
        "options": "-c statement_timeout=30000",  # 30 second statement timeout
        "client_encoding": "utf8",  # Set encoding directly as parameter
    }
    pool_size = 5
    max_overflow = 10  # Allow some overflow for burst traffic
    logger.info("Using Supabase pooler configuration with extended timeouts")

# Add pool_recycle to prevent stale connections
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Test connections before using them
    connect_args=connect_args,
    pool_size=pool_size,
    max_overflow=max_overflow,
    pool_recycle=300,  # Recycle connections after 5 minutes
    pool_timeout=30,  # Wait up to 30 seconds for a connection from the pool
    echo=settings.ENVIRONMENT == "development"  # Log SQL queries in development
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(max_retries=3, retry_delay=2):
    """Initialize database tables and types with retry logic for cloud environments

    Args:
        max_retries: Maximum number of connection attempts
        retry_delay: Initial delay between retries in seconds (uses exponential backoff)
    """
    for attempt in range(max_retries):
        try:
            # Import all models to ensure they're registered with Base
            from app.models import models

            # Test connection first
            logger.info(f"Testing database connection (attempt {attempt + 1}/{max_retries})...")
            with engine.connect() as test_conn:
                test_conn.execute(text("SELECT 1"))
                logger.info("Database connection successful!")

            # For PostgreSQL, create enum types if they don't exist
            if not settings.DATABASE_URL.startswith("sqlite"):
                with engine.connect() as conn:
                    # Create enum types if they don't exist
                    enums = [
                        ("userrole", ["freelancer", "agent", "business", "admin"]),
                        ("projectstatus", ["open", "in_progress", "completed", "cancelled"]),
                        ("applicationstatus", ["pending", "accepted", "rejected", "withdrawn"]),
                        ("paymentstatus", ["pending", "processing", "completed", "failed"]),
                        ("portfolioitemtype", ["screenshot", "github_repo", "huggingface_model", "link", "project"])
                    ]

                    for enum_name, values in enums:
                        try:
                            # Check if enum exists
                            result = conn.execute(text(
                                f"SELECT 1 FROM pg_type WHERE typname = '{enum_name}'"
                            ))
                            if not result.fetchone():
                                values_str = "', '".join(values)
                                conn.execute(text(
                                    f"CREATE TYPE {enum_name} AS ENUM ('{values_str}')"
                                ))
                                conn.commit()
                                logger.info(f"Created enum type: {enum_name}")
                        except Exception as e:
                            logger.warning(f"Enum {enum_name} might already exist: {e}")
                            conn.rollback()

            # Create all tables
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")

            return True

        except Exception as e:
            logger.error(f"Error initializing database (attempt {attempt + 1}/{max_retries}): {str(e)}")

            if attempt < max_retries - 1:
                # Exponential backoff: 2s, 4s, 8s
                wait_time = retry_delay * (2 ** attempt)
                logger.info(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                logger.error("Database initialization failed after all retries", exc_info=True)
                return False

    return False
