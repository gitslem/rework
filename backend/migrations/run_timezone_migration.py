#!/usr/bin/env python3
"""
Run database migration for timezone fields
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    """Run the timezone fields migration"""
    print("=" * 60)
    print("Running Timezone Fields Migration")
    print("=" * 60)
    print()

    # Import after loading env
    from app.db.database import engine
    from app.core.config import settings

    # Check database connection
    database_url_display = settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL
    print(f"Database: {database_url_display}")
    print()

    # Check if using PostgreSQL
    is_postgres = 'postgresql' in settings.DATABASE_URL.lower() or 'postgres' in settings.DATABASE_URL.lower()

    if not is_postgres:
        print("⚠️  Warning: This migration is designed for PostgreSQL.")
        print("   Current database type appears to be different.")
        print(f"   Database URL: {database_url_display}")
        print()
        response = input("Continue anyway? (yes/no): ")
        if response.lower() != 'yes':
            print("Migration cancelled.")
            sys.exit(0)
        print()

    # Read migration SQL from the correct location
    sql_file = Path(__file__).parent.parent.parent / "database" / "migrations" / "004_add_timezone_fields.sql"

    if not sql_file.exists():
        print(f"❌ Error: Migration file not found: {sql_file}")
        print(f"   Expected location: {sql_file}")
        sys.exit(1)

    with open(sql_file, 'r') as f:
        migration_sql = f.read()

    print("✅ Migration SQL loaded successfully")
    print()

    try:
        # Test connection first
        print("Testing database connection...")
        with engine.connect() as test_conn:
            test_conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        print()

        # Execute migration
        with engine.begin() as conn:
            print("Executing migration...")
            print("-" * 60)
            conn.execute(text(migration_sql))
            print("-" * 60)
            print("✅ Migration executed successfully!")
            print()

            # Verify migration
            print("Verifying migration...")
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'profiles'
                AND column_name IN ('timezone', 'working_hours_start', 'working_hours_end', 'working_days')
                ORDER BY column_name;
            """))

            columns = result.fetchall()
            if len(columns) >= 4:
                print("\n✅ Verification successful! Column details:")
                print("-" * 60)
                for col in columns:
                    default = str(col[3])[:30] if col[3] else 'None'
                    print(f"  {col[0]:25} | {col[1]:20} | Nullable: {col[2]:5} | Default: {default}")
                print("-" * 60)
                print()
                print("🎉 Migration completed successfully!")
                print()
                print("Next steps:")
                print("1. Restart your backend server")
                print("2. Test profile creation/updates with timezone support")
                print("3. Check backend logs for any issues")
            else:
                print("⚠️  Warning: Could not verify all columns")
                print(f"Found {len(columns)} columns, expected 4")
                if columns:
                    print("\nFound columns:")
                    for col in columns:
                        print(f"  - {col[0]}")

    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ Migration failed: {error_msg}")
        print()

        # Provide specific guidance based on error
        if "already exists" in error_msg.lower() or "duplicate" in error_msg.lower():
            print("ℹ️  It appears the columns may already exist.")
            print("   This is not necessarily an error - the migration may have been run previously.")
            print()
            print("To verify, check your profiles table schema:")
            print("   SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';")
        elif "does not exist" in error_msg.lower() and "table" in error_msg.lower():
            print("❌ The 'profiles' table does not exist.")
            print("   You need to run the initial database setup first:")
            print("   1. Make sure DATABASE_URL is set in your .env file")
            print("   2. Run: python -c 'from app.db.database import init_db; init_db()'")
        elif "connection" in error_msg.lower() or "timeout" in error_msg.lower():
            print("❌ Database connection issue.")
            print("   1. Check DATABASE_URL in your .env file")
            print("   2. Verify database is running and accessible")
            print("   3. Check firewall/network settings")
        else:
            print("Common issues:")
            print("1. Database not accessible - check DATABASE_URL in .env")
            print("2. Profiles table doesn't exist - run initial setup first")
            print("3. Permission denied - use database admin credentials")
            print("4. Columns already exist - migration may have already been run")
        print()
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
