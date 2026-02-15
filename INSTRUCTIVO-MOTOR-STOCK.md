# 📦 Instructivo: Motor de Stock Inteligente - Clicando

El **Motor de Stock de Clicando** es un sistema modular de alta disponibilidad diseñado para gestionar inventarios en tiempo real de forma segura, escalable y automatizada.

---

## 🏗️ 1. ¿Qué es y qué hace?
Es el "cerebro logístico" de la tienda. Se encarga de:
- **Sincronización:** Vincula cada producto con su existencia física real.
- **Validación:** Impide que un cliente agregue al carrito productos que no tienen stock disponible.
- **Comunicación Visual:** Informa al cliente mediante etiquetas dinámicas (✅ Disponible, ⚠️ Últimas unidades, ❌ Agotado).
- **Control Administrativo:** Permite al dueño de la tienda sumar o restar unidades con un solo clic.

## ⚙️ 2. Activación y Control (CRM)
- **Estado Actual:** Se activa mediante un "switch" en la base de datos (`enable_stock = true`).
- **Control CRM:** El administrador maestro (Maptiva) puede habilitar o deshabilitar este motor por cada tienda individual desde el **Portal Maestro / Gestión de Clientes**.
- **Autonomía:** Una vez habilitado por Maptiva, el cliente final tiene control total desde su propio panel de administración (`/admin/inventario`).

## 📈 3. Beneficios y Uso Actual
- **Uso:** El administrador simplemente selecciona un producto en su panel y ajusta la cantidad mediante botones de entrada/salida.
- **Beneficios:**
    - **Mejor UX:** El cliente no se frustra pidiendo algo que no hay.
    - **Ahorro de tiempo:** Evita mensajes de WhatsApp preguntando "Consultame si tenés stock". 
    - **Profesionalismo:** Eleva la percepción de la tienda a un E-commerce de nivel corporativo.

## 🚀 4. Escalabilidad y Vínculos Externos
El sistema fue diseñado para crecer:
- **Importación Masiva:** Preparado para integrar cargas vía **Excel/CSV** mediante una futura herramienta de importación.
- **APIs de Terceros:** La estructura RPC (Remote Procedure Call) permite que en el futuro se pueda conectar con softwares contables o de facturación locales.
- **Alertas Automáticas:** Posibilidad de enviar un WhatsApp al dueño del local cuando un producto baje de las 5 unidades.

## 🔒 5. Confiabilidad y Seguridad
- **Cero errores de cálculo:** Los ajustes se realizan mediante **Transacciones SQL** en el servidor, lo que garantiza que nunca se pierda un número, incluso si dos personas compran al mismo tiempo.
- **Seguridad RLS:** Solo el administrador autenticado puede modificar el stock. El público general tiene acceso de "solo lectura" mediante una ventana segura (RPC).

## 💰 6. Estrategia Comercial (El Bonus $)
Este motor no es solo una funcionalidad; es un **Upsell estratégico**:
- **Paquete Premium:** Se puede ofrecer como un módulo adicional al paquete básico de Clicando.
- **Valor Percibido:** Al ser una herramienta de gestión administrativa (no solo visual), justifica una suscripción mensual superior o un pago de activación inicial.
- **Diferenciación:** Pocos catálogos de WhatsApp ofrecen gestión de stock profesional; esto nos posiciona un escalón arriba de la competencia.

---
*Este documento es iterable y evolucionará junto con el desarrollo del proyecto.* 🚀🐾⚖️
