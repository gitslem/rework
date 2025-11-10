# Supabase Database Setup for Remote Works

This guide covers setting up and configuring Supabase as your PostgreSQL database for the Remote Works platform.

## Why Supabase?

- **Free tier**: 500 MB database, perfect for getting started
- **Managed PostgreSQL**: No server maintenance required
- **Auto backups**: Daily backups included
- **Fast**: Global CDN and connection pooling
- **Dashboard**: Beautiful UI to manage your data
- **Real-time**: Built-in real-time subscriptions (optional feature)
- **Auth**: Built-in authentication (we use our own, but you can switch)

---

## Quick Start (5 Minutes)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email

### Step 2: Create a New Project

1. Click **"New Project"**
2. Select your organization (or create one)
3. Fill in project details:
   ```
   Name: remoteworks
   Database Password: [Generate a strong password]
   Region: [Choose closest to your users]
   Pricing Plan: Free
   ```
4. Click **"Create new project"**
5. Wait 2-3 minutes for initialization

### Step 3: Create Database Schema

**IMPORTANT:** You need to create the database tables before the app can work.

1. In Supabase dashboard, go to **SQL Editor** (in the sidebar)
2. Click **"New Query"**
3. Open the file `database/schema.sql` from the project
4. Copy the entire contents (all ~300 lines)
5. Paste into the SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter`)
7. You should see: **"Success. No rows returned"**

**Verify tables were created:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 8 tables: agent_assignments, applications, notifications, payments, profiles, projects, reviews, users

### Step 4: Get Connection String

1. In project dashboard, click **Settings** (gear icon)
2. Go to **Database** section
3. Scroll to **Connection String** → **URI** tab
4. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

### Step 5: Update Backend Environment

1. Create/update `backend/.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
   ```

2. Test connection locally:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   python main.py
   ```

3. Visit http://localhost:8000/health
   - Should show: `{"status": "healthy", "database": "connected"}`

### Step 6: Verify Everything Works

1. In Supabase dashboard, go to **Table Editor**
2. You should see 8 tables with proper columns
3. Visit http://localhost:8000/health
   - Should show: `{"status": "healthy", "database": "connected"}`
4. Try registering a user via the API or frontend
5. Check Supabase **Table Editor** → **users** table
   - Your new user should appear!

**Done!** Your database is ready. 🎉

---

## Supabase Dashboard Overview

### Table Editor

View and edit your database tables visually:

1. Click **Table Editor** in sidebar
2. Select a table (e.g., `users`)
3. View/edit rows, filter, sort
4. Add/delete rows manually if needed

### SQL Editor

Run custom SQL queries:

1. Click **SQL Editor** in sidebar
2. Write SQL queries
3. Click **Run** to execute

**Example queries:**

```sql
-- Count total users
SELECT COUNT(*) FROM users;

-- View recent projects
SELECT * FROM projects ORDER BY created_at DESC LIMIT 10;

-- Get user statistics
SELECT
  u.email,
  p.total_earnings,
  p.completed_projects,
  p.average_rating
FROM users u
JOIN profiles p ON u.id = p.user_id
ORDER BY p.total_earnings DESC;

-- Find active projects
SELECT * FROM projects WHERE status = 'open';
```

### Database Settings

1. **Connection Pooling**: Enabled by default (PgBouncer)
2. **Connection String**: Get URI, Session, or Transaction mode
3. **Database Password**: Reset if needed
4. **SSL**: Enabled by default

### Backups

**Free Tier**: Daily backups, 7-day retention

**Pro Tier**: Point-in-time recovery (PITR)

To restore:
1. Go to **Database** → **Backups**
2. Select a backup
3. Click **Restore**

---

## Connection Modes

Supabase offers different connection modes:

### 1. Session Mode (Default - Recommended)

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

- Best for most applications
- Supports all PostgreSQL features
- Used by SQLAlchemy by default

### 2. Transaction Mode (For Serverless)

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

- For serverless environments (AWS Lambda, Vercel Functions)
- Connection pooling via PgBouncer
- Port: 6543

