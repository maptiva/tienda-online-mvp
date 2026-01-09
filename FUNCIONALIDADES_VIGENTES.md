# 🚀 Clicando: Registro de Funcionalidades Vigentes

Este documento es la **memoria viva** de Clicando. Sirve como guía técnica, historial de evolución y base de conocimiento para la redacción de contenidos (instructivos, posts, anuncios).

---

## 💎 Identidad Core (Zero-Risk SaaS)
Clicando no es solo un catálogo, es una plataforma de gestión ágil diseñada para que el comerciante tenga el control total sin complicaciones técnicas.

- **Multi-Tenant:** Arquitectura que permite gestionar cientos de tiendas independientes bajo una misma infraestructura robusta.
- **URLs Amigables (Slugs):** Cada tienda tiene su identidad propia (ej: `clicando.com.ar/tu-tienda`).
- **Indexación Automática:** Presencia en el directorio principal de Clicando y sección "Confían en nosotros".

---

## 🛠️ Panel Administrativo (Gestión Pro)

### 💰 Gestión de Precios (Hito Reciente)
- **Actualización Masiva:** Herramienta para ajustar precios de todo el catálogo o categorías específicas por porcentaje (%) o montos fijos ($).
- **Inteligencia Anti-Inflación:** Pensada para actualizaciones rápidas ante cambios en el tipo de cambio o costos.
- **Sistema "Undo" (Deshacer):** Capacidad de revertir el último lote actualizado para corregir errores al instante.
- **Redondeo Inteligente:** Opciones para redondear a 10s, 100s o formato marketing (.99).
- **Consultar Precio (Price on Request):** Opción para ocultar el precio en productos específicos y derivar a consulta directa por WhatsApp (ideal para servicios o artículos volátiles).

### 📦 Gestión de Productos y Stock
- **Catálogo Dinámico:** Alta, baja y modificación de productos con sincronización instantánea.
- **Categorización Flexible:** Organización por rubros para facilitar la navegación del cliente.
- **Galería de Imágenes:** Soporte para múltiples fotos por producto (imagen principal + galería).
- **Backup de Precios:** Sistema que resguarda el precio original automáticamente cuando un producto pasa a estado "Consultar Precio".

### ⚙️ Configuración y Marca
- **Personalización Visual:** Carga de Logo y colores de marca.
- **Horarios y Contacto:** Gestión de horarios comerciales y datos de contacto directo.
- **Geolocalización Máxima:** Mapa interactivo integrado para que los clientes encuentren el local físico por cercanía geográfica.

---

## 👤 Experiencia del Cliente (Frontend Publico)

- **WhatsApp Integrado:** Botón flotante de contacto permanente y derivación de pedidos.
- **Carrito de Pedidos WhatsApp:** Sistema que transforma una selección de productos en un mensaje estructurado de WhatsApp al vendedor.
- **Visualización Premium:** Diseño responsive (móvil/desktop) con previsualizaciones rápidas y carga optimizada de imágenes (miniaturas).
- **Modo "Oculto":** Los productos con "Consultar Precio" invitan a la interacción directa en lugar de mostrar un precio desactualizado.

---

## 🛡️ Infraestructura y Seguridad
- **Políticas RLS (Row Level Security):** Seguridad a nivel de base de datos que garantiza que cada cliente solo vea y edite sus propios datos.
- **Zustand Store:** Gestión de estado global para una UI rápida, fluida y con actualizaciones "optimistas".
- **Modo Demo / Próximamente:** Herramientas para pre-lanzar tiendas o configurar entornos de prueba.

---

## 📜 Histórico de Versiones (Hitos)
- **V1 (Genesis):** Catálogo básico y derivación simple a WhatsApp.
- **V2 (SaaS Explosion):** Migración a base de datos compartida y Slugs personalizados.
- **V3 (Geolocalización):** Implementación de mapas y ubicación de tiendas.
- **V4 (UX Core):** Miniaturas de productos, galería de imágenes y optimización de carga.
- **V5 (Precios 2026):** Lanzamiento de Actualización Masiva, Modo Consultar Precio y Sistema Undo.
- **Seguridad de Datos:** Implementación de sanitización automática para evitar errores de sintaxis numérica en campos vacíos.

---
**Última actualización:** 09/01/2026 - *Fase de Gestión de Precios Masivos Completada.*
