-- ========= SCRIPT 21: Aplicar RLS a la tabla 'products' =========

-- 1. Habilitar Row Level Security en la tabla 'products'.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas (si existen) para empezar de cero.
DROP POLICY IF EXISTS "Los dueños pueden gestionar sus propios productos" ON products;
DROP POLICY IF EXISTS "El público puede ver productos de tiendas activas" ON products;

-- 3. Crear política para que los dueños gestionen SUS productos.
-- Permite a un usuario hacer todo en un producto si su ID de autenticación
-- coincide con el user_id del producto.
CREATE POLICY "Los dueños pueden gestionar sus propios productos" ON products
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Crear política para que el PÚBLICO vea productos de tiendas ACTIVAS.
-- Permite a CUALQUIERA ver un producto, SIEMPRE Y CUANDO la tienda
-- asociada a ese producto (a través del user_id) esté marcada como activa.
CREATE POLICY "El público puede ver productos de tiendas activas" ON products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM stores
      WHERE stores.user_id = products.user_id AND stores.is_active = true
    )
  );

-- =====================================================================
