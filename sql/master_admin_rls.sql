-- =====================================================
-- MASTER ADMIN: LLAVE MAESTRA RLS
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase
-- Propósito: Permitir que el email maptiva.sig.app@gmail.com 
-- tenga acceso total a cualquier fila independientemente del user_id.

-- 1. Actualizar STORES
DROP POLICY IF EXISTS "Master admin can do everything on stores" ON stores;
CREATE POLICY "Master admin can do everything on stores"
  ON stores FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com');

-- 2. Actualizar CATEGORIES
DROP POLICY IF EXISTS "Master admin can do everything on categories" ON categories;
CREATE POLICY "Master admin can do everything on categories"
  ON categories FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com');

-- 3. Actualizar PRODUCTS
DROP POLICY IF EXISTS "Master admin can do everything on products" ON products;
CREATE POLICY "Master admin can do everything on products"
  ON products FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com');

-- 5. Actualizar CLIENTS (CRM)
DROP POLICY IF EXISTS "Master admin can do everything on clients" ON clients;
CREATE POLICY "Master admin can do everything on clients"
  ON clients FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com');

-- 6. Actualizar SUBSCRIPTIONS (CRM)
DROP POLICY IF EXISTS "Master admin can do everything on subscriptions" ON subscriptions;
CREATE POLICY "Master admin can do everything on subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com');

-- 7. Actualizar PAYMENTS (CRM)
DROP POLICY IF EXISTS "Master admin can do everything on payments" ON payments;
CREATE POLICY "Master admin can do everything on payments"
  ON payments FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com');

-- 8. Actualizar INVENTORY
DROP POLICY IF EXISTS "Master admin can do everything on inventory" ON inventory;
CREATE POLICY "Master admin can do everything on inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com');

-- 9. Actualizar INVENTORY_LOGS
DROP POLICY IF EXISTS "Master admin can do everything on inventory_logs" ON inventory_logs;
CREATE POLICY "Master admin can do everything on inventory_logs"
  ON inventory_logs FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'maptiva.sig.app@gmail.com');

-- NOTA: Mantener las políticas anteriores (donde auth.uid() = user_id) 
-- permitirá que el dueño de la tienda siga accediendo normalmente.
