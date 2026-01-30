-- Agregar columna para el nombre del negocio/emprendimiento
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Comentario para documentación
COMMENT ON COLUMN leads.business_name IS 'Nombre de la tienda, emprendimiento o negocio del prospecto';
