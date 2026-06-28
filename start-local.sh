#!/bin/bash
# ============================================================
# LangBridge — One-Command Local Startup Script
# Usage: chmod +x start-local.sh && ./start-local.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

print_banner() {
  echo -e "${BLUE}"
  echo "  ██╗      █████╗ ███╗   ██╗ ██████╗ ██████╗ ██████╗ ██╗██████╗  ██████╗ ███████╗"
  echo "  ██║     ██╔══██╗████╗  ██║██╔════╝ ██╔══██╗██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝"
  echo "  ██║     ███████║██╔██╗ ██║██║  ███╗██████╔╝██████╔╝██║██║  ██║██║  ███╗█████╗  "
  echo "  ██║     ██╔══██║██║╚██╗██║██║   ██║██╔══██╗██╔══██╗██║██║  ██║██║   ██║██╔══╝  "
  echo "  ███████╗██║  ██║██║ ╚████║╚██████╔╝██████╔╝██║  ██║██║██████╔╝╚██████╔╝███████╗"
  echo "  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝ ╚══════╝"
  echo -e "${NC}"
  echo -e "${CYAN}         Legal Document Translator for Rural Citizens of India${NC}"
  echo -e "${CYAN}         न्याय आपकी भाषा में — Justice in Your Language${NC}"
  echo ""
}

check_prereq() {
  local cmd=$1
  local name=$2
  local url=$3
  if ! command -v "$cmd" &> /dev/null; then
    echo -e "${RED}✗ $name not found.${NC} Install from: $url"
    exit 1
  fi
  echo -e "${GREEN}✓ $name found${NC}"
}

print_banner

echo -e "${BOLD}Checking prerequisites...${NC}"
check_prereq java "Java 17+" "https://adoptium.net/"
check_prereq mvn "Maven" "https://maven.apache.org/"
check_prereq node "Node.js 18+" "https://nodejs.org/"
check_prereq mysql "MySQL 8" "https://dev.mysql.com/downloads/"
echo ""

# Check Gemini API key
PROPS="backend/src/main/resources/application.properties"
if grep -q "YOUR_GEMINI_API_KEY_HERE" "$PROPS" 2>/dev/null; then
  echo -e "${RED}⚠️  GEMINI API KEY NOT SET!${NC}"
  echo -e "   Edit ${CYAN}$PROPS${NC}"
  echo -e "   Get free key at: ${CYAN}https://aistudio.google.com/${NC}"
  echo ""
  read -p "Press Enter after setting the API key, or Ctrl+C to exit..."
fi

# Check MySQL password
if grep -q "YOUR_MYSQL_PASSWORD" "$PROPS" 2>/dev/null; then
  echo -e "${YELLOW}⚠️  MySQL password not configured.${NC}"
  read -p "Enter your MySQL root password: " MYSQL_PWD
  sed -i "s/YOUR_MYSQL_PASSWORD/$MYSQL_PWD/g" "$PROPS"
  echo -e "${GREEN}✓ MySQL password updated${NC}"
fi

echo ""
echo -e "${BOLD}Step 1/3: Setting up database...${NC}"
MYSQL_PWD_STORED=$(grep "spring.datasource.password" "$PROPS" | cut -d= -f2)
if mysql -u root -p"$MYSQL_PWD_STORED" langbridge_db -e "SELECT 1" &>/dev/null 2>&1; then
  echo -e "${GREEN}✓ Database already set up${NC}"
else
  mysql -u root -p"$MYSQL_PWD_STORED" < docs/schema.sql 2>/dev/null && \
    echo -e "${GREEN}✓ Database initialized${NC}" || \
    echo -e "${YELLOW}⚠️  DB setup may have had issues. Check manually if needed.${NC}"
fi

echo ""
echo -e "${BOLD}Step 2/3: Starting Node.js TTS service on port 3001...${NC}"
cd node-tts-service
npm install --silent
nohup node server.js > ../logs/tts.log 2>&1 &
TTS_PID=$!
echo $TTS_PID > ../logs/tts.pid
echo -e "${GREEN}✓ TTS service started (PID: $TTS_PID)${NC}"
cd ..

echo ""
echo -e "${BOLD}Step 3/3: Building Spring Boot backend...${NC}"
mkdir -p logs
cd backend
mvn clean package -DskipTests -q 2>&1 | tail -5
nohup java -jar target/langbridge-backend-1.0.0.jar > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

echo ""
echo -e "${BOLD}Starting React frontend...${NC}"
cd frontend
npm install --silent
echo ""
echo -e "═══════════════════════════════════════════════════════"
echo -e "${GREEN}${BOLD}  🎉 LangBridge is starting!${NC}"
echo -e "═══════════════════════════════════════════════════════"
echo -e "  ${CYAN}Frontend:  http://localhost:5173${NC}"
echo -e "  ${CYAN}API:       http://localhost:8080/api/health${NC}"
echo -e "  ${CYAN}TTS:       http://localhost:3001/health${NC}"
echo -e "═══════════════════════════════════════════════════════"
echo -e "  Demo login: 9999999999 / demo1234"
echo -e "═══════════════════════════════════════════════════════"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

npm run dev

# Cleanup on exit
trap "kill $TTS_PID $BACKEND_PID 2>/dev/null; echo 'LangBridge stopped.'" EXIT
