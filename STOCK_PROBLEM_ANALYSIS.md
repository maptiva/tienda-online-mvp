# 🔍 Análisis y Solución del Problema de Stock Público

## 📋 **Problema Identificado**

### **Síntoma Principal**
Los productos en la vista pública de la tienda muestran "Sin stock configurado" a pesar de:
- ✅ Tener datos de inventario en la base de datos
- ✅ El feature flag `enable_stock = true` está activado
- ✅ El motor de stock está 90% implementado y funcional

### **Error Técnico**
```
Error: new row violates row-level security policy for table "inventory"
```

---

## 🔍 **Causas Raíz (Hipótesis Confirmadas)**

### **Hipótesis 1: Problema de Componentes Frontend**
- **Estado**: ❌ Descartado
- **Análisis**: Los componentes `ProductCard`, `useStock`, `inventoryService` están correctamente implementados y llamándose en el orden correcto.

### **Hipótesis 2: Problema de Datos**
- **Estado**: ❌ Descartado  
- **Análisis**: Los datos de inventario existen en la tabla `inventory` con diferentes niveles de stock (0, 2, 4, 10 unidades).

### **Hipótesis 3: Problema de Row Level Security (RLS)**
- **Estado**: ✅ **CONFIRMADO - ESTE ES EL PROBLEMA**
- **Análisis**:

#### **Políticas RLS Actuales de `inventory`**
```sql
-- Todas las políticas requieren autenticación
CREATE POLICY "Users can view own inventory" ON inventory
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory  
FOR INSERT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory
FOR UPDATE USING (auth.uid() = user_id);
```

#### **Problema Específico**
- **Vista pública**: Usuario no autenticado → `auth.uid()` = `NULL`
- **Evaluación de política**: `NULL = user_id` = `false`
- **Resultado**: **Acceso completamente denegado**
- **Diferencia con otras tablas**: `products` y `stores` SÍ tienen políticas públicas, pero `inventory` NO.

---

## 🎯 **Solución Planteada**

### **Arquitectura de Solución**
Implementar una **función RPC pública** que permita acceso controlado a inventario sin requerir autenticación, manteniendo la seguridad y siguiendo los patrones existentes.

### **Componentes de la Solución**

#### **1. Función RPC Pública - `get_public_inventory`**

```sql
CREATE OR REPLACE FUNCTION get_public_inventory(
  p_store_slug TEXT,
  p_product_id BIGINT
)
RETURNS TABLE (
  product_id BIGINT,
  quantity INTEGER,
  reserved_quantity INTEGER,
  min_stock_alert INTEGER,
  allow_backorder BOOLEAN,
  track_stock BOOLEAN,
  is_low_stock BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    i.product_id,
    i.quantity,
    i.reserved_quantity,
    i.min_stock_alert,
    i.allow_backorder,
    i.track_stock,
    (i.quantity <= i.min_stock_alert) as is_low_stock
  FROM inventory i
  JOIN stores s ON i.user_id = s.user_id
  WHERE s.store_slug = p_store_slug 
    AND i.product_id = p_product_id
    AND s.enable_stock = true;
$$;
```

**Características de Seguridad:**
- ✅ `SECURITY DEFINER`: Permite saltar RLS de forma controlada
- ✅ **Filtros implícitos**: Solo tiendas con `enable_stock = true`
- ✅ **Datos públicos únicamente**: Sin información sensible como `user_id`
- ✅ **Acceso de solo lectura**: Sin capacidades de modificación

#### **2. Actualización de Frontend Services**

**Modificación en `inventoryService.js`:**

```javascript
// Nuevo método para vista pública
async fetchPublicInventory(storeSlug, productId) {
  const { data, error } = await supabase.rpc('get_public_inventory', {
    p_store_slug: storeSlug,
    p_product_id: productId
  });
  
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  
  return data && data.length > 0 ? data[0] : null;
},

// Método existente modificado para soporte público
async fetchInventory(productId, userId, storeSlug = null) {
  // Vista pública: usar RPC pública
  if (!userId && storeSlug) {
    return await this.fetchPublicInventory(storeSlug, productId);
  }
  
  // Vista autenticada: lógica existente (sin cambios)
  // ... código actual para usuarios autenticados
}
```

#### **3. Actualización de Hooks React**

**Modificación en `useStock.js`:**

```javascript
const loadInventory = async () => {
  // ... código existente de cache
  
  try {
    const { inventoryService } = await import('../services/inventoryService');
    
    // Llamada actualizada para soporte público
    const data = await inventoryService.fetchInventory(
      productId, 
      user?.id, 
      !user?.id ? storeName : null  // storeSlug para vista pública
    );
    
    setInventory(data);
  } catch (err) {
    console.error('Error loading inventory:', err);
  }
};
```

