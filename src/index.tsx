// ============================================
// SOVEREIGN TRAVEL AGENT - PWA Complete
// Stack: Hono + Cloudflare Pages + Supabase + Fonnte
// Author: Sovereign Empire Team
// ============================================

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { createClient } from '@supabase/supabase-js'

// ============================================
// TYPE DEFINITIONS
// ============================================

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_KEY: string
  FONNTE_TOKEN: string
  FONNTE_DEVICE: string
}

// ============================================
// APP INITIALIZATION
// ============================================

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './public' }))

// Helper: Get Supabase client
const getSupabase = (c: any) => {
  return createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_SERVICE_KEY
  )
}

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'Sovereign Travel Agent v1',
    timestamp: new Date().toISOString()
  })
})

// Auth - Login
app.post('/api/auth/login', async (c) => {
  const sb = getSupabase(c)
  const { phone, pin } = await c.req.json()

  let { data: agent } = await sb.from('agents')
    .select('*').eq('phone', phone).single()

  if (!agent) {
    // Auto-create agent if not found (MVP convenience)
    const { data: newAgent } = await sb.from('agents')
      .insert({ phone, name: `Agent ${phone.slice(-4)}`, business_name: 'Travel Agent' })
      .select().single()
    agent = newAgent
    if (!agent) return c.json({ error: 'Gagal membuat akun' }, 500)
  }

  return c.json({
    id: agent.id,
    name: agent.name,
    phone: agent.phone,
    business_name: agent.business_name
  })
})

// Customers - List
app.get('/api/customers', async (c) => {
  const sb = getSupabase(c)
  const agent_id = c.req.query('agent_id')

  const { data, error } = await sb.from('customers')
    .select('*')
    .eq('agent_id', agent_id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data || [])
})

