import { supabase } from '../../../services/supabase';

export interface ShopStatsSummary {
    visits: number;
    whatsapp_clicks: number;
    orders: number;
    conversion_rate: number;
}

export const statsService = {
    /**
     * Obtiene el resumen de métricas para una tienda.
     */
    async getStoreStatsSummary(storeId: number | string): Promise<ShopStatsSummary> {
        try {
            // En un entorno real, esto podría ser una vista o una función RPC para mayor eficiencia
            const { data, error } = await supabase
                .from('shop_stats')
                .select('event_type')
                .eq('store_id', storeId);

            if (error) throw error;

            const summary = (data || []).reduce((acc: any, curr: any) => {
                if (curr.event_type === 'visit') acc.visits++;
                if (curr.event_type === 'whatsapp_click') acc.whatsapp_clicks++;
                if (curr.event_type === 'order') acc.orders++;
                return acc;
            }, { visits: 0, whatsapp_clicks: 0, orders: 0 });

            const conversion_rate = summary.visits > 0
                ? (summary.whatsapp_clicks / summary.visits) * 100
                : 0;

            return {
                ...summary,
                conversion_rate
            };
        } catch (error) {
            console.error('[StatsService] Error fetching stats:', error);
            return { visits: 0, whatsapp_clicks: 0, orders: 0, conversion_rate: 0 };
        }
    }
};
