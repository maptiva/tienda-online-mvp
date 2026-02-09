import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productSchema, type Product } from '../schemas/product.schema';

/**
 * Cache entry con timestamp para stale checking
 */
interface CacheEntry {
    data: Product[];
    timestamp: number;
}

/**
 * Estado del store de productos
 */
interface ProductCache {
    productsCache: Record<string, CacheEntry>;
}

/**
 * Acciones del store de productos
 */
interface ProductActions {
    setProducts: (userId: string, products: Product[]) => void;
    getProducts: (userId: string) => { data: Product[]; isStale: boolean } | null;
    hasProducts: (userId: string) => boolean;
    findProduct: (productId: string | number) => Product | null;
}

export type UseProductStore = ProductCache & ProductActions;

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutos

export const useProductStore = create<ProductCache & ProductActions>()(
    persist(
        (set, get) => ({
            productsCache: {},

            setProducts: (userId: string, products: Product[]) => {
                // Validar productos con Zod antes de guardar
                const validatedProducts = products.map((product, index) => {
                    const result = productSchema.safeParse(product);
                    if (!result.success) {
                        console.warn(`Producto inválido en índice ${index}:`, result.error?.issues);
                    }
                    return result.success ? result.data : product;
                });

                set((state) => ({
                    productsCache: {
                        ...state.productsCache,
                        [userId]: {
                            data: validatedProducts,
                            timestamp: Date.now()
                        }
                    }
                }));
            },

            getProducts: (userId: string) => {
                const entry = get().productsCache[userId];
                if (!entry) return null;

                const isStale = Date.now() - entry.timestamp > STALE_THRESHOLD_MS;

                return {
                    data: entry.data,
                    isStale
                };
            },

            hasProducts: (userId: string) => {
                const entry = get().productsCache[userId];
                return !!entry;
            },

            findProduct: (productId: string | number) => {
                const cache = get().productsCache;
                const numericId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

                for (const userId in cache) {
                    const products = cache[userId]?.data;
                    const product = products?.find(p => p.id === numericId);
                    if (product) return product;
                }
                return null;
            }
        }),
        {
            name: 'product-storage',
            version: 2, // Actualizado para nueva estructura TypeScript
            partialize: (state) => ({ productsCache: state.productsCache }),
        }
    )
);
