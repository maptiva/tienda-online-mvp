-- =====================================================
-- SCRIPT 8: Actualizar Mensajes de WhatsApp Existentes
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Agregar punto al final de los mensajes existentes

-- Actualizar todos los registros que tengan el mensaje sin punto
UPDATE stores 
SET whatsapp_message = 'Hola, estoy interesado en sus productos.'
WHERE whatsapp_message = 'Hola, estoy interesado en sus productos'
   OR whatsapp_message IS NULL;
