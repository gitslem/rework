# Deployment Troubleshooting Guide

## Registration Failed Error - Debugging Steps

If users are getting "registration failed" errors with no logs on Render, follow these steps:

### Step 1: Check Backend Configuration

Visit your Render backend URL + `/debug/config`:
```
https://your-backend.onrender.com/debug/config
```

This will show you:
- Database connection status
- PostgreSQL enum types status
- Tables status
- CORS configuration
- Environment settings

**Expected output:**
```json
{
  "environment": "production",
  "database_type": "PostgreSQL",
  "database_connected": true,
  "enum_types": {
    "userrole": true,
    "projectstatus": true,
    "applicationstatus": true,
    "paymentstatus": true
  },
  "tables": {
    "users": "exists (0 rows)",
    "profiles": "exists (0 rows)",
    ...
  }
}
```

### Step 2: Initialize Database (if needed)

If enum types or tables are missing, initialize the database:

```bash
curl -X POST https://your-backend.onrender.com/init-db
```

### Step 3: Check Health Endpoint

```bash
curl https://your-backend.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "environment": "production"
}
```

### Step 4: Test Registration Directly

```bash
curl -X POST https://your-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "role": "freelancer"
  }'
```

**If successful**, you should get:
```json
{
  "email": "test@example.com",
  "role": "freelancer",
  "id": 1,
  "is_active": true,
  "is_verified": false,
  "created_at": "2025-11-10T..."
}
```

**If it fails**, check the response for specific error messages.

### Step 5: Check Render Environment Variables

Ensure these are set in your Render dashboard:

#### Required Variables:
- `DATABASE_URL` - Should be automatically set from Supabase connection
- `SECRET_KEY` - Auto-generated or manually set
- `ENVIRONMENT` = `production`

#### Optional but Recommended:
- `BACKEND_CORS_ORIGINS` - Your frontend URL (comma-separated or JSON array)
- `FRONTEND_URL` - Your frontend URL

Example CORS settings:
```
# Single origin
BACKEND_CORS_ORIGINS=https://your-frontend.vercel.app

# Multiple origins (comma-separated)
BACKEND_CORS_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com

# Multiple origins (JSON)
BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app","https://your-domain.com"]
```

### Step 6: Check Frontend Configuration

Ensure your frontend has the correct API URL:

**Vercel/Netlify Environment Variable:**
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

**Check in browser console:**
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Step 7: Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to register
4. Check the request to `/api/v1/auth/register`

**Common issues:**
- **404**: API URL is wrong
- **CORS error**: CORS not configured correctly
- **500**: Server error (check Render logs)
- **422**: Validation error (check request payload)

### Common Issues and Solutions

#### Issue 1: Database Enum Types Missing
**Symptom:** Registration fails with database error
**Solution:** Run `/init-db` endpoint or redeploy

#### Issue 2: CORS Error
**Symptom:** Browser shows CORS policy error
**Solution:** Add your frontend URL to `BACKEND_CORS_ORIGINS`

#### Issue 3: Database URL Not Set
**Symptom:** Health check shows "disconnected"
**Solution:** Set `DATABASE_URL` in Render environment variables

#### Issue 4: Tables Not Created
**Symptom:** `/debug/config` shows table errors
**Solution:** Run `/init-db` endpoint

#### Issue 5: Wrong API URL in Frontend
**Symptom:** Request not reaching backend
**Solution:** Update `NEXT_PUBLIC_API_URL` and redeploy frontend

### Production Checklist

Before going live, verify:
- [ ] `/health` endpoint returns "healthy"
- [ ] `/debug/config` shows all enum types exist
- [ ] `/debug/config` shows all tables exist
- [ ] Test registration via curl works
- [ ] Frontend can reach backend (no CORS errors)
- [ ] `DATABASE_URL` is set correctly
- [ ] `SECRET_KEY` is set (not using default)
- [ ] `BACKEND_CORS_ORIGINS` includes your frontend URL

### Getting Logs

**Render Logs:**
1. Go to your Render dashboard
2. Select your backend service
3. Click "Logs" tab
4. Try to register
5. Check for errors in real-time

**Enable Debug Logging:**
Set environment variable:
```
ENVIRONMENT=development
```
(This enables SQL query logging)

### Manual Database Check (Supabase)

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run these queries:

```sql
-- Check enum types
SELECT typname FROM pg_type WHERE typname IN ('userrole', 'projectstatus', 'applicationstatus', 'paymentstatus');

-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check users table structure
\d users;

-- Count users
SELECT COUNT(*) FROM users;
```

### Emergency Fix

If nothing works, run this SQL in Supabase SQL Editor to reset:

```sql
-- Drop and recreate enum types
DROP TYPE IF EXISTS userrole CASCADE;
DROP TYPE IF EXISTS projectstatus CASCADE;
DROP TYPE IF EXISTS applicationstatus CASCADE;
DROP TYPE IF EXISTS paymentstatus CASCADE;

CREATE TYPE userrole AS ENUM ('freelancer', 'agent', 'business', 'admin');
CREATE TYPE projectstatus AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE applicationstatus AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE paymentstatus AS ENUM ('pending', 'processing', 'completed', 'failed');
```

Then trigger a redeploy on Render or hit the `/init-db` endpoint.

### Need More Help?

1. Check `/debug/config` output
2. Check Render logs
3. Test registration with curl
4. Check browser network tab
5. Verify all environment variables are set

Share the output of `/debug/config` and any error messages for more specific help.
