# Guía de Límites Gratuitos (Capa Hobby) 📊

Esta guía resume los límites de las plataformas que sostienen a **Clicando** y cómo monitorearlos para saber cuándo es momento de escalar a un plan pago.

---

## 🟢 Supabase (Base de Datos, Auth y Storage)

Supabase es muy generoso, pero tiene límites de almacenamiento que debemos cuidar.

| Recurso | Límite Gratuito | ¿Cómo impacta en Clicando? |
| :--- | :--- | :--- |
| **Base de Datos** | 500 MB | Principalmente texto (productos, tiendas). Rinde muchísimo. |
| **Storage (Fotos)** | 1 GB | Aquí se guardan logos y fotos. **Nota:** Usamos compresión WebP para maximizar este espacio. |
| **Usuarios (Auth)** | 50,000 MAU | Cantidad de clientes únicos que inician sesión por mes. |
| **Ancho de Banda** | 5 GB | Transferencia de datos de la base de datos y archivos. |
| **Inactividad** | 7 días | Si no hay tráfico en 7 días, el proyecto se "pausa" (se reactiva manualmente). |

### 🛠️ ¿Dónde monitorear Supabase?
1. Entrá a [app.supabase.com](https://app.supabase.com).
2. Seleccioná tu proyecto de Clicando.
3. En la barra lateral, andá a **Organization Settings** o **Project Settings > Usage**.

---

## ⚪ Vercel (Hosting del Front-end)

Vercel se encarga de servir la página web a los usuarios.

| Recurso | Límite Gratuito | ¿Cómo impacta en Clicando? |
| :--- | :--- | :--- |
| **Bandwidth** | 100 GB / mes | Consumo de datos al navegar la web. Muy difícil de agotar en catálogos. |
| **Serverless Functions** | 1 Millón / mes | Se usa en procesos internos (mail, revalidaciones). |
| **Build Minutes** | 6,000 min / mes | Tiempo que tarda en "armarse" la web cada vez que hacemos un `git push`. |
| **Concurrent Builds** | 1 | Solo podemos subir una actualización a la vez. |

### 🛠️ ¿Dónde monitorear Vercel?
1. Entrá a [vercel.com/dashboard](https://vercel.com/dashboard).
2. Seleccioná el proyecto de Clicando.
3. Hacé clic en la pestaña superior que dice **Usage**.

---

## 📈 ¿Cuándo pensar en pagar?

Deberíamos considerar el plan **Pro** ($25/mes aprox en ambas plataformas) cuando:
1. Superemos los **500 MB** de base de datos debido a miles de tiendas activas.
2. Necesitemos que el proyecto **nunca se pause** por inactividad (aunque con clientes activos esto no sucede).
3. Necesitemos **Backups diarios** automáticos con recuperación en punto en el tiempo (Supabase Free solo guarda backups básicos).

> [!TIP]
> Por ahora, Clicando está optimizado para funcionar dentro de estos límites sin problemas. ¡Seguimos creciendo! 🚀✨
