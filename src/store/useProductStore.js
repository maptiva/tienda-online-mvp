import { create } from 'zustand';

export const useProductStore = create((set, get) => ({
    productsCache: {}, // Objeto para guardar productos por ID: { 'user_123': [prod1, prod2] }
    lastFetch: {}, // Para guardar timestamps si quisiéramos invalidar cache (opcional por ahora)

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
    }
}));
