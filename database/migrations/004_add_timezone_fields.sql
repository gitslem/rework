-- Migration: Add timezone and working hours fields to profiles table
-- Feature: Timezone-Aware Collaboration (Feature 4)
-- Date: 2025-11-12

-- Add timezone fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
ADD COLUMN IF NOT EXISTS working_hours_start INTEGER DEFAULT 9 NOT NULL,
ADD COLUMN IF NOT EXISTS working_hours_end INTEGER DEFAULT 17 NOT NULL,
ADD COLUMN IF NOT EXISTS working_days JSONB DEFAULT '[1, 2, 3, 4, 5]' NOT NULL;

-- Add check constraints for working hours
ALTER TABLE profiles
ADD CONSTRAINT check_working_hours_start CHECK (working_hours_start >= 0 AND working_hours_start <= 23),
ADD CONSTRAINT check_working_hours_end CHECK (working_hours_end >= 0 AND working_hours_end <= 23);

-- Add comment explaining the fields
COMMENT ON COLUMN profiles.timezone IS 'IANA timezone identifier (e.g., America/New_York, Europe/London)';
COMMENT ON COLUMN profiles.working_hours_start IS 'Start of working hours in user''s local timezone (0-23)';
COMMENT ON COLUMN profiles.working_hours_end IS 'End of working hours in user''s local timezone (0-23)';
COMMENT ON COLUMN profiles.working_days IS 'Array of working days (0=Sunday, 1=Monday, ..., 6=Saturday)';

-- Create index on timezone for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON profiles(timezone);

-- Update existing profiles to have default timezone based on location if available
-- This is a best-effort migration for existing data
UPDATE profiles
SET timezone = CASE
    -- North America
    WHEN location ILIKE '%new york%' OR location ILIKE '%ny%' OR location ILIKE '%nyc%' THEN 'America/New_York'
    WHEN location ILIKE '%los angeles%' OR location ILIKE '%la%' OR location ILIKE '%california%' OR location ILIKE '%ca%' THEN 'America/Los_Angeles'
    WHEN location ILIKE '%chicago%' OR location ILIKE '%illinois%' OR location ILIKE '%il%' THEN 'America/Chicago'
    WHEN location ILIKE '%denver%' OR location ILIKE '%colorado%' OR location ILIKE '%co%' THEN 'America/Denver'
    WHEN location ILIKE '%toronto%' OR location ILIKE '%canada%' THEN 'America/Toronto'
    WHEN location ILIKE '%vancouver%' THEN 'America/Vancouver'
    WHEN location ILIKE '%mexico%' THEN 'America/Mexico_City'

    -- Europe
    WHEN location ILIKE '%london%' OR location ILIKE '%uk%' OR location ILIKE '%united kingdom%' THEN 'Europe/London'
    WHEN location ILIKE '%paris%' OR location ILIKE '%france%' THEN 'Europe/Paris'
    WHEN location ILIKE '%berlin%' OR location ILIKE '%germany%' THEN 'Europe/Berlin'
    WHEN location ILIKE '%madrid%' OR location ILIKE '%spain%' THEN 'Europe/Madrid'
    WHEN location ILIKE '%rome%' OR location ILIKE '%italy%' THEN 'Europe/Rome'
    WHEN location ILIKE '%amsterdam%' OR location ILIKE '%netherlands%' THEN 'Europe/Amsterdam'
    WHEN location ILIKE '%stockholm%' OR location ILIKE '%sweden%' THEN 'Europe/Stockholm'

    -- Asia
    WHEN location ILIKE '%tokyo%' OR location ILIKE '%japan%' THEN 'Asia/Tokyo'
    WHEN location ILIKE '%shanghai%' OR location ILIKE '%beijing%' OR location ILIKE '%china%' THEN 'Asia/Shanghai'
    WHEN location ILIKE '%singapore%' THEN 'Asia/Singapore'
    WHEN location ILIKE '%hong kong%' THEN 'Asia/Hong_Kong'
    WHEN location ILIKE '%seoul%' OR location ILIKE '%korea%' THEN 'Asia/Seoul'
    WHEN location ILIKE '%mumbai%' OR location ILIKE '%india%' OR location ILIKE '%bangalore%' THEN 'Asia/Kolkata'
    WHEN location ILIKE '%dubai%' OR location ILIKE '%uae%' THEN 'Asia/Dubai'

    -- Australia/Pacific
    WHEN location ILIKE '%sydney%' OR location ILIKE '%australia%' THEN 'Australia/Sydney'
    WHEN location ILIKE '%melbourne%' THEN 'Australia/Melbourne'
    WHEN location ILIKE '%auckland%' OR location ILIKE '%new zealand%' THEN 'Pacific/Auckland'

    -- South America
    WHEN location ILIKE '%sao paulo%' OR location ILIKE '%brazil%' THEN 'America/Sao_Paulo'
    WHEN location ILIKE '%buenos aires%' OR location ILIKE '%argentina%' THEN 'America/Argentina/Buenos_Aires'

    -- Default to UTC
    ELSE 'UTC'
END
WHERE timezone = 'UTC' AND location IS NOT NULL AND location != '';
