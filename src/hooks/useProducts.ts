import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useProductStore } from '../store/useProductStore';
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

export const useProducts = (userId?: string): UseProductsReturn => {
    const { user, impersonatedUser } = useAuth();

    // Determinar el ID objetivo (Tienda pública, usuario impersonado o logueado)
    const targetId = userId || impersonatedUser || user?.id;

    const { getProducts, setProducts } = useProductStore();
    const cacheEntry = targetId ? getProducts(targetId) : null;
    const cachedProducts = cacheEntry?.data;
    const isStale = cacheEntry?.isStale;

    // Estado de carga inicial: solo cargando si NO hay nada (ni siquiera cache viejo)
    const [loading, setLoading] = useState(!cachedProducts && !!targetId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!targetId) {
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            try {
                // Solo activamos loading visual si realmente no hay nada que mostrar
                if (!cachedProducts) {
                    setLoading(true);
                }

                const { data, error: fetchError } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .eq('user_id', targetId)
                    .order('id', { ascending: true });

                if (fetchError) throw fetchError;

                // Validar datos de productos con Zod
                const validatedData = (data || []).map((item, index) => {
                    const result = safeValidate(productSchema, item, `products[${index}]`);
                    if (!result.success && result.error) {
                        console.warn(`Producto inválido en índice ${index}:`, result.formattedErrors);
                    }
                    return result.success ? result.data : item;
                }) as Product[];

                setProducts(targetId, validatedData);
                setError(null);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        // 1. Fetch inicial (o revalidación si es stale)
        fetchProducts();

        // 2. Focus Revalidation: escuchamos cuando la ventana vuelve a estar activa (ej: al despertar PC)
        const handleFocus = () => {
            const currentEntry = getProducts(targetId);
            if (currentEntry?.isStale) {
                fetchProducts();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);

    }, [targetId, setProducts]);

    // Devolvemos lo del cache (aunque sea viejo/stale) para que la UI no parpadee en blanco
    return { products: cachedProducts || [], loading, error };
};
