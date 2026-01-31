-- =====================================================
-- SCRIPT 27: Agregar columna tiktok_url a la tabla stores
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Permitir que cada tienda guarde su URL de TikTok

-- Agregar columna tiktok_url a la tabla stores
ALTER TABLE stores
ADD COLUMN tiktok_url TEXT;