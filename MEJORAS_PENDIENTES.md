# Mejoras Pendientes - Tienda Online SaaS

## 🎨 Mejora del Sistema de Logos

### Problema Actual
El sistema actual de carga de logos no tiene validaciones ni optimizaciones, lo que puede causar:
- Logos muy pesados que ralentizan la carga
- Formatos incompatibles
- Imágenes de baja calidad o desproporcionadas
- Mala experiencia de usuario al no ver preview

### Propuesta de Mejora

#### 1. Validaciones de Archivo
- **Formatos permitidos:** PNG, JPG, JPEG (SVG opcional)
- **Tamaño máximo:** 2MB (recomendado: 500KB)
- **Dimensiones mínimas:** 100x100px
- **Dimensiones recomendadas:** 200x200px a 500x500px

#### 2. Funcionalidades a Implementar

**A. Validación en Frontend**
```javascript
- Validar extensión antes de subir
- Validar peso del archivo
- Validar dimensiones de la imagen
- Mostrar mensajes de error claros
```

**B. Preview del Logo**
```javascript
- Mostrar vista previa antes de guardar
- Permitir cancelar y elegir otro archivo
- Comparar con logo actual (si existe)
```

**C. Optimización Automática**
```javascript
- Redimensionar automáticamente si excede tamaño máximo
- Comprimir para web sin perder calidad
- Convertir a formato óptimo (WebP con fallback)
```

**D. Mejoras de UX**
```javascript
- Instrucciones claras en el formulario
- Ejemplos visuales de logos correctos
- Drag & drop para subir archivos
- Indicador de progreso durante la carga
```

#### 3. Mejoras en Visualización

**Header:**
- Tamaño fijo del logo (ej: max-height: 60px)
- Object-fit: contain para mantener proporción
- Fondo opcional si el logo tiene transparencia

**Responsive:**
- Logo más pequeño en móviles
- Adaptación automática al espacio disponible

#### 4. Instrucciones para Usuarios

**Texto de ayuda en el formulario:**
```
"Sube el logo de tu tienda. Formatos aceptados: PNG o JPG.
Tamaño recomendado: 300x300px. Peso máximo: 2MB.
Para mejores resultados, usa un logo con fondo transparente (PNG)."
```

### Beneficios
- ✅ Mejor rendimiento de la página
- ✅ Logos de calidad consistente
- ✅ Mejor experiencia de usuario
- ✅ Menos errores y consultas de soporte
- ✅ Aspecto más profesional

### Prioridad
**Media** - No es crítico pero mejora significativamente la experiencia

### Estimación de Implementación
- **Tiempo:** 2-3 horas
- **Complejidad:** Media
- **Archivos a modificar:**
  - `src/pages/StoreSettings.jsx` (validaciones y preview)
  - `src/components/Header.jsx` (optimización de visualización)
  - Posible nuevo componente: `LogoUploader.jsx`

---

## 📝 Otras Mejoras Pendientes

### 2. Sistema de Notificaciones
- Notificaciones de nuevos pedidos por email
- Confirmación de pedido al cliente

### 3. Panel de Estadísticas
- Productos más vendidos
- Ingresos por período
- Gráficos de ventas

### 4. Gestión de Pedidos
- Ver historial de pedidos
- Estados de pedidos (pendiente, enviado, entregado)
- Exportar pedidos a Excel

### 5. Temas Personalizables
- Colores de la tienda configurables
- Fuentes personalizadas
- Layouts alternativos

---

**Fecha de creación:** 21 de Noviembre, 2025  
**Estado:** Pendiente de implementación
