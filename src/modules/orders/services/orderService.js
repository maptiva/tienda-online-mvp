import { supabase } from '../../../services/supabase';

export const orderService = {
  /**
   * Crea un pedido público utilizando la función RPC segura.
   * @param {string} storeSlug - El slug de la tienda.
   * @param {object} customerInfo - Datos del cliente {name, phone, address}.
   * @param {array} items - Lista de productos [{product_id, name, quantity, price}].
   * @param {number} total - El total de la compra.
   * @param {string} paymentMethod - Método de pago elegido.
   * @param {number} discountApplied - Descuento total aplicado.
   */
  async createPublicOrder(storeSlug, customerInfo, items, total, paymentMethod = 'whatsapp', discountApplied = 0) {
    try {
      const { data, error } = await supabase.rpc('create_public_order', {
        p_store_slug: storeSlug,
        p_customer_info: customerInfo,
        p_items: items,
        p_client_total: total,
        p_payment_method: paymentMethod,
        p_discount_applied: discountApplied
      });

      if (error) throw error;
      return data; // { success: true, order_id: "..." }
    } catch (error) {
      console.error('Error al crear pedido público:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtiene todos los pedidos de una tienda específica.
   * Requiere que el usuario esté autenticado y sea el dueño de la tienda (RLS).
   */
  async getStoreOrders(storeId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Actualiza el estado de un pedido.
   */
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      return { success: false, error: error.message };
    }
  }
};
