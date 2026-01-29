-- =====================================================
-- CONTINUACIÓN: FUNCIONES RPC - MOTOR DE STOCK
-- Este script va DESPUÉS del primer script de tablas
-- =====================================================

-- A. Función para Ajuste Manual de Stock
CREATE OR REPLACE FUNCTION adjust_inventory_stock(
  p_product_id BIGINT,
  p_user_id UUID,
  p_quantity_change INTEGER,
  p_reason TEXT DEFAULT 'Ajuste manual',
  p_created_by UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_inventory RECORD;
  new_quantity INTEGER;
  log_id BIGINT;
BEGIN
  -- Validación de seguridad: Solo el dueño puede ajustar su stock
  IF p_user_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;
  
  -- Obtener inventario actual con bloqueo FOR UPDATE
  SELECT * INTO current_inventory 
  FROM inventory 
  WHERE product_id = p_product_id AND user_id = p_user_id
  FOR UPDATE;
  
  -- Si no existe inventario, crearlo automáticamente
  IF NOT FOUND THEN
    INSERT INTO inventory (
      product_id, user_id, quantity, reserved_quantity, 
      min_stock_alert, allow_backorder, track_stock
    ) VALUES (
      p_product_id, p_user_id, 0, 0, 5, false, true
    ) RETURNING * INTO current_inventory;
  END IF;
  
  -- Calcular nueva cantidad
  new_quantity := current_inventory.quantity + p_quantity_change;
  
  -- Validación de stock negativo (solo si no permite backorder)
  IF new_quantity < 0 AND NOT current_inventory.allow_backorder THEN
    RETURN json_build_object('success', false, 'error', 'Stock insuficiente');
  END IF;
  
  -- Actualizar inventario
  UPDATE inventory 
  SET quantity = new_quantity,
      updated_at = NOW()
  WHERE id = current_inventory.id;
  
  -- Registrar movimiento en logs (salta RLS por SECURITY DEFINER)
  INSERT INTO inventory_logs (
    product_id, user_id, movement_type, quantity_change,
    previous_quantity, new_quantity, reason, created_by
  ) VALUES (
    p_product_id, p_user_id, 
    CASE WHEN p_quantity_change > 0 THEN 'restock' ELSE 'adjustment' END,
    p_quantity_change,
    current_inventory.quantity,
    new_quantity,
    p_reason,
    COALESCE(p_created_by, p_user_id)
  ) RETURNING id INTO log_id;
  
  RETURN json_build_object(
    'success', true,
    'new_quantity', new_quantity,
    'log_id', log_id,
    'previous_quantity', current_inventory.quantity
  );
END;
$$;

-- B. Función para Procesar Venta Masiva (WhatsApp/Pedido)
CREATE OR REPLACE FUNCTION process_cart_items_sale(
  p_items JSONB,  -- Formato: [{"product_id": 123, "quantity": 2}, ...]
  p_user_id UUID,
  p_order_reference TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  current_inventory RECORD;
  new_quantity INTEGER;
  results JSONB := '[]'::JSONB;
  error_count INTEGER := 0;
BEGIN
  -- Validación de seguridad: Solo el dueño puede procesar sus ventas
  IF p_user_id != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;
  
  -- Validar que haya items
  IF json_array_length(p_items) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Carrito vacío');
  END IF;
  
  -- Procesar cada item
  FOR item_record IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id BIGINT, quantity INTEGER)
  LOOP
    BEGIN
      -- Obtener inventario con bloqueo FOR UPDATE
      SELECT * INTO current_inventory 
      FROM inventory 
      WHERE product_id = item_record.product_id AND user_id = p_user_id
      FOR UPDATE;
      
      -- Si no existe inventario, error
      IF NOT FOUND THEN
        results := results || json_build_object(
          'product_id', item_record.product_id,
          'success', false,
          'error', 'Producto sin inventario configurado',
          'quantity_requested', item_record.quantity
        );
        error_count := error_count + 1;
        CONTINUE;
      END IF;
      
      -- Validar stock disponible
      IF current_inventory.quantity < item_record.quantity AND NOT current_inventory.allow_backorder THEN
        results := results || json_build_object(
          'product_id', item_record.product_id,
          'success', false,
          'error', 'Stock insuficiente',
          'available', current_inventory.quantity,
          'requested', item_record.quantity
        );
        error_count := error_count + 1;
        CONTINUE;
      END IF;
      
      -- Calcular nueva cantidad
      new_quantity := current_inventory.quantity - item_record.quantity;
      
      -- Actualizar inventario
      UPDATE inventory 
      SET quantity = new_quantity,
          updated_at = NOW()
      WHERE id = current_inventory.id;
      
      -- Registrar venta
      INSERT INTO inventory_logs (
        product_id, user_id, movement_type, quantity_change,
        previous_quantity, new_quantity, reason
      ) VALUES (
        item_record.product_id, p_user_id, 'sale',
        -item_record.quantity,
        current_inventory.quantity,
        new_quantity,
        CONCAT('Venta - ', COALESCE(p_order_reference, 'Referencia no especificada'))
      );
      
      -- Agregar resultado exitoso
      results := results || json_build_object(
        'product_id', item_record.product_id,
        'success', true,
        'previous_quantity', current_inventory.quantity,
        'new_quantity', new_quantity,
        'sold_quantity', item_record.quantity
      );
      
    EXCEPTION
      WHEN OTHERS THEN
        results := results || json_build_object(
          'product_id', item_record.product_id,
          'success', false,
          'error', SQLERRM
        );
        error_count := error_count + 1;
    END;
  END LOOP;
  
  -- Determinar resultado general
  RETURN json_build_object(
    'success', (error_count = 0),
    'processed_items', json_array_length(p_items),
    'successful_items', (json_array_length(p_items) - error_count),
    'failed_items', error_count,
    'results', results,
    'order_reference', p_order_reference
  );
END;
$$;

-- C. Función Auxiliar - Obtener Inventario con Productos
CREATE OR REPLACE FUNCTION get_user_inventory_with_products(
  p_user_id UUID
)
RETURNS TABLE (
  id BIGINT,
  product_id BIGINT,
  product_name TEXT,
  product_display_id BIGINT,
  product_image_url TEXT,
  quantity INTEGER,
  reserved_quantity INTEGER,
  min_stock_alert INTEGER,
  allow_backorder BOOLEAN,
  track_stock BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_low_stock BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    i.id,
    i.product_id,
    p.name as product_name,
    p.display_id as product_display_id,
    p.image_url as product_image_url,
    i.quantity,
    i.reserved_quantity,
    i.min_stock_alert,
    i.allow_backorder,
    i.track_stock,
    i.created_at,
    i.updated_at,
    (i.quantity <= i.min_stock_alert) as is_low_stock
  FROM inventory i
  JOIN products p ON i.product_id = p.id
  WHERE i.user_id = p_user_id
  ORDER BY i.updated_at DESC;
$$;

-- D. Función Auxiliar - Obtener Logs de Producto
CREATE OR REPLACE FUNCTION get_product_inventory_logs(
  p_product_id BIGINT,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMPTZ,
  movement_type TEXT,
  quantity_change INTEGER,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reason TEXT,
  created_by UUID
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    il.id,
    il.created_at,
    il.movement_type,
    il.quantity_change,
    il.previous_quantity,
    il.new_quantity,
    il.reason,
    il.created_by
  FROM inventory_logs il
  WHERE il.product_id = p_product_id AND il.user_id = p_user_id
  ORDER BY il.created_at DESC
  LIMIT p_limit;
$$;

-- E. Función Auxiliar - Obtener Items con Bajo Stock
CREATE OR REPLACE FUNCTION get_low_stock_items(
  p_user_id UUID
)
RETURNS TABLE (
  id BIGINT,
  product_id BIGINT,
  product_name TEXT,
  quantity INTEGER,
  min_stock_alert INTEGER,
  shortage INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    i.id,
    i.product_id,
    p.name as product_name,
    i.quantity,
    i.min_stock_alert,
    (i.min_stock_alert - i.quantity) as shortage
  FROM inventory i
  JOIN products p ON i.product_id = p.id
  WHERE i.user_id = p_user_id AND i.quantity <= i.min_stock_alert
  ORDER BY i.quantity ASC;
$$;