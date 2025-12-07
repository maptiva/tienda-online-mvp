-- =====================================================
-- SCRIPT 3: Implementar Row Level Security (RLS)
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Configurar políticas de seguridad para aislar datos

-- ==================
-- RLS para STORES
-- ==================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden ver su propia tienda
CREATE POLICY "Users can view own store"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios autenticados pueden insertar su tienda
CREATE POLICY "Users can insert own store"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios autenticados pueden actualizar su tienda
CREATE POLICY "Users can update own store"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id);

-- Permitir lectura pública de tiendas (para mostrar en frontend público)
-- Esta política se refinará en el script 06

-- ==================
-- RLS para CATEGORIES
-- ==================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver solo sus categorías
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden insertar sus categorías
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus categorías
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuarios pueden eliminar sus categorías
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ==================
-- RLS para PRODUCTS
-- ==================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver solo sus productos
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden insertar sus productos
CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus productos
CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuarios pueden eliminar sus productos
CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);
