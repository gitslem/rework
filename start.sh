#!/bin/bash

echo "🚀 Starting Remote Works Platform..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "📋 Checking dependencies..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Python and Node.js are installed"
echo ""

# Setup Backend
echo "🔧 Setting up Backend..."
cd backend

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file with SQLite database..."
    cat > .env << EOL
# Database - Using SQLite for easy local development
DATABASE_URL=sqlite:///./remoteworks.db

# Security - Development key (change in production!)
SECRET_KEY=dev-secret-key-change-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development

# Optional services (leave empty for local dev)
SENDGRID_API_KEY=
STRIPE_SECRET_KEY=
AWS_ACCESS_KEY_ID=
OPENAI_API_KEY=
REDIS_URL=redis://localhost:6379/0
EOL
    echo "✅ Created backend/.env"
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
if ! pip install --upgrade pip setuptools wheel; then
    echo "❌ Failed to upgrade pip, setuptools, and wheel"
    exit 1
fi

if ! pip install -r requirements.txt; then
    echo ""
    echo "❌ Failed to install Python dependencies"
    echo "💡 This might be due to:"
    echo "   - Python version compatibility (Python 3.9-3.13 recommended)"
    echo "   - Missing system dependencies for packages like pillow or psycopg2"
    echo "   - Network issues"
    echo ""
    echo "Try running manually:"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  pip install --upgrade pip setuptools wheel"
    echo "  pip install -r requirements.txt"
    exit 1
fi
echo "✅ Backend dependencies installed"

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NODE_ENV=development
EOL
    echo "✅ Created frontend/.env.local"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies (this may take a few minutes)..."
    if ! npm install; then
        echo ""
        echo "❌ Failed to install Node.js dependencies"
        echo "💡 Try running manually:"
        echo "  cd frontend"
        echo "  npm install"
        exit 1
    fi
    echo "✅ Frontend dependencies installed"
fi

cd ..

# Start the applications
echo ""
echo "🎉 Setup complete! Starting applications..."
echo ""
echo "📡 Backend will run on: http://localhost:8000"
echo "🎨 Frontend will run on: http://localhost:3000"
echo "📚 API Docs available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
echo "Starting backend server..."
python main.py &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Start frontend in background
cd ../frontend
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait for user to stop
wait

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
