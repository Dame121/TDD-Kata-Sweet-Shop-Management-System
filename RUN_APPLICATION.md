# 🚀 Running the Application

This document explains the different ways to start your Sweet Shop Management System backend and frontend servers.

## Quick Start Options

### Option 1: **Two Terminal Windows** (Recommended) ⭐

**Best for:** Viewing backend and frontend logs separately, debugging, development

#### Windows Batch (.bat)
```bash
# Simply double-click:
start.bat

# Or from PowerShell/Command Prompt:
.\start.bat
```

#### Windows PowerShell
```powershell
# Run:
.\start.ps1

# If you get execution policy error:
powershell -ExecutionPolicy Bypass -File start.ps1
```

**What happens:**
- ✅ Backend opens in Terminal 1 (http://localhost:8000)
- ✅ Frontend opens in Terminal 2 (http://localhost:3000)
- ✅ Logs are visible separately for each server
- ✅ Easy to stop individual servers by closing the window

---

### Option 2: **Single Terminal Window** (Background Jobs)

**Best for:** Minimalist setup, running without multiple windows

```powershell
# Run:
.\start-single-window.ps1

# If you get execution policy error:
powershell -ExecutionPolicy Bypass -File start-single-window.ps1
```

**What happens:**
- ✅ Both servers run in background jobs
- ✅ Shows job IDs for reference
- ✅ Outputs combined logs in one window
- ✅ Type `exit` to stop everything

---

### Option 3: **Manual - Two Terminal Windows** (Most Control)

**Best for:** Experienced developers who want full control

#### Terminal 1 - Backend:
```bash
cd backend
python main.py
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

---

### Option 4: **Manual - Single Terminal (Sequential)** 

**Best for:** Testing, simple verification

```bash
# Start backend first
cd backend
python main.py

# In a new terminal, start frontend
cd frontend
npm start
```

---

## 🔗 Access Points

Once both servers are running, access your application at:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | React app - User interface |
| **Backend API** | http://localhost:8000 | FastAPI REST API |
| **API Documentation** | http://localhost:8000/api/docs | Swagger UI (interactive) |
| **API ReDoc** | http://localhost:8000/api/redoc | ReDoc (alternative docs) |
| **API Health Check** | http://localhost:8000/health | Backend status |

---

## 📋 Prerequisites

Before running, ensure you have:

### Backend Requirements
- ✅ Python 3.12+
- ✅ Dependencies installed: `pip install -r backend/requirements.txt`
- ✅ `.env` file configured (copy from `.env.example`)

### Frontend Requirements  
- ✅ Node.js & npm installed
- ✅ Dependencies installed: `cd frontend && npm install`

---

## ⚙️ Configuration

### Backend Configuration
Edit `.env` file in root directory:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./test.db
IMAGEKIT_PRIVATE_KEY=your-key
IMAGEKIT_PUBLIC_KEY=your-key
IMAGEKIT_URL_ENDPOINT=your-endpoint
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Frontend Configuration
Edit `.env` in frontend folder (optional):
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 🛑 Stopping the Servers

### For Script-Based Startup

#### `.bat` or multiple windows:
- Close each terminal window (Ctrl+C then close, or just close window)

#### `.ps1` Single window:
- Type `exit` and press Enter
- Or press Ctrl+C to stop the script
- Jobs will continue in background - to clean up:
  ```powershell
  Stop-Job -Name * 
  Remove-Job -Name *
  ```

### For Manual Startup
- Press `Ctrl+C` in each terminal window

---

## 🐛 Troubleshooting

### "Backend folder not found"
- Ensure you're running the script from the **root project directory**
- Check that `backend/` and `frontend/` folders exist

### Backend won't start - "Port 8000 already in use"
- Another process is using port 8000
- **Solution:** Kill the process or use different port
  ```bash
  # PowerShell - Find and kill process on port 8000
  Get-NetTCPConnection -LocalPort 8000 | Stop-Process

  # Or use a different port
  cd backend
  python -m uvicorn src.app.main:app --port 8001
  ```

### Frontend won't start - "Port 3000 already in use"
- Another process is using port 3000
- **Solution:** Kill the process or use different port
  ```bash
  # PowerShell - Find and kill process on port 3000
  Get-NetTCPConnection -LocalPort 3000 | Stop-Process

  # Or force port selection
  cd frontend
  PORT=3001 npm start
  ```

### "Module not found" error in backend
- Backend dependencies not installed
- **Solution:** 
  ```bash
  cd backend
  pip install -r requirements.txt
  ```

### "Module not found" error in frontend
- Frontend dependencies not installed
- **Solution:**
  ```bash
  cd frontend
  npm install
  ```

### PowerShell execution policy error
- Run this first:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
  ```
- Then try the script again

---

## 📊 Monitoring

### Check Backend Status
```bash
curl http://localhost:8000/health
```

### View API Documentation
- Open http://localhost:8000/api/docs in browser
- Interact with API endpoints directly

### Monitor Backend Logs
- Watch the terminal where backend is running
- Look for errors or requests being logged

### Monitor Frontend Logs  
- Watch the terminal where frontend is running
- Check browser console (F12) for JavaScript errors

---

## 🔄 Development Workflow

### For Backend Changes
1. Backend has hot-reload enabled by default
2. Make changes to Python files
3. Server automatically reloads
4. Refresh frontend to see changes

### For Frontend Changes
1. Frontend has hot-reload enabled
2. Make changes to React files
3. Browser automatically refreshes
4. See changes immediately

---

## 🎯 Common Tasks

### Reset Database
```bash
cd backend
rm test.db  # or: Remove-Item test.db (PowerShell)
python main.py  # Recreate with fresh schema
```

### Run Tests
```bash
cd backend
pytest test/ -v
```

### Install New Dependencies

**Backend:**
```bash
cd backend
pip install package-name
pip freeze > requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install package-name
```

---

## 📚 More Information

- **Backend Setup**: See `backend/STRUCTURE.md`
- **Frontend Setup**: See `frontend/FOLDER_STRUCTURE.md`
- **API Documentation**: `backend/docs/AUTHENTICATION.md`
- **Full Architecture**: Root `ARCHITECTURE_GUIDE.md`

---

## 💡 Tips

✅ **Recommended approach for development:**
- Use `start.bat` or `start.ps1` (two windows)
- Gives you clear visibility of both servers
- Easy to restart individual components
- Better logs separation for debugging

✅ **Best practices:**
- Keep both terminals visible during development
- Monitor backend logs for API errors
- Check browser console for frontend errors
- Use API docs (http://localhost:8000/api/docs) to test endpoints

---

## 🆘 Need Help?

If servers don't start:
1. Check `backend/` and `frontend/` folders exist
2. Verify Python and Node.js are installed
3. Verify all dependencies are installed
4. Check `.env` file is configured
5. Check ports 3000 and 8000 are not in use
6. See Troubleshooting section above

---

**Enjoy building with Sweet Shop Management System!** 🍬🎉
