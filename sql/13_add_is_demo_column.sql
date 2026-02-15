-- =====================================================
-- SCRIPT: Agregar columna is_demo
-- =====================================================
-- Propósito: Distinguir tiendas "reales" de tiendas "demo" en el directorio
-- Ejecutar en: Supabase SQL Editor

-- 1. Agregar la columna con valor por defecto false
ALTER TABLE stores 
ADD COLUMN is_demo BOOLEAN DEFAULT false;

-- 2. (Opcional) Si quieres actualizar tus tiendas demo actuales, 
-- descomenta y ajusta la siguiente línea con los slugs reales:
-- UPDATE stores SET is_demo = true WHERE store_slug IN ('mi-tienda-demo', 'otra-demo');

-- 3. Verificar que se agregó
-- SELECT store_name, store_slug, is_demo FROM stores;
