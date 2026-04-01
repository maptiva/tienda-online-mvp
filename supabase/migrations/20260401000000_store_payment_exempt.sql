-- Añadir la columna de exención de pagos a la tabla stores
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS payment_exempt BOOLEAN DEFAULT false;

-- Crear un índice para optimizar posibles búsquedas a futuro
CREATE INDEX IF NOT EXISTS idx_stores_payment_exempt ON stores(payment_exempt) WHERE payment_exempt = true;
