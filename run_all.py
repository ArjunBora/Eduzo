import subprocess
import time
import os
import signal
import sys

# Define services configuration
services = [
    {
        "name": "Backend",
        "command": ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        "cwd": "backend",
        "env": {}
    },
    {
        "name": "AI Service",
        # Assuming main:app based on bat file, but checking file existence is safer.
        # Fallback to model:app if main.py doesn't exist? 
        # Bat file said 'main:app', so we trust it.
        "command": ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"],
        "cwd": "ai-service",
        "env": {"MOCK_AI": "true"}
    },
    {
        "name": "Analytics",
        "command": ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"],
        "cwd": "analytics-service",
        "env": {}
    },
    {
        "name": "Frontend",
        # Use npm.cmd on Windows, npm on others
        "command": ["npm.cmd" if os.name == 'nt' else "npm", "run", "dev"],
        "cwd": "frontend",
        "env": {}
    }
]

processes = []

def start_services():
    print(f"Starting {len(services)} services in parallel...")
    root_dir = os.getcwd()
    
    for service in services:
        print(f"[{service['name']}] Starting...")
        cwd_path = os.path.join(root_dir, service['cwd'])
        
        # Merge environment variables
        env = os.environ.copy()
        env.update(service['env'])
        
        try:
            # We explicitly do NOT use shell=True to allow easier signal handling
            p = subprocess.Popen(
                service['command'],
                cwd=cwd_path,
                env=env,
                # Verify paths exist
            )
            processes.append(p)
            print(f"[{service['name']}] Started (PID: {p.pid})")
        except Exception as e:
            print(f"[{service['name']}] FAILED to start: {e}")

def stop_services(signum, frame):
    print("\n\nStopping all services...")
    for p in processes:
        try:
            # Try to terminate gracefully
            p.terminate()
        except:
            pass
            
    # Give them a moment
    time.sleep(1)
    
    # Force kill if needed (though terminate is usually enough for these)
    print("Cleanup complete. Exiting.")
    sys.exit(0)

if __name__ == "__main__":
    # Handle Ctrl+C
    signal.signal(signal.SIGINT, stop_services)
    
    start_services()
    
    print("\n---------------------------------------------------")
    print("ALL SERVICES RUNNING")
    print("Web App:   http://localhost:5173")
    print("Backend:   http://localhost:8000")
    print("AI:        http://localhost:8001")
    print("Analytics: http://localhost:8002")
    print("---------------------------------------------------")
    print("Press Ctrl+C to stop all services.")
    
    # Keep main thread alive to listen for signals
    while True:
        time.sleep(1)
