import { supabase } from '../../../services/supabase';

export const inventoryService = {
  // Obtener inventario de un producto
  async fetchInventory(productId, userId, storeSlug = null) {
    // Vista pública: usar RPC pública si no hay usuario pero hay slug
    if (!userId && storeSlug) {
      return await this.fetchPublicInventory(storeSlug, productId);
    }

    // Si no hay userId (vista pública) y no hay storeSlug, no podemos determinar la tienda
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

    return data;
  },

  // Obtener inventario público (sin autenticación) via RPC segura
  async fetchPublicInventory(storeSlug, productId) {
    const { data, error } = await supabase.rpc('get_public_inventory', {
      p_store_slug: storeSlug,
      p_product_id: productId
    });

    if (error && error.code === 'PGRST116') return null;
    if (error) {
      console.error('Error in fetchPublicInventory:', error);
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  },

  // Crear inventario por defecto
  async createDefaultInventory(productId, userId) {
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
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Ajustar stock (entrada/salida manual)
  async adjustStock(productId, userId, quantityChange, reason, createdBy = null) {
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

  // Procesar venta con validación de stock
  async processSaleTransaction(productId, userId, quantity, orderId = null) {
    const { data, error } = await supabase.rpc('process_sale_with_stock_validation', {
      p_product_id: productId,
      p_user_id: userId,
      p_quantity: quantity,
      p_order_id: orderId
    });

    if (error) throw error;
    return data.success;
  },

  // Obtener inventario completo con productos
  async fetchUserInventory(userId) {
    const { data, error } = await supabase.rpc('get_user_inventory_with_products', {
      p_user_id: userId
    });

    if (error) throw error;
    return data || [];
  },

  // Obtener historial de movimientos
  async fetchInventoryLogs(productId, userId, limit = 50) {
    const { data, error } = await supabase.rpc('get_product_inventory_logs', {
      p_product_id: productId,
      p_user_id: userId,
      p_limit: limit
    });

    if (error) throw error;
    return data || [];
  },

  // Obtener items con bajo stock
  async fetchLowStockItems(userId) {
    const { data, error } = await supabase.rpc('get_low_stock_items', {
      p_user_id: userId
    });

    if (error) throw error;
    return data || [];
  },

  // Verificar si store tiene stock habilitado por user_id (admin)
  async checkStoreStockEnabled(userId) {
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
  async checkStoreStockEnabledBySlug(storeSlug) {
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