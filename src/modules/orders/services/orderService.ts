import { supabase } from '../../../services/supabase';

export interface OrderItem {
    product_id: number | string;
    name: string;
    quantity: number;
    price: number;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    address?: string;
}

export interface OrderData {
    storeId: number | string;
    customerInfo: CustomerInfo;
    items: OrderItem[];
    total: number;
    paymentMethod: string;
    discountApplied: number;
}

export interface OrderResult {
    success: boolean;
    data?: any;
    error?: any;
}

/**
 * Servicio para la gestión de pedidos (Orders).
 */
export const orderService = {
    /**
     * Registra un nuevo pedido en la base de datos.
     */
    async createOrder(orderData: OrderData): Promise<OrderResult> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    store_id: orderData.storeId,
                    customer_info: orderData.customerInfo,
                    items: orderData.items,
                    total: orderData.total,
                    payment_method: orderData.paymentMethod,
                    discount_applied: orderData.discountApplied,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) {
                console.error('[OrderService] Error creating order:', error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (error) {
            console.error('[OrderService] Unexpected error:', error);
            return { success: false, error };
        }
    },

    /**
     * Obtiene los pedidos de una tienda específica.
     */
    async getStoreOrders(storeId: number | string): Promise<OrderResult> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (error) return { success: false, error };
        return { success: true, data };
    },

    /**
     * Actualiza el estado de un pedido.
     */
    async updateOrderStatus(orderId: string, newStatus: string): Promise<OrderResult> {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) return { success: false, error };
        return { success: true, data };
    }
};
