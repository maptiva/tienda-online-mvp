-- =====================================================
-- SCRIPT 2: Crear Tabla Stores y Agregar Multi-Tenant
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Implementar arquitectura multi-tenant

-- Crear tabla de tiendas
CREATE TABLE stores (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  contact_phone TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  whatsapp_number TEXT,
  CONSTRAINT unique_user_store UNIQUE(user_id)
);

-- Índice para búsquedas por store_name
CREATE INDEX idx_stores_name ON stores(store_name);

-- Agregar columna user_id a categories
ALTER TABLE categories 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Agregar columna user_id a products
ALTER TABLE products 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_products_user_id ON products(user_id);
