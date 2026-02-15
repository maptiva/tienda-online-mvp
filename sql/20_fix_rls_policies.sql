-- ========= SCRIPT DE REPARACIÓN DE RLS PARA LA TABLA 'stores' =========

-- 1. Asegurarse de que RLS esté HABILITADO en la tabla.
-- Si ya lo está, este comando no hace nada. Si lo deshabilitaste con el script 19, esto lo reactiva.
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar las políticas antiguas y conflictivas para evitar duplicados.
-- Es seguro ejecutar esto aunque las políticas no existan.
DROP POLICY IF EXISTS "Users can manage their own store" ON stores;
DROP POLICY IF EXISTS "Public stores are viewable by everyone" ON stores;
-- También eliminamos estas por si acaso quedaron de una versión anterior (del script 18)
DROP POLICY IF EXISTS "Enable read access for all users" ON stores;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON stores;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON stores;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON stores;


-- 3. Crear la política de GESTIÓN para los dueños de la tienda.
-- Esta es la regla principal. Permite a un usuario autenticado hacer CUALQUIER operación
-- (SELECT, INSERT, UPDATE, DELETE) SÓLO Y SÓLO SI su ID de usuario coincide con el `user_id` de la tienda.
CREATE POLICY "Store owners can manage their own stores" ON stores
  FOR ALL -- Aplica a SELECT, INSERT, UPDATE, DELETE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 4. Crear la política de LECTURA PÚBLICA para visitantes.
-- Permite que CUALQUIERA (incluso no autenticados) pueda VER las tiendas,
-- pero ÚNICAMENTE aquellas que están marcadas como activas.
-- (Asumo la existencia de la columna `is_active` del script 12).
-- Si la columna se llama diferente (ej: `public`), ajústalo aquí.
CREATE POLICY "Public can view active stores" ON stores
  FOR SELECT
  USING (is_active = true);

-- ========= FIN DEL SCRIPT DE REPARACIÓN =========