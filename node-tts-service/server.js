/**
 * LangBridge TTS Microservice
 * Uses Google Text-to-Speech (gtts) — 100% FREE, no API key needed
 * Supports: Hindi, English, Telugu, Marathi, Bengali, Tamil, Malayalam
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const gtts = require('gtts');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const AUDIO_DIR = path.join(__dirname, 'audio-files');

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'] }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('combined'));
app.use('/audio', express.static(AUDIO_DIR));

// Language code mapping for gTTS
const LANG_MAP = {
  'hi': 'hi',   // Hindi
  'en': 'en',   // English
  'te': 'te',   // Telugu
  'mr': 'mr',   // Marathi
  'bn': 'bn',   // Bengali
  'ta': 'ta',   // Tamil
  'ml': 'ml',   // Malayalam
};

/**
 * POST /tts/generate
 * Body: { text: string, lang: string }
 * Returns: { filename: string, url: string }
 */
app.post('/tts/generate', async (req, res) => {
  const { text, lang = 'hi' } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const langCode = LANG_MAP[lang] || 'hi';
  const filename = `tts_${uuidv4()}.mp3`;
  const filepath = path.join(AUDIO_DIR, filename);

  // Truncate text for TTS if too long (gTTS limit ~500 chars per call)
  const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text;

  const speech = new gtts(truncatedText, langCode);

  speech.save(filepath, (err) => {
    if (err) {
      console.error('TTS error:', err);
      return res.status(500).json({ error: 'TTS generation failed', detail: err.message });
    }

    // Schedule file cleanup after 24 hours
    setTimeout(() => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }, 24 * 60 * 60 * 1000);

    res.json({
      filename,
      url: `http://localhost:${PORT}/audio/${filename}`,
      language: langCode,
      success: true
    });
  });
});

/**
 * GET /tts/languages
 * Returns supported languages
 */
app.get('/tts/languages', (req, res) => {
  res.json({
    supported: [
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    ]
  });
});

/**
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LangBridge TTS', port: PORT });
});

// Cleanup old audio files on startup (older than 1 day)
function cleanupOldAudio() {
  if (!fs.existsSync(AUDIO_DIR)) return;
  const now = Date.now();
  fs.readdirSync(AUDIO_DIR).forEach(file => {
    const fp = path.join(AUDIO_DIR, file);
    const stat = fs.statSync(fp);
    if (now - stat.mtimeMs > 24 * 60 * 60 * 1000) {
      fs.unlinkSync(fp);
    }
  });
}

cleanupOldAudio();

app.listen(PORT, () => {
  console.log(`\n🎙️  LangBridge TTS Service running on http://localhost:${PORT}`);
  console.log(`📁  Audio files: ${AUDIO_DIR}`);
  console.log(`🌐  Languages: Hindi, English, Telugu, Marathi, Bengali, Tamil, Malayalam\n`);
});
