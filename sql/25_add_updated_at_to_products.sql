-- Add updated_at column to products table if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing rows to have a value
UPDATE public.products 
SET updated_at = created_at 
WHERE updated_at IS NULL;
