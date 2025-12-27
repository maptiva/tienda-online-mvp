-- =====================================================
-- SCRIPT 23: Corregir Políticas de Storage para Limpieza
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase
-- Propósito: Permitir a usuarios autenticados borrar sus propios archivos
-- y facilitar la limpieza administrativa.

-- 1. Políticas para Bucket: store-logos
-- Asegurar que la política de eliminación sea robusta
DROP POLICY IF EXISTS "Users can delete own logos" ON storage.objects;
CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'store-logos' 
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

-- 2. Políticas para Bucket: product-images
-- Permitir que cualquier usuario autenticado borre (ya que no tienen carpetas por usuario)
-- Nota: En un entorno multi-tenant estricto, esto debería vincularse al user_id del producto,
-- pero para simplificar la limpieza del MVP lo dejaremos para todos los autenticados.
DROP POLICY IF EXISTS "Users can delete product images" ON storage.objects;
CREATE POLICY "Users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
  );

-- 3. Política Opcional: Permitir al script administrativo (si usa Anon Key con RLS)
-- Solo habilitar si NO se va a usar la Service Role Key. 
-- WARNING: Esto permite que CUALQUIER USUARIO ANONIMO borre archivos si conoce la ruta.
-- CREATE POLICY "Allow anon delete for cleanup"
--   ON storage.objects FOR DELETE
--   TO anon
--   USING (bucket_id IN ('store-logos', 'product-images'));
