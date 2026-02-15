-- Add updated_at column to stores table if it doesn't exist
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing rows to have a value (optional but good practice)
UPDATE public.stores 
SET updated_at = created_at 
WHERE updated_at IS NULL;
