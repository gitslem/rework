# Database Schema Fix Guide

## Issue Description

The application encountered a database schema mismatch error:

```
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn)
column profiles.github_username does not exist
```

This error occurs because the SQLAlchemy models define `github_username` and `huggingface_username` columns in the `profiles` table, but these columns don't exist in the actual PostgreSQL database.

## Root Cause

The database was created with an earlier schema version that didn't include these columns. The columns are required by the **Verified Freelancer Profiles** feature (Feature #7) for tracking freelancer social profiles.

## Solution

I've created **three methods** to fix this issue. Choose the one that works best for your deployment:

---

### Method 1: Using Alembic (Recommended)

Alembic is a database migration tool that manages schema changes systematically.

**Steps:**

1. **Install dependencies** (if not already installed):
   ```bash
   cd backend
   pip install alembic psycopg2-binary
   ```

2. **Run the migration**:
   ```bash
   alembic upgrade head
   ```

3. **Verify the fix**:
   - Restart your application
   - Check that the error no longer appears

**What this does:**
- Connects to your PostgreSQL database using the `DATABASE_URL` environment variable
- Adds the missing columns to the `profiles` table
- Records the migration in the `alembic_version` table for version tracking

---

### Method 2: Direct SQL Script (Quick Fix)

If you have direct database access, run this SQL script:

**File location:** `backend/migrations/add_missing_profile_columns.sql`

**Execute:**
```bash
psql -d your_database_name -f backend/migrations/add_missing_profile_columns.sql
```

**Or manually run:**
```sql
-- Add github_username column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;

-- Add huggingface_username column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;
```

**What this does:**
- Checks if columns exist before adding them (idempotent)
- Adds both columns with VARCHAR type
- Works on any PostgreSQL database

---

### Method 3: Using psql Interactive

If you have psql access:

```bash
# Connect to your database
psql -d your_database_name

# Run these commands
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;

# Verify
\d profiles

# Exit
\q
```

---

## Verification

After applying the fix, verify it worked:

1. **Check database schema:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'profiles'
     AND column_name IN ('github_username', 'huggingface_username')
   ORDER BY column_name;
   ```

   Expected output:
   ```
        column_name      | data_type
   ----------------------+-----------
    github_username      | character varying
    huggingface_username | character varying
   ```

2. **Restart your application:**
   ```bash
   # For development
   uvicorn main:app --reload

   # For production (adjust as needed)
   systemctl restart your-app-service
   ```

3. **Test the API:**
   ```bash
   # Get your access token
   TOKEN="your_jwt_token_here"

   # Test freelancer search endpoint
   curl -H "Authorization: Bearer $TOKEN" \
        http://localhost:8000/api/v1/freelancers/search?limit=5
   ```

   If no error appears, the fix was successful!

---

## For Production Deployment

### Railway

If deploying on Railway:

1. The migration will run automatically when you push to the branch
2. Railway detects Alembic and runs migrations during deployment
3. Alternatively, use Railway's database console to run the SQL script

### Heroku

```bash
heroku run alembic upgrade head --app your-app-name
```

### Custom Server

```bash
# SSH into your server
ssh user@your-server

# Navigate to app directory
cd /path/to/rework/backend

# Activate virtual environment
source venv/bin/activate

# Run migration
alembic upgrade head
```

---

## Files Changed

This fix includes the following new files:

1. **`backend/alembic/`** - Alembic migration system
   - `env.py` - Configuration connecting Alembic to your models
   - `versions/e3da4ba29285_*.py` - Migration script

2. **`backend/migrations/`** - SQL scripts directory
   - `add_missing_profile_columns.sql` - Direct SQL fix
   - `README.md` - Migration documentation

3. **`DATABASE_FIX_GUIDE.md`** - This guide

---

## Prevention

To prevent this issue in the future:

1. **Use Alembic for all schema changes:**
   ```bash
   # After changing models
   alembic revision --autogenerate -m "Description of changes"
   alembic upgrade head
   ```

2. **Version control migrations:**
   - Always commit migration files
   - Never modify the database schema manually

3. **Test migrations:**
   - Test on staging before production
   - Keep backups before running migrations

---

## Troubleshooting

### Error: "Database URL not set"

Set the DATABASE_URL environment variable:
```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### Error: "Permission denied"

Ensure your database user has ALTER TABLE permissions:
```sql
GRANT ALL PRIVILEGES ON TABLE profiles TO your_user;
```

### Error: "Column already exists"

The migration is idempotent and handles this automatically. If using direct SQL, the `IF NOT EXISTS` clause prevents errors.

### Error: "Cannot find migration"

Ensure you're in the backend directory:
```bash
cd backend
alembic upgrade head
```

---

## Summary

This fix resolves a schema mismatch between the application models and the database. The missing columns are required for the **Verified Freelancer Profiles** feature, which allows freelancers to link their GitHub and Hugging Face profiles.

**Recommended approach:** Use Method 1 (Alembic) for production systems.

**Quick fix:** Use Method 2 (SQL script) if you need immediate resolution.

After applying the fix, all 7 features will be fully functional without database errors.
