// ============================================
// SOVEREIGN TRAVEL AGENT - PWA Complete v1.2
// Stack: Hono + Cloudflare Pages + Supabase + Fonnte
// Fix: Loading stuck, syntax errors, error handling
// ============================================

import { Hono } from 'hono'
import { cors } from 'hono/cors'
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

// Helper: Get Supabase client (with validation)
const getSupabase = (c: any) => {
  const url = c.env.SUPABASE_URL
  const key = c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase credentials not configured')
  }
  return createClient(url, key)
}

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'Sovereign Travel Agent v1.2',
    timestamp: new Date().toISOString(),
    supabase_configured: !!(c.env.SUPABASE_URL && (c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY))
  })
})

// Auth - Login
app.post('/api/auth/login', async (c) => {
  try {
    const sb = getSupabase(c)
    const { phone, pin } = await c.req.json()

    let { data: agent, error: selectError } = await sb.from('agents')
      .select('*').eq('phone', phone).single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = not found, anything else is a real error
      return c.json({ error: 'Database error: ' + selectError.message }, 500)
    }

    if (!agent) {
      const { data: newAgent, error: insertError } = await sb.from('agents')
        .insert({ phone, name: 'Agent ' + phone.slice(-4), business_name: 'Travel Agent' })
        .select().single()
      
      if (insertError) {
        return c.json({ error: 'Gagal membuat akun: ' + insertError.message }, 500)
      }
      agent = newAgent
    }

    if (!agent) return c.json({ error: 'Gagal membuat akun' }, 500)

    return c.json({
      id: agent.id,
      name: agent.name,
      phone: agent.phone,
      business_name: agent.business_name
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Login error' }, 500)
  }
})

// Customers - List
app.get('/api/customers', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')
    const { data, error } = await sb.from('customers')
      .select('*')
      .eq('agent_id', agent_id)
      .order('created_at', { ascending: false })
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Customers - Create
app.post('/api/customers', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('customers')
      .insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Customers - Update
app.put('/api/customers/:id', async (c) => {
  try {
    const sb = getSupabase(c)
    const id = c.req.param('id')
    const body = await c.req.json()
    const { data, error } = await sb.from('customers')
      .update(body).eq('id', id).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Packages - List
app.get('/api/packages', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')
    const { data, error } = await sb.from('packages')
      .select('*')
      .eq('agent_id', agent_id)
      .order('created_at', { ascending: false })
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Packages - Create
app.post('/api/packages', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('packages')
      .insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Bookings - List
app.get('/api/bookings', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')
    const { data, error } = await sb.from('bookings')
      .select('*, customer:customers(name, phone), package:packages(name, destination, price)')
      .eq('agent_id', agent_id)
      .order('created_at', { ascending: false })
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Bookings - Create
app.post('/api/bookings', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('bookings')
      .insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Bookings - Update Status
app.put('/api/bookings/:id/status', async (c) => {
  try {
    const sb = getSupabase(c)
    const id = c.req.param('id')
    const { status } = await c.req.json()
    const { data, error } = await sb.from('bookings')
      .update({ status }).eq('id', id).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Payments - List
app.get('/api/payments', async (c) => {
  try {
    const sb = getSupabase(c)
    const booking_id = c.req.query('booking_id')
    const { data, error } = await sb.from('payments')
      .select('*')
      .eq('booking_id', booking_id)
      .order('payment_date', { ascending: false })
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data || [])
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Payments - Create
app.post('/api/payments', async (c) => {
  try {
    const sb = getSupabase(c)
    const body = await c.req.json()
    const { data, error } = await sb.from('payments')
      .insert(body).select().single()
    if (error) return c.json({ error: error.message }, 500)
    return c.json(data)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Dashboard Stats
app.get('/api/dashboard', async (c) => {
  try {
    const sb = getSupabase(c)
    const agent_id = c.req.query('agent_id')

    const [bookingsRes, customersRes, packagesRes] = await Promise.all([
      sb.from('bookings').select('status').eq('agent_id', agent_id),
      sb.from('customers').select('*', { count: 'exact', head: true }).eq('agent_id', agent_id),
      sb.from('packages').select('*', { count: 'exact', head: true }).eq('agent_id', agent_id)
    ])

    const bookings = bookingsRes.data || []
    return c.json({
      total_customers: customersRes.count || 0,
      total_packages: packagesRes.count || 0,
      total_bookings: bookings.length,
      inquiry: bookings.filter((b: any) => b.status === 'inquiry').length,
      dp: bookings.filter((b: any) => b.status === 'dp').length,
      paid: bookings.filter((b: any) => b.status === 'paid').length,
      departed: bookings.filter((b: any) => b.status === 'departed').length
    })
  } catch (err: any) {
    return c.json({
      total_customers: 0, total_packages: 0, total_bookings: 0,
      inquiry: 0, dp: 0, paid: 0, departed: 0,
      error: err.message
    })
  }
})

// WhatsApp - Send Message
app.post('/api/wa/send', async (c) => {
  try {
    const { target, message } = await c.req.json()
    const token = c.env.FONNTE_TOKEN
    if (!token) return c.json({ error: 'Fonnte token not configured' }, 500)

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
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// WhatsApp - Webhook (Auto-Reply)
app.post('/api/wa/webhook', async (c) => {
  try {
    const body = await c.req.json()
    const { sender, message } = body
    const token = c.env.FONNTE_TOKEN

    const upperMsg = (message || '').trim().toUpperCase()
    let reply = ''

    if (upperMsg === 'INFO') {
      reply = "🌍 *SOVEREIGN TRAVEL AGENT*\n\nSistem manajemen travel agent berbasis WhatsApp.\n\nFitur:\n✅ Database jama'ah\n✅ Booking & payment tracking\n✅ Auto-reminder\n✅ Laporan keuangan\n\nKetik HARGA untuk info harga."
    } else if (upperMsg === 'HARGA') {
      reply = "💰 *PAKET SOVEREIGN TRAVEL*\n\n📦 FREE\n- 10 customers\n- 5 bookings/bulan\n\n📦 BASIC - Rp 149.000/bulan\n- 100 customers\n- Unlimited bookings\n- WA broadcast\n\n📦 PRO - Rp 299.000/bulan\n- Unlimited customers\n- Multi-agent\n- Priority support\n\nKetik DAFTAR untuk mulai trial gratis!"
    } else if (upperMsg === 'DAFTAR') {
      reply = "🎉 Daftar trial gratis:\n\n1. Buka: https://sovereign-travel-agent.pages.dev\n2. Login dengan nomor WA kamu\n3. Mulai manage jama'ah!\n\nAda pertanyaan? Ketik BANTUAN"
    } else if (upperMsg === 'BANTUAN') {
      reply = "📞 Butuh bantuan?\n\nWhatsApp: 085643383832\nEmail: support@sovereign.com\n\nKetik:\n- INFO = Info sistem\n- HARGA = Paket harga\n- DAFTAR = Trial gratis"
    } else {
      reply = "Halo! Selamat datang di Sovereign Travel Agent.\n\nKetik:\n- INFO = Info sistem\n- HARGA = Paket & harga\n- DAFTAR = Trial gratis\n- BANTUAN = Hubungi support"
    }

    if (reply && token) {
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
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// ============================================
// MAIN WEB APP (PWA) - v1.2 Fixed
// ============================================

app.get('/', (c) => {
  return c.html(getAppHTML())
})

function getAppHTML(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Sovereign Travel Agent</title>
    <meta name="description" content="Sistem manajemen travel agent berbasis WhatsApp untuk Indonesia">
    <meta name="theme-color" content="#059669">
    <link rel="manifest" href="/static/manifest.json">
    <link rel="apple-touch-icon" href="/static/icon-192.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * { -webkit-tap-highlight-color: transparent; }
        body { overscroll-behavior-y: none; margin: 0; padding: 0; }
        .slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-out { animation: fadeOut 0.4s ease-out forwards; }
        @keyframes fadeOut { to { opacity: 0; visibility: hidden; } }
        .tab-active { background: #059669; color: white; }
        .tab-inactive { background: white; color: #374151; }
        .tab-inactive:hover { background: #f9fafb; }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app" class="max-w-md mx-auto min-h-screen bg-white shadow-lg relative">
        
        <!-- Splash Screen -->
        <div id="splashScreen" class="fixed inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 z-50 flex items-center justify-center transition-opacity duration-300">
            <div class="text-center text-white">
                <div class="mb-4">
                    <i class="fas fa-plane-departure text-6xl animate-bounce"></i>
                </div>
                <h1 class="text-2xl font-bold mb-2">Sovereign Travel</h1>
                <p class="text-emerald-100 text-sm" id="splashStatus">Memuat...</p>
                <div class="mt-4 w-48 h-1.5 bg-emerald-500/50 rounded-full overflow-hidden mx-auto">
                    <div class="h-full bg-white rounded-full" id="splashProgress" style="width:0%;transition:width 0.3s ease"></div>
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
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-xl font-bold mb-4">Login</h2>
                <input type="tel" id="loginPhone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-3" placeholder="Nomor WhatsApp (08xxx)">
                <input type="password" id="loginPin" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4" placeholder="PIN (opsional)">
                <button onclick="doLogin()" id="loginBtn" class="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition">
                    <i class="fas fa-sign-in-alt mr-2"></i> Login / Daftar
                </button>
                <div id="loginError" class="hidden mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm"></div>
            </div>
            <div class="text-center mt-6 text-sm text-gray-500">
                <p>Belum punya akun? Otomatis terdaftar saat login pertama.</p>
            </div>
        </div>

        <!-- Main App -->
        <div id="mainApp" class="hidden">
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

            <div class="bg-white border-b sticky top-[72px] z-10">
                <div class="flex overflow-x-auto">
                    <button onclick="showTab('dashboard')" class="flex-1 py-3 px-4 text-sm font-semibold tab-active" id="tab-dashboard">
                        <i class="fas fa-home mr-1"></i> Home
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

            <div class="p-4 pb-24">
                <!-- Dashboard -->
                <div id="content-dashboard" class="slide-up">
                    <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-sm p-4">
                            <div class="text-3xl font-bold" id="stat-customers">-</div>
                            <div class="text-sm opacity-90">Total Jama'ah</div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-sm p-4">
                            <div class="text-3xl font-bold" id="stat-bookings">-</div>
                            <div class="text-sm opacity-90">Total Booking</div>
                        </div>
                        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-sm p-4">
                            <div class="text-3xl font-bold" id="stat-inquiry">-</div>
                            <div class="text-sm opacity-90">Inquiry</div>
                        </div>
                        <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-sm p-4">
                            <div class="text-3xl font-bold" id="stat-paid">-</div>
                            <div class="text-sm opacity-90">Lunas</div>
                        </div>
                    </div>
                    <div id="dashboardError" class="hidden mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm"></div>
                    <div class="bg-white rounded-xl shadow-sm p-4">
                        <h3 class="font-bold mb-2 flex items-center">
                            <i class="fas fa-bolt text-emerald-600 mr-2"></i> Quick Actions
                        </h3>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="showTab('customers'); openModal('AddCustomer')" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                                <i class="fas fa-user-plus mr-1"></i> Tambah Jama'ah
                            </button>
                            <button onclick="showTab('bookings'); openModal('AddBooking')" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                                <i class="fas fa-plus mr-1"></i> Booking Baru
                            </button>
                            <button onclick="showTab('packages'); openModal('AddPackage')" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                                <i class="fas fa-box mr-1"></i> Tambah Paket
                            </button>
                            <button onclick="sendWABroadcast()" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                                <i class="fab fa-whatsapp mr-1"></i> Broadcast WA
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Customers -->
                <div id="content-customers" class="hidden slide-up">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold">Jama'ah</h2>
                        <button onclick="openModal('AddCustomer')" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                    <div id="customersList"><div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2">Memuat data...</p></div></div>
                </div>

                <!-- Bookings -->
                <div id="content-bookings" class="hidden slide-up">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold">Booking</h2>
                        <button onclick="openModal('AddBooking')" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                    <div id="bookingsList"><div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2">Memuat data...</p></div></div>
                </div>

                <!-- Packages -->
                <div id="content-packages" class="hidden slide-up">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold">Paket Tour</h2>
                        <button onclick="openModal('AddPackage')" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                            <i class="fas fa-plus mr-1"></i> Tambah
                        </button>
                    </div>
                    <div id="packagesList"><div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2">Memuat data...</p></div></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div id="modalBackdrop" class="hidden fixed inset-0 bg-black bg-opacity-50 z-40" onclick="closeModal()"></div>
    
    <div id="modalAddCustomer" class="hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Tambah Jama'ah Baru</h3>
        <input type="text" id="newCustomerName" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="Nama Lengkap">
        <input type="tel" id="newCustomerPhone" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="No HP (08xxx)">
        <input type="email" id="newCustomerEmail" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="Email (opsional)">
        <textarea id="newCustomerAddress" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4" rows="2" placeholder="Alamat"></textarea>
        <div class="flex gap-2">
            <button onclick="closeModal()" class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold">Batal</button>
            <button onclick="saveCustomer()" class="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold">Simpan</button>
        </div>
    </div>

    <div id="modalAddPackage" class="hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Tambah Paket Tour</h3>
        <input type="text" id="newPackageName" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="Nama Paket">
        <input type="text" id="newPackageDestination" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="Destinasi">
        <input type="number" id="newPackagePrice" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="Harga">
        <input type="number" id="newPackageDuration" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="Durasi (hari)">
        <textarea id="newPackageDescription" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4" rows="3" placeholder="Deskripsi paket"></textarea>
        <div class="flex gap-2">
            <button onclick="closeModal()" class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold">Batal</button>
            <button onclick="savePackage()" class="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold">Simpan</button>
        </div>
    </div>

    <div id="modalAddBooking" class="hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Booking Baru</h3>
        <select id="newBookingCustomer" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3">
            <option value="">Pilih Jama'ah</option>
        </select>
        <select id="newBookingPackage" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3">
            <option value="">Pilih Paket</option>
        </select>
        <input type="date" id="newBookingDepartureDate" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="Tanggal Keberangkatan">
        <input type="number" id="newBookingPrice" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" placeholder="Total Harga">
        <select id="newBookingStatus" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4">
            <option value="inquiry">Inquiry</option>
            <option value="dp">DP</option>
            <option value="paid">Lunas</option>
        </select>
        <div class="flex gap-2">
            <button onclick="closeModal()" class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold">Batal</button>
            <button onclick="saveBooking()" class="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold">Simpan</button>
        </div>
    </div>

    <script>
        // ============================================
        // GLOBAL STATE
        // ============================================
        var currentAgent = null;
        var currentTab = 'dashboard';
        var customers = [];
        var packages = [];
        var bookings = [];

        // ============================================
        // INIT - Fixed: no more stuck loading
        // ============================================
        function init() {
            var progress = document.getElementById('splashProgress');
            var statusEl = document.getElementById('splashStatus');
            
            // Animate progress bar
            progress.style.width = '30%';
            statusEl.textContent = 'Memeriksa sesi...';
            
            setTimeout(function() {
                progress.style.width = '70%';
                statusEl.textContent = 'Mempersiapkan...';
            }, 200);
            
            setTimeout(function() {
                progress.style.width = '100%';
                statusEl.textContent = 'Siap!';
            }, 400);

            // Hide splash after animation completes
            setTimeout(function() {
                var splash = document.getElementById('splashScreen');
                splash.classList.add('fade-out');
                
                setTimeout(function() {
                    splash.style.display = 'none';
                    
                    // Check for stored session
                    var stored = localStorage.getItem('sovereign_agent');
                    if (stored) {
                        try {
                            currentAgent = JSON.parse(stored);
                            showMainApp();
                        } catch (e) {
                            localStorage.removeItem('sovereign_agent');
                            document.getElementById('loginPage').classList.remove('hidden');
                        }
                    } else {
                        document.getElementById('loginPage').classList.remove('hidden');
                    }
                }, 400);
            }, 600);

            // Register service worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/static/service-worker.js').catch(function() {});
            }
        }

        // ============================================
        // AUTH
        // ============================================
        function doLogin() {
            var phone = document.getElementById('loginPhone').value.trim();
            var pin = document.getElementById('loginPin').value.trim();
            var errorEl = document.getElementById('loginError');
            var btn = document.getElementById('loginBtn');

            if (!phone) {
                errorEl.textContent = 'Masukkan nomor WhatsApp!';
                errorEl.classList.remove('hidden');
                return;
            }

            errorEl.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...';

            fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone, pin: pin || '0000' })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Login / Daftar';
                
                if (data.error) {
                    errorEl.textContent = data.error;
                    errorEl.classList.remove('hidden');
                    return;
                }

                currentAgent = data;
                localStorage.setItem('sovereign_agent', JSON.stringify(data));
                document.getElementById('loginPage').classList.add('hidden');
                showMainApp();
            })
            .catch(function(err) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Login / Daftar';
                errorEl.textContent = 'Error: ' + (err.message || 'Koneksi gagal. Cek internet Anda.');
                errorEl.classList.remove('hidden');
            });
        }

        function doLogout() {
            if (confirm('Yakin logout?')) {
                localStorage.removeItem('sovereign_agent');
                location.reload();
            }
        }

        // ============================================
        // MAIN APP - Fixed: parallel loading with error tolerance
        // ============================================
        function showMainApp() {
            document.getElementById('mainApp').classList.remove('hidden');
            document.getElementById('agentName').textContent = currentAgent.business_name || currentAgent.name || 'Travel Agent';
            document.getElementById('agentPhone').textContent = currentAgent.phone || '';

            // Load all data in parallel - errors won't block UI
            loadDashboard();
            loadCustomers();
            loadPackages();
            loadBookings();
        }

        // ============================================
        // TAB NAVIGATION
        // ============================================
        function showTab(tabName) {
            var tabs = ['dashboard', 'customers', 'bookings', 'packages'];
            for (var i = 0; i < tabs.length; i++) {
                var t = tabs[i];
                document.getElementById('content-' + t).classList.add('hidden');
                document.getElementById('tab-' + t).className = 'flex-1 py-3 px-4 text-sm font-semibold tab-inactive';
            }
            document.getElementById('content-' + tabName).classList.remove('hidden');
            document.getElementById('tab-' + tabName).className = 'flex-1 py-3 px-4 text-sm font-semibold tab-active';
            currentTab = tabName;
        }

        // ============================================
        // DASHBOARD - Fixed: error tolerant
        // ============================================
        function loadDashboard() {
            if (!currentAgent) return;
            
            fetch('/api/dashboard?agent_id=' + currentAgent.id)
            .then(function(res) { return res.json(); })
            .then(function(stats) {
                document.getElementById('stat-customers').textContent = stats.total_customers || 0;
                document.getElementById('stat-bookings').textContent = stats.total_bookings || 0;
                document.getElementById('stat-inquiry').textContent = stats.inquiry || 0;
                document.getElementById('stat-paid').textContent = stats.paid || 0;
                
                if (stats.error) {
                    var errEl = document.getElementById('dashboardError');
                    errEl.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> Database belum setup. <a href="https://supabase.com/dashboard/project/bkcvrpcunyjgetpkoyjx" target="_blank" class="underline font-semibold">Setup Supabase</a>';
                    errEl.classList.remove('hidden');
                }
            })
            .catch(function(err) {
                console.error('Dashboard load error:', err);
                document.getElementById('stat-customers').textContent = '0';
                document.getElementById('stat-bookings').textContent = '0';
                document.getElementById('stat-inquiry').textContent = '0';
                document.getElementById('stat-paid').textContent = '0';
            });
        }

        // ============================================
        // CUSTOMERS - Fixed: no syntax errors
        // ============================================
        function loadCustomers() {
            if (!currentAgent) return;
            
            fetch('/api/customers?agent_id=' + currentAgent.id)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.error) {
                    customers = [];
                } else {
                    customers = data;
                }
                renderCustomers();
            })
            .catch(function(err) {
                console.error('Customers load error:', err);
                customers = [];
                renderCustomers();
            });
        }

        function renderCustomers() {
            var html = '';
            if (customers.length === 0) {
                html = '<div class="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500"><i class="fas fa-users text-4xl mb-2"></i><p>Belum ada data jama\\'ah</p></div>';
            } else {
                for (var i = 0; i < customers.length; i++) {
                    var c = customers[i];
                    var waNum = c.phone ? c.phone.replace(/^0/, '') : '';
                    html += '<div class="bg-white rounded-xl shadow-sm p-4 mb-3">';
                    html += '<div class="flex items-start justify-between">';
                    html += '<div class="flex-1">';
                    html += '<h3 class="font-bold text-lg">' + (c.name || '-') + '</h3>';
                    html += '<p class="text-sm text-gray-600"><i class="fas fa-phone mr-1"></i> ' + (c.phone || '-') + '</p>';
                    if (c.email) html += '<p class="text-sm text-gray-600"><i class="fas fa-envelope mr-1"></i> ' + c.email + '</p>';
                    html += '</div>';
                    html += '<a href="https://wa.me/62' + waNum + '" target="_blank" class="text-green-600 hover:text-green-700 ml-2"><i class="fab fa-whatsapp text-2xl"></i></a>';
                    html += '</div></div>';
                }
            }
            document.getElementById('customersList').innerHTML = html;

            // Update booking modal select
            var selectHTML = '<option value="">Pilih Jama\\'ah</option>';
            for (var j = 0; j < customers.length; j++) {
                selectHTML += '<option value="' + customers[j].id + '">' + customers[j].name + ' (' + customers[j].phone + ')</option>';
            }
            document.getElementById('newBookingCustomer').innerHTML = selectHTML;
        }

        function saveCustomer() {
            var name = document.getElementById('newCustomerName').value.trim();
            var phone = document.getElementById('newCustomerPhone').value.trim();
            var email = document.getElementById('newCustomerEmail').value.trim();
            var address = document.getElementById('newCustomerAddress').value.trim();

            if (!name || !phone) { alert('Nama dan No HP wajib diisi!'); return; }

            fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent_id: currentAgent.id, name: name, phone: phone, email: email, address: address })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.error) { alert(data.error); return; }
                closeModal();
                loadCustomers();
                loadDashboard();
                document.getElementById('newCustomerName').value = '';
                document.getElementById('newCustomerPhone').value = '';
                document.getElementById('newCustomerEmail').value = '';
                document.getElementById('newCustomerAddress').value = '';
            })
            .catch(function(err) { alert('Error: ' + err.message); });
        }

        // ============================================
        // PACKAGES - Fixed: no template literals in inline script
        // ============================================
        function loadPackages() {
            if (!currentAgent) return;
            
            fetch('/api/packages?agent_id=' + currentAgent.id)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.error) {
                    packages = [];
                } else {
                    packages = data;
                }
                renderPackages();
            })
            .catch(function(err) {
                console.error('Packages load error:', err);
                packages = [];
                renderPackages();
            });
        }

        function renderPackages() {
            var html = '';
            if (packages.length === 0) {
                html = '<div class="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500"><i class="fas fa-box text-4xl mb-2"></i><p>Belum ada paket tour</p></div>';
            } else {
                for (var i = 0; i < packages.length; i++) {
                    var p = packages[i];
                    var price = p.price ? parseInt(p.price).toLocaleString('id-ID') : '0';
                    html += '<div class="bg-white rounded-xl shadow-sm p-4 mb-3">';
                    html += '<h3 class="font-bold text-lg mb-1">' + (p.name || '-') + '</h3>';
                    html += '<p class="text-sm text-gray-600 mb-2"><i class="fas fa-map-marker-alt mr-1"></i> ' + (p.destination || '-') + '</p>';
                    html += '<div class="flex items-center justify-between">';
                    html += '<div class="text-emerald-600 font-bold text-xl">Rp ' + price + '</div>';
                    html += '<div class="text-sm text-gray-500">' + (p.duration_days || '-') + ' hari</div>';
                    html += '</div></div>';
                }
            }
            document.getElementById('packagesList').innerHTML = html;

            var selectHTML = '<option value="">Pilih Paket</option>';
            for (var j = 0; j < packages.length; j++) {
                var pp = packages[j];
                var ppPrice = pp.price ? parseInt(pp.price).toLocaleString('id-ID') : '0';
                selectHTML += '<option value="' + pp.id + '">' + pp.name + ' - Rp ' + ppPrice + '</option>';
            }
            document.getElementById('newBookingPackage').innerHTML = selectHTML;
        }

        function savePackage() {
            var name = document.getElementById('newPackageName').value.trim();
            var destination = document.getElementById('newPackageDestination').value.trim();
            var price = document.getElementById('newPackagePrice').value.trim();
            var duration_days = document.getElementById('newPackageDuration').value.trim();
            var description = document.getElementById('newPackageDescription').value.trim();

            if (!name || !price) { alert('Nama paket dan harga wajib diisi!'); return; }

            fetch('/api/packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent_id: currentAgent.id, name: name, destination: destination, price: parseFloat(price), duration_days: parseInt(duration_days) || null, description: description })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.error) { alert(data.error); return; }
                closeModal();
                loadPackages();
                loadDashboard();
                document.getElementById('newPackageName').value = '';
                document.getElementById('newPackageDestination').value = '';
                document.getElementById('newPackagePrice').value = '';
                document.getElementById('newPackageDuration').value = '';
                document.getElementById('newPackageDescription').value = '';
            })
            .catch(function(err) { alert('Error: ' + err.message); });
        }

        // ============================================
        // BOOKINGS - Fixed
        // ============================================
        function loadBookings() {
            if (!currentAgent) return;
            
            fetch('/api/bookings?agent_id=' + currentAgent.id)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.error) {
                    bookings = [];
                } else {
                    bookings = data;
                }
                renderBookings();
            })
            .catch(function(err) {
                console.error('Bookings load error:', err);
                bookings = [];
                renderBookings();
            });
        }

        function renderBookings() {
            var badgeClass = { inquiry: 'bg-blue-100 text-blue-800', dp: 'bg-yellow-100 text-yellow-800', paid: 'bg-green-100 text-green-800', departed: 'bg-purple-100 text-purple-800' };
            var html = '';
            if (bookings.length === 0) {
                html = '<div class="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500"><i class="fas fa-ticket-alt text-4xl mb-2"></i><p>Belum ada booking</p></div>';
            } else {
                for (var i = 0; i < bookings.length; i++) {
                    var b = bookings[i];
                    var bStatus = b.status || 'inquiry';
                    var bClass = badgeClass[bStatus] || badgeClass.inquiry;
                    var customerName = (b.customer && b.customer.name) ? b.customer.name : 'N/A';
                    var pkgName = (b.package && b.package.name) ? b.package.name : 'N/A';
                    var pkgDest = (b.package && b.package.destination) ? b.package.destination : '-';
                    var bPrice = b.total_price ? parseInt(b.total_price).toLocaleString('id-ID') : '0';

                    html += '<div class="bg-white rounded-xl shadow-sm p-4 mb-3">';
                    html += '<div class="flex items-start justify-between mb-2">';
                    html += '<h3 class="font-bold text-lg">' + customerName + '</h3>';
                    html += '<span class="inline-block px-3 py-1 text-xs font-semibold rounded-full ' + bClass + '">' + bStatus.toUpperCase() + '</span>';
                    html += '</div>';
                    html += '<p class="text-sm text-gray-600 mb-1"><i class="fas fa-box mr-1"></i> ' + pkgName + '</p>';
                    html += '<p class="text-sm text-gray-600 mb-1"><i class="fas fa-map-marker-alt mr-1"></i> ' + pkgDest + '</p>';
                    html += '<div class="flex items-center justify-between mt-3 pt-3 border-t">';
                    html += '<div class="text-emerald-600 font-bold">Rp ' + bPrice + '</div>';
                    html += '<button onclick="changeBookingStatus(\\'' + b.id + '\\', \\'' + bStatus + '\\')" class="text-blue-600 text-sm"><i class="fas fa-edit mr-1"></i> Ubah Status</button>';
                    html += '</div></div>';
                }
            }
            document.getElementById('bookingsList').innerHTML = html;
        }

        function saveBooking() {
            var customer_id = document.getElementById('newBookingCustomer').value;
            var package_id = document.getElementById('newBookingPackage').value;
            var departure_date = document.getElementById('newBookingDepartureDate').value;
            var total_price = document.getElementById('newBookingPrice').value.trim();
            var status = document.getElementById('newBookingStatus').value;

            if (!customer_id || !package_id || !total_price) { alert('Semua field wajib diisi!'); return; }

            fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent_id: currentAgent.id, customer_id: customer_id, package_id: package_id, departure_date: departure_date || null, total_price: parseFloat(total_price), status: status })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.error) { alert(data.error); return; }
                closeModal();
                loadBookings();
                loadDashboard();
                document.getElementById('newBookingCustomer').value = '';
                document.getElementById('newBookingPackage').value = '';
                document.getElementById('newBookingDepartureDate').value = '';
                document.getElementById('newBookingPrice').value = '';
                document.getElementById('newBookingStatus').value = 'inquiry';
            })
            .catch(function(err) { alert('Error: ' + err.message); });
        }

        function changeBookingStatus(id, currentStatus) {
            var statuses = ['inquiry', 'dp', 'paid', 'departed'];
            var idx = statuses.indexOf(currentStatus);
            var nextStatus = statuses[(idx + 1) % statuses.length];

            if (confirm('Ubah status menjadi ' + nextStatus.toUpperCase() + '?')) {
                fetch('/api/bookings/' + id + '/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: nextStatus })
                })
                .then(function() {
                    loadBookings();
                    loadDashboard();
                })
                .catch(function(err) { alert('Error: ' + err.message); });
            }
        }

        // ============================================
        // MODALS
        // ============================================
        function openModal(modalId) {
            document.getElementById('modalBackdrop').classList.remove('hidden');
            document.getElementById('modal' + modalId).classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('modalBackdrop').classList.add('hidden');
            var modals = document.querySelectorAll('[id^="modal"]');
            for (var i = 0; i < modals.length; i++) {
                modals[i].classList.add('hidden');
            }
        }

        // ============================================
        // WHATSAPP BROADCAST
        // ============================================
        function sendWABroadcast() {
            var message = prompt('Ketik pesan broadcast:');
            if (!message) return;
            if (customers.length === 0) { alert('Belum ada jama\\'ah untuk dikirim pesan!'); return; }

            if (confirm('Kirim broadcast ke ' + customers.length + ' jama\\'ah?')) {
                var sent = 0;
                function sendNext() {
                    if (sent >= customers.length) {
                        alert('Broadcast selesai terkirim ke ' + customers.length + ' jama\\'ah!');
                        return;
                    }
                    fetch('/api/wa/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ target: customers[sent].phone, message: message })
                    })
                    .then(function() { sent++; setTimeout(sendNext, 2000); })
                    .catch(function() { sent++; setTimeout(sendNext, 2000); });
                }
                sendNext();
            }
        }

        // ============================================
        // START APP
        // ============================================
        init();
    </script>
</body>
</html>`
}

export default app
