#!/usr/bin/env python3
"""
Test database connection for Supabase
Run this to diagnose connection issues
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_connection():
    """Test database connection with different configurations"""
    print("=" * 70)
    print("Database Connection Test")
    print("=" * 70)
    print()
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not set in environment")
        print("Please set DATABASE_URL in your .env file or environment variables")
        return False
    
    print(f"📍 Testing connection to: {database_url.split('@')[-1] if '@' in database_url else 'unknown'}")
    print()
    
    # Test 1: Raw psycopg2 connection
    print("Test 1: Direct psycopg2 connection")
    print("-" * 70)
    try:
        import psycopg2
        conn = psycopg2.connect(
            database_url,
            connect_timeout=10,
            options="-c client_encoding=utf8"
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ SUCCESS: Connected to PostgreSQL")
        print(f"   Version: {version[:60]}...")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False
    
    print()
    
    # Test 2: SQLAlchemy connection
    print("Test 2: SQLAlchemy connection")
    print("-" * 70)
    try:
        from sqlalchemy import create_engine, text
        
        # Create engine with Supabase-specific settings
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            connect_args={
                "connect_timeout": 10,
                "options": "-c client_encoding=utf8",
            },
            pool_size=1,
            max_overflow=0,
        )
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database(), current_user;"))
            db, user = result.fetchone()
            print(f"✅ SUCCESS: SQLAlchemy connection working")
            print(f"   Database: {db}")
            print(f"   User: {user}")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False
    
    print()
    
    # Test 3: Check tables
    print("Test 3: Checking tables")
    print("-" * 70)
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table}")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
    
    print()
    
    # Test 4: Check for google_id column
    print("Test 4: Checking for google_id column in users table")
    print("-" * 70)
    try:
        if 'users' in tables:
            columns = inspector.get_columns('users')
            column_names = [col['name'] for col in columns]
            if 'google_id' in column_names:
                print("✅ google_id column exists")
            else:
                print("❌ google_id column MISSING - run migration!")
                print("   See backend/migrations/add_google_oauth_support.sql")
            
            # Check hashed_password nullability
            hashed_pwd_col = next((c for c in columns if c['name'] == 'hashed_password'), None)
            if hashed_pwd_col and hashed_pwd_col.get('nullable'):
                print("✅ hashed_password is nullable (good for OAuth)")
            else:
                print("⚠️  hashed_password might not be nullable")
        else:
            print("⚠️  users table not found - run init_db")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
    
    print()
    print("=" * 70)
    print("✅ Connection tests complete!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
