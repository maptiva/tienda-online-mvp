import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartModal.module.css';
import { MdOutlineDelete } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import Swal from 'sweetalert2';
import { inventoryService } from '../modules/inventory/services/inventoryService';
import { orderService } from '../modules/orders/services/orderService';
import PaymentMethodSelector from '../modules/discounts/components/PaymentMethodSelector';
import { supabase } from '../services/supabase';
import { statsService } from '../modules/stats/services/statsService';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  storeSlug: string;
  stockEnabled: boolean;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber,
  storeSlug,
  stockEnabled
}) => {
  const { cart, removeFromCart, clearCart } = useCart() as any;
  const { theme } = useTheme() as any;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para descuentos
  const [discountSettings, setDiscountSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');

  // Cargar configuración y datos persistidos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // Recuperar datos del comprador del localStorage
      const savedName = localStorage.getItem('clicando_customer_name');
      const savedPhone = localStorage.getItem('clicando_customer_phone');
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);

      if (storeSlug) {
        const fetchDiscountSettings = async () => {
          try {
            const { data, error } = await supabase
              .from('stores')
              .select('discount_settings')
              .eq('store_slug', storeSlug)
              .single();

            if (data?.discount_settings) {
              setDiscountSettings(data.discount_settings);
              if (data.discount_settings.enabled) {
                setPaymentMethod('cash');
              }
            }
          } catch (error) {
            console.error('Error fetching discounts:', error);
          }
        };
        fetchDiscountSettings();
      }
    }
  }, [isOpen, storeSlug]);

  if (!isOpen) return null;

  // Cálculos de totales y descuentos
  const subtotal = cart.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0);

  const getDiscountPercentage = () => {
    if (!discountSettings || !discountSettings.enabled) return 0;
    if (paymentMethod === 'cash') return discountSettings.cash_discount || 0;
    if (paymentMethod === 'transfer') return discountSettings.transfer_discount || 0;
    return 0;
  };

  const discountPercentage = getDiscountPercentage();
  const discountAmount = subtotal * (discountPercentage / 100);
  const finalTotal = subtotal - discountAmount;

  const handleWhatsAppOrder = async (retriesLeft = 1) => {
    if (cart.length === 0) {
      Swal.fire({ icon: 'info', title: 'Carrito vacío', text: 'Tu carrito está vacío.', confirmButtonColor: 'var(--color-primary)' });
      return;
    }

    if (!name || !phone) {
      Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Por favor, completa tu nombre y teléfono.', confirmButtonColor: 'var(--color-primary)' });
      return;
    }

    setIsSubmitting(true);

    if (!whatsappNumber) {
      Swal.fire({ icon: 'error', title: 'Error de configuración', text: 'No hay número de WhatsApp configurado para esta tienda.', confirmButtonColor: 'var(--color-primary)' });
      setIsSubmitting(false);
      return;
    }

    let orderId: string | null = null;

    // 1. Guardar el pedido en la Base de Datos
    try {
      const orderData = { name, phone, address };
      const itemsForOrder = cart.map((item: any) => ({
        product_id: Number(item.product.id), // ID real para integridad referencial
        display_id: item.product.display_id,  // ID corto (#1, #2...)
        sku: item.product.sku,                // SKU personalizado
        name: item.product.name,
        quantity: Number(item.quantity),
        price: Number(item.product.price)
      }));

      // Redondear a 2 decimales para evitar discrepancias de micro-centavos
      const roundedTotal = parseFloat(finalTotal.toFixed(2));
      const roundedDiscount = parseFloat(discountAmount.toFixed(2));

      const resOrder = await orderService.createPublicOrder(
        storeSlug.trim(), // Limpiar posibles espacios
        orderData,
        itemsForOrder,
        roundedTotal,
        paymentMethod,
        roundedDiscount
      );

      if (resOrder.success) {
        orderId = resOrder.data as string;
        // Registrar evento de pedido en estadísticas
        const { data: stData } = await supabase.from('stores').select('id').eq('store_slug', storeSlug).single();
        if (stData) {
          statsService.trackEvent(stData.id, 'order');
        }
      } else {
        // Mostrar error real de la base de datos si falla el blindaje
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar pedido',
          text: resOrder.error || 'No se pudo guardar el pedido por una inconsistencia de datos.',
          confirmButtonColor: 'var(--color-primary)'
        });
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('🔥 [ORDER ERROR]:', err);
    }

    // 2. Procesar Stock (Si aplica)
    const proceedToWhatsAppFn = (id: string | null) => proceedToWhatsApp(id);

    if (stockEnabled && storeSlug) {
      try {
        const itemsToProcess = cart.map((item: any) => ({
          product_id: item.product.id,
          quantity: item.quantity
        }));

        const result = await (inventoryService as any).processPublicCartSale(
          storeSlug,
          itemsToProcess,
          `Pedido #${orderId || 'WEB'} - ${name}`
        );

        if (!result.success) {
          const swalRes = await Swal.fire({
            icon: 'warning',
            title: '⚠️ Problemas con el Stock',
            text: 'No pudimos reservar algunos productos, ¿deseas continuar?',
            showCancelButton: true,
            confirmButtonText: 'Continuar de todas formas'
          });

          if (swalRes.isConfirmed) proceedToWhatsAppFn(orderId);
          else setIsSubmitting(false);
          return;
        }
        proceedToWhatsAppFn(orderId);
      } catch (error) {
        proceedToWhatsAppFn(orderId);
      }
    } else {
      proceedToWhatsAppFn(orderId);
    }

    function proceedToWhatsApp(finalOrderId: string | null) {
      let message = `Hola, me gustaría hacer el siguiente pedido:

*Pedido:* #${finalOrderId ? finalOrderId.slice(-6).toUpperCase() : 'WEB'}
*Nombre:* ${name}
*Teléfono:* ${phone}`;

      if (address) message += `
*Dirección:* ${address}`;

      const paymentLabels: Record<string, string> = { cash: 'Efectivo', transfer: 'Transferencia', whatsapp: 'WhatsApp' };
      message += `
*Pago:* ${paymentLabels[paymentMethod] || 'WhatsApp'}`;

      message += `

*Productos:*`;
      cart.forEach((item: any) => {
        // Implementación de REF: #ID o SKU como en baseline
        const productRef = item.product.sku ? item.product.sku : `#${item.product.display_id || item.product.id}`;
        message += `
- ${item.quantity}x ${item.product.name} (REF: ${productRef}) - $${(item.product.price * item.quantity).toFixed(2)}`;
      });

      if (discountAmount > 0) {
        message += `

*Subtotal:* $${subtotal.toFixed(2)}`;
        message += `
*Descuento (${discountPercentage}%):* -$${discountAmount.toFixed(2)}`;
      }

      message += `

*TOTAL:* $${finalTotal.toFixed(2)}`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      Swal.fire({
        icon: 'success',
        title: '¡Pedido Confirmado!',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: 'top-end'
      });

      // Guardar datos en localStorage para la próxima vez
      localStorage.setItem('clicando_customer_name', name);
      localStorage.setItem('clicando_customer_phone', phone);

      window.location.href = whatsappUrl;
      onClose();
      clearCart();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${theme === 'light' ? styles.light : ''} custom-scrollbar`}>
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
            onChange={e => {
              // Solo permitir números
              const val = e.target.value.replace(/\D/g, '');
              setPhone(val);
            }}
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

            {/* Selector de Método de Pago con Descuentos */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
              discountSettings={discountSettings}
            />
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

          <div className="flex flex-col items-end gap-1">
            {discountAmount > 0 && (
              <>
                <div className="text-sm text-gray-500 line-through">
                  Subtotal: ${subtotal.toFixed(2)}
                </div>
                <div className="text-sm text-emerald-600 font-bold">
                  Ahorro ({discountPercentage}%): -${discountAmount.toFixed(2)}
                </div>
              </>
            )}
            <div className={styles.total}>
              Total: ${finalTotal.toFixed(2)}
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
