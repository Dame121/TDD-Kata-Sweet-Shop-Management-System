# ============================================================
# Sweet Shop Management System - Single Window Startup
# ============================================================
# PowerShell script that runs both backend and frontend
# in the same terminal window (run them in parallel)
#
# Usage:
#   .\start-single-window.ps1
#
# Or if you get execution policy error:
#   powershell -ExecutionPolicy Bypass -File start-single-window.ps1
#
# Requirements:
#   - Python 3.12+ (for backend)
#   - Node.js & npm (for frontend)
#   - Both dependencies installed
# ============================================================

Clear-Host

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Sweet Shop Management System - Full Stack Startup            ║" -ForegroundColor Green
Write-Host "║                   (Single Terminal Window)                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check if backend folder exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend folder not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if frontend folder exists
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: frontend folder not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🚀 Starting servers in background processes..." -ForegroundColor Cyan
Write-Host ""

# Start backend as a background job
Write-Host "  ▶ Backend:  cd backend && env\Scripts\Activate.ps1 && python main.py" -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "backend"
    & .\env\Scripts\Activate.ps1
    python main.py
}

# Wait a moment
Start-Sleep -Seconds 2

# Start frontend as a background job
Write-Host "  ▶ Frontend: cd frontend && npm start" -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "frontend"
    npm start
}

Write-Host ""
Write-Host "✓ Both servers started in background" -ForegroundColor Green
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                   ✅ Both servers started!                      ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Backend:  http://localhost:8000                               ║" -ForegroundColor White
Write-Host "║  Frontend: http://localhost:3000                               ║" -ForegroundColor White
Write-Host "║  API Docs: http://localhost:8000/api/docs                      ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Running Jobs:" -ForegroundColor Cyan
Write-Host "  - Backend  (Job ID: $($backendJob.Id))" -ForegroundColor White
Write-Host "  - Frontend (Job ID: $($frontendJob.Id))" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  To stop servers, type: Stop-Job -ID <job-id>" -ForegroundColor Yellow
Write-Host "   Or press Ctrl+C to exit this script (jobs will continue running)" -ForegroundColor Yellow
Write-Host ""

# Wait for jobs to complete (they won't, so this keeps script running)
Write-Host "Type 'exit' to close this window and stop all jobs:" -ForegroundColor Yellow
Get-Job | Wait-Job

Write-Host ""
Write-Host "Cleaning up jobs..." -ForegroundColor Yellow
Get-Job | Stop-Job
Get-Job | Remove-Job
Write-Host "Done." -ForegroundColor Green
