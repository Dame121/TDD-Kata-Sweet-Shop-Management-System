@echo off
REM ============================================================
REM Sweet Shop Management System - Start Both Backend & Frontend
REM ============================================================
REM This batch script starts both the backend and frontend servers
REM in separate terminal windows.
REM ============================================================

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   Sweet Shop Management System - Full Stack Startup            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if backend folder exists
if not exist "backend" (
    echo ❌ Error: backend folder not found!
    echo Please run this script from the root directory.
    pause
    exit /b 1
)

REM Check if frontend folder exists
if not exist "frontend" (
    echo ❌ Error: frontend folder not found!
    echo Please run this script from the root directory.
    pause
    exit /b 1
)

echo 🚀 Starting Backend Server (Python/FastAPI)...
echo    Location: backend/
echo    Virtual Environment: backend\env
echo    Command: python main.py
echo.

REM Start backend in a new terminal window
start "Sweet Shop Backend - Backend" cmd /c "cd backend && env\Scripts\activate.bat && python main.py && pause"

echo ✓ Backend terminal opened
echo.
echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak
echo.

echo 🚀 Starting Frontend Server (React)...
echo    Location: frontend/
echo    Command: npm start
echo.

REM Start frontend in a new terminal window
start "Sweet Shop - Frontend" cmd /c "cd frontend && npm start"

echo ✓ Frontend terminal opened
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   ✅ Both servers started!                      ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║  Backend:  http://localhost:8000                               ║
echo ║  Frontend: http://localhost:3000                               ║
echo ║  API Docs: http://localhost:8000/api/docs                      ║
echo ║                                                                 ║
echo ║  Both servers are running in separate windows above.           ║
echo ║  Close each window to stop the respective server.              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
pause
