# Quick Fix: "Google sign up failed" Error

## The Problem
You're getting **"Google sign up failed. Please try again"** error after selecting your email.

## The Cause
Your Supabase database doesn't have the `google_id` column needed for OAuth authentication.

## The Solution (3 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard at https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar (database icon)
4. Click **+ New Query**

### Step 2: Run This Migration SQL

Copy and paste this entire SQL code into the editor:

```sql
-- Add google_id column for OAuth support
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'google_id'
    ) THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
        RAISE NOTICE 'Added google_id column successfully';
    ELSE
        RAISE NOTICE 'google_id column already exists';
    END IF;
END $$;

-- Make hashed_password nullable for OAuth users
DO $$
BEGIN
    ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;
    RAISE NOTICE 'Made hashed_password nullable successfully';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'hashed_password already nullable or error: %', SQLERRM;
END $$;

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('google_id', 'hashed_password')
ORDER BY column_name;
```

### Step 3: Execute

Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

You should see:
- "Success" message
- A table showing the columns:
  ```
  google_id         | character varying | YES
  hashed_password   | character varying | YES
  ```

### Step 4: Restart Your Backend (If Self-Hosted)

If you're running the backend on Render or another platform:
1. Go to your Render dashboard
2. Find your backend service
3. Click **Manual Deploy > Deploy latest commit** (or just wait for auto-deploy)

For local development:
```bash
# Stop the backend (Ctrl+C)
# Then restart:
cd backend
uvicorn main:app --reload
```

### Step 5: Test Again

1. Go to your app
2. Click "Get Started"
3. Choose your role (Freelancer/Agent/Business)
4. Click on the Google button
5. Select your email
6. ✅ You should now successfully sign in and be redirected to the dashboard!

## Still Having Issues?

Check your backend logs for detailed error messages. The backend now logs:
- "Google OAuth attempt with role: ..."
- "Token decoded - email: ..., google_id: ..."
- "Database query completed - user found: ..."

### Common Issues After Migration

**"Client ID mismatch" or "Token invalid"**
- Make sure `GOOGLE_CLIENT_ID` in backend matches `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend
- Check Render environment variables are set correctly

**"Database error"**
- Verify DATABASE_URL points to your Supabase instance
- Check Supabase project is running

**"Authorization failed"**
- Add your production URL to Google Cloud Console authorized origins
- Format: `https://your-app.onrender.com` (no trailing slash)

## Need More Help?

See the full documentation:
- `GOOGLE_OAUTH_SETUP.md` - Complete setup guide
- `backend/migrations/README.md` - Migration details
- Backend logs - Check for detailed error messages
