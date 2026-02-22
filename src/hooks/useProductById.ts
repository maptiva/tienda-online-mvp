import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category_id?: string;
    user_id: string;
    [key: string]: unknown;
}

/**
 * Hook para obtener un producto por ID usando TanStack Query
 * 
 * Beneficios sobre el cache manual:
 * - Cache automático por ID
 * - Revalidación en foco
 * - Deduplicación de requests
 */
export const useProductById = (productId: string | null) => {
    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', productId],
        queryFn: async (): Promise<Product | null> => {
            if (!productId) return null;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
        enabled: !!productId,
        staleTime: 60 * 1000, // 1 minuto
        gcTime: 10 * 60 * 1000, // 10 minutos
        refetchOnWindowFocus: true,
    });

    return {
        product: product || null,
        loading: isLoading,
        error: error?.message || null
    };
};
