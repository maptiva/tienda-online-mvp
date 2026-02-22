# Plan de Migración a TanStack Query

## Resumen

Migrar el sistema de cache manual basado en `Map` a TanStack Query para mejorar la gestión de datos del servidor, eliminar bugs de cache y preparar la aplicación para escalar.

---

## Problema Actual

### Caches Manuales Identificados

| Archivo | Tipo | TTL | Problema |
|---------|------|-----|----------|
| `useStock.js` | `Map` en memoria | 30s | No invalida al cambiar tienda |
| `useStoreConfig.js` | `Map` en memoria | 30s/5min | No revalida en foco |
| `useProducts.ts` | Zustand store | Sin TTL | No hay revalidación |

### Síntomas Reportados

- Datos de stock obsoletos al cambiar de tienda
- "Agotado" mostrado incorrectamente hasta limpiar cache del navegador
- Inconsistencia entre pestañas/dispositivos

---

## Solución: TanStack Query

### ¿Por qué TanStack Query?

1. **Estándar de la industria** - Usado por Netflix, Airbnb, etc.
2. **Invalidación automática** - Basada en tiempo y eventos
3. **Revalidación en foco** - Actualiza datos al volver a la pestaña
4. **Deduplicación** - Evita requests duplicados
5. **DevTools** - Debug visual del estado de cache
6. **TypeScript first** - Tipado excelente

---

## Fases de Implementación

### Fase 1: Instalación y Configuración

#### 1.1 Instalar dependencias

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

#### 1.2 Crear QueryClient

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,      // 30 segundos por defecto
      gcTime: 5 * 60 * 1000,     // 5 minutos en cache
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

#### 1.3 Configurar en App.jsx

```jsx
// src/App.jsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App existente */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

### Fase 2: Migrar useStock

#### 2.1 Hook actual (con cache manual)

```javascript
// src/modules/inventory/hooks/useStock.js (ACTUAL)
const stockCache = new Map();

export const useStock = (productId, storeSlug = null) => {
  // Cache manual con TTL de 30s
  // Problemas: no invalida, no revalida en foco
};
```

#### 2.2 Hook migrado (con TanStack Query)

```typescript
// src/modules/inventory/hooks/useStock.ts (NUEVO)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export const useStock = (productId: string | null, storeSlug?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query para obtener inventario
  const {
    data: inventory,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['inventory', productId, storeSlug],
    queryFn: () => inventoryService.fetchInventory(productId!, user?.id, storeSlug),
    enabled: !!productId,
    staleTime: 10 * 1000,  // 10 segundos - datos frescos
    gcTime: 5 * 60 * 1000, // 5 minutos - mantener en cache
  });

  // Mutation para ajustar stock
  const adjustStockMutation = useMutation({
    mutationFn: ({ quantity, reason }: { quantity: number; reason: string }) =>
      inventoryService.adjustStock(productId!, user!.id, quantity, reason),
    onSuccess: (result) => {
      // Invalidar y refetch para obtener datos actualizados
      queryClient.invalidateQueries({ queryKey: ['inventory', productId] });
    },
  });

  return {
    inventory,
    isLoading,
    error,
    adjustStock: adjustStockMutation.mutateAsync,
    refetch,
  };
};
```

---

### Fase 3: Migrar useStoreConfig

```typescript
// src/modules/inventory/hooks/useStoreConfig.ts (NUEVO)
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export const useStoreConfig = () => {
  const { user } = useAuth();
  const { storeName } = useParams();

  const cacheKey = storeName || user?.id;

  const { data: stockEnabled = false, isLoading, error, refetch } = useQuery({
    queryKey: ['storeConfig', cacheKey],
    queryFn: async () => {
      if (storeName) {
        return inventoryService.checkStoreStockEnabledBySlug(storeName);
      }
      return inventoryService.checkStoreStockEnabled(user!.id);
    },
    enabled: !!(storeName || user?.id),
    staleTime: storeName ? 30 * 1000 : 5 * 60 * 1000, // 30s público, 5min admin
    gcTime: 30 * 60 * 1000, // 30 minutos
  });

  return {
    stockEnabled,
    loading: isLoading,
    error,
    refetch,
  };
};
```

---

### Fase 4: Migrar useProducts

```typescript
// src/hooks/useProducts.ts (ACTUALIZADO)
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export const useProducts = (userId?: string) => {
  return useQuery({
    queryKey: ['products', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
```

---

### Fase 5: Invalidación Inteligente

#### 5.1 Invalidar al cambiar de tienda

```typescript
// src/components/PublicLayout.jsx
import { useQueryClient } from '@tanstack/react-query';

const PublicLayout = () => {
  const queryClient = useQueryClient();
  const { storeName } = useParams();

  // Invalidar cache cuando cambia la tienda
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['storeConfig'] });
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [storeName, queryClient]);

  // ...
};
```

#### 5.2 Invalidar después de operaciones

```typescript
// Después de crear/actualizar/eliminar producto
const createProductMutation = useMutation({
  mutationFn: productService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  },
});
```

---

### Fase 6: Eliminar Caches Manuales

1. Eliminar `stockCache` de `useStock.js`
2. Eliminar `storeConfigCache` de `useStoreConfig.js`
3. Eliminar caches de Zustand si aplica
4. Limpiar imports no utilizados

---

## Configuración de Tiempos

| Tipo de Dato | staleTime | gcTime | Razón |
|--------------|-----------|--------|-------|
| Inventario | 10s | 5min | Cambia frecuentemente |
| Config tienda | 30s/5min | 30min | Cambia raramente |
| Productos | 1min | 10min | Balanceado |
| Categorías | 5min | 30min | Muy estable |

---

## Beneficios Esperados

1. **Sin más "Agotado" fantasma** - Revalidación automática
2. **Mejor UX** - Datos frescos sin refresh manual
3. **Menos código** - Eliminar ~100 líneas de cache manual
4. **Debugging fácil** - DevTools visuales
5. **Escalable** - Fácil agregar nuevas queries

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Breaking changes | Migrar un hook a la vez |
| Bundle size | Tree-shaking automático |
| Curva de aprendizaje | Documentación excelente |

---

## Estrategia de Rollback (Reversibilidad)

### Principio: Migración Incremental con Git Branches

La migración se hace **un hook a la vez**, cada uno en su propio commit. Si algo falla, se puede revertir parcialmente.

### Procedimiento de Rollback

#### Rollback Parcial (un hook específico)

```bash
# Si useStock con TanStack falla, revertir solo ese commit
git revert <commit-hash-de-useStock>

