-- ============================================
-- Migración: Tabla de Estadísticas de Tiendas (shop_stats)
-- Fecha: 01 de marzo de 2026
-- Descripción: Almacena eventos de visitas, clics y pedidos para métricas.
-- ============================================

CREATE TABLE IF NOT EXISTS shop_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id BIGINT REFERENCES stores(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'whatsapp_click', 'order')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_shop_stats_store_id ON shop_stats(store_id);
CREATE INDEX IF NOT EXISTS idx_shop_stats_event_type ON shop_stats(event_type);
CREATE INDEX IF NOT EXISTS idx_shop_stats_created_at ON shop_stats(created_at);

-- Habilitar RLS (Seguridad)
ALTER TABLE shop_stats ENABLE ROW LEVEL SECURITY;

-- 1. Permiso para insertar (Público/Anónimo) 
-- Permite que los visitantes generen métricas sin estar logueados
DROP POLICY IF EXISTS "Public can insert stats" ON shop_stats;
CREATE POLICY "Public can insert stats" ON shop_stats
    FOR INSERT WITH CHECK (true);

-- 2. Permisología para lectura (Solo el dueño de la tienda)
DROP POLICY IF EXISTS "Clients can view own store stats" ON shop_stats;
CREATE POLICY "Clients can view own store stats" ON shop_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores s
            WHERE s.id = shop_stats.store_id
            AND s.user_id = auth.uid()
        )
    );

COMMENT ON TABLE shop_stats IS 'Eventos de interacción del usuario con las tiendas para analítica.';
