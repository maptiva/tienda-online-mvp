-- =====================================================
-- SCRIPT 10: Agregar Campo Store Slug
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Separar URL (store_slug) del nombre de tienda (store_name)

-- Agregar columna store_slug para URLs amigables
-- Esto permite tener nombres bonitos (store_name) y URLs separadas (store_slug)

ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_slug TEXT UNIQUE;

-- Crear índice para búsquedas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(store_slug);

-- Actualizar registros existentes: copiar store_name a store_slug
UPDATE stores SET store_slug = store_name WHERE store_slug IS NULL;
