import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { inventoryService } from '../services/inventoryService';

interface Inventory {
    id: string;
    product_id: string;
    quantity: number;
    reserved_quantity: number;
    min_stock_alert: number;
    allow_backorder: boolean;
    track_stock: boolean;
}

interface AdjustStockParams {
    quantity: number;
    reason?: string;
}

/**
 * Hook para manejar el inventario de un producto usando TanStack Query
 * 
 * Beneficios sobre el cache manual:
 * - Revalidación automática al volver a la pestaña (refetchOnWindowFocus)
 * - Revalidación al reconectar (refetchOnReconnect)
 * - Invalidación automática después de mutaciones
 * - Deduplicación de requests
 * - DevTools para debugging
 */
export const useStock = (productId: string | null, storeSlug?: string) => {
    const { user, impersonatedUser } = useAuth();
    const queryClient = useQueryClient();

    // Determinar el ID objetivo (Usuario impersonado o logueado)
    const targetId = impersonatedUser || user?.id;

    // Query para obtener inventario
    const {
        data: inventory,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['inventory', productId, storeSlug, targetId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => inventoryService.fetchInventory(productId!, user?.id as any, storeSlug as any),
        enabled: !!productId,
        staleTime: 10 * 1000,  // 10 segundos - datos frescos
        gcTime: 5 * 60 * 1000, // 5 minutos - mantener en cache
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    // Mutation para ajustar stock
    const adjustStockMutation = useMutation({
        mutationFn: ({ quantity, reason = 'Ajuste manual' }: AdjustStockParams) =>
            inventoryService.adjustStock(productId!, user!.id, quantity, reason),
        onSuccess: (result) => {
            // Invalidar la query para obtener datos actualizados del servidor
            queryClient.invalidateQueries({
                queryKey: ['inventory', productId]
            });
            // También invalidar inventario general si existe
            queryClient.invalidateQueries({
                queryKey: ['userInventory']
            });
        },
    });

    const checkAvailability = (requestedQuantity: number = 1): boolean => {
        if (!inventory) return false;
        return inventory.quantity >= requestedQuantity;
    };

    const loadLogs = async () => {
        try {
            const logsData = await inventoryService.fetchInventoryLogs(productId!, user!.id);
            return logsData;
        } catch (err) {
            console.error('Error loading logs:', err);
            return [];
        }
    };

    return {
        inventory: inventory as Inventory | null,
        logs: [],
        loading: isLoading,
        error: error?.message || null,
        adjustStock: (quantity: number, reason?: string) =>
            adjustStockMutation.mutateAsync({ quantity, reason }),
        checkAvailability,
        loadInventory: refetch,
        loadLogs,
        clearCache: () => {
            queryClient.removeQueries({ queryKey: ['inventory', productId] });
        },
        refreshInventory: refetch
    };
};
