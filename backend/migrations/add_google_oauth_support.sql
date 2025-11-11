-- Migration: Add Google OAuth support to users table
-- Date: 2025-11-11
-- Description: Adds google_id column and makes hashed_password nullable for OAuth users

-- Add google_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'google_id'
    ) THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    END IF;
END $$;

-- Make hashed_password nullable for OAuth users
DO $$
BEGIN
    ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;
EXCEPTION
    WHEN others THEN
        -- Column might already be nullable, ignore error
        NULL;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID (sub claim from Google token)';
