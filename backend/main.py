from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.api.endpoints import auth, projects, applications, users
from app.db.database import Base, engine, get_db, init_db
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Remote Works Platform API"
)

# CORS middleware
logger.info(f"Configuring CORS for origins: {settings.cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup"""
    logger.info("Starting application...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'SQLite'}")

    if init_db():
        logger.info("Database initialized successfully")
    else:
        logger.error("Database initialization failed - some features may not work")

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Remote Works API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with database connectivity test"""
    try:
        # Test database connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


@app.post("/init-db")
def initialize_database():
    """Manually initialize database tables (admin endpoint)"""
    try:
        if init_db():
            return {
                "status": "success",
                "message": "Database initialized successfully"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Database initialization failed"
            )
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database initialization failed: {str(e)}"
        )


@app.get("/debug/config")
def debug_config():
    """Debug endpoint to check configuration (REMOVE IN PRODUCTION)"""
    import os
    from sqlalchemy import text

    try:
        # Get database info
        db_url = settings.DATABASE_URL
        db_type = "PostgreSQL" if "postgresql" in db_url else "SQLite"
        db_host = db_url.split('@')[1].split('/')[0] if '@' in db_url else "local"

        # Test database connection
        try:
            from app.db.database import engine
            with engine.connect() as conn:
                version = conn.execute(text("SELECT version()")).fetchone()[0]
                db_connected = True
                db_version = version[:50]

                # Check enum types for PostgreSQL
                enum_status = {}
                if "PostgreSQL" in version:
                    enums = ['userrole', 'projectstatus', 'applicationstatus', 'paymentstatus']
                    for enum_name in enums:
                        exists = conn.execute(text(
                            f"SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{enum_name}')"
                        )).fetchone()[0]
                        enum_status[enum_name] = exists

                # Check tables
                table_status = {}
                tables = ['users', 'profiles', 'projects', 'applications']
                for table in tables:
                    try:
                        count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()[0]
                        table_status[table] = f"exists ({count} rows)"
                    except Exception as e:
                        table_status[table] = f"error: {str(e)[:30]}"

        except Exception as e:
            db_connected = False
            db_version = str(e)[:50]
            enum_status = {}
            table_status = {}

        return {
            "environment": settings.ENVIRONMENT,
            "database_type": db_type,
            "database_host": db_host,
            "database_connected": db_connected,
            "database_version": db_version,
            "enum_types": enum_status,
            "tables": table_status,
            "cors_origins": settings.cors_origins,
            "frontend_url": settings.FRONTEND_URL,
            "api_version": settings.VERSION
        }
    except Exception as e:
        logger.error(f"Debug config failed: {str(e)}", exc_info=True)
        return {
            "error": str(e),
            "error_type": type(e).__name__
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
