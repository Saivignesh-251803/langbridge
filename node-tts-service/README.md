# LangBridge TTS Microservice

## What It Does
Free Text-to-Speech service using Google's gTTS library. No API key required. No cost.

## Languages Supported
| Code | Language | Native |
|------|----------|--------|
| hi   | Hindi    | हिंदी  |
| en   | English  | English|
| te   | Telugu   | తెలుగు |
| mr   | Marathi  | मराठी  |
| bn   | Bengali  | বাংলা  |
| ta   | Tamil    | தமிழ்  |
| ml   | Malayalam| മലയാളം |

## Running
```bash
nvm use 18
npm install
npm start
# Runs on http://localhost:3001
```

## API
```
POST /tts/generate
Body: { "text": "your text", "lang": "hi" }
Response: { "filename": "tts_uuid.mp3", "url": "..." }

GET /tts/languages   # List supported languages
GET /health          # Health check
```

## Notes
- Audio files auto-delete after 24 hours
- Max text length: 500 characters per request
- Backed by Google Translate TTS (free, no key needed)
