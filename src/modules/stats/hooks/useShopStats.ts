import { useCallback } from 'react';
import { shopStatsService, StatEventType } from '../services/shopStatsService';

/**
 * Hook para registrar métricas desde componentes funcionales.
 */
export const useShopStats = (storeId?: number | string) => {
    const track = useCallback(async (event_type: StatEventType, metadata?: Record<string, any>) => {
        if (!storeId) return;
        return await shopStatsService.trackEvent({
            store_id: storeId,
            event_type,
            metadata
        });
    }, [storeId]);

    const trackVisit = useCallback(() => track('visit'), [track]);
    const trackWhatsAppClick = useCallback((metadata?: Record<string, any>) => track('whatsapp_click', metadata), [track]);
    const trackOrder = useCallback((metadata?: Record<string, any>) => track('order', metadata), [track]);

    return {
        trackVisit,
        trackWhatsAppClick,
        trackOrder
    };
};
