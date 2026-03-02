-- ============================================
-- SQL Consolidado Corregido: Tabla de Pedidos y Función RPC Segura
-- Fecha: 28 de febrero de 2026
-- ============================================

-- 1. Crear la tabla 'orders' (Si no existe)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
    customer_info JSONB NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    payment_method TEXT,
    discount_applied DECIMAL(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 2. Habilitar RLS y políticas para el DUEÑO
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orders_owner_select ON orders;
CREATE POLICY orders_owner_select ON orders
    FOR SELECT
    USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS orders_owner_update ON orders;
CREATE POLICY orders_owner_update ON orders
    FOR UPDATE
    USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Eliminar política de inserción pública directa por seguridad
DROP POLICY IF EXISTS orders_public_insert ON orders;

-- 3. Crear la FUNCIÓN RPC Segura (Versión Corregida)
CREATE OR REPLACE FUNCTION create_public_order(
  p_store_slug TEXT,
  p_customer_info JSONB,
  p_items JSONB,
  p_total DECIMAL,
  p_payment_method TEXT,
  p_discount_applied DECIMAL DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_store_id BIGINT;
  v_order_id UUID; -- AQUÍ ESTÁ LA CORRECCIÓN: Declaramos la variable
BEGIN
  -- Buscar la tienda por slug
  SELECT id INTO v_store_id
  FROM stores
  WHERE store_slug = p_store_slug;

  IF v_store_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Tienda no encontrada');
  END IF;

  -- Insertar el pedido y guardar el ID generado en v_order_id
  INSERT INTO orders (
    store_id,
    customer_info,
    items,
    total,
    payment_method,
    discount_applied,
    status
  ) VALUES (
    v_store_id,
    p_customer_info,
    p_items,
    p_total,
    p_payment_method,
    p_discount_applied,
    'pending'
  )
  RETURNING id INTO v_order_id;

  -- Retornar éxito con el ID del pedido
  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 4. Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION create_public_order(TEXT, JSONB, JSONB, DECIMAL, TEXT, DECIMAL) TO anon;
GRANT EXECUTE ON FUNCTION create_public_order(TEXT, JSONB, JSONB, DECIMAL, TEXT, DECIMAL) TO authenticated;
