#!/usr/bin/env python3
"""
Diagnostic script to check configuration and identify issues
Run this on Render to diagnose the registration problem
"""

import os
import sys

print("="*60)
print("CONFIGURATION DIAGNOSTIC")
print("="*60)

# Check Python version
print(f"\nPython Version: {sys.version}")

# Check environment variables
print("\n" + "="*60)
print("ENVIRONMENT VARIABLES")
print("="*60)

important_vars = [
    'DATABASE_URL',
    'SECRET_KEY',
    'ENVIRONMENT',
    'ALGORITHM',
    'ACCESS_TOKEN_EXPIRE_MINUTES',
    'REFRESH_TOKEN_EXPIRE_DAYS',
    'BACKEND_CORS_ORIGINS',
    'FRONTEND_URL',
    'PORT'
]

for var in important_vars:
    value = os.getenv(var, 'NOT SET')
    # Mask sensitive data
    if 'SECRET' in var or 'PASSWORD' in var or 'DATABASE_URL' in var:
        if value != 'NOT SET':
            if 'DATABASE_URL' in var:
                # Show just the database type
                if value.startswith('postgresql'):
                    masked = f"postgresql://***@{value.split('@')[1] if '@' in value else '***'}"
                elif value.startswith('sqlite'):
                    masked = value
                else:
                    masked = "***"
                print(f"{var}: {masked}")
            else:
                print(f"{var}: {'***SET***' if value != 'NOT SET' else 'NOT SET'}")
        else:
            print(f"{var}: NOT SET")
    else:
        print(f"{var}: {value}")

# Check if settings can be loaded
print("\n" + "="*60)
print("LOADING APPLICATION SETTINGS")
print("="*60)

try:
    from app.core.config import settings
    print("✅ Settings loaded successfully")
    print(f"   - Environment: {settings.ENVIRONMENT}")
    print(f"   - Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL[:20]+'...'}")
    print(f"   - CORS Origins: {settings.cors_origins}")
except Exception as e:
    print(f"❌ Failed to load settings: {e}")
    import traceback
    traceback.print_exc()

# Check database connection
print("\n" + "="*60)
print("DATABASE CONNECTION TEST")
print("="*60)

try:
    from app.db.database import engine
    from sqlalchemy import text

    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()")).fetchone()
        print(f"✅ Database connection successful")
        print(f"   - Version: {result[0][:80]}")

        # Check if PostgreSQL
        if 'PostgreSQL' in result[0]:
            print("\n   Checking PostgreSQL enum types:")
            enums = ['userrole', 'projectstatus', 'applicationstatus', 'paymentstatus']
            for enum_name in enums:
                check = conn.execute(text(
                    f"SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{enum_name}')"
                )).fetchone()
                status = "✅" if check[0] else "❌"
                print(f"   {status} {enum_name}: {'exists' if check[0] else 'MISSING'}")

            # Check tables
            print("\n   Checking tables:")
            tables = ['users', 'profiles', 'projects', 'applications']
            for table in tables:
                try:
                    count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()
                    print(f"   ✅ {table}: {count[0]} rows")
                except Exception as e:
                    print(f"   ❌ {table}: {str(e)[:50]}")
        else:
            print(f"   - Using SQLite")

except Exception as e:
    print(f"❌ Database connection failed: {e}")
    import traceback
    traceback.print_exc()

# Check imports
print("\n" + "="*60)
print("MODULE IMPORTS TEST")
print("="*60)

modules_to_test = [
    'fastapi',
    'sqlalchemy',
    'pydantic',
    'passlib',
    'jose',
    'app.models.models',
    'app.schemas.schemas',
    'app.api.endpoints.auth'
]

for module in modules_to_test:
    try:
        __import__(module)
        print(f"✅ {module}")
    except Exception as e:
        print(f"❌ {module}: {str(e)[:50]}")

print("\n" + "="*60)
print("DIAGNOSTIC COMPLETE")
print("="*60)
