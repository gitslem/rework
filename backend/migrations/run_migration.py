#!/usr/bin/env python3
"""
Run database migration for Google OAuth support
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.database import engine
from app.core.config import settings

def run_migration():
    """Run the Google OAuth migration"""
    print("=" * 60)
    print("Running Google OAuth Support Migration")
    print("=" * 60)
    print(f"\nDatabase: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    print()
    
    # Read migration SQL
    sql_file = Path(__file__).parent / "add_google_oauth_support.sql"
    
    if not sql_file.exists():
        print(f"❌ Error: Migration file not found: {sql_file}")
        sys.exit(1)
    
    with open(sql_file, 'r') as f:
        migration_sql = f.read()
    
    print("Migration SQL loaded successfully")
    print()
    
    try:
        # Execute migration
        with engine.begin() as conn:
            print("Executing migration...")
            conn.execute(text(migration_sql))
            print("✅ Migration executed successfully!")
            print()
            
            # Verify migration
            print("Verifying migration...")
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('google_id', 'hashed_password')
                ORDER BY column_name;
            """))
            
            columns = result.fetchall()
            if len(columns) >= 2:
                print("\n✅ Verification successful! Column details:")
                print("-" * 60)
                for col in columns:
                    print(f"  {col[0]:20} | {col[1]:20} | Nullable: {col[2]}")
                print("-" * 60)
                print()
                print("🎉 Migration completed successfully!")
                print()
                print("Next steps:")
                print("1. Restart your backend server")
                print("2. Test Google OAuth login/signup")
                print("3. Check backend logs for any issues")
            else:
                print("⚠️  Warning: Could not verify all columns")
                print(f"Found {len(columns)} columns, expected 2")
                
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        print()
        print("Common issues:")
        print("1. Database not accessible - check DATABASE_URL in .env")
        print("2. Users table doesn't exist - run initial setup first")
        print("3. Permission denied - use database admin credentials")
        print()
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
