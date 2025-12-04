-- =====================================================
-- SCRIPT 11: Trigger para Auto-Generar Store Slug
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Generar automáticamente store_slug cuando se crea/actualiza una tienda

-- Función para generar slug desde store_name
CREATE OR REPLACE FUNCTION generate_store_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Si store_slug está vacío o es NULL, generarlo desde store_name
  IF NEW.store_slug IS NULL OR NEW.store_slug = '' THEN
    -- Convertir store_name a slug:
    -- 1. Convertir a minúsculas
    -- 2. Reemplazar espacios y caracteres especiales por guiones
    -- 3. Eliminar acentos
    NEW.store_slug := lower(
      regexp_replace(
        regexp_replace(
          translate(
            NEW.store_name,
            'áéíóúÁÉÍÓÚñÑ',
            'aeiouAEIOUnN'
          ),
          '[^a-zA-Z0-9\s-]', '', 'g'  -- Eliminar caracteres especiales
        ),
        '\s+', '-', 'g'  -- Reemplazar espacios por guiones
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que se ejecuta ANTES de INSERT o UPDATE
CREATE TRIGGER trigger_generate_store_slug
  BEFORE INSERT OR UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION generate_store_slug();

-- Comentario explicativo
COMMENT ON FUNCTION generate_store_slug() IS 'Genera automáticamente store_slug desde store_name si está vacío';
COMMENT ON TRIGGER trigger_generate_store_slug ON stores IS 'Auto-genera store_slug antes de insertar o actualizar una tienda';
