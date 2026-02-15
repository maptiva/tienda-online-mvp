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
SET search_path = public
AS $$
  -- Se asume que p_store_slug es único por tienda
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
  JOIN products p ON i.product_id = p.id AND p.user_id = s.user_id -- Doble check de pertenencia
  WHERE s.store_slug = p_store_slug 
    AND i.product_id = p_product_id
    AND s.enable_stock = true
    AND s.store_slug IS NOT NULL; -- Asegurar slug válido
$$;

-- Comentario: Esta función permite acceso público seguro a inventario
-- Solo retorna datos de tiendas con stock habilitado (enable_stock = true)
-- Doble validación: i.user_id == p.user_id == s.user_id garantiza que el producto sea de la tienda.
-- Usando SECURITY DEFINER para saltar RLS de forma controlada, limitado por búsqueda explícita.