import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

// Cache simple para evitar llamadas repetidas
const storeConfigCache = new Map();

export const useStoreConfig = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockEnabled, setStockEnabled] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadStoreConfig();
    }
  }, [user?.id]);

  const loadStoreConfig = async () => {
    const cacheKey = user.id;
    
    // Revisar cache primero (5 minutos)
    if (storeConfigCache.has(cacheKey)) {
      const cached = storeConfigCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutos
        setStockEnabled(cached.stockEnabled);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const { inventoryService } = await import('../services/inventoryService');
      const enabled = await inventoryService.checkStoreStockEnabled(user.id);

      // Actualizar cache
      storeConfigCache.set(cacheKey, {
        stockEnabled: enabled,
        timestamp: Date.now()
      });

      setStockEnabled(enabled);
    } catch (err) {
      console.error('Error loading store config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    if (user?.id) {
      storeConfigCache.delete(user.id);
    }
  };

  const refetch = () => {
    clearCache();
    loadStoreConfig();
  };

  return {
    stockEnabled,
    loading,
    error,
    refetch,
    clearCache
  };
};