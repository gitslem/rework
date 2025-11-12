# Fix for Supabase Migration Error

## Problem
```
ERROR: 42710: type "milestone_status" already exists
```

This happens when the enum types were created in a previous migration attempt but the tables weren't completed.

## Solution

### Option 1: Run the Fixed Migration (Recommended)

Use the fixed migration file that handles existing types:

```bash
# File: database/migrations/005_milestones_and_approvals_FIXED.sql
```

**Steps:**

1. **In Supabase Dashboard:**
   - Go to SQL Editor
   - Click "New Query"
   - Copy the entire content of `005_milestones_and_approvals_FIXED.sql`
   - Paste it into the SQL editor
   - Click "Run"

2. **The fixed migration will:**
   - Drop existing tables if they exist (safe)
   - Drop existing enum types if they exist
   - Recreate everything fresh
   - Add verification queries at the end

3. **Check the output** - You should see:
   ```
   Tables created: milestones, proof_approvals
   Enums created: milestone_status, approval_status
   Milestone column added to proofs: true
   ✅ Migration completed successfully!
   ```

---

### Option 2: Manual Cleanup (If Option 1 Fails)

If you need to manually clean up first:

```sql
-- Run these commands in Supabase SQL Editor, one at a time:

-- Step 1: Drop tables if they exist
DROP TABLE IF EXISTS proof_approvals CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;

-- Step 2: Drop types if they exist
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS milestone_status CASCADE;

-- Step 3: Now run the FIXED migration file
-- (Copy paste 005_milestones_and_approvals_FIXED.sql)
```

---

## Verification

After running the migration, verify everything is set up:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('milestones', 'proof_approvals');

-- Check enums exist
SELECT typname
FROM pg_type
WHERE typname IN ('milestone_status', 'approval_status');

-- Check milestone_id column added to proofs_of_build
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'proofs_of_build'
AND column_name = 'milestone_id';
```

Expected results:
- 2 tables: `milestones`, `proof_approvals`
- 2 enums: `milestone_status`, `approval_status`
- Column: `milestone_id` in `proofs_of_build`

---

## Common Issues

### Issue: "table does not exist"
**Cause:** The migration tried to reference a table that doesn't exist yet.
**Fix:** Make sure you're running the FIXED version which handles dependencies correctly.

### Issue: "relation already exists"
**Cause:** Tables already exist from a previous attempt.
**Fix:** The FIXED migration handles this with `DROP TABLE IF EXISTS`.

### Issue: "function update_updated_at_column already exists"
**Cause:** Function was created in a previous migration.
**Fix:** The FIXED migration uses `CREATE OR REPLACE FUNCTION` to handle this.

---

## What the Migration Does

1. **Creates milestone_status enum:**
   - pending
   - in_review
   - approved
   - rejected
   - completed

2. **Creates approval_status enum:**
   - pending
   - approved
   - rejected
   - revision_requested

3. **Creates milestones table** with:
   - Budget allocation (percentage and calculated amount)
   - Deliverables and acceptance criteria
   - Proof tracking
   - Escrow integration
   - Payment tracking

4. **Creates proof_approvals table** with:
   - Proof and milestone linking
   - Reviewer tracking
   - Feedback and revision notes
   - Status timestamps

5. **Adds milestone_id column** to existing `proofs_of_build` table

6. **Creates triggers** for:
   - Auto-updating `updated_at` timestamps
   - Auto-completing milestones when all proofs approved

---

## Testing After Migration

```sql
-- Test creating a milestone
INSERT INTO milestones (project_id, milestone_number, title, budget_percentage)
VALUES (1, 1, 'Test Milestone', 50.0);

-- Verify it was created
SELECT * FROM milestones;

-- Clean up test data
DELETE FROM milestones WHERE title = 'Test Milestone';
```

---

## Need Help?

If you're still getting errors:

1. **Share the exact error message**
2. **Check which step failed** (look at the line number in the error)
3. **Verify your Supabase PostgreSQL version:**
   ```sql
   SELECT version();
   ```

---

## Success Checklist

- [ ] Fixed migration ran without errors
- [ ] Verification queries show 2 tables and 2 enums
- [ ] Backend server starts without errors
- [ ] API endpoints respond correctly:
  - `GET /api/v1/milestones`
  - `POST /api/v1/milestones`
- [ ] No type errors in backend logs

---

## Next Steps After Migration

1. **Restart your backend server** (if running locally)
2. **Test the milestone endpoints** in Swagger UI: `/docs`
3. **Create a test project and milestone** through the API
4. **Test the GitHub webhook** if you've set it up

Your proof-of-build system should now be fully operational! 🎉
