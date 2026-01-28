-- ========================================
-- SCRIPT 4: DATOS DE PRUEBA PARA INVENTORY (ADAPTADO)
-- ========================================
-- Script para poblar la tabla inventory con datos realistas
-- Versión adaptada que usa UUIDs reales de productos existentes

-- PASO 1: Obtener productos reales de Baby Sweet y crear inventario
-- ==============================================================

-- Primero verifiquemos qué productos existen para Baby Sweet
-- Y creemos datos de prueba usando esos IDs reales

-- Insertar datos de prueba para los primeros 10 productos de Baby Sweet
INSERT INTO inventory (
  product_id,
  user_id,
  quantity,
  low_stock_threshold,
  reserved_quantity,
  created_at,
  updated_at
)
SELECT 
  p.id as product_id,
  p.user_id,
  -- Asignar cantidades variadas para probar diferentes estados
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) <= 2 THEN 0  -- 2 productos agotados
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) <= 4 THEN 3  -- 2 productos con stock muy bajo
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) <= 6 THEN 8  -- 2 productos con stock bajo
    ELSE 25 + (ROW_NUMBER() OVER (ORDER BY p.created_at) * 5)  -- Resto con buen stock
  END as quantity,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) <= 4 THEN 10  -- Umbral más alto para productos con poco stock
    ELSE 15  -- Umbral normal para productos con buen stock
  END as low_stock_threshold,
  0 as reserved_quantity,  -- Sin reservas inicialmente
  NOW() as created_at,
  NOW() as updated_at
FROM products p
WHERE p.user_id = (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1)
AND ROW_NUMBER() OVER (ORDER BY p.created_at) <= 10  -- Limitar a los primeros 10 productos
ON CONFLICT (product_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  updated_at = NOW();

-- PASO 2: Crear logs de auditoría para simular actividad previa
-- ============================================================

-- Insertar logs de movimientos para demostrar funcionalidad de auditoría
INSERT INTO inventory_logs (
  inventory_id,
  user_id,
  change_type,
  quantity_change,
  reason,
  created_at
)
SELECT 
  i.id as inventory_id,
  i.user_id,
  -- Diferentes tipos de cambios para variedad
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) % 3 = 0 THEN 'sale'
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) % 3 = 1 THEN 'restock'
    ELSE 'adjustment'
  END as change_type,
  -- Cambios de cantidad realistas
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) % 3 = 0 THEN -1  -- Venta
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) % 3 = 1 THEN i.quantity / 2  -- Reabastecimiento
    ELSE 5  -- Ajuste
  END as quantity_change,
  -- Razones descriptivas
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) % 3 = 0 THEN 'Venta online - Order #' || (ROW_NUMBER() OVER (ORDER BY i.product_id) * 1000)
    WHEN ROW_NUMBER() OVER (ORDER BY i.product_id) % 3 = 1 THEN 'Reabastecimiento del proveedor'
    ELSE 'Ajuste de inventario físico'
  END as reason,
  -- Timestamps variados para mostrar actividad en el tiempo
  NOW() - (ROW_NUMBER() OVER (ORDER BY i.product_id) * INTERVAL '2 hours') as created_at
FROM inventory i
WHERE i.user_id = (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1)
AND ROW_NUMBER() OVER (ORDER BY i.product_id) <= 8  -- Crear logs para 8 productos
ON CONFLICT DO NOTHING;

-- PASO 3: Verificación y diagnóstico
-- ================================

-- Consulta para verificar los resultados
SELECT 
  'RESUMEN DE INVENTARIO CREADO' as reporte,
  COUNT(*) as total_productos_con_inventario,
  COUNT(CASE WHEN quantity = 0 THEN 1 END) as productos_agotados,
  COUNT(CASE WHEN quantity > 0 AND quantity <= low_stock_threshold THEN 1 END) as productos_con_stock_bajo,
  COUNT(CASE WHEN quantity > low_stock_threshold THEN 1 END) as productos_con_stock_normal,
  SUM(quantity) as total_unidades_en_stock
FROM inventory 
WHERE user_id = (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1);

-- Vista detallada de cada producto
SELECT 
  ROW_NUMBER() OVER (ORDER BY 
    CASE 
      WHEN i.quantity = 0 THEN 1
      WHEN i.quantity <= i.low_stock_threshold THEN 2
      ELSE 3
    END,
    i.quantity DESC
  ) as orden,
  p.name as producto,
  i.quantity as stock_actual,
  i.low_stock_threshold as umbral_bajo_stock,
  CASE 
    WHEN i.quantity = 0 THEN '🔴 Agotado'
    WHEN i.quantity <= i.low_stock_threshold THEN '🟠 Quedan ' || i.quantity || ' unidades'
    ELSE '🟢 En stock'
  END as estado_visual,
  CASE 
    WHEN i.quantity = 0 THEN 'Deshabilitado'
    ELSE 'Habilitado'
  END as estado_botón_compra,
  i.updated_at as ultima_actualización
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

-- Verificar logs creados
SELECT 
  'LOGS DE AUDITORÍA CREADOS' as reporte,
  COUNT(*) as total_logs,
  COUNT(CASE WHEN change_type = 'sale' THEN 1 END) as logs_ventas,
  COUNT(CASE WHEN change_type = 'restock' THEN 1 END) as logs_reabastecimiento,
  COUNT(CASE WHEN change_type = 'adjustment' THEN 1 END) as logs_ajustes
FROM inventory_logs 
WHERE user_id = (SELECT user_id FROM stores WHERE store_name = 'Baby Sweet' LIMIT 1);

-- ================================================
-- INSTRUCCIONES:
-- 
-- 1. Ejecutar este script en Supabase Dashboard > SQL Editor
-- 2. Verificar que no hay errores en la ejecución
-- 3. Refrescar la tienda Baby Sweet en el frontend
-- 4. Deberías ver:
--    - Badge "Sin stock configurado" → Reemplazado por estados reales
--    - "🔴 Agotado" para productos sin stock
--    - "🟠 Quedan X unidades" para stock bajo
--    - "🟢 En stock" para productos disponibles
--    - Botones de compra deshabilitados para productos agotados
-- ================================================