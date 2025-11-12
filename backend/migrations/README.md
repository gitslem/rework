# Database Migrations

This directory contains SQL migration scripts for manual database updates.

## Quick Fix for Missing Profile Columns

If you see the error:
```
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn) column profiles.github_username does not exist
```

Run the following SQL script on your PostgreSQL database:

```bash
psql -d your_database_name -f add_missing_profile_columns.sql
```

Or connect to your database and run:
```sql
-- Add missing columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;
```

## Using Alembic (Recommended)

For managed migrations, use Alembic:

```bash
cd backend
alembic upgrade head
```

This will apply all pending migrations automatically.

## Creating New Migrations

To create a new migration after changing models:

```bash
alembic revision --autogenerate -m "Description of changes"
# Review the generated migration file
alembic upgrade head
```

## Troubleshooting

1. **Database connection error**: Ensure your DATABASE_URL environment variable is set correctly
2. **Columns already exist**: The migration script is idempotent and will skip columns that already exist
3. **Permission denied**: Ensure your database user has ALTER TABLE permissions
