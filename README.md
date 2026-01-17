# EduZo — Centralized Student Portfolio Platform

**EduZo is a unified student portfolio hub that centralizes and verifies academic and extracurricular activities to generate shareable digital profiles for placements and institutional growth.**



##  Quick Start (Run Locally)

You can get the entire microservice ecosystem running in under a minute using Docker or the provided automation scripts.

### Prerequisites
* **Docker & Docker Compose** (Recommended)
* **Python 3.9+** (For script-based startup)
* **Node.js** (For manual frontend development)

### Installation
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ArjunBora/Eduzo.git](https://github.com/ArjunBora/Eduzo.git)
   cd Eduzo
Run with Docker:

Bash

docker-compose up --build
Alternative: Run with Python Script:

Bash

python run_all.py
The Frontend will be available at http://localhost:3000 and the Gateway at http://localhost:8000.

 Tech Stack
EduZo is built with a scalable microservices architecture to handle high-concurrency verification and data processing.

Frontend: React (Web Dashboard) & React Native (Mobile App)

Backend: FastAPI (Python)

AI Service: Qwen3 AI Reasoning for automated activity categorization

Database & Caching: SQLite (Development) & Redis (Analytics)

Infrastructure: Docker, Docker Compose, and a centralized Gateway service

Languages: TypeScript (Primary), Python, JavaScript

 System Architecture & Flow

Shutterstock
Centralized Tracking: Students log academic milestones and extracurricular achievements via the mobile or web app.

Faculty Verification: To ensure credibility, all entries remain in a PENDING state until a faculty member reviews and marks them as VERIFIED.

Automated Portfolios: Once verified, the system generates a professional, shareable digital portfolio (accessible via /p/:token) for recruiters or scholarship boards.

Institutional Analytics: Real-time data provides departments with insights into student performance and engagement metrics.

Project Structure
frontend/: React-based web application dashboard.

backend/: Core business logic and API services.

mobile/: React Native source code for the student mobile app.

ai-service/: Qwen3 integration for intelligent data processing and categorization.

analytics-service/: Redis-backed service for real-time institutional reporting.

gateway/: Unified entry point for all microservice communications.

 Authors
Arjun Bora — GitHub Profile
Chanchal Taye -- GitHub Profile
