# 🌍 Sovereign Travel Agent

> **"WA-First Travel Management System - Generate Real Money from Indonesian Travel Agents"**

[![Status](https://img.shields.io/badge/status-MVP%20Development-blue)]()
[![Revenue](https://img.shields.io/badge/target-Rp%2010M%20MRR-green)]()
[![Users](https://img.shields.io/badge/target-100%20paying%20users-orange)]()

---

## 🎯 What Is This?

**Sovereign Travel Agent** adalah sistem manajemen travel agent berbasis WhatsApp yang dirancang untuk travel agent kecil-menengah di Indonesia.

### Problem We Solve:
- ❌ Travel agents masih pakai Excel untuk track 100+ jama'ah
- ❌ Follow-up customer via WhatsApp satu-satu (time consuming!)
- ❌ Payment tracking DP/cicilan/pelunasan kacau
- ❌ Document management (paspor, visa) scattered everywhere
- ❌ Tidak tahu profit/loss real-time

### Our Solution:
✅ Customer database (jama'ah) tersentral
✅ Booking & payment tracking otomatis
✅ WhatsApp auto-reply bot (24/7)
✅ Payment reminder otomatis via WA
✅ Financial reports real-time

---

## 🚀 Quick Start

### Prerequisites:
- Node.js 18+
- Cloudflare account (free tier)
- Supabase account (free tier)
- Fonnte WhatsApp API (free tier)

### Installation:

```bash
# Clone repository
git clone https://github.com/ganihypha/Sovereign-travel-fmily.git
cd Sovereign-travel-fmily

# Install dependencies
npm install

# Setup environment variables
cp .env.example .dev.vars
# Edit .dev.vars dengan credentials kamu

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

---

## 🗂️ Project Structure

```
webapp/
├── src/
│   ├── index.tsx              # Main Hono app
│   └── routes/
│       ├── auth.ts            # Authentication
│       ├── customers.ts       # Customer management
│       ├── bookings.ts        # Booking management
│       ├── payments.ts        # Payment tracking
│       ├── reports.ts         # Financial reports
│       └── wa.ts              # WhatsApp webhook & API
├── public/
│   └── static/                # Static assets
├── migrations/
│   └── 001_initial_schema.sql # Database schema
├── .dev.vars                  # Local environment variables
├── wrangler.jsonc             # Cloudflare configuration
├── package.json
├── README.md                  # This file
└── ROADMAP_MVP_TO_REVENUE.md  # Complete roadmap to Rp 10M MRR
```

---

## 🔑 Environment Variables

Create `.dev.vars` file:

```bash
# Supabase (Database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Fonnte (WhatsApp API)
FONNTE_TOKEN=your-device-token
FONNTE_DEVICE=0856xxxxxxxx

# Cloudflare (Optional - R2 for file storage)
CF_ACCOUNT_ID=your-account-id
CF_R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
```

**Production:** Set these as secrets in Cloudflare Pages dashboard.

---

## 📊 Current Status

### ✅ Completed:
- [x] Project setup & credentials configured
- [x] Supabase database connected (bkcvrpcunyjgetpkoyjx.supabase.co)
- [x] Fonnte WhatsApp API connected (device 085643383832)
- [x] GitHub repository setup
- [x] Roadmap to Rp 10M MRR documented

### 🔄 In Progress:
- [ ] Database schema creation
- [ ] Basic authentication (phone + PIN)
- [ ] Customer CRUD API
- [ ] WhatsApp auto-reply bot

### ⏳ Planned (Week 2-4):
- [ ] Booking & payment management
- [ ] Payment reminder automation
- [ ] Financial reports & dashboard
- [ ] MVP launch & first paying customer 🎉

---

## 💰 Revenue Model

### Pricing Tiers:

| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | Rp 0 | 10 customers, 5 bookings/month | Freemium funnel |
| **Basic** | Rp 149K/bulan | 100 customers, unlimited bookings, WA broadcast | Main revenue driver |
| **Pro** | Rp 299K/bulan | Unlimited, multi-agent, document storage | Premium users |

### Revenue Projections:

| Timeline | Paying Users | MRR | ARR |
|----------|-------------|-----|-----|
| Month 1 | 5 | Rp 745K | Rp 8.9M |
| Month 3 | 15 | Rp 2.8M | Rp 33.9M |
| Month 6 | 40 | Rp 8.9M | Rp 107M |
| Month 12 | 80 | Rp 19.4M | Rp 232M |

**Target: Rp 10M MRR in 6 months** 🎯

---

## 🎯 Market Opportunity

- **Total Travel Agents Indonesia**: ~500,000+
- **Using WhatsApp**: >85% (425,000+)
- **Using Digital System**: <2% (10,000)
- **Market Gap**: **490,000 agents** (98% penetrasi opportunity!)
- **TAM**: Rp 877 miliar/year (if we charge Rp 149K/month to all)

**Capture 1% = Rp 8.7 miliar/year**
**Capture 0.1% = Rp 877 juta/year**

---

## 🛠️ Tech Stack

### Frontend:
- **Framework**: Hono SSR (server-side rendering)
- **Styling**: TailwindCSS (CDN)
- **Icons**: Font Awesome
- **Mobile-First**: Responsive design untuk HP

### Backend:
- **Framework**: Hono.js
- **Runtime**: Cloudflare Workers/Pages
- **Database**: Supabase (PostgreSQL)
- **WhatsApp**: Fonnte API
- **Storage**: Cloudflare R2 (optional untuk document upload)

### Deployment:
- **Platform**: Cloudflare Pages
- **CDN**: Global edge network
- **Cost**: $0/month (free tier cukup untuk MVP)
- **Domain**: Custom domain via Cloudflare

---

## 🚀 Deployment

### Local Development:
```bash
npm run dev
# Access: http://localhost:3000
```

### Production Deploy:
```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Set production secrets
npx wrangler pages secret put SUPABASE_URL --project-name sovereign-travel-agent
npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name sovereign-travel-agent
npx wrangler pages secret put FONNTE_TOKEN --project-name sovereign-travel-agent
```

### Production URLs:
- **Main App**: https://sovereign-travel-agent.pages.dev
- **API Health**: https://sovereign-travel-agent.pages.dev/api/health
- **WhatsApp Webhook**: https://sovereign-travel-agent.pages.dev/api/wa/webhook

---

## 📱 WhatsApp Integration

### Setup Fonnte Webhook:
1. Login ke https://md.fonnte.com
2. Pilih device yang connected (085643383832)
3. Edit device → Set webhook URL:
   ```
   https://sovereign-travel-agent.pages.dev/api/wa/webhook
   ```
4. Enable Autoread: ON

### Supported Keywords:
- `INFO` → Show tour package info
- `HARGA` → Show price list
- `BOOKING` → How to book
- `STATUS` → Check booking status
- `ADMIN` → Contact admin

### Broadcast Feature:
```bash
# Send broadcast to multiple customers
POST /api/wa/broadcast
{
  "targets": ["6285643383832", "6281234567890"],
  "message": "Promo Umroh Ramadhan! Diskon 20%..."
}
```

---

## 📊 Database Schema

See `migrations/001_initial_schema.sql` for complete schema.

### Main Tables:
- **agents**: Travel agent owners
- **customers**: Jama'ah/travelers
- **packages**: Tour packages
- **bookings**: Customer bookings
- **payments**: Payment tracking (DP, cicilan, pelunasan)
- **wa_messages**: WhatsApp message log

---

## 🎓 Documentation

- **Roadmap**: [ROADMAP_MVP_TO_REVENUE.md](./ROADMAP_MVP_TO_REVENUE.md) - Complete 30-day MVP to Rp 10M MRR
- **API Docs**: Coming soon (Swagger/OpenAPI)
- **User Guide**: Coming soon (screenshots + video tutorial)

---

## 🤝 Contributing

This is a private project for now. If you want to collaborate, contact:
- **Email**: [your-email]
- **WhatsApp**: [your-whatsapp]

---

## 📞 Support

Need help? Contact us:
- **WhatsApp**: 085643383832 (Bot aktif 24/7!)
- **Email**: support@sovereignempire.com
- **GitHub Issues**: https://github.com/ganihypha/Sovereign-travel-fmily/issues

---

## 📜 License

Proprietary - All Rights Reserved
© 2026 Sovereign Empire Team

---

## 🏆 Success Metrics

### Week 1 Target:
- [x] Database live ✅
- [ ] Basic UI accessible
- [ ] 1 test user bisa login

### Week 2 Target:
- [ ] WA Bot reply keyword "INFO"
- [ ] Broadcast ke 5 nomor berhasil

### Week 4 Target:
- [ ] **FIRST PAYING CUSTOMER** 🎉
- [ ] Revenue: Rp 149,000

### Month 3 Target:
- [ ] 15 paying customers
- [ ] MRR: Rp 2.8 juta

### Month 6 Target:
- [ ] 40 paying customers
- [ ] MRR: Rp 8.9 juta
- [ ] Product-market fit validated ✅

---

## 🔥 Let's Generate Real Money!

**"Build fast. Ship faster. Get paid fastest."**

Join the Sovereign Empire revolution. 🚀👑

---

*Last Updated: 22 Maret 2026*
*Status: MVP Development Phase*
