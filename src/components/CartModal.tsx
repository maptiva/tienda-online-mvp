import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartModal.module.css';
import { MdOutlineDelete } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import Swal from 'sweetalert2';
import { inventoryService } from '../modules/inventory/services/inventoryService';
import { useDiscounts, DiscountSettings } from '../modules/discounts/hooks/useDiscounts';
import { PaymentMethodSelector } from '../modules/discounts/components/PaymentMethodSelector';
import { orderService } from '../modules/orders/services/orderService';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  storeSlug: string;
  stockEnabled: boolean;
  storeId: number | string;
  discountSettings: DiscountSettings;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber,
  storeSlug,
  stockEnabled,
  storeId,
  discountSettings
}) => {
  const { cart, removeFromCart, clearCart } = useCart() as any;
  const { theme } = useTheme() as any;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'other'>('other');

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0);
  const { calculateDiscount, getPercentageFor } = useDiscounts(discountSettings, subtotal);
  const discountAmount = calculateDiscount(paymentMethod);
  const finalTotal = subtotal - discountAmount;

  if (!isOpen) return null;

  const handleWhatsAppOrder = async (retriesLeft = 1) => {
    const isDev = import.meta.env.MODE !== 'production';
    if (isDev) console.debug('🔍 [CART DEBUG]: handleWhatsAppOrder iniciado', {
      cartLength: cart.length,
      cartItems: cart.map((item: any) => ({
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

    const payMethodLabel = paymentMethod === 'cash' ? 'Efectivo' : (paymentMethod === 'transfer' ? 'Transferencia' : 'Otro/A convenir');
    message += `\n*Método de Pago:* ${payMethodLabel}`;

    message += `\n\n*Pedido:*`;

    cart.forEach((item: any) => {
      const productRef = item.product.sku ? item.product.sku : `#${item.product.display_id || item.product.id}`;
      message += `\n- ${item.quantity}x ${item.product.name} (REF: ${productRef}) - $${(item.product.price * item.quantity).toFixed(2)}`;
    });

    message += `\n\n*Resumen:*`;
    message += `\nSubtotal: $${subtotal.toFixed(2)}`;
    if (discountAmount > 0) {
      message += `\nDescuento (${getPercentageFor(paymentMethod)}%): -$${discountAmount.toFixed(2)}`;
    }
    message += `\n*Total a Pagar: $${finalTotal.toFixed(2)}*`;

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
        const itemsToProcess = cart.map((item: any) => ({
          product_id: item.product.id,
          quantity: item.quantity
        }));

        if (isDev) console.debug('🔍 [STOCK DEBUG]: Items a procesar:', itemsToProcess);
        if (isDev) console.debug('🔍 [STOCK DEBUG]: Llamando a processPublicCartSale...');

        const result = await (inventoryService as any).processPublicCartSale(storeSlug, itemsToProcess, `Pedido de ${name}`);
        if (isDev) console.debug('🔍 [STOCK DEBUG]: Resultado del procesamiento:', result);

        if (!result.success) {
          if (isDev) console.error('🔥 [STOCK ERROR]: Procesamiento fallido');

          const resArray = Array.isArray(result.results) ? result.results : (result.results ? JSON.parse(result.results) : []);
          const failedItems = resArray.filter((item: any) => !item.success);
          const errorMessage = failedItems.map((item: any) => {
            const cartItem = cart.find((c: any) => c.product.id === item.product_id);
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
    function proceedToWhatsApp() {
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      // En móviles, location.href suele abrir la App directamente de forma más fluida
      window.location.href = whatsappUrl;

      // Registrar pedido en la DB (Silent fail if error, we don't want to block the user)
      orderService.createOrder({
        storeId,
        customerInfo: { name, phone, address },
        items: cart.map((item: any) => ({
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: finalTotal,
        paymentMethod: paymentMethod,
        discountApplied: discountAmount
      });

      onClose();
      clearCart();
    }
  };

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

        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onChange={(method) => setPaymentMethod(method as any)}
          discounts={{
            cash: getPercentageFor('cash'),
            transfer: getPercentageFor('transfer')
          }}
        />

        {cart.length > 0 ? (
          <div className={styles.cartItems}>
            {cart.map((item: any) => (
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
          <div className={`${styles.total} flex flex-col items-end`}>
            {discountAmount > 0 && (
              <span className="text-sm text-gray-400 line-through">Subtotal: ${subtotal.toFixed(2)}</span>
            )}
            <div className="flex items-center gap-2">
              {discountAmount > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  -{getPercentageFor(paymentMethod)}%
                </span>
              )}
              <span className="font-black text-xl">Total: ${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          className={styles.whatsappButton}
          onClick={() => handleWhatsAppOrder()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando pedido...' : 'Confirmar Pedido por WhatsApp'}
        </button>
      </div>
    </div>
  );
};

export default CartModal;
