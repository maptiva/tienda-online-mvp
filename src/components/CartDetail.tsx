import React from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartDetail.module.css';

const CartDetail = () => {
  const { cart } = useCart();

  if (cart.length === 0) {
    return <p>Tu carrito está vacío.</p>;
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className={styles.container}>
      <h2>Detalle del Carrito</h2>
      <ul>
        {cart.map(item => (
          <li key={item.product.id} className={styles.cartItem}>
            <img src={item.product.image_url} alt={item.product.name} />
            <div>
              <h3>{item.product.name}</h3>
              <p>Cantidad: {item.quantity}</p>
              <p>Precio: ${item.product.price.toFixed(2)}</p>
            </div>
          </li>
        ))}
      </ul>
      <h3>Total: ${total.toFixed(2)}</h3>
    </div>
  );
};

export default CartDetail;
