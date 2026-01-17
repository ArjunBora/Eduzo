# EduZo — Centralized Student Portfolio Platform

A modern **full-stack academic portfolio application** that centralizes and verifies **student academic and extracurricular activities** using a **microservices-based backend** and a **React web frontend**.

EduZo allows students to **log achievements**, faculty to **verify authenticity**, and institutions to **generate secure, shareable digital portfolios**, enabling transparent placements, scholarships, and institutional analytics for demonstration and hackathon purposes.



##  Features

###  1. Centralized Student Activity Tracking
- Single platform for academic and extracurricular records
- Students can log certifications, projects, competitions, and achievements
- Replaces fragmented resumes and manual spreadsheets

###  2. Faculty Verification System
- All submissions are created in a **PENDING** state
- Faculty members review and **VERIFY** activities
- Ensures credibility and prevents false claims

###  3. Automated Digital Portfolio Generation
- Verified activities are compiled into a professional portfolio
- Secure, shareable public link:
- Ideal for recruiters, scholarship boards, and internships

###  4. AI-Powered Categorization
- Activities automatically classified using **Qwen3 AI reasoning**
- Reduces manual tagging effort
- Improves analytics accuracy and portfolio clarity

###  5. Institutional Analytics & Insights
- Real-time dashboards for departments and institutions
- Tracks:
- Student engagement
- Academic participation
- Extracurricular involvement
- Enables data-driven institutional decisions



##  Frontend (Web & Mobile)

###  Features
- Clean dashboard-style UI
- Student activity submission and tracking
- Faculty verification workflows
- Portfolio preview and sharing

###  Tech
- **React** for web dashboard
- **React Native** for mobile application
- Centralized API access via gateway
- Responsive and scalable UI architecture



##  Backend (Microservices Architecture)

###  Services
- **Gateway Service** – Central entry point for all APIs
- **Backend Service** – Core business logic and data handling
- **AI Service** – Automated activity categorization
- **Analytics Service** – Real-time institutional metrics

###  Core Responsibilities
- Activity management
- Verification workflows
- Portfolio generation
- AI-based classification
- Analytics aggregation

>  No monolithic backend  
> Each service runs independently and communicates via APIs



##  How EduZo Works

1. Student registers and logs activities
2. Activities are stored in **PENDING** state
3. Faculty reviews and verifies submissions
4. AI service categorizes verified activities
5. Portfolio is automatically generated
6. Shareable portfolio link is created
7. Recruiters or institutions view the portfolio
8. Analytics service updates institutional insights



##  Tech Stack

| Layer | Tools |
|-----|------|
| **Frontend** | React, React Native |
| **Backend** | FastAPI (Python) |
| **AI Engine** | Qwen3 |
| **Database** | SQLite |
| **Caching / Analytics** | Redis |
| **Infrastructure** | Docker, Docker Compose |
| **Version Control** | Git, GitHub |



##  Local Development Setup

### 1️ Clone the Repository
```bash
git clone https://github.com/ArjunBora/Eduzo.git
cd Eduzo
```
### 2 Documentation
https://github.com/ArjunBora/Eduzo/blob/main/EduZo.pdf


## Author
- Arjun Bora:- https://github.com/ArjunBora
- Chanchal Taye:- https://github.com/ChanchalTaye