### 3. Direct Connection (No Pooling)

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

- Direct connection without pooling
- Use for database migrations
- Port: 5432

**We recommend Session Mode (default) for Render deployment.**

---

## Security Best Practices

### 1. Database Password

- **Use a strong password**: At least 16 characters
- **Don't share**: Keep it in environment variables only
- **Rotate regularly**: Change password every 3-6 months

To reset password:
1. Settings → Database → Reset database password
2. Update DATABASE_URL in all environments

### 2. SSL Connections

Supabase requires SSL by default. If you get SSL errors:

```python
# In backend/app/db/database.py
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
    }
)
```

### 3. IP Whitelisting (Optional)

For extra security:
1. Settings → Database → Restrictions
2. Enable "Restrict database to specific IP addresses"
3. Add your Render service IP

### 4. Database Roles

Supabase creates these roles:
- `postgres`: Superuser (use for app)
- `authenticator`: For Supabase Auth
- `service_role`: For admin operations

**We use the `postgres` role for the app.**

---

## Performance Optimization

### 1. Connection Pooling

Already enabled by default via PgBouncer.

SQLAlchemy configuration:
```python
# backend/app/db/database.py
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,           # Number of connections to maintain
    max_overflow=20,        # Max connections above pool_size
    pool_pre_ping=True,     # Verify connections before using
    pool_recycle=3600,      # Recycle connections after 1 hour
)
```

### 2. Indexes

Important indexes are auto-created, but you can add more:

```sql
-- Example: Index for faster project searches by category
CREATE INDEX idx_projects_category ON projects(category);

-- Index for faster user lookups by email (already created)
CREATE INDEX idx_users_email ON users(email);
```

Add indexes via SQL Editor if needed.

### 3. Query Optimization

Monitor slow queries:
1. Go to **Database** → **Query Performance**
2. Identify slow queries
3. Add indexes or optimize queries

### 4. Database Size

Free tier: 500 MB

Check current usage:
```sql
SELECT
  pg_size_pretty(pg_database_size('postgres')) as database_size;

-- Size by table
SELECT
  schemaname as schema,
  tablename as table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Monitoring

### Database Health

Visit Supabase dashboard to monitor:

1. **Database Usage**: Storage, bandwidth, connections
2. **Query Performance**: Slow queries, execution times
3. **Logs**: Real-time database logs
4. **Reports**: Weekly email reports (opt-in)

### Backend Health Check

Our app includes a health check:

```bash
curl https://your-backend.onrender.com/health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

If database is down:
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "connection refused"
}
```

---

## Database Migrations

### Initial Setup (One-Time)

The app creates tables automatically on first run via:
```python
# backend/main.py
Base.metadata.create_all(bind=engine)
```

### Schema Changes (Using Alembic)

For production, use Alembic for migrations:

1. **Initialize Alembic** (if not done):
   ```bash
   cd backend
   alembic init alembic
   ```

2. **Configure Alembic**:
   Update `alembic.ini`:
   ```ini
   sqlalchemy.url = driver://user:pass@localhost/dbname
   ```

   Update `alembic/env.py`:
   ```python
   from app.core.config import settings
   from app.models.models import Base

   config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
   target_metadata = Base.metadata
   ```

3. **Create migration**:
   ```bash
   alembic revision --autogenerate -m "Add new column"
   ```

4. **Apply migration**:
   ```bash
   alembic upgrade head
   ```

5. **For production** (Render), update `build.sh`:
   ```bash
   #!/usr/bin/env bash
   set -o errexit
   pip install -r requirements.txt
   alembic upgrade head
   ```

---

## Data Management

### Export Data

**Method 1: Supabase Dashboard**
1. Table Editor → Select table
2. Export as CSV

**Method 2: SQL Export**
```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup.sql
```

### Import Data

**Method 1: SQL Editor**
1. SQL Editor → Paste SQL
2. Run import script

**Method 2: psql**
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < backup.sql
```

### Seed Data (For Testing)

Create a seed script:

