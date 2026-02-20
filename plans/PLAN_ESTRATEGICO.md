# Plan Estratégico: Escalabilidad y Crecimiento Clicando 2026

Este documento unifica la visión de crecimiento técnico y de producto para Clicando, abordando SEO, conversión, métricas y contabilidad.

---

## 1. Crecimiento y SEO (Google)
**Objetivo**: Capitalizar el aumento de relevancia en Google y mejorar la tasa de clics (CTR).

### Acciones Inmediatas
- [x] **Optimización Metadatos Login**: Cambiar "Bienvenido de nuevo" por términos con intención comercial ("Acceso Negocios", "Panel Tiendas").
- [ ] **Sitemap Dinámico**: Asegurar que todas las tiendas públicas estén indexadas correctamente.
- [ ] **Rich Snippets**: Implementar datos estructurados (`Product`, `LocalBusiness`) en las páginas de las tiendas para mostrar precios y stock directamente en resultados de Google.

---

## 2. Conversión y Ventas (Descuentos)
**Objetivo**: Incentivar compras y flexibilidad de pago para las tiendas.

### Fase 1: Descuentos por Método de Pago (En Progreso)
*Referencia: `plans/PLAN_DESCUENTOS_PAGO.md`*
- Permitir a las tiendas configurar % OFF para Efectivo/Transferencia.
- Mostrar el ahorro explícitamente en el carrito ("Ahorras $X pagando en efectivo").
- "Hook" visual: Banner informativo en la cabecera de la tienda.

### Fase 2: Cupones y Promociones (Futuro)
- Códigos de descuento fijos o porcentuales.
- Promociones automáticas (2x1, envío gratis por monto mínimo).

---

## 3. Inteligencia de Negocio (Métricas)
**Objetivo**: Dar a las tiendas visibilidad sobre su rendimiento.
*Referencia: `plans/PLAN_METRICAS.md`*

### Métricas Core (MVP)
1.  **Visitas Únicas**: ¿Cuánta gente entra a mi tienda?
2.  **Clics en WhatsApp**: Intención de compra real.
3.  **Productos Más Vistos**: Interés de la audiencia.

### Implementación Técnica
- **Eventos**: Tabla `shop_stats` en Supabase.
- **Privacidad**: Registro anónimo (sin cookies invasivas).
- **Visualización**: Dashboard simple en el admin con gráficos de líneas/barras.

---

## 4. Contabilidad y Registro (Scalability)
**Objetivo**: Profesionalizar la gestión de las tiendas, permitiendo auditoría y control financiero.

### Visión: "Clicando Ledgers"
Para que las tiendas crezcan, necesitan saber no solo qué pidieron, sino qué se *concretó*.

#### Plan de Desarrollo
1.  **Registro de Pedidos (Orders Table)**:
    - Actualmente los pedidos "vuelan" a WhatsApp.
    - **Cambio**: Guardar una copia del pedido en base de datos (`orders` table) con estado "Pendiente".
2.  **Conciliación**:
    - El vendedor puede entrar a su panel y marcar el pedido como "Concretado", "Cancelado" o "Pagado".
3.  **Movimientos Contables**:
    - Registro de descuentos aplicados.
    - reporte de ventas mensuales.

### Estructura de Datos Propuesta (Preliminar)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  customer_info JSONB, -- Datos del cliente
  items JSONB, -- Snapshot de productos y precios al momento de compra
  total DECIMAL,
  payment_method TEXT, -- efectivo, transferencia
  discount_applied DECIMAL,
  status TEXT DEFAULT 'pending', -- pending, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Roadmap Tentativo

| Q1 2026 (Actual) | Q2 2026 | Q3 2026 |
| :--- | :--- | :--- |
| **UX Login Fix** | **Métricas Básicas** | **Registro de Pedidos (Orders)** |
| **Descuentos Pago** | Dashboards Admin | Gestión de Estados de Pedido |
| | Rich Snippets SEO | Reportes Contables Exportables |
