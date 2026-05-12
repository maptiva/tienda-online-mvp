import { supabase } from '../../../services/supabase';
import { type SupabaseError } from '../../../utils/supabaseErrors';

const isDev = import.meta.env.MODE !== 'production';

/**
 * Item de inventario
 */
export interface InventoryItem {
    id?: string;
    product_id: string;
    user_id: string;
    quantity: number;
    reserved_quantity: number;
    min_stock_alert: number;
    allow_backorder: boolean;
    track_stock: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Parámetros para crear inventario por defecto
 */
export interface CreateInventoryParams {
    product_id: string;
    user_id: string;
    quantity: number;
    reserved_quantity: number;
    min_stock_alert: number;
    allow_backorder: boolean;
    track_stock: boolean;
}

/**
 * Item para procesamiento de venta
 */
export interface SaleItem {
    product_id: string;
    quantity: number;
}

/**
 * Resultado de operación de inventario
 */
export interface InventoryResult<T> {
    data: T | null;
    error: SupabaseError | null;
}

export const inventoryService = {
    // Obtener inventario de un producto
    async fetchInventory(productId: string, userId: string | null, storeSlug: string | null = null): Promise<InventoryItem | null> {
        // Vista pública: usar siempre RPC pública si hay slug de tienda
        // Esto evita conflictos cuando un admin visita tiendas públicas de otros usuarios
        if (storeSlug) {
            return await this.fetchPublicInventory(storeSlug, productId);
        }

        // Solo para acceso directo al inventory del usuario logueado (admin panel)
        if (!userId) {
            return null;
        }

        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('product_id', productId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found error
            throw error;
        }

        // Si no existe registro y somos admin (userId presente), crear uno por defecto
        if (!data && userId) {
            return await this.createDefaultInventory(productId, userId);
        }

        return data as InventoryItem | null;
    },

    // Obtener inventario público (sin autenticación) via RPC segura
    async fetchPublicInventory(storeSlug: string, productId: string): Promise<InventoryItem | null> {
        const numericProductId = parseInt(productId, 10);
        
        if (isNaN(numericProductId)) {
            console.error('[fetchPublicInventory] Invalid productId:', productId);
            return null;
        }

        const { data, error } = await supabase.rpc('get_public_inventory', {
            p_store_slug: storeSlug,
            p_product_id: numericProductId
        });

        if (error && error.code === 'PGRST116') return null;
        if (error) {
            console.error('Error in fetchPublicInventory:', error);
            throw error;
        }

        return data && data.length > 0 ? data[0] as InventoryItem : null;
    },

    // Crear inventario por defecto
    async createDefaultInventory(productId: string, userId: string): Promise<InventoryItem> {
        const { data, error } = await supabase
            .from('inventory')
            .insert([{
                product_id: productId,
                user_id: userId,
                quantity: 0,
                reserved_quantity: 0,
                min_stock_alert: 5,
                allow_backorder: false,
                track_stock: true
            }] as CreateInventoryParams[])
            .select()
            .single();

        if (error) throw error;
        return data as InventoryItem;
    },

    // Procesar venta pública (sin login)
    async processPublicCartSale(storeSlug: string, items: SaleItem[], orderReference: string | null = null): Promise<unknown> {
        if (isDev) console.debug('[SERVICE DEBUG]: Llamando a processPublicCartSale', {
            storeSlug,
            items,
            orderReference
        });

        try {
            const { data, error } = await supabase.rpc('process_public_cart_sale', {
                p_store_slug: storeSlug,
                p_items: items,
                p_order_reference: orderReference
            });

            if (isDev) console.debug('[SERVICE DEBUG]: Respuesta de Supabase', { data, error });

            if (error) {
                console.error('[SERVICE ERROR]: Error en RPC call', error);
                throw error;
            }

            if (isDev) console.debug('[SERVICE SUCCESS]: Respuesta exitosa', data);
            return data;
        } catch (error) {
            console.error('[SERVICE CRITICAL]: Error completo en processPublicCartSale', error);
            throw error;
        }
    },

    // Ajustar stock (entrada/salida manual)
    async adjustStock(productId: string, userId: string, quantityChange: number, reason: string, createdBy: string | null = null): Promise<unknown> {
        // Ejecutar como transacción usando RPC
        const { data, error } = await supabase.rpc('adjust_inventory_stock', {
            p_product_id: productId,
            p_user_id: userId,
            p_quantity_change: quantityChange,
            p_reason: reason,
            p_created_by: createdBy || userId
        });

        if (error) throw error;
        return data;
    },

    // Procesar venta masiva desde carrito
    async processCartSale(userId: string, items: SaleItem[], orderReference: string | null = null): Promise<unknown> {
        const { data, error } = await supabase.rpc('process_cart_items_sale', {
            p_items: items,
            p_user_id: userId,
            p_order_reference: orderReference
        });

        if (error) throw error;
        return data;
    },

    // Obtener inventario completo con productos
    async fetchUserInventory(userId: string): Promise<unknown[]> {
        const { data, error } = await supabase.rpc('get_user_inventory_with_products', {
            p_user_id: userId
        });

        if (error) throw error;
        return data || [];
    },

    // Obtener historial de movimientos
    async fetchInventoryLogs(productId: string, userId: string, limit: number = 50): Promise<unknown[]> {
        const { data, error } = await supabase.rpc('get_product_inventory_logs', {
            p_product_id: productId,
            p_user_id: userId,
            p_limit: limit
        });

        if (error) throw error;
        return data || [];
    },

    // Obtener items con bajo stock
    async fetchLowStockItems(userId: string): Promise<unknown[]> {
        const { data, error } = await supabase.rpc('get_low_stock_items', {
            p_user_id: userId
        });

        if (error) throw error;
        return data || [];
    },

    // Verificar si store tiene stock habilitado por user_id (admin)
    async checkStoreStockEnabled(userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('stores')
            .select('enable_stock')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data?.enable_stock || false;
    },

    // Verificar si store tiene stock habilitado por store_slug (vista pública)
    async checkStoreStockEnabledBySlug(storeSlug: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('stores')
            .select('enable_stock')
            .eq('store_slug', storeSlug)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data?.enable_stock || false;
    }
};
