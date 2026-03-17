1# ============================================================
# Sweet Shop Management System - Start Both Backend & Frontend
# ============================================================
# PowerShell script to start both backend and frontend servers
# 
# Usage: .\start.ps1
# ============================================================

# Clear screen
Clear-Host

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Sweet Shop Management System - Full Stack Startup            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Save current directory
$rootDir = Get-Location

# Check if backend folder exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if frontend folder exists
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: frontend folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🚀 Starting Backend Server (Python/FastAPI)..." -ForegroundColor Cyan
Write-Host "   Location: backend/" -ForegroundColor Gray
Write-Host "   Virtual Environment: backend\.venv" -ForegroundColor Gray
Write-Host "   Command: python main.py" -ForegroundColor Gray
Write-Host ""

# Start backend in a new terminal window
$backendPath = Join-Path $rootDir "backend"
$envPath = Join-Path $backendPath "env\Scripts\Activate.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; & '$envPath'; python main.py" -WindowStyle Normal

Write-Host "✓ Backend terminal opened" -ForegroundColor Green
Write-Host ""
Write-Host "Waiting 3 seconds before starting frontend..." -ForegroundColor Yellow
Write-Host ""

# Wait for backend to initialize
Start-Sleep -Seconds 3

Write-Host "🚀 Starting Frontend Server (React)..." -ForegroundColor Cyan
Write-Host "   Location: frontend/" -ForegroundColor Gray
Write-Host "   Command: npm start" -ForegroundColor Gray
Write-Host ""

# Start frontend in a new terminal window
$frontendPath = Join-Path $rootDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm start" -WindowStyle Normal

Write-Host "✓ Frontend terminal opened" -ForegroundColor Green
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                   ✅ Both servers started!                      ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Backend:  http://localhost:8000                               ║" -ForegroundColor White
Write-Host "║  Frontend: http://localhost:3000                               ║" -ForegroundColor White
Write-Host "║  API Docs: http://localhost:8000/api/docs                      ║" -ForegroundColor White
Write-Host "║                                                                 ║" -ForegroundColor White
Write-Host "║  Both servers are running in separate windows above.           ║" -ForegroundColor White
Write-Host "║  Close each window or press Ctrl+C to stop the server.         ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Script completed. Main window can now be closed." -ForegroundColor Yellow
Write-Host ""
