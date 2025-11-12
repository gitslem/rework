-- ⚡ COMPLETE FIX FOR SUPABASE DATABASE
-- This adds ALL missing columns to the profiles table
-- Run this in Supabase SQL Editor

-- Add all potentially missing columns
-- Using IF NOT EXISTS so it's safe to run multiple times

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

-- Verify all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
