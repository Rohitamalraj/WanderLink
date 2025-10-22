@echo off
echo ============================================================
echo 🚀 Starting WanderLink Agent System
echo ============================================================
echo.

cd /d %~dp0

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then: venv\Scripts\activate.bat
    echo Then: pip install -r requirements.txt
    pause
    exit /b 1
)

echo Starting agents in separate windows...
echo.

REM Start MatchMaker Agent
echo 1️⃣  Starting MatchMaker Agent (Port 8001)...
start "MatchMaker Agent" cmd /k "venv\Scripts\activate.bat && echo 🤝 MatchMaker Agent && python src\matchmaker_agent.py"
timeout /t 2 /nobreak > nul

REM Start Planner Agent
echo 2️⃣  Starting Planner Agent (Port 8002)...
start "Planner Agent" cmd /k "venv\Scripts\activate.bat && echo 🗺️  Planner Agent && python src\planner_agent.py"
timeout /t 2 /nobreak > nul

REM Start User Agent
echo 3️⃣  Starting User Agent (Port 8003)...
start "User Agent" cmd /k "venv\Scripts\activate.bat && echo 👤 User Agent && python src\user_agent.py"
timeout /t 2 /nobreak > nul

REM Start Agent Service
echo 4️⃣  Starting Agent Service (Port 8000)...
start "Agent Service" cmd /k "venv\Scripts\activate.bat && echo 🌐 Agent Service API && python src\agent_service.py"

echo.
echo ============================================================
echo ✅ All agents started successfully!
echo ============================================================
echo.
echo 📡 Services running:
echo    MatchMaker Agent:  http://localhost:8001
echo    Planner Agent:     http://localhost:8002
echo    User Agent:        http://localhost:8003
echo    Agent Service API: http://localhost:8000
echo    API Docs:          http://localhost:8000/docs
echo.
echo 💡 Frontend should connect to: http://localhost:8000
echo.
echo Press any key to exit...
pause > nul
