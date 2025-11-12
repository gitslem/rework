-- Quick fix for missing columns in profiles table
-- Run this SQL directly on your PostgreSQL database

-- Add github_username column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;

-- Add huggingface_username column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('github_username', 'huggingface_username')
ORDER BY column_name;
