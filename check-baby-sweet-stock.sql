-- Verificar productos con stock en Baby Sweet
SELECT 
  p.name as producto,
  p.id as product_id,
  p.display_id,
  p.sku,
  COALESCE(i.quantity, 0) as stock_actual,
  COALESCE(i.track_stock, true) as track_stock,
  i.allow_backorder,
  COALESCE(i.min_stock_alert, 5) as min_alert,
  CASE 
    WHEN COALESCE(i.quantity, 0) <= 0 THEN '❌ Agotado'
    WHEN COALESCE(i.quantity, 0) <= COALESCE(i.min_stock_alert, 5) THEN '⚠️ Últimas'
    ELSE '✅ Disponible'
  END as estado
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN stores s ON p.user_id = s.user_id
WHERE s.store_slug = 'baby-sweet'
ORDER BY p.id
LIMIT 10;