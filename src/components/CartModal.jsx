import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartModal.module.css';
import { MdDeleteOutline } from 'react-icons/md';

const CartModal = ({ isOpen, onClose }) => {
  const { cart, deleteCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleWhatsAppOrder = () => {
    if (!name || !phone) {
      alert('Por favor, completa tu nombre y teléfono.');
      return;
    }

    let message = `Hola, me gustaría hacer el siguiente pedido:\n\n`;
    message += `*Nombre:* ${name}\n`;
    message += `*Teléfono:* ${phone}\n`;
    if (address) {
      message += `*Dirección:* ${address}\n`;
    }
    message += `\n*Pedido:*\n`;

    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toFixed(2)}\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    message += `\n*Total:* $${total.toFixed(2)}`;

    const whatsappUrl = `https://wa.me/5493456533273?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const onDeleteProductCart = (id) => {
    deleteCart(id)
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <h2>Tu Pedido</h2>
        <div className={styles.form}>
          <h3>Completa tus datos para el pedido</h3>
          <input type="text" placeholder="Nombre y Apellido" value={name} onChange={e => setName(e.target.value)} />
          <input type="text" placeholder="Teléfono de Contacto" value={phone} onChange={e => setPhone(e.target.value)} />
          <input type="text" placeholder="Dirección de Envío (Opcional)" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div className={styles.cartItems}>
          {
            cart.length === 0 ? (
              <div className='flex flex-col items-center py-5 justify-center'>
                <h3>Tu carrito esta vacio</h3>
                <p className='text-gray-500'>¡Anade productos para verlos aqui!</p>
              </div>
            ) :
              cart.map(item => (
                <div key={item.product.id} className='flex items-center mb-4 pb-4 border-b border-[#eee] gap-5'>
                  <img src={item.product.image_url} alt={item.product.name} className={styles.productImage} />
                  <div className={styles.productDetails}>
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <MdDeleteOutline className='text-red-500 cursor-pointer hover:bg-red-300 rounded-sm' size={20} onClick={() => onDeleteProductCart(item.product.id)} />
                </div>
              ))}
        </div>
        <div className={styles.total}>
          Total: ${cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
        </div>
        <button className={styles.whatsappButton} onClick={handleWhatsAppOrder}>Confirmar Pedido por WhatsApp</button>
      </div>
    </div>
  );
};

export default CartModal;
