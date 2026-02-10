import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { type Product } from '../schemas/product.schema';

/**
 * Item del carrito con producto completo y cantidad
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Estructura de todos los carritos (multi-tenant)
 * Key: storeSlug, Value: array de items
 */
export interface AllCarts {
  [storeSlug: string]: CartItem[];
}

/**
 * Tipo del contexto del carrito
 */
export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number | string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const { pathname } = useLocation();

    // Identificamos el slug de la tienda actual de la URL
    // Las rutas fijas NO son tiendas y no deben persistir productos aquí
    const pathParts = pathname.split('/').filter(Boolean);
    const storeSlug = pathParts[0];
    const reservedRoutes = ['mapa', 'login', 'forgot-password', 'reset-password', 'admin'];
    const isStorePath = storeSlug && !reservedRoutes.includes(storeSlug);

    const [allCarts, setAllCarts] = useState<AllCarts>(() => {
        const saved = localStorage.getItem('clicando_multi_carts');
        return saved ? JSON.parse(saved) : {};
    });

    // El carrito expuesto al contexto es el de la tienda actual
    const cart: CartItem[] = (isStorePath && allCarts[storeSlug]) ? allCarts[storeSlug] : [];

    useEffect(() => {
        localStorage.setItem('clicando_multi_carts', JSON.stringify(allCarts));
    }, [allCarts]);

    const addToCart = (product: Product, quantity: number): void => {
        if (!isStorePath) return;

        setAllCarts(prev => {
            const currentStoreCart = prev[storeSlug] || [];
            const existingProduct = currentStoreCart.find(item => item.product.id === product.id);

            let newStoreCart: CartItem[];
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

    const removeFromCart = (productId: number | string): void => {
        if (!isStorePath) return;

        setAllCarts(prev => {
            const currentStoreCart = prev[storeSlug] || [];
            const newStoreCart = currentStoreCart.filter(item => item.product.id !== productId);
            return { ...prev, [storeSlug]: newStoreCart };
        });
    };

    const clearCart = (): void => {
        if (!isStorePath) return;

        setAllCarts(prev => {
            const newAllCarts = { ...prev };
            delete newAllCarts[storeSlug];
            return newAllCarts;
        });
    };

    const value: CartContextType = {
        cart,
        addToCart,
        removeFromCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
