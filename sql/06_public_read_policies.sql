-- =====================================================
-- SCRIPT 6: Políticas de Lectura Pública Refinadas
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Permitir que usuarios no autenticados vean datos
--            de tiendas activas únicamente.

-- ==================
-- RLS para STORES
-- ==================
-- Eliminar la política permisiva anterior si existe
DROP POLICY IF EXISTS "Public can view stores by name" ON stores;

-- Nueva política: solo tiendas activas son visibles públicamente
CREATE POLICY "Public can view active stores"
  ON stores FOR SELECT
  USING (status = 'active');

-- ==================
-- RLS para PRODUCTS
-- ==================
-- Eliminar la política permisiva anterior si existe
DROP POLICY IF EXISTS "Public can view all products" ON products;

-- Nueva política: solo productos de tiendas activas son visibles
CREATE POLICY "Public can view products from active stores"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM stores
      WHERE stores.user_id = products.user_id AND stores.status = 'active'
    )
  );

-- ==================
-- RLS para CATEGORIES
-- ==================
-- Eliminar la política permisiva anterior si existe
DROP POLICY IF EXISTS "Public can view all categories" ON categories;

-- Nueva política: solo categorías de tiendas activas son visibles
CREATE POLICY "Public can view categories from active stores"
  ON categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM stores
      WHERE stores.user_id = categories.user_id AND stores.status = 'active'
    )
  );
