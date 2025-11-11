# Database Migrations for Google OAuth Support

## Overview
This migration adds Google OAuth support to the users table by:
1. Adding a `google_id` column to store Google OAuth user IDs
2. Making `hashed_password` nullable (OAuth users don't need passwords)
3. Adding an index on `google_id` for performance

## For Supabase Users

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `add_google_oauth_support.sql`
5. Click **Run** or press `Ctrl+Enter`
6. Verify the migration succeeded (you should see "Success" message)

### Option 2: Using Python Script

```bash
# Make sure your DATABASE_URL is set in .env
python migrations/run_migration.py
```

### Option 3: Using psql Command Line

```bash
# Get your database connection string from Supabase
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f migrations/add_google_oauth_support.sql
```

## For Other PostgreSQL Databases

Run the SQL file using your preferred method:

```bash
psql -U your_user -d your_database -f migrations/add_google_oauth_support.sql
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if google_id column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('google_id', 'hashed_password');

-- Should return:
-- google_id | character varying | YES
-- hashed_password | character varying | YES
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove google_id column
ALTER TABLE users DROP COLUMN IF EXISTS google_id;

-- Make hashed_password required again (only if you want to)
-- WARNING: This will fail if you have OAuth users without passwords!
-- ALTER TABLE users ALTER COLUMN hashed_password SET NOT NULL;
```

## Troubleshooting

### "relation 'users' does not exist"
- Your database tables haven't been created yet
- Run the initial database setup first

### "column 'google_id' already exists"
- Migration has already been run
- No action needed

### Permission Denied
- Make sure your database user has ALTER TABLE permissions
- For Supabase, use the postgres user credentials