// Customers - Create
app.post('/api/customers', async (c) => {
  const sb = getSupabase(c)
  const body = await c.req.json()

  const { data, error } = await sb.from('customers')
    .insert(body)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Customers - Update
app.put('/api/customers/:id', async (c) => {
  const sb = getSupabase(c)
  const id = c.req.param('id')
  const body = await c.req.json()

  const { data, error } = await sb.from('customers')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Packages - List
app.get('/api/packages', async (c) => {
  const sb = getSupabase(c)
  const agent_id = c.req.query('agent_id')

  const { data, error } = await sb.from('packages')
    .select('*')
    .eq('agent_id', agent_id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data || [])
})

// Packages - Create
app.post('/api/packages', async (c) => {
  const sb = getSupabase(c)
  const body = await c.req.json()

  const { data, error } = await sb.from('packages')
    .insert(body)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Bookings - List
app.get('/api/bookings', async (c) => {
  const sb = getSupabase(c)
  const agent_id = c.req.query('agent_id')

  const { data, error } = await sb.from('bookings')
    .select(`
      *,
      customer:customers(name, phone),
      package:packages(name, destination, price)
    `)
    .eq('agent_id', agent_id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data || [])
})

// Bookings - Create
app.post('/api/bookings', async (c) => {
  const sb = getSupabase(c)
  const body = await c.req.json()

  const { data, error } = await sb.from('bookings')
    .insert(body)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Bookings - Update Status
app.put('/api/bookings/:id/status', async (c) => {
  const sb = getSupabase(c)
  const id = c.req.param('id')
  const { status } = await c.req.json()

  const { data, error } = await sb.from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Payments - List
app.get('/api/payments', async (c) => {
  const sb = getSupabase(c)
  const booking_id = c.req.query('booking_id')

  const { data, error } = await sb.from('payments')
    .select('*')
    .eq('booking_id', booking_id)
    .order('payment_date', { ascending: false })

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data || [])
})

// Payments - Create
app.post('/api/payments', async (c) => {
  const sb = getSupabase(c)
  const body = await c.req.json()

  const { data, error } = await sb.from('payments')
    .insert(body)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// Dashboard Stats
app.get('/api/dashboard', async (c) => {
  const sb = getSupabase(c)
  const agent_id = c.req.query('agent_id')

  // Get bookings count by status
  const { data: bookings } = await sb.from('bookings')
    .select('status')
    .eq('agent_id', agent_id)

  // Get total customers
  const { count: customersCount } = await sb.from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent_id)

  // Get total packages
  const { count: packagesCount } = await sb.from('packages')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent_id)

  // Calculate stats
  const stats = {
    total_customers: customersCount || 0,
    total_packages: packagesCount || 0,
    total_bookings: bookings?.length || 0,
    inquiry: bookings?.filter(b => b.status === 'inquiry').length || 0,
    dp: bookings?.filter(b => b.status === 'dp').length || 0,
    paid: bookings?.filter(b => b.status === 'paid').length || 0,
    departed: bookings?.filter(b => b.status === 'departed').length || 0
  }

  return c.json(stats)
})

// WhatsApp - Send Message
app.post('/api/wa/send', async (c) => {
  const { target, message } = await c.req.json()
  const token = c.env.FONNTE_TOKEN

  const formData = new URLSearchParams()
  formData.append('target', target)
  formData.append('message', message)
  formData.append('countryCode', '62')

  const response = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { 'Authorization': token },
    body: formData
  })

  return c.json(await response.json())
})

// WhatsApp - Webhook (Auto-Reply)
app.post('/api/wa/webhook', async (c) => {
  const body = await c.req.json()
  const { sender, message } = body
  const token = c.env.FONNTE_TOKEN

  const upperMsg = message.trim().toUpperCase()
  let reply = ''

  switch (upperMsg) {
    case 'INFO':
      reply = `🌍 *SOVEREIGN TRAVEL AGENT*\n\nSistem manajemen travel agent berbasis WhatsApp.\n\nFitur:\n✅ Database jama'ah\n✅ Booking & payment tracking\n✅ Auto-reminder\n✅ Laporan keuangan\n\nKetik HARGA untuk info harga.`
      break
    case 'HARGA':
      reply = `💰 *PAKET SOVEREIGN TRAVEL*\n\n📦 FREE\n- 10 customers\n- 5 bookings/bulan\n\n📦 BASIC - Rp 149.000/bulan\n- 100 customers\n- Unlimited bookings\n- WA broadcast\n\n📦 PRO - Rp 299.000/bulan\n- Unlimited customers\n- Multi-agent\n- Priority support\n\nKetik DAFTAR untuk mulai trial gratis!`
      break
    case 'DAFTAR':
      reply = `🎉 Daftar trial gratis:\n\n1. Buka: https://sovereign-travel-agent.pages.dev\n2. Login dengan nomor WA kamu\n3. Mulai manage jama'ah!\n\nAda pertanyaan? Ketik BANTUAN`
      break
    case 'BANTUAN':
      reply = `📞 Butuh bantuan?\n\nWhatsApp: 085643383832\nEmail: support@sovereign.com\n\nKetik:\n- INFO = Info sistem\n- HARGA = Paket harga\n- DAFTAR = Trial gratis`
      break
    default:
      reply = `Halo! Selamat datang di Sovereign Travel Agent.\n\nKetik:\n- INFO = Info sistem\n- HARGA = Paket & harga\n- DAFTAR = Trial gratis\n- BANTUAN = Hubungi support`
  }

  if (reply) {
    const formData = new URLSearchParams()
    formData.append('target', sender)
    formData.append('message', reply)
    formData.append('countryCode', '62')

    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': token },
      body: formData
    })
  }

  return c.json({ status: true })
})

// ============================================
// MAIN WEB APP (PWA)
// ============================================

app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Sovereign Travel Agent - WA-First Travel Management</title>
    
    <!-- PWA Meta -->
    <meta name="description" content="Sistem manajemen travel agent berbasis WhatsApp untuk Indonesia">
    <meta name="theme-color" content="#059669">
    <link rel="manifest" href="/static/manifest.json">
    <link rel="apple-touch-icon" href="/static/icon-192.png">
    
    <!-- TailwindCSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    
    <style>
        * { -webkit-tap-highlight-color: transparent; }
        body { overscroll-behavior-y: none; margin: 0; padding: 0; }
        .slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-out { animation: fadeOut 0.3s ease-out forwards; }
        @keyframes fadeOut { to { opacity: 0; visibility: hidden; } }
        .tab-active { @apply bg-emerald-600 text-white; }
        .tab-inactive { @apply bg-white text-gray-700 hover:bg-gray-50; }
        .card { @apply bg-white rounded-xl shadow-sm p-4 mb-4; }
        .btn-primary { @apply bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition; }
        .btn-secondary { @apply bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition; }
        .input { @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent; }
        .badge { @apply inline-block px-3 py-1 text-xs font-semibold rounded-full; }
        .badge-inquiry { @apply bg-blue-100 text-blue-800; }
        .badge-dp { @apply bg-yellow-100 text-yellow-800; }
        .badge-paid { @apply bg-green-100 text-green-800; }
        .badge-departed { @apply bg-purple-100 text-purple-800; }
        
        /* Skeleton loading styles */
        .skeleton { @apply animate-pulse bg-gray-200 rounded; }
        .skeleton-text { @apply skeleton h-4 mb-2; }
        .skeleton-title { @apply skeleton h-6 mb-3 w-2/3; }
        .skeleton-card { @apply skeleton h-24 mb-4; }
    </style>
</head>
<body class="bg-gray-50">
    
    <!-- App Container -->
    <div id="app" class="max-w-md mx-auto min-h-screen bg-white shadow-lg relative">
        
        <!-- Loading Screen (Fast splash) -->
        <div id="loadingScreen" class="fixed inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 z-50 flex items-center justify-center">
            <div class="text-center text-white">
                <div class="mb-4">
                    <i class="fas fa-plane-departure text-6xl mb-4 animate-bounce"></i>
                </div>
                <h1 class="text-2xl font-bold mb-2">Sovereign Travel</h1>
                <p class="text-emerald-100 text-sm">Memuat aplikasi...</p>
                <div class="mt-4">
                    <div class="w-48 h-1 bg-emerald-500 rounded-full overflow-hidden mx-auto">
                        <div class="h-full bg-white animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Login Page -->
        <div id="loginPage" class="hidden p-6">
            <div class="text-center mt-20 mb-10">
                <i class="fas fa-plane-departure text-6xl text-emerald-600 mb-4"></i>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">Sovereign Travel</h1>
                <p class="text-gray-600">Sistem Travel Agent Terbaik</p>
            </div>

            <div class="card">
                <h2 class="text-xl font-bold mb-4">Login</h2>
                <input type="tel" id="loginPhone" class="input mb-3" placeholder="Nomor WhatsApp (08xxx)">
                <input type="password" id="loginPin" class="input mb-4" placeholder="PIN (opsional)">
                <button onclick="doLogin()" class="btn-primary w-full">
                    <i class="fas fa-sign-in-alt mr-2"></i> Login / Daftar
                </button>
            </div>

            <div class="text-center mt-6 text-sm text-gray-500">
                <p>Belum punya akun? Otomatis terdaftar saat login pertama kali.</p>
            </div>
        </div>

        <!-- Main App (after login) -->
        <div id="mainApp" class="hidden">
            
            <!-- Header -->
            <div class="bg-emerald-600 text-white p-4 sticky top-0 z-10">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-lg font-bold" id="agentName">Sovereign Travel</h1>
                        <p class="text-xs text-emerald-100" id="agentPhone"></p>
                    </div>
                    <button onclick="doLogout()" class="text-white hover:text-emerald-100">
                        <i class="fas fa-sign-out-alt text-xl"></i>
                    </button>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="bg-white border-b sticky top-[72px] z-10">
                <div class="flex overflow-x-auto">
                    <button onclick="showTab('dashboard')" class="flex-1 py-3 px-4 text-sm font-semibold tab-active" id="tab-dashboard">
                        <i class="fas fa-home mr-1"></i> Dashboard
                    </button>
                    <button onclick="showTab('customers')" class="flex-1 py-3 px-4 text-sm font-semibold tab-inactive" id="tab-customers">
                        <i class="fas fa-users mr-1"></i> Jama'ah
                    </button>
                    <button onclick="showTab('bookings')" class="flex-1 py-3 px-4 text-sm font-semibold tab-inactive" id="tab-bookings">
                        <i class="fas fa-ticket-alt mr-1"></i> Booking
                    </button>
                    <button onclick="showTab('packages')" class="flex-1 py-3 px-4 text-sm font-semibold tab-inactive" id="tab-packages">
                        <i class="fas fa-box mr-1"></i> Paket
                    </button>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="p-4 pb-24">
                
                <!-- Dashboard Tab -->
                <div id="content-dashboard" class="slide-up">
                    <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
                    
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <div class="text-3xl font-bold" id="stat-customers">0</div>
                            <div class="text-sm opacity-90">Total Jama'ah</div>
                        </div>
                        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <div class="text-3xl font-bold" id="stat-bookings">0</div>
                            <div class="text-sm opacity-90">Total Booking</div>
                        </div>
                        <div class="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                            <div class="text-3xl font-bold" id="stat-inquiry">0</div>
                            <div class="text-sm opacity-90">Inquiry</div>
                        </div>
                        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <div class="text-3xl font-bold" id="stat-paid">0</div>
                            <div class="text-sm opacity-90">Lunas</div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="font-bold mb-2 flex items-center">
                            <i class="fas fa-chart-line text-emerald-600 mr-2"></i>
                            Quick Actions
                        </h3>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="showTab('customers'); openModal('addCustomer')" class="btn-secondary text-sm py-2">
                                <i class="fas fa-user-plus mr-1"></i> Tambah Jama'ah
                            </button>
                            <button onclick="showTab('bookings'); openModal('addBooking')" class="btn-secondary text-sm py-2">
                                <i class="fas fa-plus mr-1"></i> Booking Baru
                            </button>
                            <button onclick="showTab('packages'); openModal('addPackage')" class="btn-secondary text-sm py-2">
                                <i class="fas fa-box mr-1"></i> Tambah Paket
                            </button>
                            <button onclick="sendWABroadcast()" class="btn-secondary text-sm py-2">
                                <i class="fab fa-whatsapp mr-1"></i> Broadcast WA
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Customers Tab -->
                <div id="content-customers" class="hidden slide-up">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold">Jama'ah</h2>
                        <button onclick="openModal('addCustomer')" class="btn-primary text-sm">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                    
                    <div id="customersList"></div>
                </div>

                <!-- Bookings Tab -->
                <div id="content-bookings" class="hidden slide-up">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold">Booking</h2>
                        <button onclick="openModal('addBooking')" class="btn-primary text-sm">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                    
                    <div id="bookingsList"></div>
                </div>

                <!-- Packages Tab -->
                <div id="content-packages" class="hidden slide-up">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold">Paket Tour</h2>
                        <button onclick="openModal('addPackage')" class="btn-primary text-sm">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                    
                    <div id="packagesList"></div>
                </div>

            </div>

        </div>

    </div>

    <!-- Modals (Add Customer, Add Booking, Add Package) -->
    <div id="modalBackdrop" class="hidden fixed inset-0 bg-black bg-opacity-50 z-40" onclick="closeModal()"></div>
    
    <div id="modalAddCustomer" class="hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Tambah Jama'ah Baru</h3>
        <input type="text" id="newCustomerName" class="input mb-3" placeholder="Nama Lengkap">
        <input type="tel" id="newCustomerPhone" class="input mb-3" placeholder="No HP (08xxx)">
        <input type="email" id="newCustomerEmail" class="input mb-3" placeholder="Email (opsional)">
        <textarea id="newCustomerAddress" class="input mb-4" rows="2" placeholder="Alamat"></textarea>
        <div class="flex gap-2">
            <button onclick="closeModal()" class="btn-secondary flex-1">Batal</button>
            <button onclick="saveCustomer()" class="btn-primary flex-1">Simpan</button>
        </div>
    </div>

    <div id="modalAddPackage" class="hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Tambah Paket Tour</h3>
        <input type="text" id="newPackageName" class="input mb-3" placeholder="Nama Paket (e.g. Umroh Ramadhan)">
        <input type="text" id="newPackageDestination" class="input mb-3" placeholder="Destinasi (e.g. Mekkah-Madinah)">
        <input type="number" id="newPackagePrice" class="input mb-3" placeholder="Harga (e.g. 25000000)">
        <input type="number" id="newPackageDuration" class="input mb-3" placeholder="Durasi (hari)">
        <textarea id="newPackageDescription" class="input mb-4" rows="3" placeholder="Deskripsi paket"></textarea>
        <div class="flex gap-2">
            <button onclick="closeModal()" class="btn-secondary flex-1">Batal</button>
            <button onclick="savePackage()" class="btn-primary flex-1">Simpan</button>
        </div>
    </div>

    <div id="modalAddBooking" class="hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Booking Baru</h3>
        <select id="newBookingCustomer" class="input mb-3">
            <option value="">Pilih Jama'ah</option>
        </select>
        <select id="newBookingPackage" class="input mb-3">
            <option value="">Pilih Paket</option>
        </select>
        <input type="date" id="newBookingDepartureDate" class="input mb-3" placeholder="Tanggal Keberangkatan">
        <input type="number" id="newBookingPrice" class="input mb-3" placeholder="Total Harga">
        <select id="newBookingStatus" class="input mb-4">
            <option value="inquiry">Inquiry</option>
            <option value="dp">DP</option>
            <option value="paid">Lunas</option>
        </select>
        <div class="flex gap-2">
            <button onclick="closeModal()" class="btn-secondary flex-1">Batal</button>
            <button onclick="saveBooking()" class="btn-primary flex-1">Simpan</button>
        </div>
    </div>

    <script>
        // ============================================
        // GLOBAL STATE & CACHE
        // ============================================
        let currentAgent = null;
        let currentTab = 'dashboard';
        let customers = [];
        let packages = [];
        let bookings = [];
        
        // Simple in-memory cache with expiry
        const cache = {
            data: {},
            set(key, value, ttl = 60000) {
                this.data[key] = {
                    value,
                    expiry: Date.now() + ttl
                };
            },
            get(key) {
                const item = this.data[key];
                if (!item) return null;
                if (Date.now() > item.expiry) {
                    delete this.data[key];
                    return null;
                }
                return item.value;
            },
            clear() {
                this.data = {};
            }
        };
        
        // Performance monitoring
        const perf = {
            marks: {},
            start(name) {
                this.marks[name] = Date.now();
            },
            end(name) {
                if (!this.marks[name]) return;
                const duration = Date.now() - this.marks[name];
                console.log('[Perf] ' + name + ': ' + duration + 'ms');
                delete this.marks[name];
                return duration;
            }
        };

        // ============================================
        // INIT
        // ============================================
        async function init() {
            // Register service worker for PWA caching
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('/static/service-worker.js');
                    console.log('[PWA] Service Worker registered');
                } catch (err) {
                    console.log('[PWA] Service Worker registration failed:', err);
                }
            }
            
            // Fast splash screen (reduced to 600ms)
            setTimeout(() => {
                const splash = document.getElementById('loadingScreen');
                splash.classList.add('fade-out');
                
                setTimeout(() => {
                    splash.classList.add('hidden');
                    
                    const stored = localStorage.getItem('sovereign_agent');
                    if (stored) {
                        currentAgent = JSON.parse(stored);
                        showMainApp();
                    } else {
                        document.getElementById('loginPage').classList.remove('hidden');
                    }
                }, 300);
            }, 600);
        }

        // ============================================
        // AUTH
        // ============================================
        async function doLogin() {
            const phone = document.getElementById('loginPhone').value.trim();
            const pin = document.getElementById('loginPin').value.trim();

            if (!phone) {
                alert('Masukkan nomor WhatsApp!');
                return;
            }

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, pin: pin || '0000' })
                });

                const data = await res.json();
                
                if (data.error) {
                    alert(data.error);
                    return;
                }

                currentAgent = data;
                localStorage.setItem('sovereign_agent', JSON.stringify(data));
                
                document.getElementById('loginPage').classList.add('hidden');
                showMainApp();
            } catch (err) {
                alert('Error login: ' + err.message);
            }
        }

        function doLogout() {
            if (confirm('Yakin logout?')) {
                localStorage.removeItem('sovereign_agent');
                location.reload();
            }
        }

        // ============================================
        // MAIN APP
        // ============================================
        async function showMainApp() {
            document.getElementById('mainApp').classList.remove('hidden');
            document.getElementById('agentName').textContent = currentAgent.business_name || currentAgent.name;
            document.getElementById('agentPhone').textContent = currentAgent.phone;

            await loadDashboard();
            await loadCustomers();
            await loadPackages();
            await loadBookings();
        }

        // ============================================
        // TAB NAVIGATION
        // ============================================
        function showTab(tabName) {
            // Hide all content
            ['dashboard', 'customers', 'bookings', 'packages'].forEach(t => {
                document.getElementById('content-' + t).classList.add('hidden');
                document.getElementById('tab-' + t).classList.remove('tab-active');
                document.getElementById('tab-' + t).classList.add('tab-inactive');
            });

            // Show selected
            document.getElementById('content-' + tabName).classList.remove('hidden');
            document.getElementById('tab-' + tabName).classList.add('tab-active');
            document.getElementById('tab-' + tabName).classList.remove('tab-inactive');
            
            currentTab = tabName;
        }

        // ============================================
        // DASHBOARD
        // ============================================
        async function loadDashboard() {
            try {
                // Show skeleton loading
                showSkeletonLoading('stat-customers');
                showSkeletonLoading('stat-bookings');
                showSkeletonLoading('stat-inquiry');
                showSkeletonLoading('stat-paid');
                
                const res = await fetch('/api/dashboard?agent_id=' + currentAgent.id);
                const stats = await res.json();

                // Animate counter update
                animateCounter('stat-customers', stats.total_customers);
                animateCounter('stat-bookings', stats.total_bookings);
                animateCounter('stat-inquiry', stats.inquiry);
                animateCounter('stat-paid', stats.paid);
            } catch (err) {
                console.error('Error loading dashboard:', err);
                // Show error state
                document.getElementById('stat-customers').textContent = '—';
                document.getElementById('stat-bookings').textContent = '—';
                document.getElementById('stat-inquiry').textContent = '—';
                document.getElementById('stat-paid').textContent = '—';
            }
        }
        
        // Helper: Show skeleton loading
        function showSkeletonLoading(elementId) {
            const el = document.getElementById(elementId);
            el.innerHTML = '<div class="skeleton h-8 w-16"></div>';
        }
        
        // Helper: Animate counter
        function animateCounter(elementId, targetValue) {
            const el = document.getElementById(elementId);
            let current = 0;
            const increment = Math.ceil(targetValue / 20);
            const timer = setInterval(() => {
                current += increment;
                if (current >= targetValue) {
                    current = targetValue;
                    clearInterval(timer);
                }
                el.textContent = current;
            }, 30);
        }

        // ============================================
        // CUSTOMERS
        // ============================================
        async function loadCustomers() {
            perf.start('loadCustomers');
            
            try {
                // Check cache first
                const cacheKey = 'customers_' + currentAgent.id;
                const cached = cache.get(cacheKey);
                
                if (cached) {
                    customers = cached;
                    renderCustomers();
                    perf.end('loadCustomers');
                    return;
                }
                
                // Fetch from API
                const res = await fetch('/api/customers?agent_id=' + currentAgent.id);
                customers = await res.json();
                
                // Cache for 1 minute
                cache.set(cacheKey, customers, 60000);
                
                renderCustomers();
                perf.end('loadCustomers');
            } catch (err) {
                console.error('Error loading customers:', err);
                perf.end('loadCustomers');
            }
        }
        
        function renderCustomers() {
            const html = customers.length === 0 
                ? '<div class="card text-center text-gray-500"><i class="fas fa-users text-4xl mb-2"></i><p>Belum ada jama\'ah</p></div>'
                : customers.map(c => '<div class="card"><div class="flex items-start justify-between"><div class="flex-1"><h3 class="font-bold text-lg">' + c.name + '</h3><p class="text-sm text-gray-600"><i class="fas fa-phone mr-1"></i> ' + c.phone + '</p>' + (c.email ? '<p class="text-sm text-gray-600"><i class="fas fa-envelope mr-1"></i> ' + c.email + '</p>' : '') + '</div><a href="https://wa.me/62' + c.phone.replace(/^0/, '') + '" target="_blank" class="text-green-600 hover:text-green-700"><i class="fab fa-whatsapp text-2xl"></i></a></div></div>').join('');

            document.getElementById('customersList').innerHTML = html;

            // Update booking modal customer select
            const selectHTML = '<option value="">Pilih Jama\'ah</option>' + 
                customers.map(c => '<option value="' + c.id + '">' + c.name + ' (' + c.phone + ')</option>').join('');
            document.getElementById('newBookingCustomer').innerHTML = selectHTML;
        }
            } catch (err) {
                console.error('Error loading customers:', err);
            }
        }

        async function saveCustomer() {
            const name = document.getElementById('newCustomerName').value.trim();
            const phone = document.getElementById('newCustomerPhone').value.trim();
            const email = document.getElementById('newCustomerEmail').value.trim();
            const address = document.getElementById('newCustomerAddress').value.trim();

            if (!name || !phone) {
                alert('Nama dan No HP wajib diisi!');
                return;
            }

            try {
                const res = await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agent_id: currentAgent.id,
                        name, phone, email, address
                    })
                });

                const data = await res.json();
                
                if (data.error) {
                    alert(data.error);
                    return;
                }

                closeModal();
                await loadCustomers();
                await loadDashboard();
                
                // Clear form
                document.getElementById('newCustomerName').value = '';
                document.getElementById('newCustomerPhone').value = '';
                document.getElementById('newCustomerEmail').value = '';
                document.getElementById('newCustomerAddress').value = '';
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }

        // ============================================
        // PACKAGES
        // ============================================
        async function loadPackages() {
            try {
                const res = await fetch('/api/packages?agent_id=' + currentAgent.id);
                packages = await res.json();

                const html = packages.length === 0
                    ? '<div class="card text-center text-gray-500"><i class="fas fa-box text-4xl mb-2"></i><p>Belum ada paket</p></div>'
                    : packages.map(p => \`
                        <div class="card">
                            <h3 class="font-bold text-lg mb-1">\${p.name}</h3>
                            <p class="text-sm text-gray-600 mb-2"><i class="fas fa-map-marker-alt mr-1"></i> \${p.destination || '-'}</p>
                            <div class="flex items-center justify-between">
                                <div class="text-emerald-600 font-bold text-xl">Rp \${parseInt(p.price).toLocaleString('id-ID')}</div>
                                <div class="text-sm text-gray-500">\${p.duration_days || '-'} hari</div>
                            </div>
                        </div>
                    \`).join('');

                document.getElementById('packagesList').innerHTML = html;

                // Update booking modal package select
                const selectHTML = '<option value="">Pilih Paket</option>' + 
                    packages.map(p => \`<option value="\${p.id}">\${p.name} - Rp \${parseInt(p.price).toLocaleString('id-ID')}</option>\`).join('');
                document.getElementById('newBookingPackage').innerHTML = selectHTML;
            } catch (err) {
                console.error('Error loading packages:', err);
            }
        }

        async function savePackage() {
            const name = document.getElementById('newPackageName').value.trim();
            const destination = document.getElementById('newPackageDestination').value.trim();
            const price = document.getElementById('newPackagePrice').value.trim();
            const duration_days = document.getElementById('newPackageDuration').value.trim();
            const description = document.getElementById('newPackageDescription').value.trim();

            if (!name || !price) {
                alert('Nama paket dan harga wajib diisi!');
                return;
            }

            try {
                const res = await fetch('/api/packages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agent_id: currentAgent.id,
                        name, destination, price: parseFloat(price), 
                        duration_days: parseInt(duration_days) || null, description
                    })
                });

                const data = await res.json();
                
                if (data.error) {
                    alert(data.error);
                    return;
                }

                closeModal();
                await loadPackages();
                await loadDashboard();
                
                // Clear form
                document.getElementById('newPackageName').value = '';
                document.getElementById('newPackageDestination').value = '';
                document.getElementById('newPackagePrice').value = '';
                document.getElementById('newPackageDuration').value = '';
                document.getElementById('newPackageDescription').value = '';
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }

        // ============================================
        // BOOKINGS
        // ============================================
        async function loadBookings() {
            try {
                const res = await fetch('/api/bookings?agent_id=' + currentAgent.id);
                bookings = await res.json();

                const statusBadge = (status) => {
                    const map = {
                        inquiry: 'badge-inquiry',
                        dp: 'badge-dp',
                        paid: 'badge-paid',
                        departed: 'badge-departed'
                    };
                    return map[status] || 'badge-inquiry';
                };

                const html = bookings.length === 0
                    ? '<div class="card text-center text-gray-500"><i class="fas fa-ticket-alt text-4xl mb-2"></i><p>Belum ada booking</p></div>'
                    : bookings.map(b => \`
                        <div class="card">
                            <div class="flex items-start justify-between mb-2">
                                <h3 class="font-bold text-lg">\${b.customer?.name || 'N/A'}</h3>
                                <span class="badge \${statusBadge(b.status)}">\${b.status.toUpperCase()}</span>
                            </div>
                            <p class="text-sm text-gray-600 mb-1"><i class="fas fa-box mr-1"></i> \${b.package?.name || 'N/A'}</p>
                            <p class="text-sm text-gray-600 mb-1"><i class="fas fa-map-marker-alt mr-1"></i> \${b.package?.destination || '-'}</p>
                            <div class="flex items-center justify-between mt-3 pt-3 border-t">
                                <div class="text-emerald-600 font-bold">Rp \${parseInt(b.total_price).toLocaleString('id-ID')}</div>
                                <button onclick="changeBookingStatus('\${b.id}', '\${b.status}')" class="text-blue-600 text-sm">
                                    <i class="fas fa-edit mr-1"></i> Ubah Status
                                </button>
                            </div>
                        </div>
                    \`).join('');

                document.getElementById('bookingsList').innerHTML = html;
            } catch (err) {
                console.error('Error loading bookings:', err);
            }
        }

        async function saveBooking() {
            const customer_id = document.getElementById('newBookingCustomer').value;
            const package_id = document.getElementById('newBookingPackage').value;
            const departure_date = document.getElementById('newBookingDepartureDate').value;
            const total_price = document.getElementById('newBookingPrice').value.trim();
            const status = document.getElementById('newBookingStatus').value;

            if (!customer_id || !package_id || !total_price) {
                alert('Semua field wajib diisi!');
                return;
            }

            try {
                const res = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agent_id: currentAgent.id,
                        customer_id, package_id, 
                        departure_date: departure_date || null,
                        total_price: parseFloat(total_price), 
                        status
                    })
                });

                const data = await res.json();
                
                if (data.error) {
                    alert(data.error);
                    return;
                }

                closeModal();
                await loadBookings();
                await loadDashboard();
                
                // Clear form
                document.getElementById('newBookingCustomer').value = '';
                document.getElementById('newBookingPackage').value = '';
                document.getElementById('newBookingDepartureDate').value = '';
                document.getElementById('newBookingPrice').value = '';
                document.getElementById('newBookingStatus').value = 'inquiry';
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }

        async function changeBookingStatus(id, currentStatus) {
            const statuses = ['inquiry', 'dp', 'paid', 'departed'];
            const currentIndex = statuses.indexOf(currentStatus);
            const nextStatus = statuses[(currentIndex + 1) % statuses.length];

            if (confirm(\`Ubah status menjadi \${nextStatus.toUpperCase()}?\`)) {
                try {
                    const res = await fetch(\`/api/bookings/\${id}/status\`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: nextStatus })
                    });

                    await loadBookings();
                    await loadDashboard();
                } catch (err) {
                    alert('Error: ' + err.message);
                }
            }
        }

        // ============================================
        // MODALS
        // ============================================
        function openModal(modalId) {
            document.getElementById('modalBackdrop').classList.remove('hidden');
            document.getElementById('modal' + modalId.charAt(0).toUpperCase() + modalId.slice(1)).classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('modalBackdrop').classList.add('hidden');
            document.querySelectorAll('[id^="modal"]').forEach(modal => {
                modal.classList.add('hidden');
            });
        }

        // ============================================
        // WHATSAPP
        // ============================================
        async function sendWABroadcast() {
            const message = prompt('Ketik pesan broadcast:');
            if (!message) return;

            if (customers.length === 0) {
                alert('Belum ada jama\'ah untuk dikirim pesan!');
                return;
            }

            if (confirm(\`Kirim broadcast ke \${customers.length} jama'ah?\`)) {
                for (const c of customers) {
                    try {
                        await fetch('/api/wa/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                target: c.phone,
                                message: message
                            })
                        });
                        await new Promise(r => setTimeout(r, 2000)); // Delay 2s
                    } catch (err) {
                        console.error('Error sending to', c.phone, err);
                    }
                }
                alert('Broadcast selesai terkirim!');
            }
        }

        // ============================================
        // START APP
        // ============================================
        init();
    </script>
</body>
</html>
  `)
})

export default app
