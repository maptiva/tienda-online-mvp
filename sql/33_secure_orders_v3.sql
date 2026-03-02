-- ============================================
-- SQL: Seguridad de Pedidos SaaS (V3.1 - FINAL REFINADA)
-- Fecha: 01 de marzo de 2026
-- ============================================

DROP FUNCTION IF EXISTS create_public_order(TEXT, JSONB, JSONB, DECIMAL, TEXT, DECIMAL);

CREATE OR REPLACE FUNCTION create_public_order(
  p_store_slug TEXT,
  p_customer_info JSONB,
  p_items JSONB,
  p_client_total DECIMAL,
  p_payment_method TEXT,
  p_discount_applied DECIMAL DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, pg_temp 
AS $$
DECLARE
  v_store_id BIGINT;
  v_store_owner_id UUID;
  v_calculated_total DECIMAL := 0;
  v_subtotal DECIMAL := 0;
  v_new_order_id UUID;
  v_item RECORD;
  v_real_price DECIMAL;
BEGIN
  -- 1. VALIDACIÓN DE PAYLOAD
  IF jsonb_typeof(p_items) != 'array' THEN
    RETURN json_build_object('success', false, 'error', 'Formato de productos inválido');
  END IF;

  -- [V3.1] Evitar pedidos vacíos
  IF jsonb_array_length(p_items) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'El pedido no tiene productos');
  END IF;

  -- 2. RESOLUCIÓN DE TIENDA (Optimización: una sola lectura)
  SELECT id, user_id INTO v_store_id, v_store_owner_id 
  FROM stores 
  WHERE store_slug = p_store_slug AND is_active = true;
  
  IF v_store_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'La tienda no está disponible para recibir pedidos');
  END IF;

  -- 3. CÁLCULO AUTORITATIVO DE PRECIOS (Server-side)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id BIGINT, quantity INTEGER)
  LOOP
    SELECT price INTO v_real_price FROM products WHERE id = v_item.product_id AND user_id = v_store_owner_id;
    
    IF v_real_price IS NULL THEN
      RAISE WARNING 'SECURITY ALERT: Intento de insertar producto ajeno (%) en pedido de tienda %', v_item.product_id, v_store_id;
      RETURN json_build_object('success', false, 'error', 'Inconsistencia en el catálogo de productos');
    END IF;

    v_calculated_total := v_calculated_total + (v_real_price * v_item.quantity);
  END LOOP;

  -- 4. VALIDACIÓN DE DESCUENTOS
  v_subtotal := v_calculated_total; 
  
  IF p_discount_applied < 0 OR p_discount_applied > v_subtotal THEN
    RAISE WARNING 'FRAUD ALERT: Descuento sospechoso bloqueado: % sobre subtotal %', p_discount_applied, v_subtotal;
    RETURN json_build_object('success', false, 'error', 'Cálculo de descuento no permitido');
  END IF;

  v_calculated_total := v_subtotal - p_discount_applied;

  -- 5. AUDITORÍA DE CONSISTENCIA
  IF ABS(v_calculated_total - p_client_total) > 0.01 THEN
    RAISE WARNING 'DISCREPANCY: El cliente envió total %, pero el servidor calculó %', p_client_total, v_calculated_total;
  END IF;

  -- 6. INSERCIÓN SEGURA
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
    v_calculated_total, 
    p_payment_method,
    p_discount_applied,
    'pending'
  )
  RETURNING id INTO v_new_order_id;

  -- 7. RESPUESTA OPACA
  RETURN json_build_object(
    'success', true,
    'order_id', v_new_order_id,
    'verified_total', v_calculated_total
  );

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'CRITICAL ERROR en create_public_order: %', SQLERRM;
  RETURN json_build_object('success', false, 'error', 'No se pudo procesar el pedido. Intente nuevamente.');
END;
$$;

-- Permisos
REVOKE ALL ON FUNCTION create_public_order(TEXT, JSONB, JSONB, DECIMAL, TEXT, DECIMAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_public_order(TEXT, JSONB, JSONB, DECIMAL, TEXT, DECIMAL) TO anon, authenticated;
