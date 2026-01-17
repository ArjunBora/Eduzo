from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import redis
import json
import os
from datetime import datetime

app = FastAPI(title="Analytics Service", version="1.0.0")


# In-memory fallback if Redis is not available
class MockRedis:
    def __init__(self):
        self.data = {}
        self.lists = {}
        print("Redis unavailable. Using in-memory fallback.")

    def get(self, key):
        return self.data.get(key)

    def incr(self, key):
        self.data[key] = self.data.get(key, 0) + 1
        return self.data[key]

    def lpush(self, key, value):
        if key not in self.lists:
            self.lists[key] = []
        self.lists[key].insert(0, value)
        return len(self.lists[key])

    def ltrim(self, key, start, end):
        if key in self.lists:
            self.lists[key] = self.lists[key][start:end+1]
        return True

try:
    redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/2"), decode_responses=True)
    redis_client.ping() # Check connection
    print("Connected to Redis.")
except redis.ConnectionError:
    redis_client = MockRedis()

class Event(BaseModel):
    event_type: str
    user_id: str
    metadata: dict = {}
    timestamp: datetime = datetime.utcnow()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "analytics", "backend": "redis" if not isinstance(redis_client, MockRedis) else "memory"}

@app.post("/api/analytics/event")
async def log_event(event: Event, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_event, event)
    return {"status": "queued"}

def process_event(event: Event):
    # Increment global counter
    redis_client.incr(f"stats:total_events")
    # Increment event specific counter
    redis_client.incr(f"stats:event:{event.event_type}")
    # Store event log (list with cap)
    redis_client.lpush("logs:events", json.dumps(event.dict(), default=str))
    redis_client.ltrim("logs:events", 0, 999) # Keep last 1000 events

@app.get("/api/analytics/dashboard")
async def get_dashboard_stats():
    total_events = redis_client.get("stats:total_events") or 0
    questions_asked = redis_client.get("stats:event:question_asked") or 0
    logins = redis_client.get("stats:event:login") or 0
    
    return {
        "total_interactions": int(total_events),
        "questions_asked": int(questions_asked),
        "active_users_today": int(logins), # Simplification
        "system_health": "Optimal"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
