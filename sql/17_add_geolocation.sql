-- Agregar columnas para geolocalización de tiendas
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8), -- Suficiente precisión para GPS
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS show_map BOOLEAN DEFAULT false;

-- Comentario para documentación
COMMENT ON COLUMN stores.latitude IS 'Latitud de la ubicación física de la tienda';
COMMENT ON COLUMN stores.longitude IS 'Longitud de la ubicación física de la tienda';
COMMENT ON COLUMN stores.city IS 'Ciudad o localidad de la tienda';
COMMENT ON COLUMN stores.category IS 'Categoría del comercio (ej. Comida, Ropa)';
COMMENT ON COLUMN stores.show_map IS 'Si es true, muestra el mapa en el footer/contacto';
