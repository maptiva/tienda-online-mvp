-- =====================================================
-- SCRIPT 3: Agregar campo enable_stock a stores
-- Para feature flag del motor de stock por tenant
-- =====================================================

-- Agregar columna enable_stock a stores
ALTER TABLE stores 
ADD COLUMN enable_stock BOOLEAN DEFAULT false;

-- Crear índice para búsquedas eficientes
CREATE INDEX idx_stores_enable_stock ON stores(enable_stock) WHERE enable_stock = true;

-- Actualizar algunas tiendas de prueba a true (opcional para testing)
-- UPDATE stores SET enable_stock = true WHERE store_name = 'Tu Tienda de Prueba';
