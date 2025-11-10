# 🚀 Quick Start Guide - Remote Works Platform

Get up and running in **5 minutes** with SQLite database!

---

## Prerequisites

- **Python 3.9+** - [Download here](https://www.python.org/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

Check if you have them installed:
```bash
python3 --version  # or python --version on Windows
node --version
git --version
```

---

## Option 1: Automatic Setup (Recommended) ⚡

### For Linux/Mac:

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/gitslem/rework.git
cd rework

# 2. Run the start script
./start.sh
```

### For Windows:

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/gitslem/rework.git
cd rework

# 2. Run the start script
start.bat
```

**That's it!** The script will:
- ✅ Create SQLite database automatically
- ✅ Set up Python virtual environment
- ✅ Install all dependencies
- ✅ Create .env files with defaults
- ✅ Start both backend and frontend servers

**Access the application:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

---

## Option 2: Manual Setup 🛠️

If you prefer to set things up manually:

### Step 1: Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (SQLite will be used by default)
cp .env.example .env

# Start backend server
python main.py
```

Backend will run on http://localhost:8000

### Step 2: Setup Frontend (in a new terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start frontend server
npm run dev
```

Frontend will run on http://localhost:3000

---

## 🎯 Using the Application

### 1. Register a New Account

1. Go to http://localhost:3000
2. Click **"Get Started"** or **"Sign Up"**
3. Choose your role:
   - **Freelancer**: Work on projects and earn
   - **Agent**: Work on behalf of others
   - **Business**: Post projects and hire talent
4. Enter your email and password
5. Click **"Create Account"**

### 2. Login

1. Go to http://localhost:3000/login
2. Enter your email and password
3. Click **"Login"**
4. You'll be redirected to your **Dashboard**!

### 3. Explore the Dashboard

Your dashboard shows:
- 💰 Total Earnings
- 📊 Active Projects
- ✅ Completed Projects
- 📝 Pending Applications
- ⭐ Your Rating
- 💬 Reviews

---

## 📚 API Documentation

Visit http://localhost:8000/docs for interactive API documentation powered by Swagger UI.

### Key Endpoints:

**Authentication:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

**Users:**
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/me/profile` - Get user profile
- `PATCH /api/v1/users/me/profile` - Update profile
- `GET /api/v1/users/me/stats` - Get dashboard statistics

**Projects:**
- `GET /api/v1/projects/` - List all projects
- `POST /api/v1/projects/` - Create project (business only)
- `GET /api/v1/projects/{id}` - Get project details
- `PATCH /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

**Applications:**
- `POST /api/v1/applications/` - Apply to project
- `GET /api/v1/applications/` - Get my applications
- `GET /api/v1/applications/project/{id}` - Get project applications
- `PATCH /api/v1/applications/{id}` - Update application status

---

## 🗄️ Database

The application uses **SQLite** by default for easy local development. The database file (`remoteworks.db`) is automatically created in the `backend/` directory when you first run the application.

### Database Tables:

The following tables are created automatically:
- `users` - User accounts
- `profiles` - User profiles and statistics
- `projects` - Posted projects
- `applications` - Job applications
- `agent_assignments` - Agent-freelancer relationships
- `reviews` - Ratings and reviews
- `payments` - Transaction records
- `notifications` - User notifications

### View Database:

**Option 1: SQLite Browser**
- Download [DB Browser for SQLite](https://sqlitebrowser.org/)
- Open `backend/remoteworks.db`

**Option 2: Command Line**
```bash
cd backend
sqlite3 remoteworks.db
# SQLite commands:
.tables          # List all tables
.schema users    # View users table schema
SELECT * FROM users;  # Query users
.exit            # Exit SQLite
```

### Switch to PostgreSQL:

If you want to use PostgreSQL instead:

1. Install PostgreSQL
2. Create a database:
   ```bash
   createdb remoteworks
   ```
3. Update `backend/.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/remoteworks
   ```
4. Restart the backend

---

## 🔧 Troubleshooting

### Port Already in Use

**Backend (port 8000):**
```bash
# Find and kill the process
# Linux/Mac:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (port 3000):**
```bash
# Find and kill the process
# Linux/Mac:
lsof -ti:3000 | xargs kill -9
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Errors

If you see database errors:
1. Delete the database file: `rm backend/remoteworks.db`
2. Restart the backend - database will be recreated automatically

### Module Not Found Errors

**Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

If you see CORS errors in the browser console:
1. Make sure backend is running on port 8000
2. Check `backend/.env` has:
   ```
   BACKEND_CORS_ORIGINS=["http://localhost:3000"]
   ```
3. Restart the backend

---

## 🧪 Testing the Application

### Create Test Users

You can create multiple test accounts:

```bash
# Freelancer
Email: freelancer@test.com
Password: testpass123

# Agent
Email: agent@test.com
Password: testpass123

# Business
Email: business@test.com
Password: testpass123
```

### Test the API with cURL

```bash
# Health check
curl http://localhost:8000/health

# Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","role":"freelancer"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

## 📖 What's Next?

### For Development:

1. **Explore the Code:**
   - Backend: `backend/app/`
   - Frontend: `frontend/src/`

2. **Read the Documentation:**
   - [Full Documentation](./README.md)
   - [Deployment Guide](./DEPLOY_TO_RENDER_SUPABASE.md)
   - [Supabase Setup](./SUPABASE_SETUP.md)

3. **Add Features:**
   - Check `README.md` for list of planned features
   - Create a new branch for your feature
   - Submit a pull request

### For Production Deployment:

When you're ready to deploy:

1. **Read the deployment guide:** [DEPLOY_TO_RENDER_SUPABASE.md](./DEPLOY_TO_RENDER_SUPABASE.md)
2. **Set up Supabase database** (free tier available)
3. **Deploy to Render** (free tier available)
4. **Update environment variables** for production

---

## 💡 Tips

### Hot Reload

Both backend and frontend have hot reload enabled:
- **Backend**: Changes to Python files automatically restart the server
- **Frontend**: Changes to React/TypeScript files automatically refresh the browser

### VS Code Extensions (Recommended)

- **Python** by Microsoft
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **SQLite Viewer**
- **REST Client** (for testing API)

### Environment Variables

The `.env` file in `backend/` contains all configuration. Key settings:

```bash
DATABASE_URL=sqlite:///./remoteworks.db  # Database
SECRET_KEY=your-secret-key               # JWT secret
BACKEND_CORS_ORIGINS=["http://localhost:3000"]  # CORS
```

---

## 🛑 Stopping the Application

### If using start script:
- Press `Ctrl+C` in the terminal

### If running manually:
- Press `Ctrl+C` in each terminal window

### Kill all processes:
```bash
# Linux/Mac
pkill -f "python main.py"
pkill -f "next dev"

# Windows
taskkill /F /IM python.exe
taskkill /F /IM node.exe
```

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Start everything | `./start.sh` (Linux/Mac) or `start.bat` (Windows) |
| Start backend only | `cd backend && source venv/bin/activate && python main.py` |
| Start frontend only | `cd frontend && npm run dev` |
| View API docs | http://localhost:8000/docs |
| Access application | http://localhost:3000 |
| Check health | http://localhost:8000/health |
| View database | `cd backend && sqlite3 remoteworks.db` |

---

## 🆘 Need Help?

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review the [Full Documentation](./README.md)
3. Check the API documentation at http://localhost:8000/docs
4. Look at the backend logs in the terminal
5. Check the browser console for frontend errors
6. Open an issue on GitHub

---

## 🎉 You're Ready!

Your Remote Works platform is now running locally. You can:

✅ Register users and login
✅ Access the dashboard
✅ Test all API endpoints
✅ Start building features
✅ Deploy to production when ready

**Happy coding!** 🚀
