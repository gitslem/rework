# Database Schema Setup

This directory contains the database schema for the Remote Works platform.

---

## Quick Setup for Supabase

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for initialization (2-3 minutes)

### Step 2: Run the Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `schema.sql`
4. Paste into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter`

**Expected Output:**
```
Success. No rows returned
```

### Step 3: Verify Tables Were Created

Run this in SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 8 tables:
- ✅ agent_assignments
- ✅ applications
- ✅ notifications
- ✅ payments
- ✅ profiles
- ✅ projects
- ✅ reviews
- ✅ users

### Step 4: Get Database URL

1. Go to **Settings** → **Database**
2. Find **Connection String** → **URI** tab
3. Copy the connection string:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. Replace `[PASSWORD]` with your actual password

### Step 5: Update Render Environment Variables

1. Go to your Render backend service
2. Navigate to **Environment** tab
3. Add/update:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres
   ```
4. Save and redeploy

---

## Schema Overview

### Tables

| Table | Purpose | Rows (typical) |
|-------|---------|----------------|
| **users** | User accounts & authentication | 1000s |
| **profiles** | User details, skills, statistics | 1000s |
| **projects** | Job postings | 100s |
| **applications** | Job applications | 1000s |
| **agent_assignments** | Agent-freelancer relationships | 100s |
| **reviews** | Ratings and feedback | 1000s |
| **payments** | Transaction records | 1000s |
| **notifications** | User notifications | 10000s |

### Enums

- `user_role`: freelancer, agent, business, admin
- `project_status`: open, in_progress, completed, cancelled
- `application_status`: pending, accepted, rejected, withdrawn
- `payment_status`: pending, processing, completed, failed

### Key Features

✅ **Foreign Keys**: All relationships enforced with CASCADE delete
✅ **Indexes**: Optimized for common queries
✅ **Triggers**: Auto-update `updated_at` timestamps
✅ **Constraints**: Data validation at database level
✅ **JSONB**: Flexible storage for skills, metadata, attachments

---

## For Local Development (PostgreSQL)

If using PostgreSQL locally instead of SQLite:

### 1. Create Database
```bash
createdb remoteworks
```

### 2. Run Schema
```bash
psql remoteworks < database/schema.sql
```

### 3. Update .env
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/remoteworks
```

---

## Alternative: Let FastAPI Create Tables

If you prefer automatic table creation:

1. **Skip running schema.sql**
2. Just set `DATABASE_URL` in your environment
3. Start the backend - tables will be created automatically
4. FastAPI uses SQLAlchemy's `Base.metadata.create_all()`

**Pros:**
- No manual SQL needed
- Works for both SQLite and PostgreSQL
- Automatic schema sync with models

**Cons:**
- No explicit control over indexes/constraints
- Can't customize database-specific features
- No migration history

---

## Sample Data (Optional)

To add test users, uncomment the sample data section at the bottom of `schema.sql`:

```sql
-- Insert test users
INSERT INTO users (email, hashed_password, role) VALUES
('freelancer@test.com', '$2b$12$...', 'freelancer'),
('agent@test.com', '$2b$12$...', 'agent'),
('business@test.com', '$2b$12$...', 'business');
```

**Test user password:** `testpass123`

---

## Database Migrations (Alembic)

For production, use Alembic for schema changes:

### Setup Alembic (One-time)
```bash
cd backend
alembic init alembic
```

### Configure
Edit `alembic/env.py`:
```python
from app.core.config import settings
from app.models.models import Base

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata
```

### Create Migration
```bash
alembic revision --autogenerate -m "Initial schema"
```

### Apply Migration
```bash
# Local
alembic upgrade head

# Production (add to build.sh)
alembic upgrade head
```

---

## Troubleshooting

### Error: "relation already exists"

**Solution:** Tables already created. Either:
- Drop tables and re-run (see CLEANUP section in schema.sql)
- Or skip schema.sql and use existing tables

### Error: "type already exists"

**Solution:** Enums already created. Drop them first:
```sql
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

### Error: "permission denied"

**Solution:** Make sure you're using the correct database credentials with proper permissions.

### Schema out of sync with models

**Solution:** Use Alembic migrations or regenerate schema from models:
```bash
# This creates a new schema.sql from your SQLAlchemy models
# (requires additional setup)
```

---

## Schema Management Best Practices

### Development
- ✅ Use SQLite for quick local testing
- ✅ Use PostgreSQL locally to match production
- ✅ Run schema.sql once at project start

### Production
- ✅ Run schema.sql in Supabase before first deployment
- ✅ Use Alembic for all schema changes
- ✅ Test migrations in staging first
- ✅ Backup database before migrations

### Version Control
- ✅ Keep schema.sql in git
- ✅ Keep Alembic migrations in git
- ✅ Document all schema changes
- ✅ Never edit production database manually

---

## Database URL Formats

### SQLite (Local Development)
```
sqlite:///./remoteworks.db
```

### PostgreSQL (Local)
```
postgresql://user:password@localhost:5432/remoteworks
```

### Supabase (Production)
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

### Render PostgreSQL (Alternative)
```
postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/dbname
```

---

## Maintenance

### View Table Sizes
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View Index Usage
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Vacuum Database (Performance)
```sql
VACUUM ANALYZE;
```

---

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/database
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/

---

## Summary

For production on Supabase:

1. ✅ Run `database/schema.sql` in Supabase SQL Editor
2. ✅ Verify 8 tables were created
3. ✅ Copy DATABASE_URL from Supabase
4. ✅ Set DATABASE_URL in Render environment variables
5. ✅ Deploy backend
6. ✅ Test registration and login

**Schema is now ready for production!** 🚀
