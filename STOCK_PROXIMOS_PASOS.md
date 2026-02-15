# STOCK_PROXIMOS_PASOS.md

## 📋 Plan de Acción para Mejoras del Motor de Stock

Basado en las observaciones del socio y los requisitos definidos para pequeños comercios (ropa, deco) con 50-200 productos.

### 🎯 **Contexto de Negocio**

#### **Perfil de Cliente:**
- **Segmento:** Pequeños comercios (ropa, decoración)
- **Volumen:** 50-200 productos por tienda
- **Frecuencia:** 
  - Recepción de mercadería (semanal)
  - Ventas por otros canales (diario)
- **Nivel Tecnológico:** Básico a intermedio
- **No requieren:** POS ni sistemas externos por ahora

---

## 🚀 **Fase 1: Corrección de Visibilidad Pública (Prioridad Alta)**

### 📊 **Requisitos de Display Dinámico:**

#### **Lógica de Visualización:**
- **Stock = 0:** Mostrar "Agotado" (Rojo) + **Deshabilitar botón de compra**
- **Stock ≤ 5:** Mostrar "¡Últimas X unidades!" (Naranja/Amarillo)
- **Stock > 5:** Mostrar "Disponible" (Verde)

#### **Modificaciones Técnicas Requeridas:**

**1. Actualizar `useStoreConfig.js`:**
- Cambiar de `user_id` a `store_slug` como parámetro
- Obtener `store_slug` desde `useParams()` en lugar de `useAuth()`
- Mantener cache y error handling existentes

**2. Mejorar `StockBadge.jsx`:**
- Implementar 3 estados dinámicos con colores específicos
- Agregar indicadores visuales (iconos o colores)
- Mantener modo fallback actual

**3. Integrar en `ProductCard.jsx`:**
- Usar `useParams().storeName` para identificar tienda
- Condicionar renderizado a `enable_stock` (sin login)
- Deshabilitar botón de compra cuando stock = 0

### 🎨 **Especificación Visual:**

```javascript
// Estados de stock según cantidad
const getStockDisplay = (quantity, minAlert = 5) => {
  if (quantity === 0) {
    return {
      text: "Agotado",
      color: "red", 
      icon: "❌",
      disabled: true
    }
  }
  if (quantity <= minAlert) {
    return {
      text: `¡Últimas ${quantity} unidades!`,
      color: "orange",
      icon: "⚠️", 
      disabled: false
    }
  }
  return {
    text: "Disponible",
    color: "green",
    icon: "✅",
    disabled: false
  }
}
```

### 🤔 **Consultas de Decisión:**

1. **Deshabilitación de compra:** ¿Botón completamente disabled o mensaje "Producto agotado - recibir notificación"?
2. **Colores:** ¿Usar sistema de temas actual o colores fijos para stock?
3. **Cache strategy:** ¿Tiempo de cache para stock pública (30s, 1min, 5min)?

---

## 🛠️ **Fase 2: Panel de Inventario Básico**

### 📋 **Estructura del Panel (`/admin/inventory`):**

#### **Layout de Tabla Principal:**
```
| Foto | Nombre Producto | Stock Actual | Ajustes Rápidos | Ajuste Manual |
|------|----------------|--------------|------------------|---------------|
| 🖼️  | Camisa Azul   | 15 unidades   |  [+] [-]        | [50] [+50]     |
| 🖼️  | Vela Perfumada| 2 unidades    |  [+] [-]        | [10] [+10]     |
| 🖼️  | Cuadro Moderno | 0 unidades    |  [+] [-]        | [25] [+25]     |
```

### 🧩 **Componentes a Implementar:**

#### **1. InventoryPage.jsx (Layout Principal):**
- Compatible con admin layout existente
- Integrar con AsideBar existente
- Responsive design para mobile/tablet

#### **2. InventoryTable.jsx (Tabla Principal):**
- Fetch all inventory items para tienda actual
- Grid/table layout responsive
- Foto miniatura, nombre, stock actual
- Integración con componentes de ajuste

#### **3. StockQuickAdjust.jsx (Ajustes Rápidos):**
- Botones `[+]` y `[-]` para ajustes de 1 unidad
- Adj inmediato sin confirmación
- Loading states y feedback visual
- Undo functionality para accidentes

#### **4. StockManualAdjust.jsx (Ajuste Manual):**
- Input numérico para cantidad específica
- Botón de confirmación con validación
- Support para números positivos/negativos
- Reason/notes field para audit trail

### 🔍 **Funcionalidades Adicionales:**

#### **Filtering y Search:**
- **Search:** Por nombre de producto
- **Filter:** Por categoría (ropa, deco, etc.)
- **Filter:** Por estado de stock (agotado, bajo, disponible)
- **Sort:** Por nombre, stock, última actualización

#### **Performance Considerations:**
- **Pagination:** Para manejar 50-200 productos eficientemente
- **Lazy loading:** Solo cargar visible items
- **Real-time updates:** Refrescar sin recargar página completa
- **Mobile optimization:** Touch-friendly controls

### 📱 **Mobile Responsive Design:**
- **Compact table view** para pantallas pequeñas
- **Stacked cards** para móviles
- **Touch-friendly buttons** y controls
- **Quick actions toolbar** flotante

---

