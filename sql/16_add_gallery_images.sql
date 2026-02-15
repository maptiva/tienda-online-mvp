-- Agregar columna para galería de imágenes
-- Se usará un array de texto para almacenar las URLs adicionales
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- Comentario para documentación
COMMENT ON COLUMN products.gallery_images IS 'Array de URLs para imágenes secundarias del producto';
