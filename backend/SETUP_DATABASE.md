# Database Setup Guide

This guide will help you create all the database tables including the new **candidate_projects** tables.

## Quick Start (Recommended)

### Option 1: Using the Python Script (Easiest)

```bash
cd backend

# Pull the latest changes
git pull

# Run the table creation script
python create_tables.py
```

This will create all tables including:
- ✨ `candidate_projects` - Main project table
- ✨ `project_updates` - Weekly updates from agents
- ✨ `project_actions` - Action items for candidates/agents

Plus all existing tables (users, profiles, projects, etc.)

---

## Alternative Options

### Option 2: Using the FastAPI Endpoint

If you prefer to use the API:

```bash
# 1. Start the backend server
cd backend
uvicorn main:app --reload

# 2. In a new terminal, create the tables
curl -X POST http://localhost:8000/init-db
```

### Option 3: Using Alembic (For Production)

If you want to use migrations:

```bash
cd backend

# Install alembic if not installed
pip install alembic

# Run the migration
alembic upgrade head
```

---

## Configuration

### Database Options

#### SQLite (Default - Best for Development)
Already configured in `.env`:
```env
DATABASE_URL=sqlite:///./remoteworks.db
```

#### PostgreSQL (For Production)
Edit `.env` and change to:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/remoteworks
```

Make sure PostgreSQL is running and the database exists:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE remoteworks;"
```

---

## Verifying the Setup

### Check Tables Were Created

```bash
# Start the backend
cd backend
uvicorn main:app --reload

# In another terminal, check diagnostics
curl http://localhost:8000/diagnostics | python -m json.tool
```

You should see in the output:
```json
{
  "tables": {
    "list": [
      "candidate_projects",
      "project_updates",
      "project_actions",
      ...
    ]
  }
}
```

---

## Testing the Feature

### 1. Start Backend
```bash
cd backend
uvicorn main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm install  # if first time
npm run dev
```

### 3. Access the Projects Page
Navigate to: `http://localhost:3000/candidate-projects`

---

## Troubleshooting

### Error: "No module named 'psycopg2'"
You're using PostgreSQL but the driver isn't installed:
```bash
pip install psycopg2-binary
```

### Error: "Database connection failed"
1. Check your `.env` file has correct DATABASE_URL
2. For PostgreSQL: Make sure PostgreSQL is running
3. For SQLite: Make sure the backend directory is writable

### Tables already exist
That's fine! The script handles this gracefully.

### Want to reset everything?
```bash
# For SQLite
rm backend/remoteworks.db
python backend/create_tables.py

# For PostgreSQL
psql -U postgres -c "DROP DATABASE remoteworks; CREATE DATABASE remoteworks;"
python backend/create_tables.py
```

---

## Understanding the Architecture

**Important:** This feature uses your **SQL database** (PostgreSQL or SQLite), NOT Firebase.

- **SQL Database**: Stores candidate projects, updates, actions, users, etc.
- **Firebase**: Only used for real-time messaging and some profile data

The new tables are created in your SQL database automatically.

---

## Need Help?

If you encounter any issues:
1. Check the backend logs when running `uvicorn main:app --reload`
2. Verify your `.env` file is configured correctly
3. Make sure you have the required dependencies installed
