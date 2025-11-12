from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.api.endpoints import auth, projects, applications, users
from app.db.database import Base, engine, get_db, init_db
from datetime import datetime
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
# Auth and users routers are included both with and without API version prefix for backwards compatibility
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth-v1"])
app.include_router(auth.router, tags=["auth"])  # Direct /auth/* endpoints
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["users-v1"])
app.include_router(users.router, tags=["users"])  # Direct /users/* endpoints
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)


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


@app.get("/diagnostics")
def run_diagnostics(db: Session = Depends(get_db)):
    """Comprehensive diagnostics endpoint for troubleshooting"""
    from sqlalchemy import text, inspect
    import traceback

    diagnostics = {
        "status": "running",
        "timestamp": str(datetime.now()),
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "configuration": {
            "cors_origins": settings.cors_origins,
            "frontend_url": settings.FRONTEND_URL,
            "api_prefix": settings.API_V1_STR
        },
        "database": {},
        "tables": {},
        "enums": {},
        "errors": []
    }

    try:
        # Database type and host info
        db_url = settings.DATABASE_URL
        diagnostics["database"]["type"] = "PostgreSQL" if "postgresql" in db_url else "SQLite"
        if '@' in db_url:
            diagnostics["database"]["host"] = db_url.split('@')[1].split('/')[0]
        else:
            diagnostics["database"]["host"] = "local"

        # Check database connection and version
        try:
            db.execute(text("SELECT 1"))
            diagnostics["database"]["connection"] = "✓ Connected"

            # Get database version
            try:
                version = db.execute(text("SELECT version()")).fetchone()[0]
                diagnostics["database"]["version"] = version[:80]
            except:
                diagnostics["database"]["version"] = "unknown"

        except Exception as e:
            diagnostics["database"]["connection"] = f"✗ Failed: {str(e)}"
            diagnostics["errors"].append(f"Database connection: {str(e)}")

        # List all tables
        try:
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            diagnostics["tables"]["count"] = len(tables)
            diagnostics["tables"]["list"] = tables
            diagnostics["tables"]["expected"] = ["users", "profiles", "projects", "applications",
                                                 "agent_assignments", "reviews", "payments", "notifications"]
            missing_tables = set(diagnostics["tables"]["expected"]) - set(tables)
            if missing_tables:
                diagnostics["tables"]["missing"] = list(missing_tables)
                diagnostics["errors"].append(f"Missing tables: {missing_tables}")

            # Get row counts for each table
            diagnostics["tables"]["details"] = {}
            for table in tables:
                try:
                    count = db.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()[0]
                    diagnostics["tables"]["details"][table] = f"✓ {count} rows"
                except Exception as e:
                    diagnostics["tables"]["details"][table] = f"✗ Error: {str(e)[:30]}"

        except Exception as e:
            diagnostics["tables"]["error"] = str(e)
            diagnostics["errors"].append(f"Table inspection: {str(e)}")

        # Check PostgreSQL enums (if PostgreSQL)
        if "postgresql" in settings.DATABASE_URL:
            try:
                result = db.execute(text("SELECT typname FROM pg_type WHERE typtype = 'e'"))
                enum_names = [row[0] for row in result]
                diagnostics["enums"]["found"] = enum_names
                diagnostics["enums"]["expected"] = ["user_role", "project_status", "application_status", "payment_status"]
                missing_enums = set(diagnostics["enums"]["expected"]) - set(enum_names)
                if missing_enums:
                    diagnostics["enums"]["missing"] = list(missing_enums)
                    diagnostics["errors"].append(f"Missing enums: {missing_enums}")
            except Exception as e:
                diagnostics["enums"]["error"] = str(e)
                diagnostics["errors"].append(f"Enum check: {str(e)}")

        # Test user creation
        try:
            from app.models.models import User
            test_user_count = db.query(User).count()
            diagnostics["database"]["user_count"] = test_user_count
        except Exception as e:
            diagnostics["database"]["user_query_error"] = str(e)
            diagnostics["errors"].append(f"User query: {str(e)}")

        # Overall status
        diagnostics["status"] = "healthy" if len(diagnostics["errors"]) == 0 else "issues_found"

    except Exception as e:
        diagnostics["status"] = "error"
        diagnostics["critical_error"] = str(e)
        diagnostics["traceback"] = traceback.format_exc()

    return diagnostics


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
