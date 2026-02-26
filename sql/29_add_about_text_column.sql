-- Add about_text column for store "Nosotros" section
-- This allows store owners to add a custom "About Us" description

ALTER TABLE stores ADD COLUMN IF NOT EXISTS about_text TEXT;

-- Update existing stores with default empty text
UPDATE stores SET about_text = '' WHERE about_text IS NULL;

-- Optional: Add a comment to explain the column purpose
COMMENT ON COLUMN stores.about_text IS 'Texto personalizado de la sección "Nosotros" del comercio. Los dueños pueden describir su negocio, historia, valores, etc.';
