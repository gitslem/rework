@echo off
echo Starting Remote Works Platform...
echo.

REM Check if we're in the right directory
if not exist "backend\" (
    echo Error: Please run this script from the project root directory
    exit /b 1
)
if not exist "frontend\" (
    echo Error: Please run this script from the project root directory
    exit /b 1
)

REM Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python 3.9+
    exit /b 1
)

REM Check for Node
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 18+
    exit /b 1
)

echo Python and Node.js are installed
echo.

REM Setup Backend
echo Setting up Backend...
cd backend

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file with SQLite database...
    (
        echo # Database - Using SQLite for easy local development
        echo DATABASE_URL=sqlite:///./remoteworks.db
        echo.
        echo # Security - Development key ^(change in production!^)
        echo SECRET_KEY=dev-secret-key-change-in-production-use-openssl-rand-hex-32
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo REFRESH_TOKEN_EXPIRE_DAYS=7
        echo.
        echo # CORS
        echo BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
        echo FRONTEND_URL=http://localhost:3000
        echo.
        echo # Environment
        echo ENVIRONMENT=development
        echo.
        echo # Optional services ^(leave empty for local dev^)
        echo SENDGRID_API_KEY=
        echo STRIPE_SECRET_KEY=
        echo AWS_ACCESS_KEY_ID=
        echo OPENAI_API_KEY=
        echo REDIS_URL=redis://localhost:6379/0
    ) > .env
    echo Created backend/.env
)

REM Create virtual environment if it doesn't exist
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo Virtual environment created
)

REM Activate virtual environment and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -q -r requirements.txt
echo Backend dependencies installed

cd ..

REM Setup Frontend
echo.
echo Setting up Frontend...
cd frontend

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local file...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
        echo NODE_ENV=development
    ) > .env.local
    echo Created frontend/.env.local
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo Installing Node.js dependencies ^(this may take a few minutes^)...
    call npm install
    echo Frontend dependencies installed
)

cd ..

REM Start the applications
echo.
echo Setup complete! Starting applications...
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo API Docs available at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend
cd backend
call venv\Scripts\activate.bat
start "Remote Works Backend" cmd /k "python main.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
cd ..\frontend
start "Remote Works Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows!
echo Close the command windows to stop the servers.
pause
