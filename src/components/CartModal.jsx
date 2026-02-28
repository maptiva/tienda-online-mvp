import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartModal.module.css';
import { MdOutlineDelete } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import Swal from 'sweetalert2';
import { inventoryService } from '../modules/inventory/services/inventoryService';

const CartModal = ({ isOpen, onClose, whatsappNumber, storeSlug, stockEnabled }) => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleWhatsAppOrder = async (retriesLeft = 1) => {
    const isDev = import.meta.env.MODE !== 'production';
    if (isDev) console.debug('🔍 [CART DEBUG]: handleWhatsAppOrder iniciado', {
      cartLength: cart.length,
      cartItems: cart.map(item => ({
        name: item.product.name,
        id: item.product.id,
        quantity: item.quantity
      }))
    });

    if (cart.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'Tu carrito está vacío.',
        confirmButtonColor: 'var(--color-primary)'
      });
      return;
    }

    if (!name || !phone) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor, completa tu nombre y teléfono.',
        confirmButtonColor: 'var(--color-primary)'
      });
      return;
    }

    setIsSubmitting(true);

    if (!whatsappNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Error de configuración',
        text: 'No hay número de WhatsApp configurado para esta tienda.',
        confirmButtonColor: 'var(--color-primary)'
      });
      return;
    }

    let message = `Hola, me gustaría hacer el siguiente pedido:\n\n*Nombre:* ${name}\n*Teléfono:* ${phone}`;

    if (address) {
      message += `\n*Dirección:* ${address}`;
    }

    message += `\n\n*Pedido:*`;

    cart.forEach(item => {
      const productRef = item.product.sku ? item.product.sku : `#${item.product.display_id || item.product.id}`;
      message += `\n- ${item.quantity}x ${item.product.name} (REF: ${productRef}) - $${(item.product.price * item.quantity).toFixed(2)}`;
    });

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    message += `\n\n*Total:* $${total.toFixed(2)}`;

    // Si el stock está habilitado, descontar antes de redirigir
    if (isDev) console.debug('🔍 [STOCK DEBUG]: Verificando si se procesa stock', {
      stockEnabled,
      storeSlug,
      shouldProcess: !!(stockEnabled && storeSlug)
    });

    if (stockEnabled && storeSlug) {
      if (isDev) console.debug('🔍 [STOCK DEBUG]: Iniciando procesamiento de stock', {
        stockEnabled,
        storeSlug,
        cartSize: cart.length
      });

      try {
        const itemsToProcess = cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }));

        if (isDev) console.debug('🔍 [STOCK DEBUG]: Items a procesar:', itemsToProcess);
        if (isDev) console.debug('🔍 [STOCK DEBUG]: Llamando a processPublicCartSale...');

        const result = await inventoryService.processPublicCartSale(storeSlug, itemsToProcess, `Pedido de ${name}`);
        if (isDev) console.debug('🔍 [STOCK DEBUG]: Resultado del procesamiento:', result);

        if (!result.success) {
          if (isDev) console.error('🔥 [STOCK ERROR]: Procesamiento fallido');

          const resArray = Array.isArray(result.results) ? result.results : (result.results ? JSON.parse(result.results) : []);
          const failedItems = resArray.filter(item => !item.success);
          const errorMessage = failedItems.map(item => {
            const cartItem = cart.find(c => c.product.id === item.product_id);
            const productName = cartItem ? cartItem.product.name : `Producto #${item.product_id}`;
            return `• ${productName}: ${item.error}`;
          }).join('\n');

          const swalRes = await Swal.fire({
            icon: 'warning',
            title: '⚠️ Problemas con el Stock',
            html: `<div style="text-align: left; white-space: pre-line; font-size:14px;">\n              <strong>No pudimos reservar algunos productos:</strong><br><br>\n              ${errorMessage}\n            </div>`,
            width: '500px',
            confirmButtonColor: 'var(--color-primary)',
            showCancelButton: true,
            cancelButtonText: 'Cancelar pedido',
            confirmButtonText: 'Continuar de todas formas'
          });

          if (swalRes.isConfirmed) {
            proceedToWhatsApp();
          } else {
            setIsSubmitting(false);
          }
          return;
        }

        if (isDev) console.debug('✅ [STOCK SUCCESS]: Stock descontado correctamente');

        // Notificación no bloqueante (opcional, para feedback visual rápido)
        Swal.fire({
          icon: 'success',
          title: '✅ ¡Pedido Confirmado!',
          text: 'Redirigiendo a WhatsApp...',
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: 'top-end'
        });

        // Redirección inmediata
        proceedToWhatsApp();

      } catch (error) {
        setIsSubmitting(false);
        if (isDev) console.error('🔥 [STOCK CRITICAL ERROR]:', error);

        const swalRes = await Swal.fire({
          icon: 'error',
          title: 'Error del Sistema',
          text: 'Hubo un error al reservar tu stock. Por favor, intenta nuevamente.',
          confirmButtonColor: 'var(--color-primary)',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Intentar de nuevo'
        });

        if (swalRes.isConfirmed) {
          if (retriesLeft > 0) {
            await handleWhatsAppOrder(retriesLeft - 1);
          } else {
            await Swal.fire({ icon: 'error', title: 'No se pudo reservar stock', text: 'Por favor intenta más tarde o contacta al vendedor.' });
          }
        }
        return;
      }
    } else {
      // Si el stock NO está habilitado, vamos directo a WhatsApp sin demora
      proceedToWhatsApp();
    }

    // Función auxiliar para continuar a WhatsApp
    // CAMBIO IMPORTANTE: Usamos window.location.href en lugar de window.open
    // Esto es mucho más confiable en móviles y evita el bloqueo de popups después de un proceso asíncrono
    function proceedToWhatsApp() {
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      // En móviles, location.href suele abrir la App directamente de forma más fluida
      window.location.href = whatsappUrl;

      onClose();
      clearCart();
    }
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

        <div className={styles.totalSection}>
          {cart.length > 0 && (
            <button className={styles.clearAllButton} onClick={clearCart}>
              Vaciar carrito
            </button>
          )}
          <div className={styles.total}>
            Total: ${total.toFixed(2)}
          </div>
        </div>

        <button
          className={styles.whatsappButton}
          onClick={handleWhatsAppOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando pedido...' : 'Confirmar Pedido por WhatsApp'}
        </button>
      </div>
    </div>
  );
};

export default CartModal;
