# 🌍 SOVEREIGN TRAVEL AGENT - MVP TO REVENUE ROADMAP

## **Author**: Sovereign Empire Team | **Version**: 1.0 | **Date**: 22 Maret 2026

---

## 📊 EXECUTIVE SUMMARY

**Sovereign Travel Agent** adalah sistem manajemen travel agent berbasis WhatsApp yang dirancang khusus untuk travel agent kecil-menengah di Indonesia.

### 🎯 Problem Statement
- **~500,000+** travel agent di Indonesia (umroh, tour, tiket, paket wisata)
- **>90%** masih pakai Excel / Google Sheets untuk manage customer & booking
- **>85%** komunikasi via WhatsApp
- **<2%** yang pakai sistem digital lengkap

### 💡 Solution
WA-first travel management system yang menggabungkan:
- Customer Management (jama'ah/traveler database)
- Booking & Payment Tracking
- WhatsApp Auto-Reply & Notification
- Document Management (paspor, visa, tiket)
- Laporan Keuangan Realtime

### 🚀 Vision
**"Jadi alat operasional wajib travel agent Indonesia"**

---

## 🎭 USER PERSONA - TRAVEL AGENT OWNER

### **Profile:**
- **Nama**: "Pak Budi" archetype
- **Usia**: 30-50 tahun
- **Bisnis**: Travel agent (umroh/tour/tiket)
- **Team**: 1-5 orang
- **Customer**: 50-500 jama'ah/tahun
- **Omzet**: Rp 50 juta - Rp 1 miliar/tahun

### **Pain Points:**
1. **Data customer tersebar** - WA, Excel, notebook
2. **Lupa follow-up** customer yang sudah tanya tapi belum booking
3. **Payment tracking manual** - DP, cicilan, pelunasan kacau
4. **Document management chaos** - paspor, foto, visa scan dimana-mana
5. **Tidak tahu profit/rugi real-time**
6. **WhatsApp flood** - ratusan chat masuk per hari

### **Behavior:**
- Safety-first, takut data ilang
- WA-native (90% komunikasi via WA)
- Link-averse (prefer langsung chat)
- Trust naik dari bukti nyata & rekomendasi

---

## 💰 MARKET OPPORTUNITY

| Metric | Value |
|--------|-------|
| Total Travel Agent Indonesia | ~500,000+ |
| Yang jualan via WhatsApp | >85% (425,000+) |
| Yang sudah pakai sistem digital | <2% (10,000) |
| **Market Gap Available** | **>98% (490,000 agent)** |
| Average Revenue/Agent/Year | Rp 50 juta - Rp 1 M |
| Willingness to Pay | Rp 99,000 - Rp 499,000/bulan |

**Total Addressable Market (TAM):**
- 490,000 agents × Rp 149,000/bulan × 12 = **Rp 877 Miliar/tahun**
- Capture 0.1% = Rp 877 juta/tahun
- Capture 1% = Rp 8.7 miliar/tahun

---

## 🎯 PRODUCT VISION & GOALS

### **Vision Statement:**
"Sovereign Travel Agent mengubah travel agent Indonesia dari manual chaos menjadi automated profit machine - 100% via WhatsApp"

### **Success Metrics (6 bulan):**
1. **Revenue**: Rp 10 juta/bulan (67 paying users @ Rp 149K)
2. **User Adoption**: 200 travel agents aktif
3. **NPS Score**: >50 (promoters > detractors)

### **Non-Goals (v1 MVP):**
- ❌ Booking maskapai/hotel API integration (manual entry dulu)
- ❌ Mobile app native
- ❌ Multi-language
- ❌ Payment gateway integration

---

## 🏗️ CORE FEATURES MVP (30 HARI)

### **Tier 1 - WA Bot & Customer Management**
**Priority: CRITICAL**

#### 1.1 Customer Database (Jama'ah)
- Add customer via WA / web panel
- Fields: Nama, No HP, Email, Alamat, Paspor, Foto
- Quick search by name/phone
- Customer notes/history

#### 1.2 WhatsApp Auto-Reply Bot
- Keyword triggers:
  - **"INFO"** → Paket tour info
  - **"HARGA"** → Price list
  - **"BOOKING"** → Cara booking
  - **"STATUS"** → Cek status booking
  - **"ADMIN"** → Contact admin
- Webhook receiver untuk incoming messages
- Auto-response dengan template messages

#### 1.3 WhatsApp Blast/Broadcast
- Send promo ke selected customers
- Personalized messages ({nama}, {paket})
- Delay 10-30 detik (anti-ban)
- Schedule broadcast untuk tanggal tertentu

---

### **Tier 2 - Booking & Payment**
**Priority: HIGH**

#### 2.1 Booking Management
- Create booking: Customer + Paket + Tanggal + Harga
- Status: Inquiry → DP → Cicilan → Lunas → Berangkat
- Payment tracking: DP, Cicilan 1, 2, 3, Pelunasan
- Document checklist per booking:
  - ✅ Paspor
  - ✅ Visa
  - ✅ Tiket
  - ✅ Foto 4x6
  - ✅ KTP/KK

#### 2.2 Payment Reminder (Auto WA)
- Reminder H-7 sebelum due date cicilan
- Reminder H-3
- Reminder H-1
- Send receipt setelah payment confirmed

---

### **Tier 3 - Reports & Dashboard**
**Priority: MEDIUM**

#### 3.1 Dashboard Owner
- Total Bookings (Inquiry / DP / Lunas)
- Total Revenue (DP + Cicilan + Pelunasan)
- Outstanding Payments
- Top Selling Packages
- Customer Growth Chart

#### 3.2 Financial Reports
- Daily Transaction Report
- Monthly Revenue Report
- Profit/Loss per Package
- Payment History per Customer

---

## 🔧 TECH STACK

### **Frontend:**
- Hono SSR (server-side HTML rendering)
- TailwindCSS CDN
- Alpine.js (optional light interactivity)
- Mobile-first responsive design

### **Backend:**
- **Framework**: Hono.js
- **Runtime**: Cloudflare Workers/Pages
- **Database**: Supabase (PostgreSQL)
- **WhatsApp**: Fonnte API
- **File Storage**: Cloudflare R2 (for documents)

### **Deployment:**
- **Platform**: Cloudflare Pages
- **CDN**: Global edge network
- **Cost**: ~$0/month (Free tier sufficient for MVP)

---

## 📅 30-DAY MVP ROADMAP TO REVENUE

### **Week 1 (Day 1-7): Foundation**
**Goal: Database + Auth + Basic UI**

**Day 1-2:** Database Schema
```sql
-- agents (travel agent owners)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- customers (jama'ah/travelers)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  passport_number TEXT,
  passport_expire_date DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- packages (tour packages)
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  duration_days INTEGER,
  destination TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  customer_id UUID REFERENCES customers(id),
  package_id UUID REFERENCES packages(id),
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  departure_date DATE,
  total_price DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'inquiry', -- inquiry, dp, installment, paid, departed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(15,2) NOT NULL,
  payment_type TEXT, -- dp, installment_1, installment_2, final
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- wa_messages (log WhatsApp communications)
CREATE TABLE wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  customer_phone TEXT NOT NULL,
  message_type TEXT, -- incoming, outgoing, broadcast
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Day 3-4:** Basic Hono Backend
- Auth (login via phone + PIN)
- CRUD API for customers
- CRUD API for packages
- Health check endpoints

**Day 5-7:** Web UI
- Login page
- Dashboard (simple stats)
- Customer list + add customer
- Package list + add package

**Deliverable:** Working web app with database

---

### **Week 2 (Day 8-14): WhatsApp Integration**
**Goal: WA Bot Live**

**Day 8-9:** Fonnte Setup
- Connect Fonnte device
- Test send message API
- Webhook receiver endpoint
- Log all incoming messages

**Day 10-11:** Auto-Reply Bot
- Keyword parser (INFO, HARGA, BOOKING, STATUS)
- Template responses
- Test with real WhatsApp number

**Day 12-14:** Broadcast Feature
- Select customers UI
- Compose message
- Delayed send (10-30s between messages)
- Send status tracking

**Deliverable:** WA Bot yang bisa auto-reply & broadcast

---

### **Week 3 (Day 15-21): Booking & Payments**
**Goal: Core Business Logic**

**Day 15-17:** Booking Management
- Create booking UI
- Link customer + package
- Set payment schedule
- Document checklist

**Day 18-20:** Payment Tracking
- Record payments (DP, cicilan, pelunasan)
- Outstanding payment list
- Payment reminder system

**Day 21:** Payment Reminder WA
- Auto send reminder H-7, H-3, H-1 before due date
- Cron job via Cloudflare Workers cron triggers

**Deliverable:** Full booking & payment system

---

### **Week 4 (Day 22-30): Reports, Polish & Launch**
**Goal: Revenue-Ready Product**

**Day 22-24:** Reports & Dashboard
- Dashboard stats (bookings, revenue, outstanding)
- Daily/Monthly transaction reports
- Export to Excel

**Day 25-27:** Polish & Testing
- Mobile responsive fixes
- Error handling
- Data validation
- User testing dengan 2-3 travel agents

**Day 28-29:** Documentation & Onboarding
- User guide (screenshot + text)
- Video tutorial (Loom 5 menit)
- WhatsApp onboarding flow

**Day 30:** LAUNCH
- Deploy to production
- Setup custom domain (optional)
- First paying customer! 🎉

---

## 💸 PRICING STRATEGY

### **Free Tier (Forever Free)**
- 10 customers max
- 5 bookings/month
- Basic WA auto-reply
- No broadcast
- Sovereign branding in WA messages

### **Basic - Rp 149,000/bulan**
- 100 customers
- Unlimited bookings
- Full WA auto-reply + broadcast
- Payment reminders
- Reports & exports
- Remove Sovereign branding

### **Pro - Rp 299,000/bulan**
- Unlimited customers & bookings
- Multi-agent (3 sub-accounts)
- Document storage (R2)
- Priority support
- Custom WA templates

### **Revenue Projection:**
| Month | Free Users | Basic Users | Pro Users | MRR | ARR |
|-------|-----------|-------------|-----------|-----|-----|
| M1 | 20 | 5 | 0 | Rp 745K | Rp 8.9M |
| M3 | 50 | 15 | 2 | Rp 2.8M | Rp 33.9M |
| M6 | 100 | 40 | 10 | Rp 8.9M | Rp 107M |
| M12 | 200 | 80 | 25 | Rp 19.4M | Rp 232M |

---

## 🚀 GO-TO-MARKET STRATEGY

### **Phase 1: Validation (Month 1)**
**Goal: 10 paying users**

**Channels:**
1. **WhatsApp Direct Outreach**
   - Join 10 grup WhatsApp travel agent
   - Share success story + screenshot
   - Offer free trial 14 hari

2. **Facebook Groups**
   - Grup "Travel Agent Indonesia"
   - Grup "Umroh Bimbingan"
   - Post case study + demo video

3. **Referral dari existing network**
   - Tanya teman/keluarga yang kenal travel agent
   - Offer first month free

**Conversion Funnel:**
- 100 outreach → 30 reply → 10 trial → 5 paying

---

### **Phase 2: Growth (Month 2-6)**
**Goal: 50 paying users**

**Channels:**
1. **Content Marketing**
   - Blog post: "Cara Manage 100 Jama'ah Tanpa Ribet"
   - YouTube tutorial: Setup Sovereign Travel Agent
   - Instagram: Before/After screenshots

2. **Partnership**
   - Kerjasama dengan komunitas travel agent
   - Offer white-label solution

3. **Paid Ads (if needed)**
   - Facebook Ads target "Travel Agent"
   - Budget: Rp 3 juta/bulan
   - Goal: CAC < Rp 500K (payback < 4 months)

---

### **Phase 3: Scale (Month 7-12)**
**Goal: 100+ paying users**

**Channels:**
1. **Affiliate Program**
   - 20% recurring commission
   - Travel agent refer travel agent

2. **Event Sponsorship**
   - Sponsor seminar umroh/travel
   - Booth di expo travel

3. **SEO & Organic**
   - Rank for "software travel agent"
   - Rank for "sistem umroh"

---

## 🎯 SUCCESS CRITERIA

### **Week 1 Milestone:**
✅ Database live
✅ Basic UI accessible
✅ 1 test user bisa login

### **Week 2 Milestone:**
✅ WA Bot reply keyword "INFO"
✅ Broadcast ke 5 nomor berhasil

### **Week 3 Milestone:**
✅ 1 booking lengkap dicatat
✅ Payment reminder WA terkirim

### **Week 4 Milestone:**
✅ **FIRST PAYING CUSTOMER** 🎉
✅ Revenue: Rp 149,000

### **Month 3 Milestone:**
✅ 15 paying customers
✅ MRR: Rp 2.8 juta
✅ Churn rate < 10%

### **Month 6 Milestone:**
✅ 40 paying customers
✅ MRR: Rp 8.9 juta
✅ Product-market fit validated

---

## 🔥 KEY DIFFERENTIATORS

### **Why Sovereign Travel Agent Wins:**

1. **WA-First, NOT Web-First**
   - Competitors fokus ke web/app
   - Kami fokus ke WhatsApp (where the market is)

2. **Dead Simple, NOT Feature Bloat**
   - Hanya fitur yang BENAR-BENAR dipakai travel agent
   - No booking engine API (nanti aja kalau sudah scale)

3. **Affordable Pricing**
   - Competitor: Rp 500K - 2 juta/bulan
   - Kami: Rp 149K (5x lebih murah)

4. **Indonesian-First**
   - UI/UX sesuai behavior travel agent Indonesia
   - Support Bahasa Indonesia
   - WA templates yang sudah proven

---

## 📞 NEXT ACTION ITEMS

### **Immediate (Hari Ini):**
1. ✅ Setup Supabase project baru ✅ DONE
2. ✅ Setup Fonnte device ✅ DONE
3. ⏳ Create database schema
4. ⏳ Deploy skeleton app ke Cloudflare Pages

### **This Week:**
1. Build basic auth + customer CRUD
2. Test WA bot dengan keyword "INFO"
3. Recruit 3 travel agents untuk early testing

### **This Month:**
1. Complete MVP (semua fitur Tier 1-3)
2. Get 5 paying customers
3. Collect feedback & iterate

---

## 🏆 FINAL WORDS

**"Sovereign Travel Agent adalah tentang EXECUTIONAL EXCELLENCE, bukan idea complexity."**

Key Principles:
1. **Ship fast, iterate faster**
2. **Talk to users every day**
3. **Revenue > Features**
4. **Simple > Complex**
5. **WhatsApp > Everything**

**Target: Rp 10 juta MRR dalam 6 bulan. Feasible? ABSOLUTELY.**

Let's build this empire, Gyss! 🚀👑

---

*Document Version 1.0 | 22 Maret 2026*
*Sovereign Empire Team*
