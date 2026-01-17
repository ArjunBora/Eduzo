@echo off
echo Starting Analytics Service...
cd analytics-service

echo Installing dependencies...
pip install -r requirements.txt

echo running Server...
uvicorn main:app --host 0.0.0.0 --port 8002 --reload

pause
