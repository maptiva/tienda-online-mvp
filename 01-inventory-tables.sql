-- =====================================================
-- SCRIPT 1: INFRAESTRURA DE BASE DE DATOS - MOTOR DE STOCK
-- Prioridad: Seguridad e Integridad de Datos
-- Basado en: PLAN-MOTOR-DE-STOCK.md
-- =====================================================

-- 1. Crear Tabla Principal - inventory
CREATE TABLE inventory (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT false,
  track_stock BOOLEAN DEFAULT true,
  CONSTRAINT unique_product_inventory UNIQUE(product_id, user_id)
);

-- 2. Crear Tabla de Auditoría - inventory_logs
CREATE TABLE inventory_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  product_id BIGINT NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  movement_type VARCHAR(20) NOT NULL,
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  order_id BIGINT,
  CONSTRAINT valid_movement_type CHECK (movement_type IN ('sale', 'restock', 'adjustment', 'return', 'reserve', 'release'))
);

-- 3. Crear Índices para Rendimiento
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_inventory_low_stock ON inventory(user_id) 
WHERE quantity <= min_stock_alert;
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_user ON inventory_logs(user_id);
CREATE INDEX idx_inventory_logs_date ON inventory_logs(created_at);

-- 4. Crear Función para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Crear Trigger para updated_at
CREATE TRIGGER update_inventory_updated_at 
BEFORE UPDATE ON inventory 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar RLS (CRÍTICO)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Seguridad - inventory
-- Solo usuarios pueden ver su propio inventario
CREATE POLICY "Users can view own inventory" ON inventory
FOR SELECT USING (auth.uid() = user_id);

-- Solo usuarios pueden insertar su propio inventario
CREATE POLICY "Users can insert own inventory" ON inventory
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo usuarios pueden actualizar su propio inventario
CREATE POLICY "Users can update own inventory" ON inventory
FOR UPDATE USING (auth.uid() = user_id);

-- Solo usuarios pueden eliminar su propio inventario
CREATE POLICY "Users can delete own inventory" ON inventory
FOR DELETE USING (auth.uid() = user_id);

-- 8. Políticas de Seguridad - inventory_logs
-- Usuarios pueden ver sus propios logs
CREATE POLICY "Users can view own inventory logs" ON inventory_logs
FOR SELECT USING (auth.uid() = user_id);

-- Solo funciones pueden insertar logs (seguridad definida)
CREATE POLICY "Only functions can insert inventory logs" ON inventory_logs
FOR INSERT WITH CHECK (false);

-- 9. Migración de Stock Existente (Opcional - Solo después de pruebas)
-- Descomentar SOLO cuando estés seguro de que todo funciona
/*
INSERT INTO inventory (product_id, user_id, quantity, track_stock)
SELECT 
  p.id as product_id,
  p.user_id,
  COALESCE(p.stock, 0) as quantity,
  true as track_stock
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id AND p.user_id = i.user_id
WHERE i.id IS NULL;
*/