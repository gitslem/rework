-- Add missing columns to profiles table
-- Run this SQL script directly on your PostgreSQL database if you encounter the error:
-- "column profiles.github_username does not exist"

-- Add github_username column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'github_username'
    ) THEN
        ALTER TABLE profiles ADD COLUMN github_username VARCHAR;
    END IF;
END $$;

-- Add huggingface_username column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'huggingface_username'
    ) THEN
        ALTER TABLE profiles ADD COLUMN huggingface_username VARCHAR;
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('github_username', 'huggingface_username')
ORDER BY column_name;
