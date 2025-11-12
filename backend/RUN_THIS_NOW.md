# ⚡ IMMEDIATE FIX FOR DATABASE ERROR

## Error You're Seeing:
```
column "github_username" of relation "profiles" does not exist
```

## Quick Fix (Choose ONE method):

### Method 1: Using psql (Recommended)

1. **Connect to your database:**
   ```bash
   psql -d your_database_name
   ```
   
   Or if using connection string:
   ```bash
   psql postgresql://user:password@host:5432/dbname
   ```

2. **Run these two commands:**
   ```sql
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;
   ```

3. **Verify it worked:**
   ```sql
   \d profiles
   ```
   You should see both new columns listed.

4. **Exit:**
   ```sql
   \q
   ```

5. **Restart your app** and try again!

---

### Method 2: Using SQL File

```bash
psql -d your_database_name -f backend/QUICK_FIX.sql
```

---

### Method 3: Using Database GUI (pgAdmin, DBeaver, etc.)

1. Open your database tool
2. Connect to your database
3. Open SQL query window
4. Paste and run:
   ```sql
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;
   ```
5. Restart your app

---

### Method 4: Using Railway/Heroku Console

**Railway:**
```bash
railway run psql
# Then run the ALTER TABLE commands above
```

**Heroku:**
```bash
heroku pg:psql --app your-app-name
# Then run the ALTER TABLE commands above
```

---

### Method 5: Using Python Script

```bash
cd backend
python << 'PYTHON'
from app.db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username VARCHAR;"))
    conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS huggingface_username VARCHAR;"))
    conn.commit()
    print("✅ Columns added successfully!")
PYTHON
```

---

## After Running the Fix:

1. **Restart your backend:**
   ```bash
   # If using uvicorn
   uvicorn main:app --reload
   
   # Or if using Docker
   docker-compose restart backend
   ```

2. **Test profile update:**
   - Go to profile settings
   - Make a change
   - Click "Save Changes"
   - Should now work! ✅

---

## If You Still Get Errors:

Check if the columns were actually added:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('github_username', 'huggingface_username');
```

Should return:
```
   column_name
----------------------
 github_username
 huggingface_username
```

---

## Need Help?

If none of these work, please share:
1. Which database provider you're using (Railway, Heroku, local PostgreSQL, etc.)
2. The full error message
3. Result of: `SELECT version();` in psql

---

**This is a one-time fix. Once done, everything will work!** 🚀
