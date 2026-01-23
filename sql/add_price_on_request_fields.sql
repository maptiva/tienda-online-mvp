-- ============================================
-- Migración: Agregar campos para "Consultar Precio"
-- Fecha: 2026-01-09
-- ============================================

-- 1. Agregar campo para indicar si el producto tiene "Consultar Precio" activo
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_on_request BOOLEAN DEFAULT FALSE;

-- 2. Agregar campo para guardar el precio anterior (backup)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS backup_price DECIMAL(10,2);

-- 3. Agregar comentarios para documentación
COMMENT ON COLUMN products.price_on_request IS 'Indica si el producto muestra "Consultar Precio" en lugar del precio numérico';
COMMENT ON COLUMN products.backup_price IS 'Guarda el precio anterior cuando se activa price_on_request para permitir reversibilidad';

-- 4. Verificar que los campos se crearon correctamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' 
  AND column_name IN ('price_on_request', 'backup_price')
ORDER BY column_name;
