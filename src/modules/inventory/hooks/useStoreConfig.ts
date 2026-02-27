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
    const targetId = impersonatedUser?.id || user?.id;

    // Query para obtener configuración de la tienda (stock y descuentos)
    const { data: config, isLoading, error, refetch } = useQuery({
        queryKey: ['storeConfig', storeName || targetId],
        queryFn: async () => {
            if (storeName) {
                // Para vista pública seguimos con stock solo por ahora
                const stockEnabled = await inventoryService.checkStoreStockEnabledBySlug(storeName);
                return { stockEnabled, discountEnabled: false };
            }
            return await inventoryService.getStoreSidebarConfig(targetId!);
        },
        enabled: !!(storeName || targetId),
        staleTime: storeName ? 30 * 1000 : 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    const clearCache = () => {
        refetch();
    };

    return {
        stockEnabled: config?.stockEnabled ?? false,
        discountEnabled: config?.discountEnabled ?? false,
        loading: isLoading,
        error: error?.message || null,
        refetch,
        clearCache
    };
};
