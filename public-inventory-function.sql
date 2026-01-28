-- Función RPC Pública para Obtener Inventario sin Autenticación
-- Permite acceso público al stock de productos de tiendas con enable_stock = true

CREATE OR REPLACE FUNCTION get_public_inventory(
  p_store_slug TEXT,
  p_product_id BIGINT
)
RETURNS TABLE (
  product_id BIGINT,
  quantity INTEGER,
  reserved_quantity INTEGER,
  min_stock_alert INTEGER,
  allow_backorder BOOLEAN,
  track_stock BOOLEAN,
  is_low_stock BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    i.product_id,
    i.quantity,
    i.reserved_quantity,
    i.min_stock_alert,
    i.allow_backorder,
    i.track_stock,
    (i.quantity <= i.min_stock_alert) as is_low_stock
  FROM inventory i
  JOIN stores s ON i.user_id = s.user_id
  WHERE s.store_slug = p_store_slug 
    AND i.product_id = p_product_id
    AND s.enable_stock = true;
$$;