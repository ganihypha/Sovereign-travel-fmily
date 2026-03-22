-- ============================================
-- SOVEREIGN TRAVEL AGENT - Database Schema
-- Complete schema for travel agent management system
-- ============================================

-- ============================================
-- 1. AGENTS TABLE
-- Travel agent owners/operators
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  address TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CUSTOMERS TABLE  
-- Jama'ah / Travelers
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  passport_number TEXT,
  passport_expire_date DATE,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PACKAGES TABLE
-- Tour packages (Umroh, Haji, Tour, etc)
-- ============================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  duration_days INTEGER,
  include_flight BOOLEAN DEFAULT true,
  include_hotel BOOLEAN DEFAULT true,
  include_visa BOOLEAN DEFAULT true,
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. BOOKINGS TABLE
-- Customer bookings for packages
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  departure_date DATE,
  return_date DATE,
  total_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'inquiry',
  -- status: inquiry, dp, installment, paid, departed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PAYMENTS TABLE
-- Payment tracking (DP, installments, final payment)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  payment_type TEXT NOT NULL,
  -- payment_type: dp, installment_1, installment_2, installment_3, final, refund
  payment_method TEXT,
  -- payment_method: cash, transfer, cc, debit, ewallet
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. DOCUMENTS TABLE
-- Document tracking (paspor, visa, tiket, foto, KTP, KK)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  -- document_type: passport, visa, ticket, photo, ktp, kk, other
  document_url TEXT,
  document_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'pending',
  -- status: pending, submitted, approved, rejected
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. WA_MESSAGES TABLE
-- WhatsApp message log
-- ============================================
CREATE TABLE IF NOT EXISTS wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_phone TEXT NOT NULL,
  message_type TEXT NOT NULL,
  -- message_type: incoming, outgoing, broadcast, auto_reply, reminder
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  -- status: sent, delivered, read, failed
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- ============================================
-- 8. REMINDERS TABLE
-- Payment and document reminders
-- ============================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  -- reminder_type: payment_due, document_deadline, departure_soon
  reminder_date DATE NOT NULL,
  message TEXT,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_agent_id ON customers(agent_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_packages_agent_id ON packages(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_documents_booking_id ON documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_agent_id ON wa_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_customer_phone ON wa_messages(customer_phone);
CREATE INDEX IF NOT EXISTS idx_reminders_booking_id ON reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert sample agent (uncomment to use)
-- INSERT INTO agents (phone, name, business_name) VALUES 
--   ('081234567890', 'Admin Travel', 'Sovereign Travel Indonesia');

-- ============================================
-- VIEWS for reporting
-- ============================================

CREATE OR REPLACE VIEW v_booking_summary AS
SELECT 
  b.id,
  b.booking_date,
  b.departure_date,
  b.status,
  b.total_price,
  c.name as customer_name,
  c.phone as customer_phone,
  p.name as package_name,
  p.destination,
  a.business_name as agent_name,
  COALESCE(SUM(pay.amount), 0) as total_paid,
  b.total_price - COALESCE(SUM(pay.amount), 0) as outstanding
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
LEFT JOIN packages p ON b.package_id = p.id
LEFT JOIN agents a ON b.agent_id = a.id
LEFT JOIN payments pay ON b.id = pay.booking_id
GROUP BY b.id, c.name, c.phone, p.name, p.destination, a.business_name;

-- ============================================
-- RLS (Row Level Security) - Optional
-- Enable if you want multi-tenant security
-- ============================================

-- ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wa_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS for common operations
-- ============================================

-- Function to calculate outstanding payment
CREATE OR REPLACE FUNCTION get_booking_outstanding(booking_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_price DECIMAL;
  total_paid DECIMAL;
BEGIN
  SELECT b.total_price INTO total_price
  FROM bookings b WHERE b.id = booking_uuid;
  
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM payments WHERE booking_id = booking_uuid;
  
  RETURN total_price - total_paid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS for updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Schema ready.
-- ============================================

-- To apply this schema:
-- 1. Login to Supabase dashboard: https://supabase.com/dashboard
-- 2. Select your project: bkcvrpcunyjgetpkoyjx
-- 3. Go to SQL Editor
-- 4. Copy and paste this entire file
-- 5. Click "Run"
-- 6. Done! Tables created ✅
