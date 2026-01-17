# EduZo - Centralized Student Portfolio Platform

A unified mobile and web application serving as a single touchpoint to track and manage all student activities, from academics to personal achievements.

## Features

### 1. Centralized Platform
Fed by the mobile/web app, activity tracking, and achievement management. A single hub for all student interactions.

### 2. Verified Records
To ensure data credibility, all uploads (academic or extra-curricular) must be approved by faculty members (`PENDING` -> `VERIFIED`). This eliminates self-declared, unverified claims.

### 3. Digital Portfolio
The system automatically generates a shareable portfolio for students (`/p/:token`). Designed for:
- Professional placements
- Scholarship applications
- Further education

### 4. Analytics & Reporting
Real-time insights for students, faculty, and the institution. Supports institutional accreditation processes.

### 5. Integration Ready
Built to work alongside existing institutional systems like Learning Management Systems (LMS) and Enterprise Resource Planning (ERP) software.

## System Flow

**Inputs (Data Sources)**
- Mobile/Web App
- Activity Tracking
- Academic Records

**The Core (Processing)**
- Data Verification (Faculty Review)
- Organization & Storage

**Outputs (Deliverables)**
- **Digital Portfolio**: Shareable profiles.
- **Analytics**: Real-time insights.

## Tech Stack
- **Frontend**: React (Web), React Native (Mobile)
- **Backend**: FastAPI, SQLite (Dev)
- **Services**: AI Reasoning (Qwen3), Analytics (Redis)
