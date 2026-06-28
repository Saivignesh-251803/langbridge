# LangBridge — Deployment Guide

---

## LOCAL DEVELOPMENT SETUP

### Prerequisites
| Tool | Version | Download |
|------|---------|----------|
| Java | 17+ | https://adoptium.net/ |
| Maven | 3.9+ | https://maven.apache.org/ |
| Node.js | 18+ (via nvm) | https://github.com/nvm-sh/nvm |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/ |

---

### Step 1 — Get Your FREE Gemini API Key
1. Go to https://aistudio.google.com/
2. Sign in with Google
3. Click "Get API Key" → "Create API Key"
4. Copy the key — it starts with `AIza...`
5. Free tier: 15 requests/min, 1500 requests/day — enough for development & demo

---

### Step 2 — MySQL Database Setup
```bash
mysql -u root -p

# Inside MySQL:
source /path/to/langbridge/docs/schema.sql
```

---

### Step 3 — Configure Backend
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_MYSQL_ROOT_PASSWORD
gemini.api.key=AIzaYOUR_GEMINI_KEY_HERE
```

---

### Step 4 — Run the Spring Boot Backend
```bash
cd langbridge/backend
mvn clean install -DskipTests
mvn spring-boot:run
```
Backend starts at: **http://localhost:8080**

---

### Step 5 — Run the Node.js TTS Service
```bash
cd langbridge/node-tts-service
nvm use 18
npm install
npm start
```
TTS service starts at: **http://localhost:3001**

> **Note:** The TTS service uses `gtts` (Google Text-to-Speech) which is completely FREE and requires NO API key.

---

### Step 6 — Run the React Frontend
```bash
cd langbridge/frontend
npm install
npm run dev
```
Frontend starts at: **http://localhost:5173**

---

### All 3 Services Running:
```
http://localhost:8080   ← Spring Boot API
http://localhost:3001   ← Node.js TTS
http://localhost:5173   ← React Frontend
```

---

## PRODUCTION DEPLOYMENT (VPS / Cloud)

### Recommended Stack
- **VPS**: DigitalOcean Droplet ($6/mo), AWS EC2 t3.micro, or any Ubuntu 22.04 server
- **Domain**: Optional (e.g. langbridge.in)
- **SSL**: Free via Let's Encrypt + Nginx

---

### Step 1 — Server Setup (Ubuntu 22.04)
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server openjdk-17-jdk nodejs npm

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2 for Node.js process management
npm install -g pm2
```

---

### Step 2 — MySQL Production Setup
```bash
sudo mysql_secure_installation

mysql -u root -p < /var/www/langbridge/docs/schema.sql

# Create dedicated DB user (more secure than root)
mysql -u root -p -e "
CREATE USER 'langbridge'@'localhost' IDENTIFIED BY 'StrongPassword!123';
GRANT ALL PRIVILEGES ON langbridge_db.* TO 'langbridge'@'localhost';
FLUSH PRIVILEGES;"
```

---

### Step 3 — Deploy Backend
```bash
cd /var/www/langbridge/backend

# Create production config (override application.properties)
cat > src/main/resources/application-prod.properties << EOF
spring.datasource.url=jdbc:mysql://localhost:3306/langbridge_db?useSSL=true&serverTimezone=Asia/Kolkata
spring.datasource.username=langbridge
spring.datasource.password=StrongPassword!123
gemini.api.key=YOUR_GEMINI_KEY
app.cors.allowed-origins=https://yourdomain.com
jwt.secret=CHANGE_THIS_TO_A_VERY_LONG_RANDOM_SECRET_STRING_FOR_PRODUCTION
EOF

mvn clean package -DskipTests
```

Create systemd service `/etc/systemd/system/langbridge.service`:
```ini
[Unit]
Description=LangBridge Spring Boot Application
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/langbridge/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod target/langbridge-backend-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable langbridge
sudo systemctl start langbridge
```

---

### Step 4 — Deploy TTS Service with PM2
```bash
cd /var/www/langbridge/node-tts-service
nvm use 18
npm install --production
pm2 start server.js --name "langbridge-tts"
pm2 startup
pm2 save
```

---

### Step 5 — Build & Deploy React Frontend
```bash
cd /var/www/langbridge/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/langbridge/
```

---

### Step 6 — Nginx Configuration
Create `/etc/nginx/sites-available/langbridge`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # React Frontend
    root /var/www/html/langbridge;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Spring Boot API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
        client_max_body_size 25M;
    }

    # Node TTS audio files
    location /audio {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }

    location /tts {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/langbridge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 7 — SSL with Let's Encrypt (Free HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## API REFERENCE

### Auth Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT token |

### Document Endpoints (JWT Required)
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/documents/upload | Upload + process document |
| GET | /api/documents/history | Get user's document history |
| GET | /api/health | Health check |

### TTS Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | /tts/generate | Generate audio from text |
| GET | /tts/languages | List supported languages |

---

## SUPPORTED FILE TYPES
| Type | Extensions | Notes |
|------|-----------|-------|
| Images | JPG, PNG, WEBP | Uses Gemini Vision OCR |
| PDF | .pdf | Text-based PDFs only (best quality) |
| Word | .docx | Extracts all text |
| Plain Text | .txt | Direct processing |

---

## FREE TIER LIMITS (Gemini 1.5 Flash)
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute
- **Cost: ₹0 / $0** — completely free

For production at scale, upgrade to paid tier (~₹0.0005/request).
