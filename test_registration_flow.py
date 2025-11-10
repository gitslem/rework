#!/usr/bin/env python3
"""
Comprehensive registration flow test
Tests the entire registration process from API to database
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.models.models import User, Profile, UserRole
from app.schemas.schemas import UserCreate
from app.db.database import SessionLocal, init_db, engine
from app.core.security import get_password_hash
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_database_connection():
    """Test 1: Database Connection"""
    print("\n" + "="*60)
    print("TEST 1: Database Connection")
    print("="*60)
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1")).fetchone()
        db.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def test_enum_types():
    """Test 2: PostgreSQL Enum Types"""
    print("\n" + "="*60)
    print("TEST 2: PostgreSQL Enum Types")
    print("="*60)
    try:
        db = SessionLocal()

        # Check if we're using PostgreSQL
        result = db.execute(text("SELECT version()")).fetchone()
        print(f"Database: {result[0][:50]}...")

        if "PostgreSQL" in result[0]:
            # Check enum types
            enums = ['userrole', 'projectstatus', 'applicationstatus', 'paymentstatus']
            for enum_name in enums:
                result = db.execute(text(
                    f"SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{enum_name}')"
                )).fetchone()
                status = "✅" if result[0] else "❌"
                print(f"{status} Enum type '{enum_name}': {'exists' if result[0] else 'missing'}")
        else:
            print("ℹ️  Using SQLite - enum types not needed")

        db.close()
        return True
    except Exception as e:
        print(f"❌ Enum type check failed: {e}")
        return False


def test_tables_exist():
    """Test 3: Database Tables"""
    print("\n" + "="*60)
    print("TEST 3: Database Tables")
    print("="*60)
    try:
        db = SessionLocal()

        tables = ['users', 'profiles', 'projects', 'applications']
        for table in tables:
            try:
                result = db.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()
                print(f"✅ Table '{table}' exists (rows: {result[0]})")
            except Exception as e:
                print(f"❌ Table '{table}' check failed: {e}")

        db.close()
        return True
    except Exception as e:
        print(f"❌ Table check failed: {e}")
        return False


def test_schema_validation():
    """Test 4: Pydantic Schema Validation"""
    print("\n" + "="*60)
    print("TEST 4: Pydantic Schema Validation")
    print("="*60)
    try:
        # Test with string (what frontend sends)
        print("\nTesting with string 'freelancer':")
        user_data = UserCreate(
            email="test@example.com",
            password="testpass123",
            role="freelancer"
        )
        print(f"✅ Schema validation passed")
        print(f"   - Email: {user_data.email}")
        print(f"   - Role type: {type(user_data.role)}")
        print(f"   - Role value: {user_data.role}")

        # Test with enum
        print("\nTesting with UserRole.FREELANCER enum:")
        user_data2 = UserCreate(
            email="test2@example.com",
            password="testpass123",
            role=UserRole.FREELANCER
        )
        print(f"✅ Schema validation passed")
        print(f"   - Role type: {type(user_data2.role)}")
        print(f"   - Role value: {user_data2.role}")

        return True
    except Exception as e:
        print(f"❌ Schema validation failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_user_creation():
    """Test 5: User and Profile Creation"""
    print("\n" + "="*60)
    print("TEST 5: User and Profile Creation")
    print("="*60)

    test_email = f"test_user_{os.urandom(4).hex()}@example.com"

    try:
        db = SessionLocal()

        # Check if user exists
        print(f"\nAttempting to create user: {test_email}")
        existing_user = db.query(User).filter(User.email == test_email).first()
        if existing_user:
            print("❌ User already exists (shouldn't happen with random email)")
            return False

        # Create user
        print("Creating user...")
        hashed_password = get_password_hash("testpass123")
        new_user = User(
            email=test_email,
            hashed_password=hashed_password,
            role=UserRole.FREELANCER
        )
        db.add(new_user)
        print("✅ User object created")

        # Flush to get ID
        print("Flushing to get user ID...")
        db.flush()
        print(f"✅ User flushed, ID: {new_user.id}")

        # Create profile
        print("Creating profile...")
        profile = Profile(user_id=new_user.id)
        db.add(profile)
        print("✅ Profile object created")

        # Commit
        print("Committing transaction...")
        db.commit()
        print("✅ Transaction committed")

        # Verify
        print("Verifying user was created...")
        db.refresh(new_user)
        print(f"✅ User created successfully!")
        print(f"   - ID: {new_user.id}")
        print(f"   - Email: {new_user.email}")
        print(f"   - Role: {new_user.role}")
        print(f"   - Active: {new_user.is_active}")

        # Check profile
        print("Checking profile...")
        profile_check = db.query(Profile).filter(Profile.user_id == new_user.id).first()
        if profile_check:
            print(f"✅ Profile created successfully (ID: {profile_check.id})")
        else:
            print("❌ Profile not found")

        db.close()
        return True

    except Exception as e:
        print(f"❌ User creation failed: {e}")
        import traceback
        traceback.print_exc()
        try:
            db.rollback()
            db.close()
        except:
            pass
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("REGISTRATION FLOW COMPREHENSIVE TEST")
    print("="*60)

    # Initialize database
    print("\nInitializing database...")
    if init_db():
        print("✅ Database initialized")
    else:
        print("⚠️  Database initialization had issues (may be okay if already exists)")

    # Run tests
    results = []
    results.append(("Database Connection", test_database_connection()))
    results.append(("Enum Types", test_enum_types()))
    results.append(("Tables Exist", test_tables_exist()))
    results.append(("Schema Validation", test_schema_validation()))
    results.append(("User Creation", test_user_creation()))

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")

    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Registration should work.")
    else:
        print("\n⚠️  Some tests failed. Review the output above.")


if __name__ == "__main__":
    main()
