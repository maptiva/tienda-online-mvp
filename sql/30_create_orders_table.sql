-- ============================================
-- Migración: Creación de tabla de Pedidos (Orders)
-- Fecha: 2026-02-25
-- Descripción: Tabla para el registro y seguimiento de pedidos de las tiendas.
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
    customer_info JSONB NOT NULL, -- {name, phone, address}
    items JSONB NOT NULL,         -- Array de productos [{product_id, name, quantity, price}]
    total DECIMAL(12, 2) NOT NULL,
    payment_method TEXT,          -- cash, transfer, card, etc.
    discount_applied DECIMAL(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, completed, cancelled, paid
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentarios documentales
COMMENT ON TABLE orders IS 'Registro de pedidos realizados en las tiendas para métricas y contabilidad.';
COMMENT ON COLUMN orders.customer_info IS 'Información de contacto del cliente (Snapshot).';
COMMENT ON COLUMN orders.items IS 'Listado de productos comprados con sus precios en el momento de la transacción.';

-- Índices para mejorar la velocidad de búsqueda
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Políticas de RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Los administradores (dueños de tienda) pueden ver solo sus pedidos
CREATE POLICY orders_owner_select ON orders
    FOR SELECT
    USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Los administradores pueden actualizar sus pedidos (cambiar estados)
CREATE POLICY orders_owner_update ON orders
    FOR UPDATE
    USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Permitir inserción abierta desde el Gateway Público (solo si conocemos el store_id)
-- IMPORTANTE: La seguridad aquí depende de validar el store_id en la lógica de la aplicación o vía función RPC.
CREATE POLICY orders_public_insert ON orders
    FOR INSERT
    WITH CHECK (true); 
