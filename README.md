# Sovereign Family Transport v3.0

Sistem manajemen rental mobil & transport keluarga berbasis web untuk bisnis di Yogyakarta.

## URLs

- **Production**: https://sovereign-travel-agent.pages.dev
- **GitHub**: https://github.com/ganihypha/Sovereign-travel-fmily
- **Lokasi**: Jl. Wahid Hasyim, Condongcatur, Sleman, DIY 55281
- **WhatsApp**: 085643383832

## Tech Stack

- **Backend**: Hono (TypeScript) on Cloudflare Pages/Workers
- **Database**: Supabase (PostgreSQL)
- **WhatsApp Bot**: Fonnte API
- **Frontend**: Tailwind CSS + Vanilla JS (dark mode glass-morphism UI)
- **Deployment**: Cloudflare Pages

## Fitur Lengkap

### 1. Dashboard
- Total pendapatan & pendapatan bulanan
- Statistik: kendaraan, tersedia, rental aktif, pelanggan, supir, pending, selesai
- Quick actions untuk akses cepat ke semua fitur

### 2. Armada Kendaraan (Fleet Management)
- CRUD kendaraan dengan icon per tipe (MPV, SUV, Minibus, Sedan, Bus, Pickup)
- Data: nama, merk, plat nomor, warna, tahun, kursi, transmisi
- Tarif: harga lepas kunci/hari & harga + supir + BBM/hari
- Toggle status: Tersedia / Disewa
- Auto-update saat rental dibuat/selesai

### 3. Booking Rental
- Pilih pelanggan, kendaraan, supir (opsional)
- Tipe rental: Harian, Per Trip, Antar Jemput Bandara, Tour Wisata, Drop Off Antar Kota
- Input tanggal ambil & kembali, tujuan/rute
- Harga total & DP
- Status flow: PENDING > CONFIRMED > BERJALAN > SELESAI
- Filter rental berdasarkan status

### 4. Manajemen Pelanggan
- CRUD pelanggan dengan search
- Data: nama, WhatsApp, email, alamat, No KTP
- Akses langsung ke WhatsApp pelanggan

### 5. Manajemen Supir
- CRUD supir dengan status availability
- Data: nama, WhatsApp, SIM, masa berlaku, alamat
- Auto-release saat rental selesai/batal

### 6. Sistem Pembayaran
- Catat pembayaran per rental (DP, Pelunasan, Cicilan)
- Metode: Cash, Transfer Bank, E-Wallet
- Tracking total pendapatan di dashboard

### 7. WhatsApp Bot
- Auto-reply berdasarkan keyword
- **INFO** - Info layanan lengkap
- **HARGA** - Tarif rental mobil 2026
- **ARMADA** - Daftar kendaraan
- **BANDARA** - Tarif antar-jemput YIA
- **TOUR** - Paket wisata Jogja (Candi, Kota, Alam)
- **BOOKING** - Cara pemesanan

### 8. Public Price API
- Endpoint `/api/prices` tanpa auth
- Harga lepas kunci, dengan supir, bandara YIA, paket tour

## API Endpoints

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | `/api/health` | No | Health check |
| GET | `/api/prices` | No | Daftar harga publik |
| POST | `/api/auth/login` | No | Login / auto-register |
| GET | `/api/dashboard?agent_id=` | Yes | Dashboard stats |
| GET | `/api/vehicles?agent_id=` | Yes | List kendaraan |
| POST | `/api/vehicles` | Yes | Tambah kendaraan |
| PUT | `/api/vehicles/:id` | Yes | Update kendaraan |
| DELETE | `/api/vehicles/:id` | Yes | Hapus kendaraan |
| GET | `/api/drivers?agent_id=` | Yes | List supir |
| POST | `/api/drivers` | Yes | Tambah supir |
| PUT | `/api/drivers/:id` | Yes | Update supir |
| GET | `/api/customers?agent_id=` | Yes | List pelanggan |
| POST | `/api/customers` | Yes | Tambah pelanggan |
| GET | `/api/rentals?agent_id=` | Yes | List rental |
| POST | `/api/rentals` | Yes | Buat booking |
| PUT | `/api/rentals/:id/status` | Yes | Update status rental |
| GET | `/api/payments?rental_id=` | Yes | List pembayaran |
| POST | `/api/payments` | Yes | Catat pembayaran |
| POST | `/api/wa/send` | Yes | Kirim pesan WA |
| POST | `/api/wa/webhook` | No | Webhook WA masuk |

## Database Schema (Supabase)

| Tabel | Deskripsi |
|-------|-----------|
| `agents` | Owner bisnis transport |
| `vehicles` | Armada kendaraan (type, seats, price, availability) |
| `drivers` | Data supir (SIM, availability, rating) |
| `customers` | Data pelanggan penyewa |
| `rentals` | Booking rental (status, dates, prices) |
| `payments` | Catatan pembayaran |
| `wa_messages` | Log pesan WhatsApp |

## Tarif Rental 2026 (Yogyakarta)

### Lepas Kunci (Tanpa Supir)
| Kendaraan | 12 Jam | 24 Jam |
|-----------|--------|--------|
| Avanza/Xenia | Rp 275.000 | Rp 325.000 |
| Xpander/Ertiga | Rp 300.000 | Rp 350.000 |
| Innova Reborn | Rp 450.000 | Rp 550.000 |
| Fortuner | Rp 900.000 | Rp 1.200.000 |

### Dengan Supir + BBM
| Kendaraan | 12 Jam |
|-----------|--------|
| Avanza/Xenia | Rp 450.000 |
| Innova Reborn | Rp 650.000 |
| Fortuner | Rp 1.200.000 |
| Hiace Commuter (15 seat) | Rp 1.300.000 |
| Hiace Premio (14 seat) | Rp 1.500.000 |

### Antar Jemput Bandara YIA
| Kendaraan | Max Pax | Harga |
|-----------|---------|-------|
| Avanza/Xenia | 5 | Rp 200.000 |
| Innova Reborn | 5 | Rp 300.000 |
| Hiace | 14 | Rp 500.000 |

## Deployment Status

- **Platform**: Cloudflare Pages
- **Status**: LIVE
- **Build**: Vite SSR + Hono
- **Last Updated**: 2026-03-22

## Quick Start

1. Buka https://sovereign-travel-agent.pages.dev
2. Login dengan nomor WhatsApp (auto-register)
3. Tambah armada kendaraan di tab Armada
4. Tambah data supir di tab Supir
5. Buat booking rental baru di tab Rental
6. Pantau pendapatan di Dashboard

## Development

```bash
npm install
npm run build
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```
