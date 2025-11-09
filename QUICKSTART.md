# 🚀 Quick Start Guide - Remote Works Platform

## Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git installed

## Step-by-Step Setup (5 minutes)

### 1. Clone/Download the Project
```bash
# If downloading from GitHub
git clone https://github.com/yourusername/remote-works-platform.git
cd remote-works-platform

# Or if you have the downloaded folder, just navigate to it
cd remote-works-platform
```

### 2. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env file with your settings
# Minimum required:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/remoteworks
# SECRET_KEY=your-super-secret-key-change-this-in-production

# Create database
createdb remoteworks
# Or use pgAdmin/psql to create database

# Run the server
python main.py
```

✅ Backend should now be running at http://localhost:8000
📚 API docs at http://localhost:8000/docs

### 3. Frontend Setup (2 minutes)

Open a NEW terminal window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Run the development server
npm run dev
```

✅ Frontend should now be running at http://localhost:3000

### 4. Test the Application (1 minute)

1. Open http://localhost:3000 in your browser
2. Click "Get Started" or "Sign Up"
3. Choose a role (Freelancer, Agent, or Business)
4. Create an account
5. Login and explore the dashboard!

## Common Issues & Solutions

### Issue: "Connection refused" when accessing backend
**Solution**: Make sure PostgreSQL is running and the DATABASE_URL in .env is correct

### Issue: Database connection error
**Solution**: 
```bash
# Check if PostgreSQL is running
psql --version

# Create database if it doesn't exist
createdb remoteworks

# Update DATABASE_URL in backend/.env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/remoteworks
```

### Issue: Python module not found
**Solution**: Make sure virtual environment is activated and dependencies are installed
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Issue: npm install fails
**Solution**: 
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules
npm install
```

## Next Steps

### For Development:
1. Explore the API at http://localhost:8000/docs
2. Check out the code structure in README.md
3. Start building features!

### For Production Deployment:
1. Set up a production database (Railway, Supabase, AWS RDS)
2. Deploy backend to Railway or Render
3. Deploy frontend to Vercel
4. Update CORS settings and environment variables

## Key Features to Implement

✅ Already Done:
- User authentication (register, login, JWT)
- User profiles
- Projects CRUD
- Applications system
- Dashboard with stats
- Responsive UI

🚧 To Implement:
- Email verification
- Password reset
- Real Stripe integration
- File uploads (S3)
- Real-time notifications
- Search and filters
- Messaging system

## Useful Commands

### Backend
```bash
# Run server
python main.py

# Create new migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Run tests
pytest
```

### Frontend
```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Getting Help

- Check README.md for detailed documentation
- Review API docs at http://localhost:8000/docs
- Check the code comments
- Open an issue on GitHub

## Project Structure

```
remote-works-platform/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Config and security
│   │   ├── db/       # Database setup
│   │   ├── models/   # SQLAlchemy models
│   │   └── schemas/  # Pydantic schemas
│   └── main.py       # Entry point
│
└── frontend/         # Next.js frontend
    └── src/
        ├── pages/    # Next.js pages
        ├── lib/      # API client & state
        └── styles/   # Global CSS
```

Happy coding! 🎉
