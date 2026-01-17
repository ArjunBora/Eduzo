from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import os
from contextlib import asynccontextmanager
from model import ModelManager
from cache import CacheManager

# Initialize Managers
model_manager = ModelManager()
cache_manager = CacheManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting AI Service...")
    try:
        model_manager.load_model()
    except Exception as e:
        print(f"Failed to load model: {e}")
    yield
    # Shutdown
    print("Shutting down AI Service...")

app = FastAPI(title="AI Service", version="1.0.0", lifespan=lifespan)

class QuestionRequest(BaseModel):
    question: str
    student_id: str

class AIResponse(BaseModel):
    reasoning: str
    answer: str
    confidence: float
    cached: bool

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service", "model_loaded": model_manager.model is not None}

@app.post("/api/ai/ask", response_model=AIResponse)
async def ask_question(request: QuestionRequest):
    # 1. Check Cache
    cached_response = cache_manager.get_response(request.question)
    if cached_response:
        return AIResponse(
            reasoning=cached_response.get("reasoning", ""),
            answer=cached_response.get("answer", ""),
            confidence=cached_response.get("confidence", 1.0),
            cached=True
        )

    # 2. Generate Reasoning
    if not model_manager.model:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    try:
        result = model_manager.generate_reasoning(request.question)
        
        response_data = {
            "reasoning": result.get("reasoning", ""),
            "answer": result.get("answer", ""),
            "confidence": 0.95, # Placeholder for actual confidence score
            "cached": False
        }
        
        # 3. Cache Result (Background task or immediate)
        cache_manager.set_response(request.question, response_data)
        
        return AIResponse(**response_data)
        
    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
