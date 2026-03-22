# 🚀 SOVEREIGN TRAVEL AGENT - Setup Instructions

## ✅ Status Saat Ini
- ✅ GitHub: https://github.com/ganihypha/Sovereign-travel-fmily
- ✅ Cloudflare Pages: https://sovereign-travel-agent.pages.dev
- ✅ Supabase Project: bkcvrpcunyjgetpkoyjx
- ✅ Fonnte WhatsApp: 085643383832 (Connected)
- ✅ PWA Full Features: Dashboard, Customers, Bookings, Packages

## 📋 Langkah Setup Lengkap

### 1️⃣ Setup Database Supabase (PENTING!)

**Langkah:**
1. Buka: https://supabase.com/dashboard/project/bkcvrpcunyjgetpkoyjx
2. Pilih menu **SQL Editor** di sidebar kiri
3. Klik **New Query**
4. Salin **seluruh isi file `schema.sql`** yang ada di folder ini
5. Paste ke SQL Editor
6. Klik tombol **RUN** (atau tekan Ctrl/Cmd + Enter)
7. Tunggu sampai muncul notifikasi "Success"

**Cek Hasil:**
- Buka menu **Table Editor** di Supabase
- Pastikan ada 8 tabel: agents, customers, packages, bookings, payments, documents, wa_messages, reminders
- ✅ Database siap digunakan!

### 2️⃣ Setup Webhook Fonnte WhatsApp

**Langkah:**
1. Login ke: https://fonnte.com/login
2. Pilih device **085643383832**
3. Masuk ke menu **Webhook Settings**
4. Isi webhook URL dengan:
   ```
   https://sovereign-travel-agent.pages.dev/api/wa/webhook
   ```
5. **Save** perubahan
6. Test webhook dengan mengirim pesan ke nomor 085643383832

**Keyword WhatsApp yang Aktif:**
- `INFO` - Informasi umum tentang paket tour
- `HARGA` - Cek harga paket
- `BOOKING` - Cara booking
- `STATUS` - Cek status booking

### 3️⃣ Setup Cloudflare R2 Storage (Opsional)

Jika ingin simpan foto jama'ah/dokumen di Cloudflare R2:

1. Login ke Cloudflare Dashboard
2. Buka menu **R2 Object Storage**
3. Buat bucket baru: `sovereign-travel-agent`
4. Copy bucket URL dan masukkan ke environment variables

### 4️⃣ Setup ScraperAPI (Opsional)

Jika ingin scraping data harga tiket/hotel:

1. Login ke: https://scraperapi.com
2. Copy API Key: `abbea25987be4ae29c8fe7f4ee0d1ea7`
3. Sudah dikonfigurasi di `.dev.vars`

### 5️⃣ Local Development

```bash
cd /home/user/webapp

# Install dependencies (jika belum)
npm install

# Start local dev server
npm run dev

# Buka http://localhost:3000
```

### 6️⃣ Deploy ke Production

```bash
# Build project
npm run build

# Deploy ke Cloudflare Pages
npm run deploy

# Atau manual:
npx wrangler pages deploy dist --project-name sovereign-travel-agent
```

### 7️⃣ Update Secrets di Cloudflare (Jika Ada Perubahan)

```bash
export CLOUDFLARE_API_TOKEN="yvImquSdjXBLj1gS4mij0vIWBqg4771HdHAP_mbD"

# Update Supabase URL
npx wrangler pages secret put SUPABASE_URL --project-name sovereign-travel-agent
# Isi: https://bkcvrpcunyjgetpkoyjx.supabase.co

# Update Supabase Anon Key
npx wrangler pages secret put SUPABASE_ANON_KEY --project-name sovereign-travel-agent

# Update Supabase Service Key
npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name sovereign-travel-agent

# Update Fonnte Token
npx wrangler pages secret put FONNTE_TOKEN --project-name sovereign-travel-agent
# Isi: 5yTiZ2yYK2SCtM9KsVeV
```

## 🔐 Kredensial yang Sudah Dikonfigurasi

