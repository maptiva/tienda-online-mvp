-- =====================================================
-- SCRIPT 7: Agregar Mensaje Personalizable de WhatsApp
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Permitir que cada tienda personalice el mensaje del botón de WhatsApp

-- Agregar columna whatsapp_message a la tabla stores
ALTER TABLE stores 
ADD COLUMN whatsapp_message TEXT DEFAULT 'Hola, estoy interesado en sus productos.';
