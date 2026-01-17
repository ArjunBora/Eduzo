import requests
import json

BASE = 'http://localhost:8000/api'

# Register new user
print("Registering new user...")
register_data = {
    "email": "testcat@example.com",
    "password": "password123",
    "role": "student",
    "full_name": "Category Test User",
    "enrollment_no": "CAT001",
    "department": "Computer Science",
    "program": "B.Tech",
    "enrollment_year": 2023
}
reg_resp = requests.post(f'{BASE}/auth/register', json=register_data)
print("Register status:", reg_resp.status_code)

# Login
print("\nLogging in...")
login_resp = requests.post(f'{BASE}/auth/login', 
    data={'username': 'testcat@example.com', 'password': 'password123'})
print("Login status:", login_resp.status_code)

if login_resp.status_code == 200:
    token = login_resp.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    
    # Create achievement with RESEARCH category
    print("\nCreating achievement with RESEARCH category...")
    achievement_data = {
        'title': 'Machine Learning Research',
        'description': 'Published paper on AI',
        'category': 'RESEARCH',
        'date_achieved': '2024-11-15T00:00:00'
    }
    create_resp = requests.post(f'{BASE}/portfolio/achievements', 
        json=achievement_data, headers=headers)
    
    print("Create status:", create_resp.status_code)
    if create_resp.status_code == 200:
        result = create_resp.json()
        print("\n=== RESULT ===")
        print(f"Title: {result.get('title')}")
        print(f"Category: {result.get('category')}")
        print(f"Date Achieved: {result.get('date_achieved')}")
        print()
        if result.get('category') == 'RESEARCH':
            print("✅ SUCCESS! Category correctly saved as RESEARCH!")
        else:
            print(f"❌ FAILED: Category was '{result.get('category')}' instead of 'RESEARCH'")
        
        if result.get('date_achieved') and '2024-11' in str(result.get('date_achieved')):
            print("✅ SUCCESS! Date correctly saved as November 2024!")
        else:
            print(f"❌ FAILED: Date was '{result.get('date_achieved')}'")
    else:
        print("Error:", create_resp.text)
else:
    print("Login error:", login_resp.text)
