import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartModal.module.css';
import { MdOutlineDelete } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';

const CartModal = ({ isOpen, onClose, whatsappNumber }) => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    if (!name || !phone) {
      alert('Por favor, completa tu nombre y teléfono.');
      return;
    }

    if (!whatsappNumber) {
      alert('No hay número de WhatsApp configurado para esta tienda.');
      return;
    }

    let message = "Hola, me gustaría hacer el siguiente pedido:\\n\\n";
    message += `*Nombre:* ${name}\\n`;
    message += `*Teléfono:* ${phone}\\n`;
    if (address) {
      message += `*Dirección:* ${address}\\n`;
    }
    message += `\\n*Pedido:*\\n`;

    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toFixed(2)}\\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    message += `\\n*Total:* $${total.toFixed(2)}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
    clearCart();
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${theme === 'light' ? styles.light : ''}`}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <h2><strong>Tu Pedido</strong></h2>

        <div className={styles.form}>
          <h3>Completa tus datos para el pedido</h3>
          <input
            type="text"
            placeholder="Nombre y Apellido"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Teléfono de Contacto"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <input
            type="text"
            placeholder="Dirección de Envío (Opcional)"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>

        {cart.length > 0 ? (
          <div className={styles.cartItems}>
            {cart.map(item => (
              <div key={item.product.id} className={styles.productItem}>
                <img src={item.product.image_url} alt={item.product.name} className={styles.productImage} />
                <div className={styles.productDetails}>
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className={styles.deleteButton}>
                  <MdOutlineDelete className='text-red-500' size={25} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyCartMessage}>
            <h3>Tu carrito está vacío</h3>
            <p>¡Añade productos para verlos aquí!</p>
          </div>
        )}

        <div className={styles.total}>
          Total: ${total.toFixed(2)}
        </div>

        <button className={styles.whatsappButton} onClick={handleWhatsAppOrder}>Confirmar Pedido por WhatsApp</button>
      </div>
    </div>
  );
};

export default CartModal;
