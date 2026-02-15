# Plan Estratégico: Motor de Stock Escalable y Modular

## 🎯 Visión General

Implementar un sistema de gestión de inventario como **módulo independiente** para Clicando Tienda Online SaaS, siguiendo los principios de modularidad, escalabilidad y desacoplamiento que has definido.

## 📊 Análisis del Codebase Existente

### Arquitectura Actual Identificada:
- **Frontend**: React + Vite + TailwindCSS
- **Estado**: Zustand (para productos) + Context API (para auth/cart)
- **Backend**: Supabase con PostgreSQL
- **Multi-tenant**: Implementado con `user_id` en todas las tablas
- **Estructura**: `/src/hooks/`, `/src/store/`, `/src/services/`

### Tablas Existentes Relevantes:
```sql
products (id, user_id, stock INTEGER DEFAULT 0, ...)
categories (id, user_id, ...)
stores (id, user_id, ...)
```

## 🏗️ Arquitectura Propuesta

### 1. Estructura de Directorios del Módulo
```
src/
├── modules/
│   └── inventory/
│       ├── hooks/
│       │   ├── useStock.js
│       │   ├── useInventoryManager.js
│       │   └── useStockAlerts.js
│       ├── store/
│       │   └── useInventoryStore.js
│       ├── services/
│       │   └── inventoryService.js
│       ├── components/
│       │   ├── StockIndicator.jsx
│       │   ├── StockAdjustment.jsx
│       │   ├── InventoryHistory.jsx
│       │   └── StockAlerts.jsx
│       ├── types/
│       │   └── inventory.types.js
│       └── utils/
│           └── stockCalculations.js
```

### 2. Modelo de Datos (SQL)

#### Tabla Principal - inventory
```sql
CREATE TABLE inventory (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT false,
  track_stock BOOLEAN DEFAULT true,
  CONSTRAINT unique_product_inventory UNIQUE(product_id, user_id)
);

-- Índices para rendimiento
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_inventory_low_stock ON inventory(user_id) 
WHERE quantity <= min_stock_alert;
```

#### Tabla de Auditoría - inventory_logs
```sql
CREATE TABLE inventory_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  product_id BIGINT NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  movement_type VARCHAR(20) NOT NULL, -- 'sale', 'restock', 'adjustment', 'return', 'reserve', 'release'
  quantity_change INTEGER NOT NULL, -- positivo para entrada, negativo para salida
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  order_id BIGINT, -- referencia a futura tabla de pedidos
  CONSTRAINT valid_movement_type CHECK (movement_type IN ('sale', 'restock', 'adjustment', 'return', 'reserve', 'release'))
);

-- Índices para auditoría
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_user ON inventory_logs(user_id);
CREATE INDEX idx_inventory_logs_date ON inventory_logs(created_at);
```

#### Trigger para updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at 
BEFORE UPDATE ON inventory 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Hooks Personalizados

#### useStock.js - Hook Principal
```javascript
import { useState, useEffect } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { inventoryService } from '../services/inventoryService';

export const useStock = (productId) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    getInventory,
    updateInventory,
    getInventoryLogs
  } = useInventoryStore();

  const inventory = getInventory(productId);
  const logs = getInventoryLogs(productId);

  // Cargar inventario inicial
  useEffect(() => {
    if (productId && user?.id) {
      loadInventory();
    }
  }, [productId, user?.id]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      await inventoryService.fetchInventory(productId, user.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (quantity, reason = 'Ajuste manual') => {
    try {
      setLoading(true);
      await inventoryService.adjustStock(
        productId, 
        user.id, 
        quantity, 
        reason
      );
    } catch (err) {
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

  return {
    inventory,
    logs,
    loading,
    error,
    adjustStock,
    checkAvailability,
    refreshInventory: loadInventory
  };
};
```

#### useInventoryManager.js - Hook de Gestión
```javascript
import { useState, useCallback } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { inventoryService } from '../services/inventoryService';

export const useInventoryManager = () => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState({});
  
  const {
    getAllInventory,
    bulkUpdateInventory,
    getLowStockItems
  } = useInventoryStore();

  const processSale = useCallback(async (items, orderId = null) => {
    const results = [];
    
    for (const item of items) {
      try {
        setProcessing(prev => ({ ...prev, [item.productId]: true }));
        
        // Validación de stock dentro de transacción
        const success = await inventoryService.processSaleTransaction(
          item.productId,
          user.id,
          item.quantity,
          orderId
        );
        
        results.push({
          productId: item.productId,
          success,
          error: success ? null : 'Stock insuficiente'
        });
      } catch (error) {
        results.push({
          productId: item.productId,
          success: false,
          error: error.message
        });
      } finally {
        setProcessing(prev => ({ ...prev, [item.productId]: false }));
      }
    }
    
    return results;
  }, [user?.id]);

  const bulkRestock = useCallback(async (items) => {
    try {
      setProcessing(prev => ({ ...prev, bulk: true }));
      
      const updates = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        movementType: 'restock',
        reason: item.reason || 'Reposición masiva'
      }));
      
      await bulkUpdateInventory(user.id, updates);
    } catch (error) {
      throw error;
    } finally {
      setProcessing(prev => ({ ...prev, bulk: false }));
    }
  }, [user?.id]);

  return {
    processSale,
    bulkRestock,
    processing,
    getAllInventory: () => getAllInventory(user.id),
    getLowStockItems: () => getLowStockItems(user.id)
  };
};
```

### 4. Zustand Store - useInventoryStore.js
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useInventoryStore = create(
  persist(
    (set, get) => ({
      // Estado principal
      inventoryCache: {},
      logsCache: {},
      lastFetch: {},
      
      // Acciones principales
      setInventory: (userId, productId, data) => set((state) => ({
        inventoryCache: {
          ...state.inventoryCache,
          [`${userId}-${productId}`]: data
        },
        lastFetch: {
          ...state.lastFetch,
          [`${userId}-${productId}`]: Date.now()
        }
      })),
      
      updateInventory: (productId, userId, updates) => {
        const key = `${userId}-${productId}`;
        const current = get().inventoryCache[key];
        
        if (current) {
          set((