```python
# backend/seed.py
from app.db.database import SessionLocal
from app.models.models import User, Profile
from app.core.security import get_password_hash

db = SessionLocal()

# Create test users
users = [
    {
        "email": "freelancer@test.com",
        "password": "testpass123",
        "role": "freelancer"
    },
    {
        "email": "business@test.com",
        "password": "testpass123",
        "role": "business"
    },
]

for user_data in users:
    user = User(
        email=user_data["email"],
        hashed_password=get_password_hash(user_data["password"]),
        role=user_data["role"],
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create profile
    profile = Profile(user_id=user.id)
    db.add(profile)
    db.commit()

print("Seed data created!")
db.close()
```

Run:
```bash
python backend/seed.py
```

---

## Troubleshooting

### Connection Refused

**Problem**: Can't connect to database

**Solutions**:
1. Check DATABASE_URL is correct
2. Verify Supabase project is running (not paused)
3. Check password is correct (no special chars need escaping)
4. Ensure your IP isn't blocked (if IP restrictions enabled)

### SSL Errors

**Problem**: SSL certificate verification failed

**Solution**: Add SSL mode to connection string:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### Too Many Connections

**Problem**: "too many connections" error

**Solutions**:
1. Reduce SQLAlchemy pool_size (default 10)
2. Use connection pooling mode (port 6543)
3. Upgrade Supabase plan for more connections

### Slow Queries

**Problem**: Database is slow

**Solutions**:
1. Add indexes on frequently queried columns
2. Optimize N+1 queries in code
3. Use eager loading in SQLAlchemy
4. Enable query caching with Redis
5. Upgrade to Pro plan for better performance

### Database Paused (Free Tier)

**Problem**: Project paused after inactivity

**Solution**:
1. Free tier pauses after 1 week of inactivity
2. Restore project from dashboard
3. Or upgrade to Pro plan (always-on)

---

## Upgrading to Pro

When to upgrade:

- **Database > 500 MB**: Free tier limit
- **Better performance**: Dedicated resources
- **Point-in-time recovery**: Better backups
- **Production use**: More reliable
- **No pausing**: Always-on database

**Cost**: $25/month

**Benefits**:
- 8 GB database (vs 500 MB)
- 50 GB bandwidth (vs 2 GB)
- 7-day PITR backups
- Daily backups (vs weekly)
- Priority support

To upgrade:
1. Settings → Billing
2. Select Pro plan
3. Add payment method

---

## Alternative: Supabase CLI

For advanced users:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Pull remote schema
supabase db pull

# Create migration
supabase migration new add_column

# Push migration
supabase db push
```

---

## Comparison: Supabase vs Other Options

| Feature | Supabase Free | Render PostgreSQL | AWS RDS |
|---------|---------------|-------------------|---------|
| **Price** | $0 | $7/month | ~$15/month |
| **Storage** | 500 MB | 1 GB | Custom |
| **Backups** | Daily | Daily | Manual |
| **UI Dashboard** | ✅ Excellent | ✅ Basic | ❌ None |
| **Setup Time** | 2 minutes | 5 minutes | 30 minutes |
| **SSL** | ✅ Auto | ✅ Auto | Manual |
| **Scaling** | Easy | Moderate | Complex |

**Recommendation**: Start with Supabase Free, upgrade to Supabase Pro when needed.

---

## Summary Checklist

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Copied DATABASE_URL
- [ ] Updated backend/.env
- [ ] Tested connection with /health endpoint
- [ ] Verified tables created in Table Editor
- [ ] Set up backups (auto-enabled)
- [ ] Saved database password securely
- [ ] Configured SSL (auto-enabled)
- [ ] Tested app registration/login

---

## Useful Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Support**: https://supabase.com/support

---

## Next Steps

1. **Deploy backend** to Render (see DEPLOY_TO_RENDER_SUPABASE.md)
2. **Set up monitoring** in Supabase dashboard
3. **Configure backups** schedule
4. **Add test data** for development
5. **Monitor performance** as users grow

Your Supabase database is production-ready! 🚀
