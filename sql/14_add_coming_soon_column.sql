-- =====================================================
-- SCRIPT: Agregar columna coming_soon
-- =====================================================
-- Propósito: Marcar tiendas confirmadas pero que aún no están listas para vender
-- Ejecutar en: Supabase SQL Editor

-- 1. Agregar la columna con valor por defecto false
ALTER TABLE stores 
ADD COLUMN coming_soon BOOLEAN DEFAULT false;

-- 2. (Opcional) Ejemplo para marcar una tienda como "Próximamente":
-- UPDATE stores SET coming_soon = true WHERE store_slug = 'tienda-nueva';

-- 3. Verificar
-- SELECT store_name, is_demo, coming_soon FROM stores;