# O restaurar el archivo original desde el commit anterior
git checkout <commit-anterior> -- src/modules/inventory/hooks/useStock.js
```

#### Rollback Completo (toda la migración)

```bash
# Crear branch de backup antes de empezar
git checkout -b backup/pre-tanstack-query

# Volver a main para trabajar
git checkout main

# Si todo falla, restaurar desde el backup
git checkout backup/pre-tanstack-query -- src/modules/inventory/hooks/
git checkout backup/pre-tanstack-query -- src/hooks/
git checkout backup/pre-tanstack-query -- src/App.jsx
```

### Archivos de Backup

Antes de cada migración, los archivos originales se guardan:

```
backup/
├── useStock.js.backup          # Cache manual original
├── useStoreConfig.js.backup    # Cache manual original
└── useProducts.ts.backup       # Versión sin TanStack
```

### Estrategia de Branches

```
main
  └── feature/tanstack-query-phase1    # Configuración base
        └── feature/tanstack-query-phase2    # useStock migrado
              └── feature/tanstack-query-phase3    # useStoreConfig migrado
                    └── feature/tanstack-query-phase4    # useProducts migrado
```

Cada fase se mergea a main solo después de validar en staging.

### Validación por Fase

| Fase | Validación | Rollback si falla |
|------|------------|-------------------|
| 1. Config | App carga sin errores | `git revert` |
| 2. useStock | Stock se muestra correctamente | Restaurar useStock.js.backup |
| 3. useStoreConfig | Config de tienda correcta | Restaurar useStoreConfig.js.backup |
| 4. useProducts | Lista de productos correcta | Restaurar useProducts.ts.backup |

### Tests de Regresión

Antes de cada merge a main:

1. ✅ Cargar tienda pública con stock habilitado
2. ✅ Verificar que el stock se muestra correctamente
3. ✅ Agregar producto al carrito
4. ✅ Verificar que el stock se descuenta
5. ✅ Cambiar de tienda y verificar que el stock se actualiza
6. ✅ Abrir en otra pestaña y verificar consistencia

### Contacto de Emergencia

Si la migración falla en producción:

1. `git revert HEAD~N` donde N es el número de commits de la migración
2. `git push origin main --force` (solo en emergencia)
3. Vercel redeployá automáticamente

---

## Checklist de Migración

- [ ] Instalar @tanstack/react-query
- [ ] Instalar @tanstack/react-query-devtools
- [ ] Crear QueryClient con configuración
- [ ] Configurar QueryClientProvider en App.jsx
- [ ] Migrar useStock.js → useStock.ts
- [ ] Migrar useStoreConfig.js → useStoreConfig.ts
- [ ] Migrar useProducts.ts
- [ ] Agregar invalidación en PublicLayout
- [ ] Eliminar caches manuales
- [ ] Testing de flujos de stock
- [ ] Deploy a staging
- [ ] Validar en producción

---

## Referencias

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Migration Guide](https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5)
- [Supabase + React Query](https://supabase.com/docs/guides/getting-started/tutorials/with-react-query)
