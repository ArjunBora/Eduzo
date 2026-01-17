import redis
import json
import hashlib
import os
from typing import Optional, Dict, Any

class CacheManager:
    def __init__(self, redis_url: str = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/1")
        try:
            self.client = redis.from_url(self.redis_url, decode_responses=True)
            self.enabled = True
        except Exception as e:
            print(f"Warning: Redis connection failed. Caching disabled. Error: {e}")
            self.enabled = False

    def _generate_hash(self, text: str) -> str:
        """Generate a consistent hash for a given text."""
        return hashlib.sha256(text.strip().lower().encode()).hexdigest()

    def get_response(self, question: str) -> Optional[Dict[str, Any]]:
        """Retrieve a cached response for the question."""
        if not self.enabled:
            return None
        
        key = self._generate_hash(question)
        data = self.client.get(key)
        
        if data:
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                return None
        return None

    def set_response(self, question: str, response: Dict[str, Any], ttl: int = 86400):
        """Cache the response for the question. Default TTL is 24 hours."""
        if not self.enabled:
            return

        key = self._generate_hash(question)
        self.client.setex(key, ttl, json.dumps(response))
