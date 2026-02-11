import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams } from 'react-router-dom';

// Cache simple para evitar llamadas repetidas
const storeConfigCache = new Map();

export const useStoreConfig = () => {
  const { user, impersonatedUser } = useAuth();
  const { storeName } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockEnabled, setStockEnabled] = useState(false);

  // Determinar el ID objetivo (Usuario impersonado o logueado)
  const targetId = impersonatedUser || user?.id;

  useEffect(() => {
    // Para vista pública: usar storeName cuando no hay usuario logueado
    // Para vista admin: usar targetId (que contempla impersonación)
    if (storeName || targetId) {
      loadStoreConfig();
    }
  }, [storeName, targetId]);

  const loadStoreConfig = async () => {
    // Priorizar storeName para vista pública, targetId para admin
    const cacheKey = storeName || targetId;

    // Revisar cache primero (30 segundos para vista pública)
    if (storeConfigCache.has(cacheKey)) {
      const cached = storeConfigCache.get(cacheKey);
      const cacheTime = storeName ? 30000 : 300000; // 30s pública, 5min admin
      if (Date.now() - cached.timestamp < cacheTime) {
        setStockEnabled(cached.stockEnabled);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const { inventoryService } = await import('../services/inventoryService');

      // Usar store_slug para vista pública, user_id para admin
      let enabled;
      if (storeName) {
        enabled = await inventoryService.checkStoreStockEnabledBySlug(storeName);
      } else {
        enabled = await inventoryService.checkStoreStockEnabled(user.id);
      }

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
    if (storeName) {
      storeConfigCache.delete(storeName);
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