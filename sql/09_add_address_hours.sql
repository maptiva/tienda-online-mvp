-- =====================================================
-- SCRIPT 9: Agregar Campos de Domicilio y Horarios
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Agregar campos faltantes para información de la tienda

-- Agregar columnas de domicilio y horarios a la tabla stores
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS business_hours TEXT DEFAULT 'Lun-Sab: 9:00 - 20:00';
