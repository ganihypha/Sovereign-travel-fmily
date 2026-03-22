// ============================================
// SOVEREIGN FAMILY TRANSPORT v3.0
// Rental Mobil & Transport Keluarga Yogyakarta
// Jl. Wahid Hasyim, Condongcatur, Sleman, DIY
// Stack: Hono + Cloudflare Pages + Supabase + Fonnte
// ============================================

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_KEY: string
  FONNTE_TOKEN: string
  FONNTE_DEVICE: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('/api/*', cors())

const getSupabase = (c: any) => {
  const url = c.env.SUPABASE_URL
  const key = c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key)
}

// ============================================
// API: Health Check
// ============================================
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'Sovereign Family Transport v3.0',
    timestamp: new Date().toISOString(),
    supabase_configured: !!(c.env.SUPABASE_URL && (c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY))
  })
})

// ============================================
// API: Auth (Login / Auto Register)
// ============================================
app.post('/api/auth/login', async (c) => {
  try {
    const sb = getSupabase(c)
    const { phone } = await c.req.json()
    if (!phone) return c.json({ error: 'Nomor HP wajib diisi' }, 400)
    let { data: agent, error: selErr } = await sb.from('agents').select('*').eq('phone', phone).single()
    if (selErr && selErr.code !== 'PGRST116') return c.json({ error: 'Database error: ' + selErr.message }, 500)
    if (!agent) {
      const { data: newAgent, error: insErr } = await sb.from('agents').insert({
        phone,
        name: 'Owner ' + phone.slice(-4),
        business_name: 'Sovereign Family Transport',
        address: 'Jl. Wahid Hasyim, Condongcatur, Sleman, DIY',
        city: 'Yogyakarta'
      }).select().single()
      if (insErr) return c.json({ error: 'Gagal daftar: ' + insErr.message }, 500)
      agent = newAgent
    }
    return c.json({ id: agent.id, name: agent.name, phone: agent.phone, business_name: agent.business_name, city: agent.city })
  } catch (err: any) { return c.json({ error: err.message || 'Login error' }, 500) }
})

