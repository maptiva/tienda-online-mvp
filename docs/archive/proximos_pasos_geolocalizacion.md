# Plan de Implementación: Geolocalización de Tiendas

## Contexto
El objetivo es implementar la geocodificación automática para que los usuarios puedan especificar la ubicación de su tienda mediante una dirección, y esta se convierta en coordenadas geográficas (`latitude`, `longitude`). Además, se busca permitir el ajuste fino de la ubicación mediante un marcador arrastrable y la visualización de un mapa en la página pública de la tienda.

Se identificó un **problema bloqueante** previo a la geolocalización, relacionado con la funcionalidad de guardado en `StoreSettings.jsx`, que generaba errores de duplicidad en `store_name` y `store_slug`.

## Análisis del Problema Bloqueante (Guardado en `StoreSettings.jsx`)

*   **Error Reportado:** `duplicate key value violates unique constraint "stores_store_name_key"` y `duplicate key value violates unique constraint "stores_store_slug_key"`.
*   **Causa Raíz:** La tabla `stores` tiene una restricción `UNIQUE` en la columna `store_name`. Cuando un usuario intenta guardar un nombre de tienda que ya existe en la base de datos (por otro usuario), la base de datos rechaza la operación.
*   **Comportamiento del `store_slug`:** El `store_slug` se genera automáticamente a partir del `store_name` mediante un trigger (`generate_store_slug`) solo si `store_slug` es nulo o vacío. Esto asegura que la URL de la tienda sea estable después de su creación inicial, incluso si el `store_name` se modifica posteriormente.

## Solución Propuesta para el Bloqueante (Paso 1)

**Objetivo:** Mejorar la gestión de errores en `handleSubmit` de `StoreSettings.jsx` para proporcionar retroalimentación clara al usuario en caso de violación de unicidad del `store_name`.

*   **Archivo:** `src/pages/StoreSettings.jsx`
*   **Modificación:**
    *   Ajustar la lógica de `UPDATE` para usar el `id` de la tienda (`existingStore.id`) en lugar de `user_id`.
    *   Implementar un manejo específico para el código de error de PostgreSQL `23505` (violación de unicidad). Si se detecta este error, se mostrará un mensaje descriptivo al usuario: "El nombre de la tienda ya está en uso. Por favor, elige otro."
    *   Para cualquier otro tipo de error, se mantendrá un mensaje genérico.

**Justificación:** Este cambio es seguro y focalizado. No altera la lógica de negocio ni las restricciones de la base de datos, sino que mejora la experiencia del usuario al informar claramente la causa del error de guardado.

## Plan de Implementación General (Después de resolver el Bloqueante)

Una vez resuelto el problema de guardado, procederemos con los siguientes pasos, según lo descrito en el diagnóstico original y las aclaraciones:

2.  **Implementar la funcionalidad de geocodificación en `StoreSettings.jsx`**:
    *   Añadir estados para `geocoding` y `showMapPreview`.
    *   Crear la función `handleGeocode` que utilizará la API gratuita de Nominatim para convertir una dirección en coordenadas (`latitude`, `longitude`).
    *   Integrar la UI para la entrada de la dirección, un botón de "Buscar en Mapa", y mensajes de ayuda.
    *   Mostrar una vista previa del `StoreMap` después de la geocodificación inicial, permitiendo arrastrar el marcador para un ajuste fino de las coordenadas.
    *   Añadir un toggle para que el usuario decida si mostrar o no el mapa en su tienda pública.

3.  **Integrar el componente de mapa en la vista pública de la tienda (`ProductList.jsx`)**:
    *   Asegurar que el `StoreMap` se muestre de manera responsiva (mapa interactivo en desktop, botón a Google Maps en móvil) solo si la tienda ha habilitado esta opción (`show_map` en `true`) y tiene coordenadas.

4.  **Verificar el flujo completo y realizar pruebas**:
    *   Realizar pruebas exhaustivas de la geocodificación con diversas direcciones.
    *   Verificar el arrastre del marcador y la actualización de coordenadas.
    *   Confirmar el funcionamiento del toggle `show_map`.
    *   Asegurar el comportamiento responsivo del mapa.

## Próximos Pasos Específicos:

1.  **Resolver el error de guardado en `StoreSettings.jsx`** (detallado arriba).
2.  **Implementar la geocodificación en el formulario.**
3.  **Testing completo.**
4.  **Deploy a producción.**

Estoy evaluando una tercera alternativa basada en GIS (teniendo en cuenta las dos anteriores), utilizando un archivo GeoJSON como fuente de datos geoespaciales.

Objetivo

Mantener un archivo GeoJSON centralizado que contenga únicamente las tiendas activas.

Que este GeoJSON se actualice automáticamente cada vez que un usuario:

Carga su geolocalización

Modifica su dirección

Activa o desactiva su tienda

Requisitos funcionales

Cada feature del GeoJSON debería incluir como propiedades mínimas:

id_usuario o id_tienda

nombre

rubro (opcional / futuro)

direccion

ciudad

estado (activa / inactiva)

Geometría tipo Point (latitud / longitud).

Visualización

El GeoJSON se consumirá desde un mapa interactivo (ej. Leaflet).

Cada punto debe mostrar un popup con:

Nombre de la tienda

Rubro

Dirección

El mapa debe permitir:

Filtrar por ciudad (prioritario)

Filtrar por rubro (a futuro)

Consulta técnica

Necesito orientación sobre:

Arquitectura recomendada para mantener actualizado un GeoJSON dinámico:

¿Conviene generarlo on-the-fly desde la base de datos o persistirlo como archivo?

¿Cómo manejar concurrencia y múltiples usuarios?

Buenas prácticas para evitar duplicación de puntos y conflictos de escritura.

Flujo sugerido:

Usuario carga/modifica ubicación → backend → actualización GeoJSON → frontend mapa.

Alternativas más robustas si el GeoJSON no es la mejor opción (ej. endpoints GeoJSON, PostGIS, Firestore + conversión, etc.).

Busco una solución escalable, segura y mantenible, pensada para una SaaS multiusuario.