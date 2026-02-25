-- ============================================
-- Migración: Agregar configuración de descuentos por método de pago
-- Fecha: 2026-02-25
-- Descripción: Agrega columna JSONB para manejar descuentos globales de la tienda.
-- ============================================

-- Agregar columna JSONB para configuración de descuentos
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS discount_settings JSONB DEFAULT NULL;

-- Estructura esperada del JSON:
-- {
--   "enabled": boolean,
--   "cash_discount": number,
--   "transfer_discount": number,
--   "show_banner": boolean
-- }

-- Comentario documental
COMMENT ON COLUMN stores.discount_settings IS 
'Configuración de descuentos por método de pago. JSONB con estructura: enabled, cash_discount, transfer_discount, show_banner';

-- Índice para consultas eficientes (opcional si se consultan mucho los campos internos)
CREATE INDEX IF NOT EXISTS idx_stores_discount_settings 
ON stores USING GIN (discount_settings) 
WHERE discount_settings IS NOT NULL;
