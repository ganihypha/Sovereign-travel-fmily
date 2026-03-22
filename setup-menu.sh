#!/bin/bash

# ============================================
# SOVEREIGN TRAVEL AGENT - Setup Menu
# ============================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/user/webapp"
cd $PROJECT_DIR

# Function to print colored messages
print_header() {
  echo -e "\n${BLUE}================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Main menu
show_menu() {
  clear
  echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║   SOVEREIGN TRAVEL AGENT - Setup Menu    ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
  echo ""
  echo "  1) 📊 Check Status - Cek status semua service"
  echo "  2) 🗄️  Setup Database - Apply schema.sql ke Supabase"
  echo "  3) 📱 Setup WhatsApp Webhook - Konfigurasi Fonnte"
  echo "  4) 🚀 Start Local Development - Jalankan server lokal"
  echo "  5) 🔄 Restart Services - Restart PM2 services"
  echo "  6) 📦 Build & Deploy - Deploy ke Cloudflare Pages"
  echo "  7) 🔐 Update Secrets - Update environment variables"
  echo "  8) 📝 Test API Endpoints - Test health check"
  echo "  9) 📖 View Documentation - Buka dokumentasi"
  echo "  0) ❌ Exit"
  echo ""
  echo -n "Pilih menu (0-9): "
}

# 1. Check Status
check_status() {
  print_header "CHECKING SYSTEM STATUS"
  
  echo "🌐 GitHub Repository:"
  echo "   https://github.com/ganihypha/Sovereign-travel-fmily"
  
  echo ""
  echo "☁️  Cloudflare Pages:"
  echo "   https://sovereign-travel-agent.pages.dev"
  
  echo ""
  echo "🗄️  Supabase Project:"
  echo "   https://bkcvrpcunyjgetpkoyjx.supabase.co"
  
  echo ""
  echo "📱 Fonnte WhatsApp Device:"
  echo "   Number: 085643383832"
  echo "   Status: Testing..."
  
  # Test Fonnte
  FONNTE_TOKEN="5yTiZ2yYK2SCtM9KsVeV"
  RESPONSE=$(curl -s --connect-timeout 5 https://api.fonnte.com/validate \
    -H "Authorization: $FONNTE_TOKEN" || echo "error")
  
  if [[ $RESPONSE == *"device"* ]]; then
    print_success "Fonnte Device Connected"
  else
    print_warning "Fonnte Device Status Unknown"
  fi
  
  echo ""
  echo "📦 Local Dependencies:"
  if [ -d "node_modules" ]; then
    print_success "node_modules installed"
  else
    print_warning "node_modules not found - run: npm install"
  fi
  
  echo ""
  echo "🔧 PM2 Services:"
  pm2 list 2>/dev/null || print_warning "No PM2 services running"
  
  echo ""
  read -p "Press Enter to continue..."
}

# 2. Setup Database
setup_database() {
  print_header "SETUP DATABASE SUPABASE"
  
  echo "📋 Instruksi Manual Setup Database:"
  echo ""
  echo "1. Buka Supabase Dashboard:"
  echo "   https://supabase.com/dashboard/project/bkcvrpcunyjgetpkoyjx"
  echo ""
  echo "2. Klik menu 'SQL Editor' di sidebar kiri"
  echo ""
  echo "3. Klik 'New Query'"
  echo ""
  echo "4. Copy & Paste seluruh isi file: schema.sql"
  echo "   File location: $PROJECT_DIR/schema.sql"
  echo ""
  echo "5. Klik tombol 'RUN' atau tekan Ctrl+Enter"
  echo ""
  echo "6. Tunggu sampai muncul 'Success'"
  echo ""
  echo "7. Cek di 'Table Editor' - harus ada 8 tabel:"
  echo "   - agents"
  echo "   - customers"
  echo "   - packages"
  echo "   - bookings"
  echo "   - payments"
  echo "   - documents"
  echo "   - wa_messages"
  echo "   - reminders"
  echo ""
  print_warning "⚠️  Database setup harus dilakukan manual di Supabase Dashboard"
  echo ""
  
  read -p "Sudah selesai setup database? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_success "Database setup completed!"
  fi
  
  echo ""
  read -p "Press Enter to continue..."
}

# 3. Setup WhatsApp Webhook
setup_webhook() {
  print_header "SETUP WHATSAPP WEBHOOK"
  
  echo "📱 Instruksi Setup Webhook Fonnte:"
  echo ""
  echo "1. Login ke Fonnte Dashboard:"
  echo "   https://fonnte.com/login"
  echo ""
  echo "2. Pilih device: 085643383832"
  echo ""
  echo "3. Masuk ke menu 'Webhook Settings'"
  echo ""
  echo "4. Isi Webhook URL dengan:"
  echo "   https://sovereign-travel-agent.pages.dev/api/wa/webhook"
  echo ""
  echo "5. Klik 'Save'"
  echo ""
  echo "6. Test dengan kirim pesan ke 085643383832:"
  echo "   - Ketik: INFO"
  echo "   - Ketik: HARGA"
  echo "   - Ketik: BOOKING"
  echo "   - Ketik: STATUS"
  echo ""
  print_warning "⚠️  Webhook setup harus dilakukan manual di Fonnte Dashboard"
  echo ""
  
  read -p "Sudah setup webhook? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_success "Webhook setup completed!"
  fi
  
  echo ""
  read -p "Press Enter to continue..."
}

# 4. Start Local Development
start_local_dev() {
  print_header "STARTING LOCAL DEVELOPMENT"
  
  # Check port 3000
  if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    print_warning "Port 3000 is already in use. Killing existing process..."
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
  fi
  
  # Build first
  print_warning "Building project..."
  npm run build
  
  print_success "Build completed!"
  echo ""
  
  # Start with PM2
  print_warning "Starting development server with PM2..."
  pm2 delete sovereign-travel-agent 2>/dev/null || true
  pm2 start ecosystem.config.cjs
  
  print_success "Development server started!"
  echo ""
  echo "🌐 Local URL: http://localhost:3000"
  echo "📊 PM2 Status: pm2 logs sovereign-travel-agent --nostream"
  echo ""
  
  # Test
  sleep 3
  echo "Testing endpoint..."
  curl -s http://localhost:3000 | head -n 5
  echo ""
  print_success "Server is running!"
  
  echo ""
  read -p "Press Enter to continue..."
}

# 5. Restart Services
restart_services() {
  print_header "RESTARTING SERVICES"
  
  pm2 restart sovereign-travel-agent 2>/dev/null || {
    print_warning "Service not found. Starting fresh..."
    fuser -k 3000/tcp 2>/dev/null || true
    npm run build
    pm2 start ecosystem.config.cjs
  }
  
  print_success "Services restarted!"
  pm2 list
  
  echo ""
  read -p "Press Enter to continue..."
}

# 6. Build & Deploy
build_deploy() {
  print_header "BUILD & DEPLOY TO CLOUDFLARE"
  
  export CLOUDFLARE_API_TOKEN="yvImquSdjXBLj1gS4mij0vIWBqg4771HdHAP_mbD"
  
  echo "🔨 Building project..."
  npm run build
  print_success "Build completed!"
  
  echo ""
  echo "☁️  Deploying to Cloudflare Pages..."
  npx wrangler pages deploy dist --project-name sovereign-travel-agent
  
  print_success "Deployment completed!"
  echo ""
  echo "🌐 Production URL: https://sovereign-travel-agent.pages.dev"
  
  echo ""
  read -p "Press Enter to continue..."
}

# 7. Update Secrets
update_secrets() {
  print_header "UPDATE CLOUDFLARE SECRETS"
  
  export CLOUDFLARE_API_TOKEN="yvImquSdjXBLj1gS4mij0vIWBqg4771HdHAP_mbD"
  
  echo "🔐 Current Secrets in Production:"
  npx wrangler pages secret list --project-name sovereign-travel-agent
  
  echo ""
  echo "Available secrets to update:"
  echo "  1) SUPABASE_URL"
  echo "  2) SUPABASE_ANON_KEY"
  echo "  3) SUPABASE_SERVICE_KEY"
  echo "  4) FONNTE_TOKEN"
  echo "  0) Back to main menu"
  echo ""
  
  read -p "Pilih secret yang mau di-update (0-4): " secret_choice
  
  case $secret_choice in
    1)
      echo "https://bkcvrpcunyjgetpkoyjx.supabase.co" | \
        npx wrangler pages secret put SUPABASE_URL --project-name sovereign-travel-agent
      print_success "SUPABASE_URL updated!"
      ;;
    2)
      npx wrangler pages secret put SUPABASE_ANON_KEY --project-name sovereign-travel-agent
      ;;
    3)
      npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name sovereign-travel-agent
      ;;
    4)
      echo "5yTiZ2yYK2SCtM9KsVeV" | \
        npx wrangler pages secret put FONNTE_TOKEN --project-name sovereign-travel-agent
      print_success "FONNTE_TOKEN updated!"
      ;;
    0)
      return
      ;;
  esac
  
  echo ""
  read -p "Press Enter to continue..."
}

