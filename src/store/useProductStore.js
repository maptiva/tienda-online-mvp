import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProductStore = create(
    persist(
        (set, get) => ({
            productsCache: {},

            setProducts: (userId, products) => set((state) => ({
                productsCache: {
                    ...state.productsCache,
                    [userId]: {
                        data: products,
                        timestamp: Date.now()
                    }
                }
            })),

            getProducts: (userId) => {
                const entry = get().productsCache[userId];
                if (!entry) return null;

                // Calculamos si están vencidos (5 min)
                const isStale = Date.now() - entry.timestamp > 5 * 60 * 1000;

                // IMPORTANTE: Devolvemos la data igual, pero avisamos si es vieja
                return {
                    data: entry.data,
                    isStale
                };
            },

            hasProducts: (userId) => {
                const entry = get().productsCache[userId];
                return !!entry;
            },

            findProduct: (productId) => {
                const cache = get().productsCache;
                for (const userId in cache) {
                    const products = cache[userId]?.data;
                    const product = products?.find(p => p.id === parseInt(productId));
                    if (product) return product;
                }
                return null;
            }
        }),
        {
            name: 'product-storage',
            partialize: (state) => ({ productsCache: state.productsCache }),
        }
    )
);
