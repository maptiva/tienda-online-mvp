-- 12_add_is_active_column.sql
ALTER TABLE public.stores
ADD COLUMN is_active BOOLEAN DEFAULT true;
