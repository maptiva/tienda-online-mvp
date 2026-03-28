import { supabase } from '../../../services/supabase';
import { handleSupabaseError, type SupabaseError } from '../../../utils/supabaseErrors';
import { type CartItem } from '../../../schemas/cart.schema';

/**
 * Información del cliente para crear un pedido
 */
export interface CustomerInfo {
    name: string;
    phone: string;
    address?: string;
}

/**
 * Item de pedido para enviar a la base de datos
 */
export interface OrderItem {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
}

/**
 * Resultado de una operación de pedido
 */
export interface OrderResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Datos de un pedido desde la base de datos
 */
export interface Order {
    id: string;
    store_id: string;
    status: string;
    customer_info: CustomerInfo;
    items: OrderItem[];
    client_total: number;
    payment_method: string;
    discount_applied: number;
    created_at: string;
    updated_at: string;
}

export const orderService = {
    /**
     * Crea un pedido público utilizando la función RPC segura.
     * @param storeSlug - El slug de la tienda.
     * @param customerInfo - Datos del cliente {name, phone, address}.
     * @param items - Lista de productos [{product_id, name, quantity, price}].
     * @param total - El total de la compra.
     * @param paymentMethod - Método de pago elegido.
     * @param discountApplied - Descuento total aplicado.
     */
    async createPublicOrder(
        storeSlug: string,
        customerInfo: CustomerInfo,
        items: OrderItem[],
        total: number,
        paymentMethod: string = 'whatsapp',
        discountApplied: number = 0
    ): Promise<OrderResult<string>> {
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

            // El RPC devuelve un objeto JSONB: { success: boolean, order_id: string, ... }
            const response = data as { success: boolean, order_id: string, error?: string };
            
            if (response.success) {
                return { success: true, data: String(response.order_id) };
            } else {
                return { success: false, error: response.error || 'Error en el servidor al crear pedido' };
            }
        } catch (error) {
            console.error('Error al crear pedido público:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear pedido';
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Obtiene todos los pedidos de una tienda específica.
     * Requiere que el usuario esté autenticado y sea el dueño de la tienda (RLS).
     * @param storeId - ID de la tienda
     */
    async getStoreOrders(storeId: string): Promise<OrderResult<Order[]>> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('store_id', storeId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data: data as Order[] };
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener pedidos';
            return { success: false, error: errorMessage };
        }
    },

    /**
     * Actualiza el estado de un pedido.
     * @param orderId - ID del pedido
     * @param status - Nuevo estado del pedido
     */
    async updateOrderStatus(orderId: string, status: string): Promise<OrderResult<Order[]>> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId)
                .select();

            if (error) throw error;
            return { success: true, data: data as Order[] };
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar estado';
            return { success: false, error: errorMessage };
        }
    }
};
