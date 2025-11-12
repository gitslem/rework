# Timezone Fields Migration

## Problem
You're seeing this error:
```
psycopg2.errors.UndefinedColumn) column "timezone" of relation "profiles" does not exist
```

This means the database schema is missing the timezone-related columns that the application expects.

## Solution

Run the timezone fields migration to add the missing columns to your database.

### Prerequisites

1. **Database Access**: Ensure your `DATABASE_URL` environment variable is set correctly
2. **PostgreSQL**: This migration is designed for PostgreSQL databases
3. **Python Dependencies**: Install backend dependencies if not already done:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Running the Migration

#### Option 1: Using the Python Script (Recommended)

```bash
cd backend
python migrations/run_timezone_migration.py
```

This script will:
- Connect to your database
- Run the migration from `database/migrations/004_add_timezone_fields.sql`
- Verify that all columns were added successfully
- Provide helpful error messages if something goes wrong

#### Option 2: Direct SQL Execution

If you prefer to run the SQL directly:

```bash
psql $DATABASE_URL -f database/migrations/004_add_timezone_fields.sql
```

Or connect to your database and run the SQL from `database/migrations/004_add_timezone_fields.sql`

### What This Migration Does

The migration adds the following columns to the `profiles` table:

1. **timezone** (VARCHAR(50)): IANA timezone identifier (e.g., "America/New_York", "Europe/London")
   - Default: 'UTC'
   - NOT NULL

2. **working_hours_start** (INTEGER): Start of working hours in user's local timezone (0-23)
   - Default: 9
   - NOT NULL

3. **working_hours_end** (INTEGER): End of working hours in user's local timezone (0-23)
   - Default: 17
   - NOT NULL

4. **working_days** (JSONB): Array of working days (0=Sunday, 1=Monday, ..., 6=Saturday)
   - Default: [1, 2, 3, 4, 5] (Monday-Friday)
   - NOT NULL

The migration also:
- Adds check constraints to ensure working hours are valid (0-23)
- Creates an index on the timezone column for faster filtering
- Attempts to set smart timezone defaults based on existing location data

### After Running the Migration

1. **Restart your backend server** to ensure it picks up the schema changes
2. **Test profile creation/updates** to verify timezone support is working
3. **Check logs** for any remaining issues

### Troubleshooting

#### "Column already exists" error
If you see an error about columns already existing, the migration may have already been run. Verify by checking your profiles table:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('timezone', 'working_hours_start', 'working_hours_end', 'working_days');
```

#### "Table profiles does not exist" error
You need to initialize the database first:
```bash
cd backend
python -c "from app.db.database import init_db; init_db()"
```

#### Connection errors
1. Verify your DATABASE_URL environment variable is set
2. Check that your database is running and accessible
3. Verify firewall/network settings allow the connection

### For Production/Supabase Deployments

If using Supabase or a managed PostgreSQL service:
1. Ensure you have the correct connection credentials
2. You may need to use the connection pooler URL
3. Consider running migrations during a maintenance window
4. Always backup your database before running migrations

## Migration File Location

The SQL migration file is located at:
```
database/migrations/004_add_timezone_fields.sql
```
