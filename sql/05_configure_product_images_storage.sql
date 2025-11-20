-- =====================================================
-- SCRIPT 5: Configurar Storage para Imágenes de Productos
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Crear bucket y políticas para almacenar imágenes de productos

-- Crear bucket público para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Usuarios autenticados pueden subir imágenes
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Política: Lectura pública de imágenes
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Política: Usuarios pueden actualizar sus imágenes
CREATE POLICY "Users can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Política: Usuarios pueden eliminar sus imágenes
CREATE POLICY "Users can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );
