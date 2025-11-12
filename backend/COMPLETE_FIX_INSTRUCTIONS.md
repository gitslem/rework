# ⚡ COMPLETE SUPABASE DATABASE FIX

## The Problem

Your Supabase database was created with an older schema and is missing multiple columns. This causes authentication and profile creation to fail.

## ✅ ONE-TIME COMPLETE FIX (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New query"**

### Step 2: Run the Complete Fix Script

**Copy and paste this entire script, then click "Run":**

```sql
-- ⚡ COMPLETE FIX FOR PROFILES TABLE
-- Adds ALL missing columns at once

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_url VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills JSON DEFAULT '[]'::json;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_skills JSON DEFAULT '[]'::json;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR DEFAULT 'UTC' NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS working_hours_start INTEGER DEFAULT 9 NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS working_hours_end INTEGER DEFAULT 17 NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS working_days JSON DEFAULT '[1,2,3,4,5]'::json;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings FLOAT DEFAULT 0.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completed_projects INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS average_rating FLOAT DEFAULT 0.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_agent_approved BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_multiplier FLOAT DEFAULT 3.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
```

### Step 3: Verify It Worked

Run this query to see all columns:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

You should see 27+ columns including all the ones listed above.

### Step 4: Restart Your Backend

```bash
# If running locally
uvicorn main:app --reload

# Or just restart your deployment
```

## ✅ Test It

1. Go to your app
2. Try to register a new user OR log in
3. Should work without errors! 🎉

---

## Why This Happened

Your Supabase database was likely created before the full Profile model was defined. The app code expects all these columns, but Supabase only had the basic `user_id` column.

This script adds all missing columns with appropriate defaults, so existing data won't be affected.

---

## Alternative: Use Supabase File Upload

If you prefer using a file:

1. Download `backend/COMPLETE_SUPABASE_FIX.sql`
2. In Supabase SQL Editor
3. Click "..." menu → "Upload SQL file"
4. Select the file and run

---

## If You See "column already exists"

That's fine! The `IF NOT EXISTS` clause means it will skip columns that already exist. Just ignore those messages.

---

## Still Having Issues?

### Check if user_id column exists
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'user_id';
```

If it doesn't exist, you might need to create the table first:
```sql
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
);
```

Then run the fix script above.

---

## After This Fix

All these features will work:
- ✅ User registration
- ✅ Profile creation
- ✅ Profile updates
- ✅ Freelancer applications
- ✅ Company viewing applicants
- ✅ Chat functionality

**This is the complete, final fix!** 🚀
