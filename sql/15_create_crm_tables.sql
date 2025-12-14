-- 1. Tabla de Prospectos (Leads) - Para gestión comercial pre-venta
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT, -- 'Instagram', 'Web', 'Referido', etc.
    status TEXT DEFAULT 'NEW', -- 'NEW', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'LOST'
    notes TEXT,
    next_follow_up DATE
);

-- 2. Tabla de Clientes (Clients) - La entidad que paga
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL, -- Razón Social o Nombre Apellido
    billing_info JSONB, -- { "cuit": "...", "address": "..." }
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT
);

-- 3. Vincular Tiendas a Clientes
-- Agregamos la columna client_id a la tabla stores existente
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

-- 4. Tabla de Suscripciones (Subscriptions) - El contrato de servicio por tienda
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    store_id BIGINT REFERENCES stores(id) NOT NULL,
    plan_type TEXT DEFAULT 'MANTENIMIENTO_MENSUAL', -- 'BASIC', 'PRO', etc.
    amount DECIMAL(10, 2) NOT NULL DEFAULT 15.00, -- Precio pactado
    currency TEXT DEFAULT 'USD',
    billing_day INT DEFAULT 1, -- Día del mes que se genera el cargo
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'CANCELLED'
    last_payment_date DATE
);

-- 5. Tabla de Pagos (Payments) - Registro histórico
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id),
    client_id UUID REFERENCES clients(id), -- Redundante pero útil para consultas rápidas por cliente
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT, -- 'Transferencia', 'MercadoPago', 'Efectivo'
    status TEXT DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED'
    notes TEXT,
    receipt_url TEXT -- URL al comprobante si se sube
);

-- Habilitar RLS (Row Level Security) básico
-- Por ahora permitimos todo a usuarios autenticados (tu admin)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas simples para empezar (Asumiendo que usas el cliente de Supabase con Service Key o tu usuario admin)
CREATE POLICY "Enable all access for users" ON leads FOR ALL USING (true);
CREATE POLICY "Enable all access for users" ON clients FOR ALL USING (true);
CREATE POLICY "Enable all access for users" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Enable all access for users" ON payments FOR ALL USING (true);
