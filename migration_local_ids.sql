-- 1. Agregar columna para el ID local (display_id) si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'display_id') THEN
        ALTER TABLE products ADD COLUMN display_id BIGINT;
    END IF;
END $$;

-- 2. Crear índice para búsquedas rápidas por usuario y display_id
DROP INDEX IF EXISTS idx_products_user_display_id;
CREATE INDEX idx_products_user_display_id ON products(user_id, display_id); 

-- 3. Función para asignar display_id automáticamente
CREATE OR REPLACE FUNCTION assign_product_display_id()
RETURNS TRIGGER AS $$
DECLARE
    next_id BIGINT;
BEGIN
    -- Calcular el siguiente display_id para ese usuario (tienda)
    -- Usamos COALESCE(MAX, 0) + 1 para obtener el siguiente número, o 1 si es el primero
    SELECT COALESCE(MAX(display_id), 0) + 1 INTO next_id
    FROM products
    WHERE user_id = NEW.user_id;

    -- Asignar el valor
    NEW.display_id := next_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger que se dispara ANTES de insertar un producto
DROP TRIGGER IF EXISTS trigger_assign_display_id ON products;
CREATE TRIGGER trigger_assign_display_id
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION assign_product_display_id();

-- 5. MIGRACIÓN: Asignar IDs a los productos existentes
-- Usamos una DO block para recorrer tienda por tienda (user_id) y numerar sus productos
DO $$
DECLARE
    shop_user RECORD;
BEGIN
    -- Recorremos cada usuario (tienda) con productos
    FOR shop_user IN SELECT DISTINCT user_id FROM products LOOP
        
        -- Actualizamos sus productos ordenados por fecha de creación
        UPDATE products p
        SET display_id = sub.rn
        FROM (
            SELECT p2.id, ROW_NUMBER() OVER (ORDER BY p2.created_at ASC) as rn
            FROM products p2
            WHERE p2.user_id = shop_user.user_id
        ) sub
        WHERE p.id = sub.id;
        
    END LOOP;
END $$;