# 8. Test API
test_api() {
  print_header "TESTING API ENDPOINTS"
  
  echo "🧪 Testing Local Endpoint..."
  echo "GET http://localhost:3000"
  curl -s http://localhost:3000 | head -n 10
  echo ""
  
  echo ""
  echo "🧪 Testing Production Endpoint..."
  echo "GET https://sovereign-travel-agent.pages.dev"
  curl -s https://sovereign-travel-agent.pages.dev | head -n 10
  echo ""
  
  print_success "API tests completed!"
  
  echo ""
  read -p "Press Enter to continue..."
}

# 9. View Documentation
view_docs() {
  print_header "PROJECT DOCUMENTATION"
  
  echo "📖 Available Documentation:"
  echo ""
  echo "1) README.md - Project overview"
  echo "2) ROADMAP_MVP_TO_REVENUE.md - Full roadmap"
  echo "3) SETUP_INSTRUCTIONS.md - Setup guide"
  echo "4) schema.sql - Database schema"
  echo ""
  
  read -p "Pilih dokumen (1-4) atau 0 untuk kembali: " doc_choice
  
  case $doc_choice in
    1) cat README.md | less ;;
    2) cat ROADMAP_MVP_TO_REVENUE.md | less ;;
    3) cat SETUP_INSTRUCTIONS.md | less ;;
    4) cat schema.sql | less ;;
    0) return ;;
  esac
  
  echo ""
  read -p "Press Enter to continue..."
}

# Main loop
while true; do
  show_menu
  read choice
  
  case $choice in
    1) check_status ;;
    2) setup_database ;;
    3) setup_webhook ;;
    4) start_local_dev ;;
    5) restart_services ;;
    6) build_deploy ;;
    7) update_secrets ;;
    8) test_api ;;
    9) view_docs ;;
    0) 
      print_success "Terima kasih! Semangat build Sovereign Travel Agent! 🚀"
      exit 0
      ;;
    *)
      print_error "Pilihan tidak valid. Pilih 0-9."
      sleep 2
      ;;
  esac
done
