-- Add metadata fields for improved carousel UX (Respecting existing 'category' column)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;

-- Update existing stores with default description where null
UPDATE stores SET short_description = 'Descubrí los mejores productos en nuestra tienda.' WHERE short_description IS NULL;

-- Example updates for known stores (based on slugs) to make them look great
UPDATE stores SET short_description = 'Jabones naturales hechos con ingredientes orgánicos.' WHERE store_slug = 'ari-alba';
UPDATE stores SET short_description = 'Los dulces más ricos hechos con amor.' WHERE store_slug = 'bar-de-dulces';
UPDATE stores SET short_description = 'Calidad y frescura en cada producto.' WHERE store_slug = 'polynort-concepcion';
