# 🗺️ Roadmap: Sistema de Gestión de Clientes (CRM & SaaS)

Este documento detalla el plan estratégico y técnico para evolucionar la plataforma hacia un SaaS gestionable.

## 1. Visión General: Los 3 Pilares

1.  **CRM (Pre-venta):** Gestión de prospectos (Leads) que aún no pagan.
2.  **ERP/Suscripciones (Post-venta):** Gestión de clientes activos, planes y contabilidad.
3.  **Automatización:** Procesos automáticos (avisos de pago, cortes) para reducir carga operativa.

---

## 2. Arquitectura de Datos (Base de Datos)

Se han diseñado 4 nuevas tablas para soportar este sistema.
*El script de creación se encuentra en:* `sql/15_create_crm_tables.sql`

### Estructura:
*   **`leads`**: Datos de interesados (Nombre, Contacto, Estado).
*   **`clients`**: Datos de facturación de clientes reales.
*   **`stores` (Modificación)**: Se agrega `client_id` para vincular tiendas a clientes (1 Cliente -> Internet Muchas Tiendas).
*   **`subscriptions`**: Contratos de servicio (Monto, Frecuencia, Estado).
*   **`payments`**: Historial de cobros realizados.

---

## 3. Pasos de Implementación

### ✅ Fase 1: Cimientos de Datos (ESTADO ACTUAL)
1.  [x] Diseño del Schema.
2.  [x] Creación del script SQL (`sql/15_create_crm_tables.sql`).
3.  [ ] **ACCIÓN REQUERIDA:** Ejecutar el script SQL en el Editor SQL de Supabase.

### 🔜 Fase 2: Gestión Manual (El "Excel" en la Nube)
*Objetivo: Dejar de usar planillas y empezar a cargar datos en el sistema.*
1.  Entrar al Dashboard de Supabase (Table Editor).
2.  Cargar manualmente los clientes actuales en la tabla `clients`.
3.  Vincular las tiendas existentes a esos clientes (editar columna `client_id` en tabla `stores`).
4.  Crear las suscripciones activas en `subscriptions`.
5.  Registrar el historial de pagos pasados en `payments`.

### 🚀 Fase 3: Dashboard de Administración (`/admin`)
*Objetivo: Interfaz visual propia para no depender de Supabase.*
1.  Crear ruta protegida `/admin` (solo visible para usuario super-admin).
2.  Implementar vistas:
    *   **Dashboard Comercial:** KPI's simples (Ingresos del mes, Clientes Activos).
    *   **Gestor de Clientes:** Tabla para ver/editar clientes y sus estados.
    *   **Carga de Pagos:** Formulario simple para registrar un pago nuevo.

### 🤖 Fase 4: Automatizaciones (Futuro)
*Objetivo: Que el sistema trabaje solo.*
1.  Integración con servicio de Email (Resend/SendGrid).
2.  **Cron Job (Día 1):** Generar cuotas del mes y enviar mail de aviso.
3.  **Cron Job (Día 15):** Detectar impagos y enviar recordatorio.
4.  **Botón de Pánico:** "Pausar Servicio" (desactiva la tienda si no hay pago).

---

## 4. Guía Rápida para tus Clientes Actuales (Caso Práctico)

**Cliente A (1 Tienda, Pagó inicio + mantenimiento):**
1.  Crear en `clients`: "Cliente A".
2.  En `subscriptions`: Crear plan "MANTENIMIENTO_MENSUAL" ($15).
3.  En `payments`: Registrar 1 pago de $45 (30 inicio + 15 mes 1).

**Cliente B (2 Tiendas, Pagó inicio, Debe mantenimiento):**
1.  Crear en `clients`: "Cliente B".
2.  En `subscriptions`: Crear 2 suscripciones (una por tienda).
3.  En `payments`: Registrar 1 pago de $45 (Inicio x2).
4.  **Estado:** Las suscripciones pueden figurar como `ACTIVE` pero con `last_payment_date` vacío o antiguo, indicando que falta el pago del mes corriente.

---
*Documento generado el 9 de Diciembre de 2025.*
