-- Script para testing de stock dinámico
-- Crear inventario con diferentes cantidades para pruebas

-- Obtener user_id de Baby Sweet
DO $$
DECLARE
  baby_sweet_user UUID;
  product_ids BIGINT[];
BEGIN
  SELECT user_id INTO baby_sweet_user
  FROM stores 
  WHERE store_name = 'Baby Sweet'
  LIMIT 1;
  
  -- Crear inventario con diferentes cantidades
  INSERT INTO inventory (product_id, user_id, quantity, reserved_quantity, min_stock_alert, allow_backorder, track_stock)
  SELECT 
    p.id, 
    baby_sweet_user,
    CASE 
      WHEN p.id % 4 = 0 THEN 0      -- Agotado
      WHEN p.id % 4 = 1 THEN 2      -- Últimas 2 unidades
      WHEN p.id % 4 = 2 THEN 4      -- Últimas 4 unidades  
      ELSE 10                         -- Disponible
    END,
    0, -- reserved_quantity
    5, -- min_stock_alert
    false, -- allow_backorder
    true -- track_stock
  FROM products p
  WHERE p.user_id = baby_sweet_user
  ORDER BY p.id
  LIMIT 12; -- Solo primeros 12 productos
  
  RAISE NOTICE 'Stock de prueba creado para % productos', 12;
END $$;

SELECT 
  p.name,
  i.quantity,
  CASE 
    WHEN i.quantity = 0 THEN '❌ Agotado'
    WHEN i.quantity <= i.min_stock_alert THEN '⚠️ Últimas unidades'
    ELSE '✅ Disponible'
  END as estado,
  i.min_stock_alert
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.user_id = (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet')
ORDER BY p.id
LIMIT 10;
