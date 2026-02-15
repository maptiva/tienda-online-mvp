-- =====================================================
-- REVERT MASTER ADMIN: ELIMINAR LLAVE MAESTRA
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase
-- Propósito: Eliminar los permisos globales otorgados al admin maestro.
-- Una vez ejecutado, el acceso volverá a ser estrictamente por user_id.

DROP POLICY IF EXISTS "Master admin can do everything on stores" ON stores;
DROP POLICY IF EXISTS "Master admin can do everything on categories" ON categories;
DROP POLICY IF EXISTS "Master admin can do everything on products" ON products;
DROP POLICY IF EXISTS "Master admin can do everything on leads" ON leads;
DROP POLICY IF EXISTS "Master admin can do everything on clients" ON clients;
DROP POLICY IF EXISTS "Master admin can do everything on subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Master admin can do everything on payments" ON payments;
DROP POLICY IF EXISTS "Master admin can do everything on inventory" ON inventory;
DROP POLICY IF EXISTS "Master admin can do everything on inventory_logs" ON inventory_logs;

-- NOTA: Las políticas originales de aislamiento (auth.uid() = user_id) 
-- NO se ven afectadas y seguirán funcionando normalmente.
