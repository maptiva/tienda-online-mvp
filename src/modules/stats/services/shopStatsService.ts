import { supabase } from '../../../services/supabase';

export type StatEventType = 'visit' | 'whatsapp_click' | 'order';

export interface ShopStat {
    store_id: number | string;
    event_type: StatEventType;
    metadata?: Record<string, any>;
}

/**
 * Hook/Servicio para registrar métricas de las tiendas.
 */
export const shopStatsService = {
    /**
     * Registra un evento de métrica en Supabase.
     */
    async trackEvent({ store_id, event_type, metadata = {} }: ShopStat) {
        try {
            const { error } = await supabase
                .from('shop_stats')
                .insert([{
                    store_id,
                    event_type,
                    metadata
                }]);

            if (error) {
                // No bloqueamos la experiencia del usuario si fallan las métricas
                console.warn('[ShopStats] Error tracking event:', error.message);
                return { success: false, error };
            }

            return { success: true };
        } catch (err) {
            console.error('[ShopStats] Unexpected error:', err);
            return { success: false, error: err };
        }
    }
};
