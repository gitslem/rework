-- Add new fields to applications table for enhanced project proposals
-- Run this in your Supabase SQL Editor or directly on your PostgreSQL database

ALTER TABLE applications ADD COLUMN IF NOT EXISTS project_duration VARCHAR;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_cost FLOAT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS revisions_included INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;
