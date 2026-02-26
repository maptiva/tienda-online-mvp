-- ============================================
-- Migración: Tabla de Estadísticas de Tiendas (shop_stats)
-- Fecha: 2026-02-26
-- Descripción: Almacena eventos de visitas, clics y pedidos para métricas.
-- ============================================

CREATE TABLE IF NOT EXISTS public.shop_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id BIGINT REFERENCES public.stores(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'whatsapp_click', 'order')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_shop_stats_store_id ON public.shop_stats(store_id);
CREATE INDEX IF NOT EXISTS idx_shop_stats_event_type ON public.shop_stats(event_type);
CREATE INDEX IF NOT EXISTS idx_shop_stats_created_at ON public.shop_stats(created_at);

-- RLS (Seguridad)
ALTER TABLE public.shop_stats ENABLE ROW LEVEL SECURITY;

-- Permiso para insertar (Público/Anónimo) - Permite rastrear sin loguearse
CREATE POLICY "Public can insert stats" ON public.shop_stats
    FOR INSERT WITH CHECK (true);

-- Permisología para lectura (Solo Clientes dueños y Admin)
CREATE POLICY "Clients can view own store stats" ON public.shop_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores s 
            WHERE s.id = shop_stats.store_id 
            AND s.user_id = auth.uid()
        )
    );

-- Facilitar lectura a administradores maestros
CREATE POLICY "Super admins can view all stats" ON public.shop_stats
    FOR SELECT USING (
        (auth.jwt() ->> 'email') IN (SELECT email FROM crm_clients WHERE is_super_admin = true)
    );

COMMENT ON TABLE shop_stats IS 'Eventos de interacción del usuario con las tiendas para analítica.';
