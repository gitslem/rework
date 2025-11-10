# 🔧 Troubleshooting Registration and Login Issues

This guide helps diagnose and fix common registration/login problems.

---

## Quick Diagnosis

### Step 1: Is the backend running?

Open http://localhost:8000/health in your browser.

**If it doesn't load:**
- ❌ Backend is not running
- **Fix:** Start the backend (see below)

**If it shows an error:**
- ❌ Backend has issues
- **Fix:** Check the error message

**If it shows `{"status": "healthy"}`:**
- ✅ Backend is running
- Continue to Step 2

### Step 2: Check the browser console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try to register
4. Look for errors

**Common errors:**

```
Failed to fetch
```
→ Backend not running or CORS issue

```
400 Bad Request
```
→ Validation error (check password length, email format)

```
500 Internal Server Error
```
→ Database or backend code error

---

## Fix 1: Backend Not Running

### Symptoms:
- Registration button does nothing
- Browser console shows "Failed to fetch"
- http://localhost:8000/health doesn't load

### Solution:

**Option A: Use the start script (Recommended)**

Linux/Mac:
```bash
cd /home/user/rework
./start.sh
```

Windows:
```bash
cd C:\path\to\rework
start.bat
```

**Option B: Start manually**

```bash
# Terminal 1 - Backend
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Wait for:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Then in a new terminal:
```bash
# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## Fix 2: Dependencies Not Installed

### Symptoms:
```
ModuleNotFoundError: No module named 'fastapi'
```

### Solution:

```bash
cd backend

# Create virtual environment if it doesn't exist
python3 -m venv venv

# Activate it
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend
python main.py
```

---

## Fix 3: Database Not Created

### Symptoms:
```
sqlalchemy.exc.OperationalError: no such table: users
```

### Solution:

The database is created automatically when the backend starts.

**For SQLite (local dev):**
- Just start the backend - tables auto-created
- Database file: `backend/remoteworks.db`

**For PostgreSQL/Supabase (production):**
- Run the schema first (see database/README.md)
- Then start the backend

---

## Fix 4: CORS Errors

### Symptoms:
Browser console shows:
```
Access to fetch at 'http://localhost:8000/api/v1/auth/register'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

### Solution:

1. Check `backend/.env` exists and has:
```bash
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

2. If `.env` doesn't exist:
```bash
cd backend
cp .env.example .env
```

3. Restart the backend

---

## Fix 5: Password Validation Error

### Symptoms:
```
Password must be at least 8 characters
```

### Solution:

Make sure your password is:
- ✅ At least 8 characters long
- ✅ Can contain any characters

Example valid passwords:
- `testpass123`
- `password123`
- `12345678`

---

## Fix 6: Email Already Registered

### Symptoms:
```
400 Bad Request: Email already registered
```

### Solution:

**Option 1:** Use a different email

**Option 2:** Delete the existing user

For SQLite:
```bash
cd backend
sqlite3 remoteworks.db
DELETE FROM users WHERE email = 'your@email.com';
.exit
```

**Option 3:** Clear the database and start fresh

For SQLite:
```bash
cd backend
rm remoteworks.db
# Restart backend - fresh database will be created
```

---

## Fix 7: Frontend Not Connecting to Backend

### Symptoms:
- Registration seems to work but nothing happens
- Network tab shows request to wrong URL

### Solution:

1. Check `frontend/.env.local` exists and has:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

2. If it doesn't exist:
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

3. Restart frontend:
```bash
npm run dev
```

---

## Testing the Full Flow

### Manual Test:

1. **Start both servers**
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

2. **Test backend directly**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy","database":"connected"}`

3. **Register via API**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123","role":"freelancer"}'
   ```
   Should return user data with status 201

4. **Login via API**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123"}'
   ```
   Should return access_token and refresh_token

5. **Test via frontend**
   - Go to http://localhost:3000/register
   - Fill in the form
   - Click "Create Account"
   - Should redirect to dashboard

### Automated Test:

```bash
cd /home/user/rework
python3 test_auth.py
```

This will test:
- ✅ Health check
- ✅ Registration
- ✅ Login
- ✅ Get current user
- ✅ Get dashboard stats

---

## Common Deployment Issues

### Render/Supabase Deployment:

**Problem:** Registration works locally but not in production

**Checklist:**

1. ✅ Database schema created in Supabase
   ```sql
   -- Run in Supabase SQL Editor
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   -- Should show 8 tables
   ```

2. ✅ DATABASE_URL set in Render
   ```
   postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres
   ```

3. ✅ SECRET_KEY set in Render
   ```
   Generate: openssl rand -hex 32
   ```

4. ✅ CORS origins include frontend URL
   ```
   BACKEND_CORS_ORIGINS=https://your-frontend.onrender.com
   ```

5. ✅ Frontend API URL points to backend
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```

---

## Debug Checklist

Run through this checklist:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] http://localhost:8000/health shows healthy
- [ ] http://localhost:8000/docs loads API documentation
- [ ] backend/.env file exists
- [ ] frontend/.env.local file exists
- [ ] Backend console shows no errors
- [ ] Frontend console (F12) shows no errors
- [ ] Password is at least 8 characters
- [ ] Using a unique email address
- [ ] Database file exists (backend/remoteworks.db for SQLite)

---

## Still Having Issues?

### Get detailed error information:

1. **Check backend logs**
   - Look at the terminal where backend is running
   - Copy any error messages

2. **Check browser console**
   - Open Dev Tools (F12)
   - Go to Console tab
   - Copy any red error messages

3. **Check network requests**
   - Open Dev Tools (F12)
   - Go to Network tab
   - Click on the failed request
   - Check Response tab for error details

4. **Test API directly**
   ```bash
   curl -v -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123","role":"freelancer"}'
   ```
   This shows the full request/response

5. **Check database**
   ```bash
   cd backend
   sqlite3 remoteworks.db
   .tables  # Should show 8 tables
   SELECT * FROM users;  # Check registered users
   .exit
   ```

---

## Quick Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| Backend not running | Run `./start.sh` or `start.bat` |
| Missing dependencies | `cd backend && pip install -r requirements.txt` |
| Missing .env | `cd backend && cp .env.example .env` |
| CORS errors | Check `BACKEND_CORS_ORIGINS` in backend/.env |
| Wrong API URL | Check `NEXT_PUBLIC_API_URL` in frontend/.env.local |
| Database errors | Delete `backend/remoteworks.db` and restart |
| Email already exists | Use different email or clear database |
| Password too short | Use at least 8 characters |

---

## Success Indicators

When everything works correctly:

✅ Backend starts with:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

✅ Frontend starts with:
```
- ready started server on 0.0.0.0:3000
```

✅ Health check returns:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

✅ Registration succeeds and redirects to dashboard

✅ Login works and shows user data

✅ Dashboard displays stats (even if all zeros)

---

## Need More Help?

1. Run the test script: `python3 test_auth.py`
2. Check the full logs from backend and frontend
3. Verify all environment variables are set
4. Try the manual curl commands above
5. Check if the issue is frontend or backend specific

---

**Most Common Issue:** Backend not running!

**Quick Test:** Open http://localhost:8000/health

If it doesn't load → Start the backend!
If it loads → Problem is elsewhere (check error messages)
