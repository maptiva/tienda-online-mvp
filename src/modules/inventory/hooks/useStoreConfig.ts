import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';

/**
 * Hook para manejar la configuración de stock de una tienda usando TanStack Query
 * 
 * Beneficios sobre el cache manual:
 * - Revalidación automática al volver a la pestaña (refetchOnWindowFocus)
 * - Invalidación inteligente cuando cambian los datos
 * - DevTools para debugging
 */
export const useStoreConfig = () => {
    const { user, impersonatedUser } = useAuth();
    const { storeName } = useParams();

    // Determinar el ID objetivo (Usuario impersonado o logueado)
    const targetId = impersonatedUser || user?.id;

    // Query para obtener configuración de stock
    const { data: stockEnabled, isLoading, error, refetch } = useQuery({
        queryKey: ['storeConfig', storeName || targetId],
        queryFn: async () => {
            // Usar store_slug para vista pública, user_id para admin
            if (storeName) {
                return await inventoryService.checkStoreStockEnabledBySlug(storeName);
            }
            return await inventoryService.checkStoreStockEnabled(user!.id);
        },
        enabled: !!(storeName || user?.id),
        staleTime: storeName ? 30 * 1000 : 5 * 60 * 1000, // 30s público, 5min admin
        gcTime: 30 * 60 * 1000, // 30 minutos
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const clearCache = () => {
        // TanStack Query maneja la invalidación automáticamente
        refetch();
    };

    return {
        stockEnabled: stockEnabled ?? false,
        loading: isLoading,
        error: error?.message || null,
        refetch,
        clearCache
    };
};
