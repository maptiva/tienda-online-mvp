import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product, quantity) => {
        setCart(prevCart => {
            const existingProduct = prevCart.find(item => item.product.id === product.id);
            if (existingProduct) {
                return prevCart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, { product, quantity }];
            }
        });
    };

    const deleteCart = (id) => {
        const existingProduct = cart.find(elem => elem.product.id === id);
        console.log(existingProduct)
        if (existingProduct !== -1) {
            setCart(prevCart => prevCart.filter(elem => elem.product.id !== id));
        }
    }

    return (
        <CartContext.Provider value={{ cart, addToCart, deleteCart }}>
            {children}
        </CartContext.Provider>
    );
};