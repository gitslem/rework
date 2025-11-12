# Add New Application Fields to Database

## Quick Fix for Supabase

The application submission now includes 4 new fields that need to be added to your database:

1. **project_duration** - Text field for project timeline (e.g., "2 weeks")
2. **total_cost** - Float field for total project cost
3. **revisions_included** - Integer for number of revisions offered
4. **additional_info** - Text field for extra details

## How to Apply the Fix

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `ADD_APPLICATION_FIELDS.sql`
5. Click "Run" or press `Ctrl+Enter`
6. You should see "Success. No rows returned" message

### Option 2: Direct SQL Command

Run this SQL directly:

```sql
ALTER TABLE applications ADD COLUMN IF NOT EXISTS project_duration VARCHAR;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_cost FLOAT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS revisions_included INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS additional_info TEXT;
```

## Verify Installation

After running the migration, verify the columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;
```

You should see the new columns: `project_duration`, `total_cost`, `revisions_included`, and `additional_info`.

## What Changed

### Backend
- **models.py**: Added 4 new columns to Application model
- **schemas.py**: Added 4 new fields to ApplicationBase schema

### Frontend
- **apply.tsx**: Enhanced application form with:
  - Project Duration input
  - Total Cost input
  - Revisions Included input
  - Additional Information textarea
  - Fixed API URL issue causing "not found" error

## Testing

After applying the database changes:

1. Navigate to any project as a freelancer
2. Click "Apply Now"
3. Fill out the enhanced application form
4. Submit your application

The application should now submit successfully with all the new fields!
