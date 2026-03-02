import { supabase } from '../../../services/supabase';

export interface ShopStatsSummary {
    visits: number;
    whatsapp_clicks: number;
    orders: number;
    conversion_rate: number;
}

/**
 * Servicio para obtener y procesar estadísticas de la tienda.
 */
export const statsService = {
    /**
     * Obtiene el resumen consolidado de métricas para una tienda.
     * @param storeId ID numérico de la tienda.
     */
    async getStoreStatsSummary(storeId: number | string): Promise<ShopStatsSummary> {
        try {
            // Convertir storeId a número para asegurar consistencia
            const numericStoreId = typeof storeId === 'string' ? parseInt(storeId, 10) : storeId;

            const { data, error } = await supabase
                .from('shop_stats')
                .select('event_type')
                .eq('store_id', numericStoreId);

            if (error) throw error;

            const summary: ShopStatsSummary = {
                visits: 0,
                whatsapp_clicks: 0,
                orders: 0,
                conversion_rate: 0
            };

            // 2. Contabilizar eventos
            data.forEach(item => {
                if (item.event_type === 'visit') summary.visits++;
                else if (item.event_type === 'whatsapp_click') summary.whatsapp_clicks++;
                else if (item.event_type === 'order') summary.orders++;
            });

            // 3. Calcular tasa de conversión (Pedidos / Visitas) * 100
            if (summary.visits > 0) {
                summary.conversion_rate = (summary.orders / summary.visits) * 100;
            }

            return summary;
        } catch (err) {
            console.error('[StatsService] Error fetching summary:', err);
            return { visits: 0, whatsapp_clicks: 0, orders: 0, conversion_rate: 0 };
        }
    },

    /**
     * Registra un nuevo evento de métrica.
     * @param storeId ID de la tienda.
     * @param eventType Tipo de evento.
     * @param metadata Datos adicionales.
     */
    async trackEvent(storeId: number | string, eventType: 'visit' | 'whatsapp_click' | 'order', metadata = {}) {
        try {
            if (!storeId) {
                console.warn('[StatsService] Skipping trackEvent: No storeId provided');
                return;
            }

            const { error } = await supabase
                .from('shop_stats')
                .insert([{
                    store_id: storeId,
                    event_type: eventType,
                    metadata
                }]);
            
            if (error) {
                console.error(`[StatsService] Failed to track ${eventType}:`, error.message);
            } else {
                console.log(`[StatsService] ✅ Tracked ${eventType} for store ${storeId}`);
            }
        } catch (err) {
            console.error('[StatsService] Unexpected error tracking event:', err);
        }
    }
};
