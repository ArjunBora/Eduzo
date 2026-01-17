@echo off
echo Starting AI Service...
cd ai-service

echo Installing dependencies...
pip install -r requirements.txt

echo running Server...
:: Set MOCK_AI=true to skip model download for testing
set MOCK_AI=false
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

pause
