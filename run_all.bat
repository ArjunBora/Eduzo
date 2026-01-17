@echo off
echo Starting All Services...

echo Starting Backend (Port 8000)...
start cmd /k "cd backend && python -m uvicorn main:app --reload"

echo Starting Frontend (Port 5173)...
start cmd /k "cd frontend && npm run dev"

echo Starting AI Service (Port 8001)...
start cmd /k "call start_ai_service.bat"

echo Starting Analytics Service (Port 8002)...
start cmd /k "call start_analytics.bat"

echo.
echo All services are launching in separate windows.
echo Web App: http://localhost:5173
echo Backend API: http://localhost:8000/docs
echo AI Service: http://localhost:8001/docs
echo Analytics Service: http://localhost:8002/docs
echo.
pause
