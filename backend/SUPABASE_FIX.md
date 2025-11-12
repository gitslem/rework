# ⚡ Supabase Quick Fix - Add Missing Columns

## Method 1: Supabase Dashboard (Easiest - 30 seconds)

1. **Go to your Supabase project:**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Paste this SQL and run:**
   ```sql
   -- Add missing columns to profiles table
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;

   -- Verify columns were added
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'profiles'
     AND column_name IN ('github_username', 'huggingface_username')
   ORDER BY column_name;
   ```

4. **Click "Run" (or press Cmd/Ctrl + Enter)**

5. **You should see:**
   ```
   column_name            | data_type
   ----------------------|----------------
   github_username       | character varying
   huggingface_username  | character varying
   ```

6. **Done!** ✅ Restart your backend and try again.

---

## Method 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db execute --file backend/QUICK_FIX.sql
```

---

## Method 3: Using Connection String

1. **Get your connection string:**
   - Go to Supabase Dashboard
   - Settings → Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your actual password

2. **Run this command:**
   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[your-project].supabase.co:5432/postgres" \
     -c "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR; \
         ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;"
   ```

---

## Verify It Worked

After running the fix, you can verify in Supabase:

1. Go to **Table Editor** in Supabase
2. Click on **profiles** table
3. You should see the new columns: `github_username` and `huggingface_username`

---

## Alternative: Use Table Editor UI

If you prefer clicking instead of SQL:

1. Go to **Table Editor** → **profiles**
2. Click **"+ Add Column"** button
3. Add first column:
   - Name: `github_username`
   - Type: `varchar`
   - Nullable: ✅ (checked)
   - Click "Save"
4. Add second column:
   - Name: `huggingface_username`
   - Type: `varchar`
   - Nullable: ✅ (checked)
   - Click "Save"

---

## After Fix:

1. **Restart your backend:**
   ```bash
   # If running locally
   uvicorn main:app --reload

   # If on Vercel/Railway, redeploy or wait for auto-deploy
   ```

2. **Test it:**
   - Go to your app
   - Navigate to Profile Settings
   - Make a change
   - Click "Save Changes"
   - Should work! ✅

---

## Troubleshooting

### "Permission denied"
Make sure you're using the `postgres` role connection string, not the `anon` or `service_role` key.

### "Table profiles does not exist"
Your table might be in a different schema. Try:
```sql
-- Check which schema
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'profiles';

-- If it's in public schema (default), the commands above should work
-- If it's in a different schema, use:
ALTER TABLE your_schema.profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;
```

### Still getting errors?
Check the Supabase logs:
- Go to Logs → Postgres Logs in Supabase Dashboard
- Look for any errors when you try to save profile

---

## Why This Happened

Supabase databases created before the migration don't have these new columns. This is a one-time fix that adds them to your existing production database.

---

**Once done, all features will work perfectly!** 🚀
