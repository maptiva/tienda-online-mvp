-- ========================================
-- SCRIPT 4: DATOS DE PRUEBA PARA INVENTORY
-- ========================================
-- Script para poblar la tabla inventory con datos realistas
-- Este script crea registros de inventario para productos existentes

-- PASO 1: Verificar productos existentes y crear datos de prueba
-- ================================================

-- Primero, obtengamos los IDs de productos para Baby Sweet
-- (Estos IDs deben coincidir con los productos existentes)

-- Insertar datos de prueba para Baby Sweet
-- Asumiendo que tenemos estos productos para Baby Sweet
INSERT INTO inventory (
  product_id,
  user_id,
  quantity,
  low_stock_threshold,
  reserved_quantity,
  created_at,
  updated_at
) VALUES 
  -- Productos populares con buen stock
  ('11111111-1111-1111-1111-111111111111', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 50, 10, 0, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 75, 15, 0, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 30, 8, 0, NOW(), NOW()),
  
  -- Productos con stock bajo (para mostrar advertencias)
  ('44444444-4444-4444-4444-444444444444', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 5, 10, 0, NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 3, 8, 0, NOW(), NOW()),
  
  -- Productos agotados
  ('66666666-6666-6666-6666-666666666666', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 0, 5, 0, NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 0, 10, 0, NOW(), NOW()),
  
  -- Más productos con stock normal
  ('88888888-8888-8888-8888-888888888888', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 25, 5, 0, NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 40, 12, 0, NOW(), NOW()),
  ('10101010-1010-1010-1010-101010101010', (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1), 60, 15, 0, NOW(), NOW())
ON CONFLICT (product_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  updated_at = NOW();

-- PASO 2: Crear logs de auditoría para simular actividad previa
-- ============================================================

-- Logs de movimientos de inventario para demostrar la funcionalidad
INSERT INTO inventory_logs (
  inventory_id,
  user_id,
  change_type,
  quantity_change,
  reason,
  created_at
)
SELECT 
  i.id,
  i.user_id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) <= 3 THEN 'initial'
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) <= 6 THEN 'sale'
    ELSE 'restock'
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) <= 3 THEN i.quantity
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) <= 6 THEN -1
    ELSE i.quantity / 2
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) <= 3 THEN 'Stock inicial'
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) <= 6 THEN 'Venta online'
    ELSE 'Reabastecimiento'
  END,
  NOW() - (ROW_NUMBER() OVER (ORDER BY i.product_id) * INTERVAL '1 hour')
FROM inventory i
WHERE i.user_id = (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1)
AND ROW_NUMBER() OVER (ORDER BY i.product_id) <= 9;

-- PASO 3: Verificación
-- ===================

-- Consulta para verificar los datos insertados
SELECT 
  p.name as product_name,
  i.quantity as current_stock,
  i.low_stock_threshold,
  CASE 
    WHEN i.quantity = 0 THEN 'Agotado'
    WHEN i.quantity <= i.low_stock_threshold THEN 'Stock Bajo'
    ELSE 'Disponible'
  END as stock_status,
  i.created_at,
  i.updated_at
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.user_id = (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1)
ORDER BY 
  CASE 
    WHEN i.quantity = 0 THEN 1
    WHEN i.quantity <= i.low_stock_threshold THEN 2
    ELSE 3
  END,
  i.quantity DESC;

-- ================================================
-- RESULTADOS ESPERADOS:
-- 
-- 1. 10 productos con diferentes niveles de stock:
--    - 3 productos agotados (0 unidades)
--    - 2 productos con stock bajo (< threshold)
--    - 5 productos con stock normal
-- 
-- 2. Estados visuales en frontend:
--    - "🔴 Agotado" para 0 unidades
--    - "🟠 Quedan X unidades" para stock bajo
--    - "🟢 En stock" para stock normal
-- 
-- 3. Logs de auditoría mostrando actividad previa
-- ================================================