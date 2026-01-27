import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

// Stock cache simple en memoria
const stockCache = new Map();

export const useStock = (productId) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [logs, setLogs] = useState([]);

  const cacheKey = user?.id ? `${user?.id}-${productId}` : `public-${productId}`;

  // Cargar inventario inicial
  useEffect(() => {
    if (productId) {
      loadInventory();
    }
  }, [productId]);

  const loadInventory = async () => {
    // Revisar cache primero
    if (stockCache.has(cacheKey)) {
      const cached = stockCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) { // 30s cache
        setInventory(cached.data);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const { inventoryService } = await import('../services/inventoryService');
      const data = await inventoryService.fetchInventory(productId, user?.id);

      // Actualizar cache
      stockCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      setInventory(data);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (quantity, reason = 'Ajuste manual') => {
    if (!user?.id) {
      throw new Error('No autorizado para ajustar stock');
    }

    try {
      setLoading(true);
      setError(null);

      const { inventoryService } = await import('../services/inventoryService');
      const result = await inventoryService.adjustStock(
        productId, 
        user.id, 
        quantity, 
        reason
      );

      if (result.success) {
        // Actualizar cache
        const updatedInventory = {
          ...inventory,
          quantity: result.new_quantity
        };
        
        stockCache.set(cacheKey, {
          data: updatedInventory,
          timestamp: Date.now()
        });
        
        setInventory(updatedInventory);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error adjusting stock:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = (requestedQuantity = 1) => {
    if (!inventory) return false;
    return inventory.quantity >= requestedQuantity;
  };

  const loadLogs = async () => {
    try {
      const { inventoryService } = await import('../services/inventoryService');
      const logsData = await inventoryService.fetchInventoryLogs(productId, user.id);
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading logs:', err);
    }
  };

  // Clear cache for this product
  const clearCache = () => {
    stockCache.delete(cacheKey);
  };

  return {
    inventory,
    logs,
    loading,
    error,
    adjustStock,
    checkAvailability,
    loadInventory,
    loadLogs,
    clearCache,
    refreshInventory: loadInventory
  };
};