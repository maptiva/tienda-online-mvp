-- =====================================================
-- SCRIPT 6: Permitir Lectura Pública de Productos y Categorías
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Permitir que usuarios no autenticados vean productos y categorías

-- Permitir lectura pública de productos
CREATE POLICY "Public can view all products"
  ON products FOR SELECT
  USING (true);

-- Permitir lectura pública de categorías
CREATE POLICY "Public can view all categories"
  ON categories FOR SELECT
  USING (true);
