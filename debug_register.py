import urllib.request
import json
import urllib.error

url = "http://localhost:8000/api/auth/register"
payload = {
    "email": "test_student_debug@example.com",
    "password": "password123",
    "role": "student",
    "full_name": "Test Student Debug",
    "enrollment_no": "TEST_DBG_001"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    print(f"Sending request to {url}...")
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
