import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { productSchema, type Product } from '../schemas/product.schema';
import { safeValidate } from '../utils/zodHelpers';

/**
 * Tipo de retorno del hook useProducts
 */
export interface UseProductsReturn {
    products: Product[];
    loading: boolean;
    error: string | null;
}

/**
 * Hook para obtener productos usando TanStack Query
 * 
 * Beneficios sobre el cache manual con Zustand:
 * - Revalidación automática al volver a la pestaña (refetchOnWindowFocus)
 * - Revalidación al reconectar (refetchOnReconnect)
 * - Stale-while-revalidate built-in
 * - DevTools para debugging
 * - Eliminación de código manual de focus listeners
 */
export const useProducts = (userId?: string): UseProductsReturn => {
    const { user, impersonatedUser } = useAuth();

    // Determinar el ID objetivo (Tienda pública, usuario impersonado o logueado)
    const targetId = userId || impersonatedUser?.id || user?.id;

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products', targetId],
        queryFn: async () => {
            if (!targetId) return [];

            const { data, error: fetchError } = await supabase
                .from('products')
                .select('*, categories(name)')
                .eq('user_id', targetId)
                .order('id', { ascending: true });

            if (fetchError) throw fetchError;

            // Validar datos de productos con Zod de forma silenciosa e informativa
            const validatedData = (data || []).map((item, index) => {
                const result = safeValidate(productSchema, item, `products[${index}]`);
                return result.success ? result.data : item;
            }) as Product[];

            return validatedData;
        },
        enabled: !!targetId,
        staleTime: 60 * 1000, // 1 minuto - datos frescos
        gcTime: 10 * 60 * 1000, // 10 minutos - mantener en cache
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    return {
        products: products || [],
        loading: isLoading,
        error: error?.message || null,
    };
};
