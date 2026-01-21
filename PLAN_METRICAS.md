# Plan de Implementación: Métricas para Clientes (Maptiva Insights)

Este plan detalla la arquitectura para recolectar y visualizar métricas clave (visitas, clics en WhatsApp y pedidos) para cada tienda, permitiendo a los dueños de negocios medir su éxito en la plataforma.

## User Review Required

> [!IMPORTANT]
> **Privacidad y Rendimiento**: La recolección de métricas se hará de forma anónima y optimizada para no impactar la velocidad de carga de los catálogos.
> **Privacidad de Datos**: El dashboard de métricas será accesible solo por el dueño de la tienda y el administrador maestro.

## Proposed Changes

---

### [Base de Datos] Supabase

Se crearán nuevas tablas para almacenar los eventos de métricas.

#### [NEW] `shop_stats` (Tabla)
Almacenará registros agregados o eventos individuales.

```sql
-- Tabla de estadísticas de tiendas
CREATE TABLE IF NOT EXISTS public.shop_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id BIGINT REFERENCES public.stores(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'whatsapp_click', 'order')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_shop_stats_store_id ON public.shop_stats(store_id);
CREATE INDEX IF NOT EXISTS idx_shop_stats_event_type ON public.shop_stats(event_type);
CREATE INDEX IF NOT EXISTS idx_shop_stats_created_at ON public.shop_stats(created_at);

-- RLS (Seguridad)
ALTER TABLE public.shop_stats ENABLE ROW LEVEL SECURITY;

-- Permiso para insertar (Público/Anónimo)
CREATE POLICY "Public can insert stats" ON public.shop_stats
    FOR INSERT WITH CHECK (true);

-- Permisología para lectura (Solo Clientes dueños y Admin)
CREATE POLICY "Clients can view own store stats" ON public.shop_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores s 
            WHERE s.id = shop_stats.store_id 
            AND s.client_id IN (
                SELECT id FROM public.clients c 
                WHERE c.email = auth.jwt()->>'email'
            )
        )
    );
```

---

### [Frontend - Seguimiento] Captura de Eventos

Implementación de la lógica de rastreo en los componentes clave.

#### [NEW] Hook `useShopStats`
Se creará un hook centralizado para manejar el registro de eventos en Supabase.

#### [MODIFY] `ProductList.jsx` / `CatalogPage.jsx`
- Registrar una 'visit' al montar el componente (usando un `useEffect` con debounce o único por sesión).

#### [MODIFY] Botones de WhatsApp
- Disparar evento 'whatsapp_click' antes de redirigir al link de WhatsApp.

#### [MODIFY] Flujo de Checkout
- Registrar evento 'order' cuando se confirma un pedido.

---

### [Frontend - Visualización] CRM / Admin

#### [NEW] `ShopMetrics.jsx` (Componente/Página)
- Gráficos visuales usando una librería ligera (ej. `recharts` o CSS puro para barras).
- KPIs rápidos: "Total Visitas este mes", "Conversión a WhatsApp %", "Pedidos totales".

---

## Plan de Verificación

### Pruebas Automatizadas
- Verificar inserción en `shop_stats` al simular clics y visitas en local.
- Validar políticas RLS para que un cliente no vea métricas de otro.

### Verificación Manual
1. Entrar a una tienda demo y hacer clic en WhatsApp.
2. Verificar en Supabase que el evento se registró.
3. Entrar al panel de admin y ver el gráfico actualizado.
