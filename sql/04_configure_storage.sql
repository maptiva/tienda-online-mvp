-- =====================================================
-- SCRIPT 4: Configurar Storage para Logos
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Crear bucket y políticas para almacenar logos

-- Crear bucket público para logos de tiendas
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Usuarios pueden subir logos en su carpeta
CREATE POLICY "Users can upload own logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'store-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: Lectura pública de logos
CREATE POLICY "Public can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-logos');

-- Política: Usuarios pueden actualizar sus logos
CREATE POLICY "Users can update own logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'store-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: Usuarios pueden eliminar sus logos
CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'store-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
