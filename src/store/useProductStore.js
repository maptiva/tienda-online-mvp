import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProductStore = create(
    persist(
        (set, get) => ({
            productsCache: {},
            lastFetch: {},

            setProducts: (userId, products) => set((state) => ({
                productsCache: {
                    ...state.productsCache,
                    [userId]: products
                }
            })),

            getProducts: (userId) => {
                return get().productsCache[userId];
            },

            hasProducts: (userId) => {
                return !!get().productsCache[userId];
            },

            findProduct: (productId) => {
                const cache = get().productsCache;
                // Buscamos en todas las tiendas guardadas (arrays de productos)
                for (const userId in cache) {
                    const product = cache[userId]?.find(p => p.id === parseInt(productId));
                    if (product) return product;
                }
                return null;
            }
        }),
        {
            name: 'product-storage', // key in localStorage
            // Opcional: podemos filtrar qué guardar si solo queremos el cache y no todo
            partialize: (state) => ({ productsCache: state.productsCache }),
        }
    )
);
