from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

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
    # Special configuration for Supabase pooler
    connect_args = {
        "connect_timeout": 10,
        "options": "-c client_encoding=utf8",
    }
    pool_size = 5
    max_overflow = 0
    logger.info("Using Supabase pooler configuration")

# Add pool_recycle to prevent stale connections
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
    pool_size=pool_size,
    max_overflow=max_overflow,
    pool_recycle=300,  # Recycle connections after 5 minutes
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


def init_db():
    """Initialize database tables and types"""
    try:
        # Import all models to ensure they're registered with Base
        from app.models import models

        # Test connection first
        logger.info("Testing database connection...")
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
                    ("paymentstatus", ["pending", "processing", "completed", "failed"])
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
        logger.error(f"Error initializing database: {str(e)}", exc_info=True)
        return False
