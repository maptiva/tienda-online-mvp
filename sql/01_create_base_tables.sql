-- =====================================================
-- SCRIPT 1: Crear Estructura Base de Tablas
-- =====================================================
-- Ejecutar en: SQL Editor de Supabase (tienda-online-dev)
-- Propósito: Crear las tablas categories y products

-- Tabla de Categorías
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT
);

-- Tabla de Productos
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category_id BIGINT REFERENCES categories(id),
  image_url TEXT,
  stock INTEGER DEFAULT 0
);

-- Índice para mejorar búsquedas por categoría
CREATE INDEX idx_products_category ON products(category_id);