⚠️ **SECURITY NOTE**: Kredensial disimpan di file `.dev.vars` (sudah ada di `.gitignore`, tidak akan di-push ke GitHub)

### GitHub
- **Repo**: https://github.com/ganihypha/Sovereign-travel-fmily
- **Token**: Lihat file `.dev.vars` atau credentials manager Anda

### Cloudflare
- **Account ID**: Lihat file `.dev.vars`
- **Project**: sovereign-travel-agent
- **URL Production**: https://sovereign-travel-agent.pages.dev

### Supabase
- **Project URL**: https://bkcvrpcunyjgetpkoyjx.supabase.co
- **Keys**: Lihat file `.dev.vars` (SUPABASE_ANON_KEY dan SUPABASE_SERVICE_KEY)

### Fonnte WhatsApp
- **Device**: 085643383832
- **Token**: Lihat file `.dev.vars` (FONNTE_TOKEN)
- **Status**: ✅ Connected

### ScraperAPI
- **API Key**: Lihat file `.dev.vars` (SCRAPERAPI_KEY)

**📌 Cara melihat credentials:**
```bash
cat .dev.vars
```

## 📱 Testing PWA

1. **Buka URL Production**: https://sovereign-travel-agent.pages.dev
2. **Install PWA**:
   - Chrome/Edge: Klik icon install di address bar
   - Safari iOS: Share > Add to Home Screen
3. **Test Features**:
   - Dashboard (total statistik)
   - Kelola Customers (CRUD)
   - Kelola Bookings (tambah/edit/hapus)
   - Kelola Packages (paket tour)
   - WhatsApp integration

## 🎯 Next Steps (Roadmap MVP to Revenue)

### Week 1: Core Setup ✅
- [x] Database schema
- [x] PWA frontend
- [x] GitHub setup
- [x] Cloudflare deployment
- [ ] **Apply database schema ke Supabase** ⚠️
- [ ] **Setup webhook Fonnte** ⚠️

### Week 2: WhatsApp Bot
- [ ] Implement keyword handler (INFO, HARGA, BOOKING, STATUS)
- [ ] Auto-reply system
- [ ] Save incoming messages to database
- [ ] Link messages to customers

### Week 3: Booking Flow
- [ ] Customer registration flow via WhatsApp
- [ ] Package selection
- [ ] Payment tracking (DP, Installment, Full)
- [ ] Send automatic reminders

### Week 4: Launch & First Customer
- [ ] Polish UI/UX
- [ ] Test end-to-end flow
- [ ] Marketing materials
- [ ] Acquire first paying customer (Rp 149K)

### Month 2-3: Scale to 5-15 customers
- [ ] Add broadcast features
- [ ] Payment gateway integration
- [ ] Customer dashboard improvements
- [ ] Referral program

## 💰 Revenue Targets
- **Week 4**: 1 customer × Rp 149K = **Rp 149K**
- **Month 1**: 5 customers × Rp 149K = **Rp 745K MRR**
- **Month 3**: 15 customers × Rp 187K = **Rp 2.8M MRR**
- **Month 6**: 40 customers × Rp 223K = **Rp 8.9M MRR**
- **Month 12**: 80 customers × Rp 243K = **Rp 19.4M MRR**

## 📚 Documentation
- **README.md**: Project overview
- **ROADMAP_MVP_TO_REVENUE.md**: Full 12-month plan
- **schema.sql**: Complete database schema
- **SETUP_INSTRUCTIONS.md**: This file

## ⚠️ IMPORTANT: Langkah Selanjutnya
1. ✅ Baca file ini lengkap
2. ⚠️ **APPLY schema.sql ke Supabase** (paling penting!)
3. ⚠️ **Setup webhook di Fonnte dashboard**
4. ✅ Test PWA di production
5. 🚀 Lanjut Week 2: Build WhatsApp Bot

---
**Update**: 2026-03-22
**Status**: Foundation Ready ✅ | Database Pending ⚠️
**Next**: Apply schema.sql to Supabase