---

## 🔧 **Ventajas de esta Solución**

### **1. Seguridad**
- ✅ **Sin comprometer RLS existentes**: No modifica políticas actuales
- ✅ **Acceso controlado**: Solo datos públicos necesarios
- ✅ **Validación implícita**: Solo tiendas con stock habilitado
- ✅ **Sin datos sensibles**: No expone `user_id` ni información interna

### **2. Mantenibilidad**
- ✅ **Patrones consistentes**: Sigue estructura de RPC existentes
- ✅ **Cambios mínimos**: Solo 3 archivos modificados
- ✅ **Backward compatible**: No afecta vista admin existente
- ✅ **Extensible**: Fácilmente ampliable para más datos públicos

### **3. Performance**
- ✅ **Query optimizada**: Usa índices existentes
- ✅ **Cache frontend**: 30 segundos por producto
- ✅ **Lazy loading**: Solo carga cuando es necesario
- ✅ **JOINs eficientes**: Aprovecha índices `stores.store_slug` y `inventory.product_id`

---

## 📊 **Impacto Esperado**

### **Antes de la Solución**
- ❌ Vista pública: "Sin stock configurado" para todos
- ❌ Error RLS bloqueando acceso
- ❌ Motor de stock inutilizado en vista pública
- ❌ Mala experiencia de usuario

### **Después de la Solución**
- ✅ Vista pública: Estados dinámicos funcionando
- ✅ Estados: ❌ Agotado / ⚠️ Últimas unidades / ✅ Disponible
- ✅ Botones deshabilitados cuando stock = 0
- ✅ Motor 100% funcional
- ✅ Experiencia de usuario completa

---

## 🎯 **Plan de Implementación**

### **Fase 1: Backend (2 minutos)**
1. Ejecutar `CREATE FUNCTION get_public_inventory` en Supabase
2. Probar función con un producto específico
3. Verificar respuesta correcta

### **Fase 2: Frontend Services (5 minutos)**
1. Modificar `inventoryService.js` con nuevos métodos
2. Probar `fetchPublicInventory` en DevTools
3. Verificar que no hay errores

### **Fase 3: Frontend Hooks (3 minutos)**
1. Modificar `useStock.js` para soporte público
2. Actualizar llamada en `loadInventory`
3. Probar que se ejecute correctamente

### **Fase 4: Testing Integral (5 minutos)**
1. Limpiar cache del navegador
2. Probar vista pública completa
3. Verificar estados dinámicos funcionando
4. Confirmar que vista admin sigue funcionando

### **Tiempo Estimado Total: 15 minutos**

---

## 🔄 **Alternativas Consideradas y Descartadas**

### **Alternativa 1: Modificar Políticas RLS**
```sql
CREATE POLICY "Public can view inventory" ON inventory
FOR SELECT USING (true);
```
- ❌ **Descartado**: Demasiado permisivo, expone todos los datos

### **Alternativa 2: Vista Pública**
```sql
CREATE VIEW public_inventory AS
SELECT * FROM inventory JOIN stores ON ...;
```
- ❌ **Descartado**: Más complejo de mantener y asegurar

### **Alternativa 3: Policy Condicional**
```sql
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM stores...))
```
- ❌ **Descartado**: Complejo de validar y mantener

---

## 📋 **Criterios de Éxito**

### **Técnicos**
- ✅ Sin errores RLS en vista pública
- ✅ Estados dinámicos mostrados correctamente
- ✅ Performance < 500ms por consulta
- ✅ Cache funcionando correctamente

### **Funcionales**
- ✅ "❌ Agotado" para stock = 0
- ✅ "⚠️ Últimas unidades" para stock ≤ min_alert
- ✅ "✅ Disponible" para stock > min_alert
- ✅ Botones deshabilitados cuando stock = 0

### **Experiencia de Usuario**
- ✅ Visualización inmediata sin login
- ✅ Estados consistentes con backend
- ✅ Transiciones suaves entre estados
- ✅ Mobile responsive

---

## 🎯 **Conclusión**

**El problema es de arquitectura de seguridad**: La tabla `inventory` no tiene política pública mientras que `products` y `stores` sí la tienen. La solución con función RPC pública es la más segura, mantenible y consistente con el patrón existente.

**Esta solución permitirá que el motor de stock funcione al 100% en vista pública, completando el 10% faltante y habilitando toda la funcionalidad planificada.**

---

## 📅 **Próximos Pasos**

1. **Implementar solución completa** (15 minutos)
2. **Testing integral** (10 minutos)
3. **Validación empresarial** (demos a stakeholders)
4. **Documentación final** (actualizar docs)
5. **Deploy a producción** (cuando se apruebe)

**El motor de stock estará 100% funcional y listo para producción.**