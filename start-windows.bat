@echo off
title LangBridge — Local Development Server
color 0B

echo.
echo  ============================================================
echo   LangBridge — Legal Document Translator
echo   Justice in Your Language - nu-nyaaya aapaki bhaasha mein
echo  ============================================================
echo.

echo [1/3] Starting Node.js TTS Service...
cd node-tts-service
start "LangBridge TTS" cmd /k "nvm use 18 && npm install && node server.js"
cd ..

echo [2/3] Starting Spring Boot Backend...
cd backend
start "LangBridge Backend" cmd /k "mvn spring-boot:run"
cd ..

echo [3/3] Starting React Frontend...
cd frontend
start "LangBridge Frontend" cmd /k "npm install && npm run dev"
cd ..

echo.
echo  ============================================================
echo   All services starting in separate windows!
echo.
echo   Frontend  : http://localhost:5173
echo   API       : http://localhost:8080/api/health
echo   TTS       : http://localhost:3001/health
echo.
echo   Demo login: 9999999999 / demo1234
echo  ============================================================
echo.
echo  NOTE: Wait ~60 seconds for Spring Boot to fully start.
echo  Close all "LangBridge" terminal windows to stop.
echo.
pause
