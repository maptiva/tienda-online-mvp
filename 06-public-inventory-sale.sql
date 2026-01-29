-- Función RPC Pública para Procesar Ventas desde el Carrito (WhatsApp)
-- Permite que clientes (no autenticados) descuenten stock al confirmar un pedido
-- Solo funciona si la tienda tiene enable_stock = true

CREATE OR REPLACE FUNCTION process_public_cart_sale(
  p_store_slug TEXT,
  p_items JSONB,
  p_order_reference TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_enable_stock BOOLEAN;
  item_record RECORD;
  current_inventory RECORD;
  new_quantity INTEGER;
  results JSONB := '[]'::JSONB;
  error_count INTEGER := 0;
BEGIN
  -- 1. Buscar la tienda por slug para obtener el user_id y verificar estado
  SELECT user_id, enable_stock INTO v_user_id, v_enable_stock
  FROM stores
  WHERE store_slug = p_store_slug;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Tienda no encontrada');
  END IF;

  IF NOT v_enable_stock THEN
    RETURN json_build_object('success', false, 'error', 'La tienda no tiene habilitado el control de stock');
  END IF;

  -- 2. Procesar cada item del carrito
  FOR item_record IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id BIGINT, quantity INTEGER)
  LOOP
    BEGIN
      -- Bloquear fila para evitar condiciones de carrera
      SELECT * INTO current_inventory
      FROM inventory
      WHERE product_id = item_record.product_id AND user_id = v_user_id
      FOR UPDATE;

      IF NOT FOUND THEN
        results := results || json_build_object(
          'product_id', item_record.product_id,
          'success', false,
          'error', 'Producto sin inventario configurado'
        );
        error_count := error_count + 1;
        CONTINUE;
      END IF;

      -- Validar disponibilidad (si no permite backorder)
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

      -- Calcular y actualizar
      new_quantity := current_inventory.quantity - item_record.quantity;

      UPDATE inventory
      SET quantity = new_quantity,
          updated_at = NOW()
      WHERE id = current_inventory.id;

      -- Registrar log del movimiento
      INSERT INTO inventory_logs (
        product_id,
        user_id,
        movement_type,
        quantity_change,
        previous_quantity,
        new_quantity,
        reason
      ) VALUES (
        item_record.product_id,
        v_user_id,
        'sale',
        -item_record.quantity,
        current_inventory.quantity,
        new_quantity,
        CONCAT('Venta Pública - ', COALESCE(p_order_reference, 'Pedido WhatsApp'))
      );

      results := results || json_build_object(
        'product_id', item_record.product_id,
        'success', true,
        'new_quantity', new_quantity
      );

    EXCEPTION WHEN OTHERS THEN
      results := results || json_build_object(
        'product_id', item_record.product_id,
        'success', false,
        'error', SQLERRM
      );
      error_count := error_count + 1;
    END;
  END LOOP;

  -- Retornar resultado consolidado
  RETURN json_build_object(
    'success', (error_count = 0),
    'processed_items', json_array_length(p_items),
    'failed_items', error_count,
    'results', results
  );
END;
$$;

-- Otorgar permisos de ejecución al rol anon (público)
GRANT EXECUTE ON FUNCTION process_public_cart_sale(TEXT, JSONB, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION process_public_cart_sale(TEXT, JSONB, TEXT) TO authenticated;
