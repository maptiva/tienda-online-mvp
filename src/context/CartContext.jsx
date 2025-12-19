import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { pathname } = useLocation();

    // Identificamos el slug de la tienda actual de la URL
    // Las rutas fijas NO son tiendas y no deben persistir productos aquí
    const pathParts = pathname.split('/').filter(Boolean);
    const storeSlug = pathParts[0];
    const reservedRoutes = ['mapa', 'login', 'forgot-password', 'reset-password', 'admin'];
    const isStorePath = storeSlug && !reservedRoutes.includes(storeSlug);

    const [allCarts, setAllCarts] = useState(() => {
        const saved = localStorage.getItem('clicando_multi_carts');
        return saved ? JSON.parse(saved) : {};
    });

    // El carrito expuesto al contexto es el de la tienda actual
    const cart = (isStorePath && allCarts[storeSlug]) ? allCarts[storeSlug] : [];

    useEffect(() => {
        localStorage.setItem('clicando_multi_carts', JSON.stringify(allCarts));
    }, [allCarts]);

    const addToCart = (product, quantity) => {
        if (!isStorePath) return;

        setAllCarts(prev => {
            const currentStoreCart = prev[storeSlug] || [];
            const existingProduct = currentStoreCart.find(item => item.product.id === product.id);

            let newStoreCart;
            if (existingProduct) {
                newStoreCart = currentStoreCart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newStoreCart = [...currentStoreCart, { product, quantity }];
            }

            return { ...prev, [storeSlug]: newStoreCart };
        });
    };

    const removeFromCart = (productId) => {
        if (!isStorePath) return;

        setAllCarts(prev => {
            const currentStoreCart = prev[storeSlug] || [];
            const newStoreCart = currentStoreCart.filter(item => item.product.id !== productId);
            return { ...prev, [storeSlug]: newStoreCart };
        });
    };

    const clearCart = () => {
        if (!isStorePath) return;

        setAllCarts(prev => {
            const newAllCarts = { ...prev };
            delete newAllCarts[storeSlug];
            return newAllCarts;
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};