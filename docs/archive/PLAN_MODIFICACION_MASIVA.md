# 📋 Plan: Modificación de Precios en Lote (Bulk Update)

Este documento detalla la planificación para la funcionalidad de actualización masiva de precios, una herramienta crítica para que los comerciantes puedan reaccionar rápidamente a fluctuaciones económicas (inflación, cambio de moneda).

## 🎯 Objetivo
Permitir al administrador modificar el precio de múltiples productos simultáneamente basándose en filtros específicos y reglas de cálculo.

---

## 🛠️ Flujo de Usuario (UI/UX)

La interfaz se dividirá en tres etapas claras para minimizar errores:

### 1. Selección y Filtrado
El usuario debe identificar qué productos quiere modificar.
- **Filtros:** Por Categoría, por Marca (atributo futuro) y búsqueda por texto.
- **Visualización:** Lista de productos con checkbox individual y opción "Seleccionar todos".
- **Contador:** Indicador visual persistente: *"Seleccionados: 45 productos"*.

### 2. Definición del Ajuste
Una vez seleccionados los productos, se define la regla de cambio.
- **Operación:**
    - `+ %` (Aumento porcentual)
    - `- %` (Descuento porcentual)
    - `+ $` (Aumento de monto fijo)
    - `- $` (Descuento de monto fijo)
- **Valor:** Campo numérico para el ajuste.
- **✨ Redondeo Inteligente:** Opción para redondear el resultado final (ej: redondear a la decena o centena más cercana para evitar precios como $1237,42).

### 3. Previsualización y Confirmación
**Paso crítico de seguridad.**
- Se muestra una tabla comparativa con una muestra del cambio:
    - *Producto X: $1.000 ➔ $1.150 (+15%)*
- Requerir confirmación explícita mediante un botón de acción destacada.

---

## ⚙️ Consideraciones Técnicas

### Seguridad y Estabilidad
- **Transacción Atómica:** Los cambios deben aplicarse todos o ninguno (para evitar estados inconsistentes).
- **Botón Deshacer (Undo):** Guardar un registro del precio anterior a la modificación masiva para permitir revertir en caso de error inmediato.

### Futuro: Automatización por Divisa
- Permitir configurar productos con "Precio Base en USD".
- El administrador solo actualiza el "Tipo de Cambio" en la configuración general.
- El sistema recalcula automáticamente los precios en ARS para la tienda sin intervención manual producto por producto.

---

## 📍 Ubicación en la App
- **Ruta:** `/admin/productos/actualizacion-masiva`
- **Acceso:** Botón destacado en la vista de "Mis Productos" llamado **"Ajustar Precios"**.

---
*Última actualización: 17 de Diciembre 2024*