// ============================================
// API: Vehicles CRUD
// ============================================
app.get('/api/vehicles', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')
    const { data, error } = await sb.from('vehicles').select('*').eq('agent_id', agent_id).order('created_at', { ascending: false })
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.post('/api/vehicles', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('vehicles').insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.put('/api/vehicles/:id', async (c) => {
  try {
    const sb = getSupabase(c)
    const id = c.req.param('id')
    const body = await c.req.json()
    const { data, error } = await sb.from('vehicles').update(body).eq('id', id).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.delete('/api/vehicles/:id', async (c) => {
  try {
    const sb = getSupabase(c)
    const id = c.req.param('id')
    const { error } = await sb.from('vehicles').delete().eq('id', id)
    if (error) return c.json({ error: error.message }, 500)
    return c.json({ success: true })
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

// ============================================
// API: Drivers CRUD
// ============================================
app.get('/api/drivers', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')
    const { data, error } = await sb.from('drivers').select('*').eq('agent_id', agent_id).order('name')
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.post('/api/drivers', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('drivers').insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.put('/api/drivers/:id', async (c) => {
  try {
    const sb = getSupabase(c)
    const id = c.req.param('id')
    const body = await c.req.json()
    const { data, error } = await sb.from('drivers').update(body).eq('id', id).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

// ============================================
// API: Customers CRUD
// ============================================
app.get('/api/customers', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')
    const { data, error } = await sb.from('customers').select('*').eq('agent_id', agent_id).order('created_at', { ascending: false })
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.post('/api/customers', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('customers').insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

// ============================================
// API: Rentals CRUD
// ============================================
app.get('/api/rentals', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')
    const { data, error } = await sb.from('rentals').select('*, customer:customers(name, phone), vehicle:vehicles(name, brand, plate_number, seats, type), driver:drivers(name, phone)').eq('agent_id', agent_id).order('pickup_date', { ascending: false })
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.post('/api/rentals', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('rentals').insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    // If rental has a vehicle, set vehicle unavailable
    if (body.vehicle_id) {
      await sb.from('vehicles').update({ is_available: false }).eq('id', body.vehicle_id)
    }
    if (body.driver_id) {
      await sb.from('drivers').update({ is_available: false }).eq('id', body.driver_id)
    }
    return c.json(data)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.put('/api/rentals/:id/status', async (c) => {
  try {
    const sb = getSupabase(c)
    const id = c.req.param('id')
    const { status } = await c.req.json()
    // Get rental data first
    const { data: rental } = await sb.from('rentals').select('vehicle_id, driver_id').eq('id', id).single()
    const { data, error } = await sb.from('rentals').update({ status }).eq('id', id).select().single()
    if (error) return c.json({ error: error.message }, 500)
    // If rental completed/cancelled, release vehicle & driver
    if ((status === 'selesai' || status === 'batal') && rental) {
      if (rental.vehicle_id) await sb.from('vehicles').update({ is_available: true }).eq('id', rental.vehicle_id)
      if (rental.driver_id) await sb.from('drivers').update({ is_available: true }).eq('id', rental.driver_id)
    }
    return c.json(data)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

// ============================================
// API: Payments
// ============================================
app.get('/api/payments', async (c) => {
  try {
    const sb = getSupabase(c)
    const rental_id = c.req.query('rental_id')
    const { data, error } = await sb.from('payments').select('*').eq('rental_id', rental_id).order('created_at', { ascending: false })
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.post('/api/payments', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('payments').insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

// ============================================
// API: Dashboard Stats
// ============================================
app.get('/api/dashboard', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')
    const [vehiclesRes, driversRes, customersRes, rentalsRes, paymentsRes] = await Promise.all([
      sb.from('vehicles').select('is_available, type, price_per_day').eq('agent_id', agent_id),
      sb.from('drivers').select('is_available').eq('agent_id', agent_id),
      sb.from('customers').select('*', { count: 'exact', head: true }).eq('agent_id', agent_id),
      sb.from('rentals').select('status, total_price, rental_type, pickup_date, created_at').eq('agent_id', agent_id),
      sb.from('payments').select('amount, payment_type, created_at')
    ])
    const vehicles = vehiclesRes.data || []
    const drivers = driversRes.data || []
    const rentals = rentalsRes.data || []
    const payments = paymentsRes.data || []
    const revenue = payments.reduce((s: number, p: any) => s + parseFloat(p.amount || 0), 0)
    const thisMonth = new Date().toISOString().slice(0, 7)
    const monthlyRevenue = payments.filter((p: any) => (p.created_at || '').startsWith(thisMonth)).reduce((s: number, p: any) => s + parseFloat(p.amount || 0), 0)
    return c.json({
      total_vehicles: vehicles.length,
      available_vehicles: vehicles.filter((v: any) => v.is_available).length,
      total_drivers: drivers.length,
      available_drivers: drivers.filter((d: any) => d.is_available).length,
      total_customers: customersRes.count || 0,
      total_rentals: rentals.length,
      active_rentals: rentals.filter((r: any) => r.status === 'berjalan' || r.status === 'confirmed').length,
      pending_rentals: rentals.filter((r: any) => r.status === 'pending').length,
      completed_rentals: rentals.filter((r: any) => r.status === 'selesai').length,
      cancelled_rentals: rentals.filter((r: any) => r.status === 'batal').length,
      revenue: revenue,
      monthly_revenue: monthlyRevenue,
      by_type: {
        mpv: vehicles.filter((v: any) => v.type === 'mpv').length,
        suv: vehicles.filter((v: any) => v.type === 'suv').length,
        minibus: vehicles.filter((v: any) => v.type === 'minibus').length,
        other: vehicles.filter((v: any) => !['mpv','suv','minibus'].includes(v.type)).length
      }
    })
  } catch (err: any) {
    return c.json({ total_vehicles: 0, available_vehicles: 0, total_drivers: 0, available_drivers: 0, total_customers: 0, total_rentals: 0, active_rentals: 0, pending_rentals: 0, completed_rentals: 0, cancelled_rentals: 0, revenue: 0, monthly_revenue: 0, by_type: { mpv: 0, suv: 0, minibus: 0, other: 0 }, error: err.message })
  }
})

// ============================================
// API: WhatsApp (Fonnte)
// ============================================
app.post('/api/wa/send', async (c) => {
  try {
    const { target, message } = await c.req.json()
    const token = c.env.FONNTE_TOKEN
    if (!token) return c.json({ error: 'Fonnte token not configured' }, 500)
    const formData = new URLSearchParams()
    formData.append('target', target)
    formData.append('message', message)
    formData.append('countryCode', '62')
    const response = await fetch('https://api.fonnte.com/send', { method: 'POST', headers: { 'Authorization': token }, body: formData })
    const result = await response.json()
    // Log to wa_messages
    try {
      const sb = getSupabase(c)
      await sb.from('wa_messages').insert({ customer_phone: target, message_type: 'outgoing', message: message, status: 'sent' })
    } catch (e) {}
    return c.json(result)
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

app.post('/api/wa/webhook', async (c) => {
  try {
    const body = await c.req.json()
    const { sender, message } = body
    const token = c.env.FONNTE_TOKEN
    const upperMsg = (message || '').trim().toUpperCase()
    let reply = ''

    if (upperMsg === 'INFO' || upperMsg === 'HALO' || upperMsg === 'HI' || upperMsg === 'HELLO') {
      reply = [
        '*SOVEREIGN FAMILY TRANSPORT*',
        'Jl. Wahid Hasyim, Condongcatur, Sleman, Yogyakarta',
        '',
        'Layanan kami:',
        'Rental Mobil (Lepas Kunci / Dengan Supir)',
        'Antar Jemput Bandara YIA',
        'Tour Jogja & Sekitarnya',
        'Drop Off Antar Kota (Solo, Semarang, dll)',
        'Carter Harian & Mingguan',
        '',
        'Ketik HARGA untuk info tarif',
        'Ketik ARMADA untuk lihat kendaraan',
        'Ketik BANDARA untuk tarif antar-jemput YIA',
        'Ketik TOUR untuk paket wisata'
      ].join('\n')
    } else if (upperMsg === 'HARGA' || upperMsg === 'TARIF' || upperMsg === 'PRICE') {
      reply = [
        '*TARIF RENTAL MOBIL 2026*',
        '',
        '*Lepas Kunci (tanpa supir):*',
        'Avanza/Xenia - Rp 275rb/12jam | Rp 325rb/24jam',
        'Xpander/Ertiga - Rp 300rb/12jam | Rp 350rb/24jam',
        'Innova Reborn - Rp 450rb/12jam | Rp 550rb/24jam',
        'Fortuner - Rp 900rb/12jam | Rp 1.2jt/24jam',
        '',
        '*Dengan Supir + BBM:*',
        'Avanza/Xenia - Rp 450rb/12jam',
        'Innova Reborn - Rp 650rb/12jam',
        'Hiace Commuter (15 seat) - Rp 1.3jt/12jam',
        'Hiace Premio (14 seat) - Rp 1.5jt/12jam',
        '',
        '*Sudah termasuk:* Supir, BBM dalam kota, air mineral',
        '*Belum termasuk:* BBM luar kota, parkir, tol, makan supir',
        '',
        'Ketik BOOKING untuk pesan'
      ].join('\n')
    } else if (upperMsg === 'ARMADA' || upperMsg === 'MOBIL' || upperMsg === 'FLEET') {
      reply = [
        '*ARMADA KAMI*',
        '',
        '1. Toyota Avanza (7 seat) - Manual/Matic',
        '2. Daihatsu Xenia (7 seat) - Manual/Matic',
        '3. Mitsubishi Xpander (7 seat) - Matic',
        '4. Suzuki Ertiga (7 seat) - Matic',
        '5. Toyota Innova Reborn (7 seat) - Matic',
        '6. Toyota Fortuner (7 seat) - Matic',
        '7. Toyota Hiace Commuter (15 seat)',
        '8. Toyota Hiace Premio (14 seat)',
        '',
        'Semua kendaraan terawat, AC dingin, bersih & wangi',
        'Asuransi lengkap & ban cadangan',
        '',
        'Ketik HARGA untuk tarif | BOOKING untuk pesan'
      ].join('\n')
    } else if (upperMsg === 'BANDARA' || upperMsg === 'YIA' || upperMsg === 'AIRPORT') {
      reply = [
        '*ANTAR JEMPUT BANDARA YIA*',
        '',
        'Avanza/Xenia (max 5 org) - Rp 200rb',
        'Innova Reborn (max 5 org) - Rp 300rb',
        'Hiace (max 14 org) - Rp 500rb',
        '',
        '*Termasuk:* Mobil, supir, BBM, parkir bandara',
        '*Area:* Kota Jogja, Sleman, Bantul',
        '*24 Jam* - Penjemputan kapan saja',
        '',
        'Info: Waktu tempuh YIA ke Kota Jogja sekitar 45-60 menit',
        '',
        'Ketik BOOKING untuk pesan'
      ].join('\n')
    } else if (upperMsg === 'TOUR' || upperMsg === 'WISATA' || upperMsg === 'PAKET') {
      reply = [
        '*PAKET TOUR JOGJA*',
        '',
        '*Tour A - Candi (12 jam):*',
        'Borobudur + Prambanan + Ratu Boko',
        'Avanza: Rp 550rb | Innova: Rp 750rb',
        '',
        '*Tour B - Kota (12 jam):*',
        'Malioboro + Keraton + Taman Sari + Kotagede',
        'Avanza: Rp 450rb | Innova: Rp 650rb',
        '',
        '*Tour C - Alam (12 jam):*',
        'Kalibiru + Waduk Sermo + Pantai Parangtritis',
        'Avanza: Rp 500rb | Innova: Rp 700rb',
        '',
        '*Sudah termasuk:* Mobil + Supir + BBM',
        '*Belum termasuk:* Tiket wisata, parkir, makan',
        '',
        'Ketik BOOKING untuk pesan'
      ].join('\n')
    } else if (upperMsg === 'BOOKING' || upperMsg === 'PESAN' || upperMsg === 'SEWA' || upperMsg === 'ORDER') {
      reply = [
        '*CARA BOOKING*',
        '',
        '1. Buka: https://sovereign-travel-agent.pages.dev',
        '2. Login dengan nomor WA Anda',
        '3. Pilih kendaraan & tanggal',
        '',
        'Atau langsung hubungi:',
        '085643383832',
        '',
        'Info yang dibutuhkan:',
        '- Tanggal & jam penjemputan',
        '- Tujuan / rute',
        '- Jumlah penumpang',
        '- Dengan/tanpa supir',
        '- Durasi sewa',
        '',
        'Kami siap melayani!'
      ].join('\n')
    } else {
      reply = [
        'Halo! Selamat datang di *Sovereign Family Transport*',
        'Rental Mobil & Transport Keluarga Yogyakarta',
        '',
        'Ketik salah satu:',
        'INFO - Info layanan lengkap',
        'HARGA - Tarif rental mobil',
        'ARMADA - Daftar kendaraan',
        'BANDARA - Tarif antar-jemput YIA',
        'TOUR - Paket wisata Jogja',
        'BOOKING - Cara pemesanan'
      ].join('\n')
    }

    if (reply && token) {
      const formData = new URLSearchParams()
      formData.append('target', sender)
      formData.append('message', reply)
      formData.append('countryCode', '62')
      await fetch('https://api.fonnte.com/send', { method: 'POST', headers: { 'Authorization': token }, body: formData })
    }
    // Log incoming message
    try {
      const sb = getSupabase(c)
      await sb.from('wa_messages').insert({ customer_phone: sender, message_type: 'incoming', message: message, status: 'received' })
    } catch (e) {}
    return c.json({ status: true })
  } catch (err: any) { return c.json({ error: err.message }, 500) }
})

// ============================================
// API: Public Price List (no auth needed)
// ============================================
app.get('/api/prices', (c) => {
  return c.json({
    lepas_kunci: [
      { name: 'Avanza/Xenia', seats: 7, price_12h: 275000, price_24h: 325000, type: 'mpv' },
      { name: 'Xpander/Ertiga', seats: 7, price_12h: 300000, price_24h: 350000, type: 'mpv' },
      { name: 'Innova Reborn', seats: 7, price_12h: 450000, price_24h: 550000, type: 'mpv' },
      { name: 'Fortuner', seats: 7, price_12h: 900000, price_24h: 1200000, type: 'suv' }
    ],
    dengan_supir: [
      { name: 'Avanza/Xenia', seats: 7, price_12h: 450000, includes: 'Supir+BBM', type: 'mpv' },
      { name: 'Innova Reborn', seats: 7, price_12h: 650000, includes: 'Supir+BBM', type: 'mpv' },
      { name: 'Fortuner', seats: 7, price_12h: 1200000, includes: 'Supir+BBM', type: 'suv' },
      { name: 'Hiace Commuter', seats: 15, price_12h: 1300000, includes: 'Supir+BBM', type: 'minibus' },
      { name: 'Hiace Premio', seats: 14, price_12h: 1500000, includes: 'Supir+BBM', type: 'minibus' }
    ],
    bandara_yia: [
      { name: 'Avanza/Xenia', max_pax: 5, price: 200000 },
      { name: 'Innova Reborn', max_pax: 5, price: 300000 },
      { name: 'Hiace', max_pax: 14, price: 500000 }
    ],
    tour_packages: [
      { name: 'Tour Candi', desc: 'Borobudur + Prambanan + Ratu Boko', duration: '12 jam', price_avanza: 550000, price_innova: 750000 },
      { name: 'Tour Kota', desc: 'Malioboro + Keraton + Taman Sari', duration: '12 jam', price_avanza: 450000, price_innova: 650000 },
      { name: 'Tour Alam', desc: 'Kalibiru + Waduk Sermo + Parangtritis', duration: '12 jam', price_avanza: 500000, price_innova: 700000 }
    ]
  })
})

// ============================================
// MAIN WEB APP - Complete Redesign v3.0
// ============================================
app.get('/', (c) => { return c.html(getAppHTML()) })

function getAppHTML(): string {
  return '<!DOCTYPE html>' +
'<html lang="id">' +
'<head>' +
'<meta charset="UTF-8">' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' +
'<title>Sovereign Family Transport - Rental Mobil Jogja</title>' +
'<meta name="description" content="Rental Mobil & Transport Keluarga Yogyakarta. Lepas kunci, dengan supir, antar jemput bandara YIA, tour wisata Jogja.">' +
'<meta name="theme-color" content="#0f172a">' +
'<script src="https://cdn.tailwindcss.com"></script>' +
'<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet">' +
'<script>tailwind.config={theme:{extend:{colors:{brand:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a"},dark:{800:"#1e293b",900:"#0f172a"}}}}}</script>' +
'<style>' +
'*{-webkit-tap-highlight-color:transparent;box-sizing:border-box}' +
'body{overscroll-behavior-y:none;margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#0f172a}' +
'.anim-up{animation:slideUp .4s cubic-bezier(.4,0,.2,1)}' +
'@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}' +
'.anim-fade{animation:fadeIn .3s ease-out}' +
'@keyframes fadeIn{from{opacity:0}to{opacity:1}}' +
'.anim-out{animation:fadeOut .3s ease-out forwards}' +
'@keyframes fadeOut{to{opacity:0;visibility:hidden}}' +
'.glass{background:rgba(30,41,59,.8);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1)}' +
'.card{background:rgba(30,41,59,.6);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:16px;transition:all .2s}' +
'.card:hover{border-color:rgba(59,130,246,.3);transform:translateY(-1px)}' +
'.stat-card{background:linear-gradient(135deg,rgba(59,130,246,.15),rgba(59,130,246,.05));border:1px solid rgba(59,130,246,.2);border-radius:16px}' +
'.btn-primary{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;border:none;border-radius:12px;font-weight:600;transition:all .2s;cursor:pointer}' +
'.btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(37,99,235,.4)}' +
'.btn-primary:active{transform:translateY(0)}' +
'.btn-ghost{background:rgba(255,255,255,.05);color:#94a3b8;border:1px solid rgba(255,255,255,.1);border-radius:12px;font-weight:500;transition:all .2s;cursor:pointer}' +
'.btn-ghost:hover{background:rgba(255,255,255,.1);color:white}' +
'.input-dark{background:rgba(15,23,42,.6);border:1px solid rgba(255,255,255,.1);color:white;border-radius:12px;padding:12px 16px;width:100%;transition:all .2s;font-size:15px}' +
'.input-dark:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.2)}' +
'.input-dark::placeholder{color:#475569}' +
'.select-dark{background:rgba(15,23,42,.6);border:1px solid rgba(255,255,255,.1);color:white;border-radius:12px;padding:12px 16px;width:100%;font-size:15px;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E");background-position:right 12px center;background-repeat:no-repeat;background-size:16px}' +
'.select-dark:focus{outline:none;border-color:#3b82f6}' +
'select.select-dark option{background:#1e293b;color:white}' +
'.tab-bar{display:flex;gap:4px;padding:4px;background:rgba(15,23,42,.6);border-radius:14px;border:1px solid rgba(255,255,255,.06)}' +
'.tab-btn{flex:1;padding:10px 4px;border-radius:10px;font-size:11px;font-weight:600;color:#64748b;background:transparent;border:none;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:4px}' +
'.tab-btn.active{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;box-shadow:0 2px 10px rgba(37,99,235,.3)}' +
'.tab-btn i{font-size:16px}' +
'.badge{display:inline-flex;align-items:center;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600}' +
'.badge-green{background:rgba(34,197,94,.15);color:#4ade80}' +
'.badge-yellow{background:rgba(234,179,8,.15);color:#facc15}' +
'.badge-blue{background:rgba(59,130,246,.15);color:#60a5fa}' +
'.badge-red{background:rgba(239,68,68,.15);color:#f87171}' +
'.badge-gray{background:rgba(148,163,184,.15);color:#94a3b8}' +
'.badge-purple{background:rgba(168,85,247,.15);color:#c084fc}' +
'.modal-sheet{position:fixed;inset:0;z-index:100;display:none}' +
'.modal-sheet.open{display:flex}' +
'.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}' +
'.modal-content{position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:#1e293b;border-radius:24px 24px 0 0;padding:24px;max-height:90vh;overflow-y:auto;z-index:101;border:1px solid rgba(255,255,255,.1);border-bottom:none}' +
'.modal-content::-webkit-scrollbar{width:4px}' +
'.modal-content::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}' +
'.modal-handle{width:40px;height:4px;background:#475569;border-radius:4px;margin:0 auto 20px}' +
'.empty-state{text-align:center;padding:48px 24px;color:#475569}' +
'.empty-state i{font-size:48px;margin-bottom:16px;opacity:.5}' +
'.pulse{animation:pulse 2s infinite}' +
'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}' +
'.price-tag{background:linear-gradient(135deg,rgba(34,197,94,.15),rgba(34,197,94,.05));border:1px solid rgba(34,197,94,.2);color:#4ade80;padding:4px 12px;border-radius:20px;font-weight:700;font-size:13px}' +
'.vehicle-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px}' +
'.vi-mpv{background:rgba(59,130,246,.15);color:#60a5fa}' +
'.vi-suv{background:rgba(168,85,247,.15);color:#c084fc}' +
'.vi-minibus{background:rgba(234,179,8,.15);color:#facc15}' +
'.vi-sedan{background:rgba(34,197,94,.15);color:#4ade80}' +
'.vi-bus{background:rgba(239,68,68,.15);color:#f87171}' +
'.vi-pickup{background:rgba(249,115,22,.15);color:#fb923c}' +
'::-webkit-scrollbar{width:6px}' +
'::-webkit-scrollbar-track{background:transparent}' +
'::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}' +
'</style>' +
'</head>' +
'<body class="bg-dark-900 text-white">' +
'<div id="app" class="max-w-md mx-auto min-h-screen relative">' +

// SPLASH SCREEN
'<div id="splash" class="fixed inset-0 z-50 flex items-center justify-center" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#0f172a 100%)">' +
'<div class="text-center">' +
'<div class="relative mb-6">' +
'<div class="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center" style="background:linear-gradient(135deg,#2563eb,#7c3aed)">' +
'<i class="fas fa-car-side text-4xl text-white"></i>' +
'</div>' +
'<div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-dark-900" style="right:calc(50% - 52px)">' +
'<i class="fas fa-check text-xs"></i>' +
'</div>' +
'</div>' +
'<h1 class="text-2xl font-bold mb-1">Sovereign Transport</h1>' +
'<p class="text-blue-300 text-sm mb-1">Rental Mobil & Family Transport</p>' +
'<p class="text-slate-500 text-xs">Condongcatur, Sleman, Yogyakarta</p>' +
'<div class="mt-6 w-48 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">' +
'<div id="splashBar" class="h-full rounded-full transition-all duration-300" style="width:0%;background:linear-gradient(90deg,#2563eb,#7c3aed)"></div>' +
'</div>' +
'</div>' +
'</div>' +

// LOGIN PAGE
'<div id="loginPage" class="hidden min-h-screen flex flex-col justify-center p-6 anim-fade">' +
'<div class="text-center mb-8">' +
'<div class="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4" style="background:linear-gradient(135deg,#2563eb,#7c3aed)">' +
'<i class="fas fa-car-side text-3xl"></i>' +
'</div>' +
'<h1 class="text-2xl font-bold mb-1">Sovereign Transport</h1>' +
'<p class="text-slate-400 text-sm">Rental Mobil & Family Transport</p>' +
'<p class="text-slate-600 text-xs mt-1"><i class="fas fa-map-marker-alt mr-1"></i>Condongcatur, Sleman, Yogyakarta</p>' +
'</div>' +
'<div class="card p-6">' +
'<h2 class="text-lg font-bold mb-1">Masuk</h2>' +
'<p class="text-slate-400 text-xs mb-5">Login dengan nomor WhatsApp Anda</p>' +
'<div class="mb-3 relative">' +
'<i class="fab fa-whatsapp absolute left-4 top-1/2 -translate-y-1/2 text-green-500"></i>' +
'<input type="tel" id="loginPhone" class="input-dark pl-11" placeholder="08xxxxxxxxxx">' +
'</div>' +
'<button onclick="doLogin()" id="loginBtn" class="btn-primary w-full py-3.5 text-sm">' +
'<i class="fas fa-arrow-right mr-2"></i>Masuk / Daftar Otomatis' +
'</button>' +
'<div id="loginError" class="hidden mt-3 p-3 rounded-xl text-sm" style="background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2)"></div>' +
'</div>' +
'<p class="text-center mt-4 text-xs text-slate-600">Pertama kali? Akun otomatis terdaftar.</p>' +
'<div class="mt-8 text-center">' +
'<a href="https://wa.me/6285643383832" target="_blank" class="inline-flex items-center gap-2 text-green-400 text-sm hover:text-green-300">' +
'<i class="fab fa-whatsapp text-lg"></i>Chat WhatsApp Kami' +
'</a>' +
'</div>' +
'</div>' +

// MAIN APP
'<div id="mainApp" class="hidden min-h-screen pb-28">' +

// HEADER
'<div class="glass sticky top-0 z-30 px-4 py-3">' +
'<div class="flex items-center justify-between">' +
'<div class="flex items-center gap-3">' +
'<div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#2563eb,#7c3aed)">' +
'<i class="fas fa-car-side text-sm"></i>' +
'</div>' +
'<div>' +
'<h1 class="text-sm font-bold leading-tight" id="headerName">Sovereign Transport</h1>' +
'<p class="text-xs text-slate-400" id="headerPhone"></p>' +
'</div>' +
'</div>' +
'<div class="flex items-center gap-2">' +
'<a href="https://wa.me/6285643383832" target="_blank" class="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10 text-green-400 hover:bg-green-500/20"><i class="fab fa-whatsapp"></i></a>' +
'<button onclick="doLogout()" class="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20"><i class="fas fa-sign-out-alt text-sm"></i></button>' +
'</div>' +
'</div>' +
'</div>' +

// TAB CONTENT AREA
'<div class="px-4 pt-4">' +

// DASHBOARD
'<div id="page-dashboard" class="anim-up">' +
'<div class="flex items-center justify-between mb-4">' +
'<div><h2 class="text-xl font-bold">Dashboard</h2><p class="text-xs text-slate-500">Overview bisnis Anda</p></div>' +
'<button onclick="loadDashboard()" class="btn-ghost px-3 py-2 text-xs"><i class="fas fa-sync-alt mr-1"></i>Refresh</button>' +
'</div>' +

// Revenue Card
'<div class="rounded-2xl p-5 mb-4" style="background:linear-gradient(135deg,#1e40af,#7c3aed)">' +
'<div class="flex items-center justify-between mb-3">' +
'<span class="text-blue-200 text-xs font-medium"><i class="fas fa-chart-line mr-1"></i>Total Pendapatan</span>' +
'<span class="badge badge-green text-xs" id="stat-month-label">Bulan Ini</span>' +
'</div>' +
'<div class="text-3xl font-bold mb-1" id="stat-revenue">Rp 0</div>' +
'<div class="text-blue-200 text-xs" id="stat-monthly">Bulan ini: Rp 0</div>' +
'</div>' +

// Stat Grid
'<div class="grid grid-cols-2 gap-3 mb-4">' +
'<div class="stat-card p-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><i class="fas fa-car text-blue-400"></i></div><div><div class="text-xl font-bold" id="stat-vehicles">0</div><div class="text-xs text-slate-400">Kendaraan</div></div></div></div>' +
'<div class="stat-card p-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><i class="fas fa-check-circle text-green-400"></i></div><div><div class="text-xl font-bold" id="stat-available">0</div><div class="text-xs text-slate-400">Tersedia</div></div></div></div>' +
'<div class="stat-card p-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><i class="fas fa-clock text-amber-400"></i></div><div><div class="text-xl font-bold" id="stat-active">0</div><div class="text-xs text-slate-400">Rental Aktif</div></div></div></div>' +
'<div class="stat-card p-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><i class="fas fa-users text-purple-400"></i></div><div><div class="text-xl font-bold" id="stat-customers">0</div><div class="text-xs text-slate-400">Pelanggan</div></div></div></div>' +
'</div>' +

// Small Stats
'<div class="grid grid-cols-3 gap-2 mb-4">' +
'<div class="card p-3 text-center"><div class="text-lg font-bold text-blue-400" id="stat-drivers">0</div><div class="text-xs text-slate-500">Supir</div></div>' +
'<div class="card p-3 text-center"><div class="text-lg font-bold text-yellow-400" id="stat-pending">0</div><div class="text-xs text-slate-500">Pending</div></div>' +
'<div class="card p-3 text-center"><div class="text-lg font-bold text-green-400" id="stat-completed">0</div><div class="text-xs text-slate-500">Selesai</div></div>' +
'</div>' +

// Quick Actions
'<div class="card p-4 mb-4">' +
'<h3 class="font-bold text-sm mb-3"><i class="fas fa-bolt text-amber-400 mr-2"></i>Quick Actions</h3>' +
'<div class="grid grid-cols-2 gap-2">' +
'<button onclick="switchTab(1);setTimeout(function(){openModal(\'vehicle\')},200)" class="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"><i class="fas fa-plus-circle"></i>Tambah Armada</button>' +
'<button onclick="switchTab(2);setTimeout(function(){openModal(\'rental\')},200)" class="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold bg-green-500/10 text-green-400 hover:bg-green-500/20 transition"><i class="fas fa-calendar-plus"></i>Booking Baru</button>' +
'<button onclick="switchTab(3);setTimeout(function(){openModal(\'customer\')},200)" class="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition"><i class="fas fa-user-plus"></i>Pelanggan Baru</button>' +
'<button onclick="switchTab(4);setTimeout(function(){openModal(\'driver\')},200)" class="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"><i class="fas fa-id-badge"></i>Tambah Supir</button>' +
'</div>' +
'</div>' +

// Info Card
'<div class="card p-4">' +
'<div class="flex items-start gap-3">' +
'<div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0"><i class="fab fa-whatsapp text-green-400"></i></div>' +
'<div>' +
'<h3 class="font-bold text-sm mb-1">WhatsApp Bot Aktif</h3>' +
'<p class="text-xs text-slate-400 mb-2">Pelanggan bisa cek harga & booking otomatis via WA ke 085643383832</p>' +
'<p class="text-xs text-slate-500">Keywords: INFO, HARGA, ARMADA, BANDARA, TOUR, BOOKING</p>' +
'</div>' +
'</div>' +
'</div>' +
'</div>' +

// VEHICLES PAGE
'<div id="page-vehicles" class="hidden anim-up">' +
'<div class="flex items-center justify-between mb-4">' +
'<div><h2 class="text-xl font-bold">Armada</h2><p class="text-xs text-slate-500">Kelola kendaraan</p></div>' +
'<button onclick="openModal(\'vehicle\')" class="btn-primary px-4 py-2.5 text-xs"><i class="fas fa-plus mr-1"></i>Tambah</button>' +
'</div>' +
'<div id="vehiclesList"></div>' +
'</div>' +

// RENTALS PAGE
'<div id="page-rentals" class="hidden anim-up">' +
'<div class="flex items-center justify-between mb-4">' +
'<div><h2 class="text-xl font-bold">Rental</h2><p class="text-xs text-slate-500">Booking & sewa kendaraan</p></div>' +
'<button onclick="openModal(\'rental\')" class="btn-primary px-4 py-2.5 text-xs"><i class="fas fa-plus mr-1"></i>Booking</button>' +
'</div>' +
// Rental Filters
'<div class="flex gap-2 mb-4 overflow-x-auto">' +
'<button onclick="filterRentals(\'all\')" class="rental-filter active badge badge-blue text-xs whitespace-nowrap" data-filter="all">Semua</button>' +
'<button onclick="filterRentals(\'pending\')" class="rental-filter badge badge-yellow text-xs whitespace-nowrap" data-filter="pending">Pending</button>' +
'<button onclick="filterRentals(\'confirmed\')" class="rental-filter badge badge-blue text-xs whitespace-nowrap" data-filter="confirmed">Confirmed</button>' +
'<button onclick="filterRentals(\'berjalan\')" class="rental-filter badge badge-green text-xs whitespace-nowrap" data-filter="berjalan">Berjalan</button>' +
'<button onclick="filterRentals(\'selesai\')" class="rental-filter badge badge-gray text-xs whitespace-nowrap" data-filter="selesai">Selesai</button>' +
'</div>' +
'<div id="rentalsList"></div>' +
'</div>' +

// CUSTOMERS PAGE
'<div id="page-customers" class="hidden anim-up">' +
'<div class="flex items-center justify-between mb-4">' +
'<div><h2 class="text-xl font-bold">Pelanggan</h2><p class="text-xs text-slate-500">Data pelanggan</p></div>' +
'<button onclick="openModal(\'customer\')" class="btn-primary px-4 py-2.5 text-xs"><i class="fas fa-plus mr-1"></i>Tambah</button>' +
'</div>' +
'<div class="mb-3 relative">' +
'<i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>' +
'<input type="text" id="searchCustomer" class="input-dark pl-11" placeholder="Cari pelanggan..." oninput="renderCustomers()">' +
'</div>' +
'<div id="customersList"></div>' +
'</div>' +

// DRIVERS PAGE
'<div id="page-drivers" class="hidden anim-up">' +
'<div class="flex items-center justify-between mb-4">' +
'<div><h2 class="text-xl font-bold">Supir</h2><p class="text-xs text-slate-500">Manajemen driver</p></div>' +
'<button onclick="openModal(\'driver\')" class="btn-primary px-4 py-2.5 text-xs"><i class="fas fa-plus mr-1"></i>Tambah</button>' +
'</div>' +
'<div id="driversList"></div>' +
'</div>' +

'</div>' + // end content area

// BOTTOM TAB BAR
'<div class="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2" style="background:linear-gradient(transparent,#0f172a 30%)">' +
'<div class="max-w-md mx-auto">' +
'<div class="tab-bar">' +
'<button onclick="switchTab(0)" class="tab-btn active" id="navHome"><i class="fas fa-home"></i><span>Home</span></button>' +
'<button onclick="switchTab(1)" class="tab-btn" id="navFleet"><i class="fas fa-car"></i><span>Armada</span></button>' +
'<button onclick="switchTab(2)" class="tab-btn" id="navRental"><i class="fas fa-calendar-alt"></i><span>Rental</span></button>' +
'<button onclick="switchTab(3)" class="tab-btn" id="navCustomer"><i class="fas fa-users"></i><span>Pelanggan</span></button>' +
'<button onclick="switchTab(4)" class="tab-btn" id="navDriver"><i class="fas fa-id-badge"></i><span>Supir</span></button>' +
'</div>' +
'</div>' +
'</div>' +
'</div>' + // end mainApp

'</div>' + // end app wrapper

// MODALS
// Vehicle Modal
'<div id="modal-vehicle" class="modal-sheet">' +
'<div class="modal-backdrop" onclick="closeModal(\'vehicle\')"></div>' +
'<div class="modal-content">' +
'<div class="modal-handle"></div>' +
'<h3 class="text-lg font-bold mb-4"><i class="fas fa-car text-blue-400 mr-2"></i>Tambah Kendaraan</h3>' +
'<div class="space-y-3">' +
'<input type="text" id="vName" class="input-dark" placeholder="Nama kendaraan (cth: Avanza Veloz 2024)">' +
'<input type="text" id="vBrand" class="input-dark" placeholder="Merk (cth: Toyota)">' +
'<div class="grid grid-cols-2 gap-3">' +
'<select id="vType" class="select-dark"><option value="mpv">MPV</option><option value="suv">SUV</option><option value="sedan">Sedan</option><option value="minibus">Minibus</option><option value="bus">Bus</option><option value="pickup">Pickup</option></select>' +
'<input type="number" id="vSeats" class="input-dark" placeholder="Jumlah kursi" value="7">' +
'</div>' +
'<div class="grid grid-cols-2 gap-3">' +
'<input type="text" id="vPlate" class="input-dark" placeholder="Plat nomor (AB xxxx)">' +
'<input type="text" id="vColor" class="input-dark" placeholder="Warna">' +
'</div>' +
'<div class="grid grid-cols-2 gap-3">' +
'<select id="vTrans" class="select-dark"><option value="matic">Matic</option><option value="manual">Manual</option></select>' +
'<input type="number" id="vYear" class="input-dark" placeholder="Tahun">' +
'</div>' +
'<div class="p-3 rounded-xl" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.15)">' +
'<p class="text-xs text-blue-400 font-semibold mb-2"><i class="fas fa-tag mr-1"></i>Tarif</p>' +
'<div class="grid grid-cols-2 gap-3">' +
'<div><label class="text-xs text-slate-400 mb-1 block">Lepas Kunci/hari</label><input type="number" id="vPriceDay" class="input-dark text-sm" placeholder="cth: 325000"></div>' +
'<div><label class="text-xs text-slate-400 mb-1 block">+ Supir + BBM/hari</label><input type="number" id="vPriceDriver" class="input-dark text-sm" placeholder="cth: 550000"></div>' +
'</div>' +
'</div>' +
'<textarea id="vNotes" class="input-dark" rows="2" placeholder="Catatan (opsional)"></textarea>' +
'<div class="flex gap-3 pt-2">' +
'<button onclick="closeModal(\'vehicle\')" class="btn-ghost flex-1 py-3 text-sm">Batal</button>' +
'<button onclick="saveVehicle()" class="btn-primary flex-1 py-3 text-sm"><i class="fas fa-save mr-1"></i>Simpan</button>' +
'</div>' +
'</div>' +
'</div>' +
'</div>' +

// Customer Modal
'<div id="modal-customer" class="modal-sheet">' +
'<div class="modal-backdrop" onclick="closeModal(\'customer\')"></div>' +
'<div class="modal-content">' +
'<div class="modal-handle"></div>' +
'<h3 class="text-lg font-bold mb-4"><i class="fas fa-user-plus text-purple-400 mr-2"></i>Tambah Pelanggan</h3>' +
'<div class="space-y-3">' +
'<input type="text" id="cName" class="input-dark" placeholder="Nama lengkap">' +
'<div class="relative"><i class="fab fa-whatsapp absolute left-4 top-1/2 -translate-y-1/2 text-green-500"></i><input type="tel" id="cPhone" class="input-dark pl-11" placeholder="No WhatsApp (08xxx)"></div>' +
'<input type="email" id="cEmail" class="input-dark" placeholder="Email (opsional)">' +
'<input type="text" id="cAddress" class="input-dark" placeholder="Alamat">' +
'<input type="text" id="cIdNumber" class="input-dark" placeholder="No KTP (opsional, untuk lepas kunci)">' +
'<textarea id="cNotes" class="input-dark" rows="2" placeholder="Catatan (opsional)"></textarea>' +
'<div class="flex gap-3 pt-2">' +
'<button onclick="closeModal(\'customer\')" class="btn-ghost flex-1 py-3 text-sm">Batal</button>' +
'<button onclick="saveCustomer()" class="btn-primary flex-1 py-3 text-sm"><i class="fas fa-save mr-1"></i>Simpan</button>' +
'</div>' +
'</div>' +
'</div>' +
'</div>' +

// Driver Modal
'<div id="modal-driver" class="modal-sheet">' +
'<div class="modal-backdrop" onclick="closeModal(\'driver\')"></div>' +
'<div class="modal-content">' +
'<div class="modal-handle"></div>' +
'<h3 class="text-lg font-bold mb-4"><i class="fas fa-id-badge text-amber-400 mr-2"></i>Tambah Supir</h3>' +
'<div class="space-y-3">' +
'<input type="text" id="dName" class="input-dark" placeholder="Nama supir">' +
'<div class="relative"><i class="fab fa-whatsapp absolute left-4 top-1/2 -translate-y-1/2 text-green-500"></i><input type="tel" id="dPhone" class="input-dark pl-11" placeholder="No WhatsApp (08xxx)"></div>' +
'<input type="text" id="dLicense" class="input-dark" placeholder="Nomor SIM">' +
'<input type="date" id="dLicenseExp" class="input-dark" placeholder="Masa berlaku SIM">' +
'<input type="text" id="dAddress" class="input-dark" placeholder="Alamat">' +
'<textarea id="dNotes" class="input-dark" rows="2" placeholder="Catatan / pengalaman"></textarea>' +
'<div class="flex gap-3 pt-2">' +
'<button onclick="closeModal(\'driver\')" class="btn-ghost flex-1 py-3 text-sm">Batal</button>' +
'<button onclick="saveDriver()" class="btn-primary flex-1 py-3 text-sm"><i class="fas fa-save mr-1"></i>Simpan</button>' +
'</div>' +
'</div>' +
'</div>' +
'</div>' +

// Rental Modal
'<div id="modal-rental" class="modal-sheet">' +
'<div class="modal-backdrop" onclick="closeModal(\'rental\')"></div>' +
'<div class="modal-content">' +
'<div class="modal-handle"></div>' +
'<h3 class="text-lg font-bold mb-4"><i class="fas fa-calendar-plus text-green-400 mr-2"></i>Booking Rental Baru</h3>' +
'<div class="space-y-3">' +
'<select id="rCustomer" class="select-dark"><option value="">-- Pilih Pelanggan --</option></select>' +
'<select id="rVehicle" class="select-dark"><option value="">-- Pilih Kendaraan --</option></select>' +
'<select id="rDriver" class="select-dark"><option value="">Tanpa Supir (Lepas Kunci)</option></select>' +
'<select id="rType" class="select-dark"><option value="harian">Harian (Per Hari)</option><option value="trip">Per Trip</option><option value="antar_jemput">Antar Jemput Bandara</option><option value="tour">Tour Wisata</option><option value="drop_off">Drop Off Antar Kota</option></select>' +
'<div class="grid grid-cols-2 gap-3">' +
'<div><label class="text-xs text-slate-400 mb-1 block">Tanggal & Jam Ambil</label><input type="datetime-local" id="rPickup" class="input-dark text-sm"></div>' +
'<div><label class="text-xs text-slate-400 mb-1 block">Tanggal Kembali</label><input type="datetime-local" id="rReturn" class="input-dark text-sm"></div>' +
'</div>' +
'<input type="text" id="rDestination" class="input-dark" placeholder="Tujuan / Rute (cth: Bandara YIA - Hotel)">' +
'<div class="p-3 rounded-xl" style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.15)">' +
'<p class="text-xs text-green-400 font-semibold mb-2"><i class="fas fa-money-bill-wave mr-1"></i>Pembayaran</p>' +
'<div class="grid grid-cols-2 gap-3">' +
'<div><label class="text-xs text-slate-400 mb-1 block">Total Harga</label><input type="number" id="rPrice" class="input-dark text-sm" placeholder="cth: 550000"></div>' +
'<div><label class="text-xs text-slate-400 mb-1 block">DP / Uang Muka</label><input type="number" id="rDP" class="input-dark text-sm" placeholder="cth: 200000"></div>' +
'</div>' +
'</div>' +
'<textarea id="rNotes" class="input-dark" rows="2" placeholder="Catatan booking (opsional)"></textarea>' +
'<div class="flex gap-3 pt-2">' +
'<button onclick="closeModal(\'rental\')" class="btn-ghost flex-1 py-3 text-sm">Batal</button>' +
'<button onclick="saveRental()" class="btn-primary flex-1 py-3 text-sm"><i class="fas fa-save mr-1"></i>Simpan Booking</button>' +
'</div>' +
'</div>' +
'</div>' +
'</div>' +

// Payment Modal
'<div id="modal-payment" class="modal-sheet">' +
'<div class="modal-backdrop" onclick="closeModal(\'payment\')"></div>' +
'<div class="modal-content">' +
'<div class="modal-handle"></div>' +
'<h3 class="text-lg font-bold mb-4"><i class="fas fa-money-bill-wave text-green-400 mr-2"></i>Tambah Pembayaran</h3>' +
'<div class="space-y-3">' +
'<input type="hidden" id="payRentalId">' +
'<div><label class="text-xs text-slate-400 mb-1 block">Jumlah Bayar</label><input type="number" id="payAmount" class="input-dark" placeholder="cth: 300000"></div>' +
'<select id="payType" class="select-dark"><option value="dp">DP / Uang Muka</option><option value="pelunasan">Pelunasan</option><option value="cicilan">Cicilan</option></select>' +
'<select id="payMethod" class="select-dark"><option value="cash">Cash</option><option value="transfer">Transfer Bank</option><option value="ewallet">E-Wallet (OVO/GoPay/Dana)</option></select>' +
'<textarea id="payNotes" class="input-dark" rows="2" placeholder="Catatan pembayaran"></textarea>' +
'<div class="flex gap-3 pt-2">' +
'<button onclick="closeModal(\'payment\')" class="btn-ghost flex-1 py-3 text-sm">Batal</button>' +
'<button onclick="savePayment()" class="btn-primary flex-1 py-3 text-sm"><i class="fas fa-save mr-1"></i>Simpan</button>' +
'</div>' +
'</div>' +
'</div>' +
'</div>' +

// SCRIPT
'<script>' +
'var A=null,T=0,D={vehicles:[],drivers:[],customers:[],rentals:[],rentalFilter:"all"};' +

// Init & Splash
'function init(){' +
'var b=document.getElementById("splashBar");' +
'b.style.width="40%";' +
'setTimeout(function(){b.style.width="80%"},300);' +
'setTimeout(function(){b.style.width="100%"},500);' +
'setTimeout(function(){' +
'var s=document.getElementById("splash");s.classList.add("anim-out");' +
'setTimeout(function(){s.style.display="none";' +
'var st=localStorage.getItem("sft3_agent");' +
'if(st){try{A=JSON.parse(st);showApp()}catch(e){localStorage.removeItem("sft3_agent");showLogin()}}' +
'else{showLogin()}' +
'},300)},700)}' +

'function showLogin(){document.getElementById("loginPage").classList.remove("hidden")}' +

// Login
'function doLogin(){' +
'var phone=document.getElementById("loginPhone").value.trim();' +
'var err=document.getElementById("loginError");' +
'var btn=document.getElementById("loginBtn");' +
'if(!phone||phone.length<8){err.textContent="Masukkan nomor WA yang valid!";err.classList.remove("hidden");return}' +
'err.classList.add("hidden");btn.disabled=true;btn.innerHTML="<i class=\\"fas fa-spinner fa-spin mr-2\\"></i>Memproses...";' +
'fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:phone})})' +
'.then(function(r){return r.json()})' +
'.then(function(d){' +
'btn.disabled=false;btn.innerHTML="<i class=\\"fas fa-arrow-right mr-2\\"></i>Masuk / Daftar Otomatis";' +
'if(d.error){err.textContent=d.error;err.classList.remove("hidden");return}' +
'A=d;localStorage.setItem("sft3_agent",JSON.stringify(d));' +
'document.getElementById("loginPage").classList.add("hidden");showApp()})' +
'.catch(function(e){btn.disabled=false;btn.innerHTML="<i class=\\"fas fa-arrow-right mr-2\\"></i>Masuk / Daftar Otomatis";err.textContent="Error: "+e.message;err.classList.remove("hidden")})' +
'}' +

'function doLogout(){if(confirm("Yakin keluar?")){localStorage.removeItem("sft3_agent");location.reload()}}' +

// Show Main App
'function showApp(){' +
'document.getElementById("mainApp").classList.remove("hidden");' +
'document.getElementById("headerName").textContent=A.business_name||A.name;' +
'document.getElementById("headerPhone").textContent=A.phone;' +
'loadAll()}' +

'function loadAll(){loadDashboard();loadVehicles();loadDrivers();loadCustomers();loadRentals()}' +

// Tab Navigation
'function switchTab(i){' +
'T=i;var pages=["dashboard","vehicles","rentals","customers","drivers"];' +
'var navs=["navHome","navFleet","navRental","navCustomer","navDriver"];' +
'for(var j=0;j<pages.length;j++){' +
'var p=document.getElementById("page-"+pages[j]);' +
'var n=document.getElementById(navs[j]);' +
'if(j===i){p.classList.remove("hidden");p.className="anim-up";n.classList.add("active")}' +
'else{p.classList.add("hidden");n.classList.remove("active")}' +
'}}' +

// Format Currency
'function fmtRp(n){if(!n||n===0)return"Rp 0";var x=parseInt(n);if(x>=1000000)return"Rp "+((x/1000000).toFixed(1)).replace(".0","")+"jt";if(x>=1000)return"Rp "+(x/1000).toFixed(0)+"rb";return"Rp "+x}' +
'function fmtRpFull(n){if(!n||n===0)return"Rp 0";return"Rp "+parseInt(n).toLocaleString("id-ID")}' +
'function fmtDate(d){if(!d)return"-";try{return new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}catch(e){return d}}' +
'function fmtDateTime(d){if(!d)return"-";try{return new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return d}}' +

// Vehicle type icon
'function vIcon(t){var m={"mpv":"fa-car","suv":"fa-truck-monster","minibus":"fa-shuttle-van","sedan":"fa-car-side","bus":"fa-bus","pickup":"fa-truck-pickup"};return m[t]||"fa-car"}' +
'function vClass(t){return"vi-"+(t||"mpv")}' +

// Dashboard
'function loadDashboard(){' +
'if(!A)return;' +
'fetch("/api/dashboard?agent_id="+A.id).then(function(r){return r.json()}).then(function(s){' +
'document.getElementById("stat-revenue").textContent=fmtRpFull(s.revenue);' +
'document.getElementById("stat-monthly").textContent="Bulan ini: "+fmtRpFull(s.monthly_revenue);' +
'document.getElementById("stat-vehicles").textContent=s.total_vehicles||0;' +
'document.getElementById("stat-available").textContent=s.available_vehicles||0;' +
'document.getElementById("stat-active").textContent=s.active_rentals||0;' +
'document.getElementById("stat-customers").textContent=s.total_customers||0;' +
'document.getElementById("stat-drivers").textContent=s.total_drivers||0;' +
'document.getElementById("stat-pending").textContent=s.pending_rentals||0;' +
'document.getElementById("stat-completed").textContent=s.completed_rentals||0;' +
'}).catch(function(e){console.error("Dashboard:",e)})}' +

// Vehicles
'function loadVehicles(){' +
'if(!A)return;' +
'fetch("/api/vehicles?agent_id="+A.id).then(function(r){return r.json()}).then(function(d){D.vehicles=Array.isArray(d)?d:[];renderVehicles()}).catch(function(){D.vehicles=[];renderVehicles()})}' +

'function renderVehicles(){' +
'var el=document.getElementById("vehiclesList");' +
'if(!D.vehicles.length){el.innerHTML="<div class=\\"empty-state\\"><i class=\\"fas fa-car\\"></i><p class=\\"text-sm\\">Belum ada kendaraan</p><p class=\\"text-xs mt-1\\">Tap + Tambah untuk menambah armada</p></div>";updateVehicleSelect();return}' +
'var h="";' +
'for(var i=0;i<D.vehicles.length;i++){var v=D.vehicles[i];' +
'var av=v.is_available;' +
'h+="<div class=\\"card p-4 mb-3"+(av?"":" opacity-60")+"\\"><div class=\\"flex items-start gap-3\\">";' +
'h+="<div class=\\"vehicle-icon "+vClass(v.type)+"\\"><i class=\\"fas "+vIcon(v.type)+"\\"></i></div>";' +
'h+="<div class=\\"flex-1 min-w-0\\"><div class=\\"flex items-start justify-between\\"><div>";' +
'h+="<h3 class=\\"font-bold text-sm\\">"+(v.name||"-")+"</h3>";' +
'h+="<p class=\\"text-xs text-slate-400 mt-0.5\\">"+(v.brand||"")+" &middot; "+(v.plate_number||"-")+" &middot; "+(v.color||"")+" &middot; "+(v.seats||7)+" seat &middot; "+(v.transmission||"matic")+"</p>";' +
'h+="</div><span class=\\"badge "+(av?"badge-green":"badge-red")+" ml-2\\">"+(av?"Tersedia":"Disewa")+"</span></div>";' +
'h+="<div class=\\"flex items-center justify-between mt-3 pt-3\\" style=\\"border-top:1px solid rgba(255,255,255,.06)\\"><div>";' +
'if(v.price_per_day)h+="<span class=\\"price-tag\\">"+fmtRp(v.price_per_day)+"/hari</span> ";' +
'if(v.price_with_driver)h+="<span class=\\"text-xs text-slate-500 ml-1\\">+supir: "+fmtRp(v.price_with_driver)+"</span>";' +
'h+="</div><div class=\\"flex gap-2\\">";' +
'h+="<button onclick=\\"toggleVehicle(\'"+v.id+"\',"+(!av)+")\\" class=\\"text-xs "+(av?"text-red-400":"text-green-400")+"\\"><i class=\\"fas "+(av?"fa-ban":"fa-check-circle")+" mr-1\\"></i>"+(av?"Disewa":"Tersedia")+"</button>";' +
'h+="</div></div></div></div></div>"}' +
'el.innerHTML=h;updateVehicleSelect()}' +

'function updateVehicleSelect(){' +
'var sel=document.getElementById("rVehicle");if(!sel)return;' +
'var h="<option value=\\"\\">-- Pilih Kendaraan --</option>";' +
'for(var i=0;i<D.vehicles.length;i++){var v=D.vehicles[i];if(v.is_available){h+="<option value=\\""+v.id+"\\">"+v.name+" ("+v.plate_number+") - "+fmtRp(v.price_per_day)+"/hari</option>"}}' +
'sel.innerHTML=h}' +

'function saveVehicle(){' +
'var name=document.getElementById("vName").value.trim();' +
'var brand=document.getElementById("vBrand").value.trim();' +
'if(!name||!brand){alert("Nama dan merk kendaraan wajib diisi!");return}' +
'var body={agent_id:A.id,name:name,brand:brand,type:document.getElementById("vType").value,seats:parseInt(document.getElementById("vSeats").value)||7,plate_number:document.getElementById("vPlate").value.trim(),color:document.getElementById("vColor").value.trim(),transmission:document.getElementById("vTrans").value,year:parseInt(document.getElementById("vYear").value)||null,price_per_day:parseFloat(document.getElementById("vPriceDay").value)||0,price_with_driver:parseFloat(document.getElementById("vPriceDriver").value)||0,notes:document.getElementById("vNotes").value.trim()};' +
'fetch("/api/vehicles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})' +
'.then(function(r){return r.json()}).then(function(d){if(d.error){alert(d.error);return}closeModal("vehicle");clearForm("vehicle");loadVehicles();loadDashboard()}).catch(function(e){alert("Error: "+e.message)})}' +

'function toggleVehicle(id,avail){fetch("/api/vehicles/"+id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({is_available:avail})}).then(function(){loadVehicles();loadDashboard()})}' +

// Drivers
'function loadDrivers(){' +
'if(!A)return;' +
'fetch("/api/drivers?agent_id="+A.id).then(function(r){return r.json()}).then(function(d){D.drivers=Array.isArray(d)?d:[];renderDrivers()}).catch(function(){D.drivers=[];renderDrivers()})}' +

'function renderDrivers(){' +
'var el=document.getElementById("driversList");' +
'if(!D.drivers.length){el.innerHTML="<div class=\\"empty-state\\"><i class=\\"fas fa-id-badge\\"></i><p class=\\"text-sm\\">Belum ada supir</p><p class=\\"text-xs mt-1\\">Tap + Tambah untuk menambah driver</p></div>";updateDriverSelect();return}' +
'var h="";' +
'for(var i=0;i<D.drivers.length;i++){var d=D.drivers[i];var waNum=(d.phone||"").replace(/^0/,"");' +
'h+="<div class=\\"card p-4 mb-3\\"><div class=\\"flex items-start justify-between\\"><div class=\\"flex items-start gap-3\\"><div class=\\"w-11 h-11 rounded-xl flex items-center justify-center "+(d.is_available?"bg-green-500/15":"bg-red-500/15")+"\\"><i class=\\"fas fa-user-tie "+(d.is_available?"text-green-400":"text-red-400")+"\\"></i></div><div>";' +
'h+="<h3 class=\\"font-bold text-sm\\">"+d.name+"</h3>";' +
'h+="<p class=\\"text-xs text-slate-400\\"><i class=\\"fas fa-phone text-xs mr-1\\"></i>"+d.phone+"</p>";' +
'if(d.license_number)h+="<p class=\\"text-xs text-slate-500\\"><i class=\\"fas fa-id-card text-xs mr-1\\"></i>SIM: "+d.license_number+"</p>";' +
'h+="<div class=\\"mt-1\\"><span class=\\"badge "+(d.is_available?"badge-green":"badge-red")+" text-xs\\">"+(d.is_available?"Ready":"Sedang Trip")+"</span></div>";' +
'h+="</div></div>";' +
'h+="<a href=\\"https://wa.me/62"+waNum+"\\" target=\\"_blank\\" class=\\"w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 hover:bg-green-500/25\\"><i class=\\"fab fa-whatsapp text-lg\\"></i></a>";' +
'h+="</div></div>"}' +
'el.innerHTML=h;updateDriverSelect()}' +

'function updateDriverSelect(){' +
'var sel=document.getElementById("rDriver");if(!sel)return;' +
'var h="<option value=\\"\\">Tanpa Supir (Lepas Kunci)</option>";' +
'for(var i=0;i<D.drivers.length;i++){var d=D.drivers[i];if(d.is_available){h+="<option value=\\""+d.id+"\\">"+d.name+" ("+d.phone+")</option>"}}' +
'sel.innerHTML=h}' +

'function saveDriver(){' +
'var name=document.getElementById("dName").value.trim();' +
'var phone=document.getElementById("dPhone").value.trim();' +
'if(!name||!phone){alert("Nama dan No HP wajib diisi!");return}' +
'var body={agent_id:A.id,name:name,phone:phone,license_number:document.getElementById("dLicense").value.trim(),license_expire:document.getElementById("dLicenseExp").value||null,address:document.getElementById("dAddress").value.trim(),notes:document.getElementById("dNotes").value.trim()};' +
'fetch("/api/drivers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})' +
'.then(function(r){return r.json()}).then(function(d){if(d.error){alert(d.error);return}closeModal("driver");clearForm("driver");loadDrivers();loadDashboard()}).catch(function(e){alert("Error: "+e.message)})}' +

// Customers
'function loadCustomers(){' +
'if(!A)return;' +
'fetch("/api/customers?agent_id="+A.id).then(function(r){return r.json()}).then(function(d){D.customers=Array.isArray(d)?d:[];renderCustomers()}).catch(function(){D.customers=[];renderCustomers()})}' +

'function renderCustomers(){' +
'var el=document.getElementById("customersList");' +
'var q=(document.getElementById("searchCustomer")||{}).value||"";q=q.toLowerCase();' +
'var list=D.customers;' +
'if(q){list=list.filter(function(c){return(c.name||"").toLowerCase().indexOf(q)>-1||(c.phone||"").indexOf(q)>-1})}' +
'if(!list.length){el.innerHTML="<div class=\\"empty-state\\"><i class=\\"fas fa-users\\"></i><p class=\\"text-sm\\">"+(q?"Tidak ditemukan":"Belum ada pelanggan")+"</p></div>";updateCustomerSelect();return}' +
'var h="";' +
'for(var i=0;i<list.length;i++){var c=list[i];var waNum=(c.phone||"").replace(/^0/,"");' +
'h+="<div class=\\"card p-4 mb-3\\"><div class=\\"flex items-start justify-between\\"><div class=\\"flex items-start gap-3\\"><div class=\\"w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center\\"><i class=\\"fas fa-user text-purple-400\\"></i></div><div>";' +
'h+="<h3 class=\\"font-bold text-sm\\">"+c.name+"</h3>";' +
'h+="<p class=\\"text-xs text-slate-400\\"><i class=\\"fas fa-phone text-xs mr-1\\"></i>"+c.phone+"</p>";' +
'if(c.address)h+="<p class=\\"text-xs text-slate-500\\"><i class=\\"fas fa-map-marker-alt text-xs mr-1\\"></i>"+c.address+"</p>";' +
'h+="</div></div>";' +
'h+="<a href=\\"https://wa.me/62"+waNum+"\\" target=\\"_blank\\" class=\\"w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 hover:bg-green-500/25\\"><i class=\\"fab fa-whatsapp text-lg\\"></i></a>";' +
'h+="</div></div>"}' +
'el.innerHTML=h;updateCustomerSelect()}' +

'function updateCustomerSelect(){' +
'var sel=document.getElementById("rCustomer");if(!sel)return;' +
'var h="<option value=\\"\\">-- Pilih Pelanggan --</option>";' +
'for(var i=0;i<D.customers.length;i++){var c=D.customers[i];h+="<option value=\\""+c.id+"\\">"+c.name+" ("+c.phone+")</option>"}' +
'sel.innerHTML=h}' +

'function saveCustomer(){' +
'var name=document.getElementById("cName").value.trim();' +
'var phone=document.getElementById("cPhone").value.trim();' +
'if(!name||!phone){alert("Nama dan No HP wajib diisi!");return}' +
'var body={agent_id:A.id,name:name,phone:phone,email:document.getElementById("cEmail").value.trim()||null,address:document.getElementById("cAddress").value.trim(),id_number:document.getElementById("cIdNumber").value.trim()||null,notes:document.getElementById("cNotes").value.trim()};' +
'fetch("/api/customers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})' +
'.then(function(r){return r.json()}).then(function(d){if(d.error){alert(d.error);return}closeModal("customer");clearForm("customer");loadCustomers();loadDashboard()}).catch(function(e){alert("Error: "+e.message)})}' +

// Rentals
'function loadRentals(){' +
'if(!A)return;' +
'fetch("/api/rentals?agent_id="+A.id).then(function(r){return r.json()}).then(function(d){D.rentals=Array.isArray(d)?d:[];renderRentals()}).catch(function(){D.rentals=[];renderRentals()})}' +

'function filterRentals(f){' +
'D.rentalFilter=f;' +
'var btns=document.querySelectorAll(".rental-filter");' +
'for(var i=0;i<btns.length;i++){var b=btns[i];if(b.getAttribute("data-filter")===f){b.style.opacity="1";b.style.fontWeight="700"}else{b.style.opacity=".6";b.style.fontWeight="500"}}' +
'renderRentals()}' +

'function renderRentals(){' +
'var el=document.getElementById("rentalsList");' +
'var list=D.rentals;' +
'if(D.rentalFilter!=="all"){list=list.filter(function(r){return r.status===D.rentalFilter})}' +
'if(!list.length){el.innerHTML="<div class=\\"empty-state\\"><i class=\\"fas fa-calendar-alt\\"></i><p class=\\"text-sm\\">Belum ada booking</p><p class=\\"text-xs mt-1\\">Tap + Booking untuk membuat rental baru</p></div>";return}' +
'var badges={pending:"badge-yellow",confirmed:"badge-blue",berjalan:"badge-green",selesai:"badge-gray",batal:"badge-red"};' +
'var typeLabels={harian:"Harian",trip:"Per Trip",antar_jemput:"Bandara",tour:"Tour",drop_off:"Drop Off"};' +
'var h="";' +
'for(var i=0;i<list.length;i++){var r=list[i];var st=r.status||"pending";' +
'var cust=(r.customer&&r.customer.name)?r.customer.name:"N/A";' +
'var veh=(r.vehicle&&r.vehicle.name)?r.vehicle.name:"N/A";' +
'var plate=(r.vehicle&&r.vehicle.plate_number)?r.vehicle.plate_number:"";' +
'var drv=(r.driver&&r.driver.name)?r.driver.name:"Lepas Kunci";' +
'var typeLabel=typeLabels[r.rental_type]||r.rental_type||"Harian";' +
'h+="<div class=\\"card p-4 mb-3\\"><div class=\\"flex items-start justify-between mb-2\\"><div class=\\"flex-1\\"><h3 class=\\"font-bold text-sm\\">"+cust+"</h3>";' +
'h+="<div class=\\"flex items-center gap-2 mt-1 flex-wrap\\"><span class=\\"badge badge-purple text-xs\\"><i class=\\"fas fa-car text-xs mr-1\\"></i>"+veh+"</span>";' +
'if(plate)h+="<span class=\\"text-xs text-slate-500\\">"+plate+"</span>";' +
'h+="</div></div><span class=\\"badge "+(badges[st]||"badge-yellow")+"\\">"+st.toUpperCase()+"</span></div>";' +
'h+="<div class=\\"grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3\\">";' +
'h+="<div><i class=\\"fas fa-user-tie mr-1\\"></i>"+drv+"</div>";' +
'h+="<div><i class=\\"fas fa-tag mr-1\\"></i>"+typeLabel+"</div>";' +
'h+="<div><i class=\\"fas fa-calendar mr-1\\"></i>"+fmtDate(r.pickup_date)+"</div>";' +
'if(r.destination)h+="<div><i class=\\"fas fa-map-marker-alt mr-1\\"></i>"+r.destination+"</div>";' +
'h+="</div>";' +
'h+="<div class=\\"flex items-center justify-between pt-3\\" style=\\"border-top:1px solid rgba(255,255,255,.06)\\"><span class=\\"price-tag\\">"+fmtRpFull(r.total_price)+"</span>";' +
'h+="<div class=\\"flex gap-2\\">";' +
'if(st!=="selesai"&&st!=="batal"){h+="<button onclick=\\"addPayment(\'"+r.id+"\')\\" class=\\"text-xs text-green-400 hover:text-green-300\\"><i class=\\"fas fa-money-bill mr-1\\"></i>Bayar</button>";' +
'h+="<button onclick=\\"changeStatus(\'"+r.id+"\',\'"+st+"\')\\" class=\\"text-xs text-blue-400 hover:text-blue-300\\"><i class=\\"fas fa-arrow-right mr-1\\"></i>Lanjut</button>"}' +
'h+="</div></div></div>"}' +
'el.innerHTML=h}' +

'function saveRental(){' +
'var cid=document.getElementById("rCustomer").value;' +
'var vid=document.getElementById("rVehicle").value;' +
'var price=document.getElementById("rPrice").value;' +
'var pickup=document.getElementById("rPickup").value;' +
'if(!cid||!vid||!price||!pickup){alert("Pelanggan, kendaraan, harga, dan tanggal ambil wajib diisi!");return}' +
'var drvId=document.getElementById("rDriver").value||null;' +
'var body={agent_id:A.id,customer_id:cid,vehicle_id:vid,driver_id:drvId,pickup_date:pickup,return_date:document.getElementById("rReturn").value||null,destination:document.getElementById("rDestination").value.trim(),total_price:parseFloat(price),dp_amount:parseFloat(document.getElementById("rDP").value)||0,rental_type:document.getElementById("rType").value,with_driver:!!drvId,notes:document.getElementById("rNotes").value.trim()};' +
'fetch("/api/rentals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})' +
'.then(function(r){return r.json()}).then(function(d){if(d.error){alert(d.error);return}closeModal("rental");clearForm("rental");loadRentals();loadVehicles();loadDashboard()}).catch(function(e){alert("Error: "+e.message)})}' +

'function changeStatus(id,cur){' +
'var flow=["pending","confirmed","berjalan","selesai"];' +
'var idx=flow.indexOf(cur);var next=flow[Math.min(idx+1,flow.length-1)];' +
'if(cur===next)return;' +
'if(confirm("Ubah status ke "+next.toUpperCase()+"?")){' +
'fetch("/api/rentals/"+id+"/status",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})})' +
'.then(function(){loadRentals();loadVehicles();loadDrivers();loadDashboard()})}}' +

// Payments
'function addPayment(rentalId){document.getElementById("payRentalId").value=rentalId;openModal("payment")}' +
'function savePayment(){' +
'var rentalId=document.getElementById("payRentalId").value;' +
'var amount=document.getElementById("payAmount").value;' +
'if(!rentalId||!amount){alert("Jumlah pembayaran wajib diisi!");return}' +
'var body={rental_id:rentalId,amount:parseFloat(amount),payment_type:document.getElementById("payType").value,payment_method:document.getElementById("payMethod").value,notes:document.getElementById("payNotes").value.trim()};' +
'fetch("/api/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})' +
'.then(function(r){return r.json()}).then(function(d){if(d.error){alert(d.error);return}closeModal("payment");clearForm("payment");loadDashboard();alert("Pembayaran berhasil disimpan!")}).catch(function(e){alert("Error: "+e.message)})}' +

// Modals
'function openModal(id){var m=document.getElementById("modal-"+id);if(m)m.classList.add("open")}' +
'function closeModal(id){var m=document.getElementById("modal-"+id);if(m)m.classList.remove("open")}' +

'function clearForm(type){' +
'var ids={vehicle:["vName","vBrand","vPlate","vColor","vYear","vPriceDay","vPriceDriver","vNotes"],customer:["cName","cPhone","cEmail","cAddress","cIdNumber","cNotes"],driver:["dName","dPhone","dLicense","dLicenseExp","dAddress","dNotes"],rental:["rDestination","rPrice","rDP","rNotes"],payment:["payAmount","payNotes"]};' +
'var fields=ids[type]||[];' +
'for(var i=0;i<fields.length;i++){var el=document.getElementById(fields[i]);if(el)el.value=""}}' +

// Init
'init();' +
'</script>' +
'</body></html>'
}

export default app
