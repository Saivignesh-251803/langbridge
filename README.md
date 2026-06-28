# 🏛️ LangBridge — Legal & Government Document Translator

> Breaking language barriers in access to justice for rural India.

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Spring Boot 3.x (Java 17) + Maven
- **TTS Service**: Node.js (Express) — free Google TTS
- **AI**: Google Gemini 1.5 Flash (free tier)
- **Database**: MySQL 8
- **Auth**: JWT-based authentication

## Supported Languages
Hindi, English, Telugu, Marathi, Bengali, Tamil, Malayalam

## Quick Start (Local)

### Prerequisites
- Java 17+, Node.js 18+, MySQL 8, Maven 3.9+
- Free Google Gemini API key from https://aistudio.google.com/

### 1. Database Setup
```sql
mysql -u root -p < docs/schema.sql
```

### 2. Backend (Spring Boot)
```bash
cd backend
# Set your Gemini API key in src/main/resources/application.properties
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. TTS Node Service
```bash
cd node-tts-service
nvm use 18
npm install
npm start
# Runs on http://localhost:3001
```

### 4. Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Production Deployment
See docs/DEPLOYMENT.md

