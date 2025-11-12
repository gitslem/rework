-- ===================================
-- ADD HUGGING FACE OAUTH SUPPORT
-- Migration 006: Add Hugging Face OAuth columns to users table
-- ===================================

-- Add Hugging Face OAuth columns to users table
DO $$
BEGIN
    -- Add huggingface_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'huggingface_id'
    ) THEN
        ALTER TABLE users
        ADD COLUMN huggingface_id VARCHAR UNIQUE;

        CREATE INDEX idx_users_huggingface_id ON users(huggingface_id);
    END IF;

    -- Add huggingface_access_token column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'huggingface_access_token'
    ) THEN
        ALTER TABLE users
        ADD COLUMN huggingface_access_token VARCHAR;
    END IF;
END $$;

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Check columns were added
SELECT 'Hugging Face columns added to users:' as info,
       EXISTS(
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'users'
           AND column_name = 'huggingface_id'
       ) as huggingface_id_exists,
       EXISTS(
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'users'
           AND column_name = 'huggingface_access_token'
       ) as huggingface_access_token_exists;

SELECT '✅ Hugging Face OAuth migration completed successfully!' as result;