## 🔄 **Fase 3: Testing y Validación**

### 🧪 **Test Cases Cross-Role:**

#### **Visitante Anónimo:**
- ✅ Puede ver stock sin login
- ❌ No puede editar stock
- ✅ Botón de compra deshabilitado si stock = 0
- ✅ Estados dinámicos visibles correctamente

#### **Dueño Logueado:**
- ✅ Puede ver y editar stock
- ✅ Acceso a panel `/admin/inventory`
- ✅ Ajustes rápidos y manuales funcionando
- ✅ Cambios reflejan en frontend público

#### **Otros Usuarios:**
- ✅ Pueden ver stock
- ❌ No pueden editar stock ni acceder panel

### 📊 **Métricas de Éxito:**

#### **Técnicas:**
- ✅ Stock visible sin login en < 3 segundos
- ✅ Ajustes de stock aplicados en < 2 segundos
- ✅ Panel carga 50 productos en < 5 segundos
- ✅ Mobile responsiveness 100% compatible

#### **Usuario:**
- ✅ Tiempo de ajuste de stock < 10 segundos
- ✅ Zero errores en stock display
- ✅ Intuitivo sin necesidad de entrenamiento
- ✅ Funciona en tablet/phone para gestión móvil

---

## 🎯 **Estimación de Esfuerzo y Timeline**

### 📈 **Fase 1 - Visibilidad Pública:**
- **useStoreConfig refactor**: 2-3 horas
- **StockBadge enhancement**: 2-3 horas
- **ProductCard integration**: 1-2 horas
- **Testing cross-role**: 2-3 horas
- **Total Fase 1**: 7-11 horas

### 📈 **Fase 2 - Panel de Inventario:**
- **Route y layout setup**: 1-2 horas
- **InventoryTable component**: 4-6 horas
- **StockAdjustment components**: 3-4 horas
- **Mobile responsiveness**: 3-4 horas
- **Testing y UX polish**: 2-3 horas
- **Total Fase 2**: 13-19 horas

### 📈 **Total Estimado del Proyecto:**
- **20-30 horas** de desarrollo
- **2-3 días** de trabajo full-time
- **1 semana** con testing y refinamiento

---

## 🚀 **Fases Futuras (Post-MVP)**

### 📊 **Fase 4 - Excel Integration:**
- Export inventory template
- Import bulk updates
- Validation rules
- Error reporting

### 📊 **Fase 5 - Analytics y Reporting:**
- Rotación de inventario
- Tendencias de ventas
- Predicciones de stock bajo
- Reports exportables

### 📊 **Fase 6 - Advanced Features:**
- Stock reservado (checkout process)
- Multi-warehouse support
- Supplier integration
- Automated reorder alerts

---

## 📋 **Decisiones Técnicas Pendientes**

### 🔍 **Para Fase 1:**
1. **Cache strategy:** 30s vs 1min vs 5min para stock público
2. **Color scheme:** Sistema de temas actual vs colores fijos
3. **Button behavior:** Disabled vs custom message para agotado
4. **Real-time updates:** Polling vs WebSocket vs manual refresh

### 🔍 **Para Fase 2:**
1. **Table layout:** Standard table vs cards vs hybrid
2. **Pagination:** Infinite scroll vs page buttons vs load more
3. **Bulk operations:** Implementar ahora vs postpone
4. **Undo functionality:** Required o nice-to-have

### 🔍 **Para Arquitectura:**
1. **State management:** Keep current hooks vs Redux vs Context API
2. **API design:** REST vs GraphQL optimizado para stock
3. **Error handling:** Toasts vs modals vs inline messages
4. **Performance:** Client-side vs server-side filtering

---

## 🎯 **Próximos Pasos Inmediatos**

### ✅ **Day 1 - Fase 1:**
1. **Setup workspace:** Switch to `feature/inventory-module`
2. **Modify useStoreConfig:** Change to store_slug approach
3. **Update StockBadge:** Implement dynamic states
4. **Test public visibility:** Verify stock display without login

### ✅ **Day 2 - Fase 1:**
5. **Integrate ProductCard:** Add conditional stock display
6. **Test purchase button:** Verify disable when stock = 0
7. **Cross-role testing:** Anonymous, owner, other users
8. **Commit and push:** Complete Fase 1 implementation

### ✅ **Day 3-4 - Fase 2:**
9. **Create admin route:** `/admin/inventory`
10. **Build InventoryTable:** Main component development
11. **Implement adjustment components:** Quick and manual
12. **Mobile optimization:** Responsive design implementation

### ✅ **Day 5 - Testing & Polish:**
13. **Full integration testing:** End-to-end scenarios
14. **UX refinements:** Feedback, animations, polish
15. **Performance optimization:** Caching, lazy loading
16. **Documentation:** Update README and user guides

---

## 🔔 **Ready for Implementation**

Con los requisitos claros del socio y este plan detallado, tenemos todo lo necesario para implementar un sistema de stock profesional adaptado a las necesidades específicas de pequeños comercios.

**Estado Actual:** Motor de stock básico funcional  
**Próximo Paso:** Implementar Fase 1 - Corrección de visibilidad pública  
**Timeline Estimado:** 2-3 días para implementación completa

**¿Ready para proceder con Fase 1?**