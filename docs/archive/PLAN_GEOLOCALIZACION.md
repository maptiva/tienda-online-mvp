# 📍 Plan: Geolocalización de Tiendas

## Objetivo
Permitir que cada tienda configure si desea mostrar su ubicación física y, en caso afirmativo, mostrar un mapa interactivo (Leaflet o Google Maps Embed) de manera responsiva.

## 1. Cambios en Base de Datos (`sql/17_add_geolocation.sql`)
Necesitamos almacenar las coordenadas y la preferencia de visibilidad.
*   `latitude` (DECIMAL/FLOAT): Latitud.
*   `longitude` (DECIMAL/FLOAT): Longitud.
*   `show_map` (BOOLEAN): Toggle para activar/desactivar el mapa (Default: false).

## 2. Configuración en Admin (`StoreSettings.jsx`)
*   Agregar sección "Ubicación" en el formulario.
*   **Opción A (Simple):** Inputs manuales de Latitud/Longitud (link a "Cómo obtener mis coordenadas").
*   **Opción B (Intermedia):** Input de dirección + Botón "Buscar" (Geocoding simple con OpenStreetMap/Nominatim).
*   **Toggle:** "Mostrar mapa en mi tienda".

## 3. Visualización en Tienda (`Footer.jsx` o componente nuevo `StoreMap`)
El usuario sugiere el Footer, es un buen lugar estándar.

**Desktop:**
*   Columna adicional en el Footer o sección dedicada sobre el footer.
*   Mostrar mapa cuadrado/rectangular interactivo.

**Móvil:**
*   Aquí "menos invasivo" podría ser:
    *   Un botón/link "📍 Ver Ubicación" que abra el mapa en un modal o lleve a Google Maps App.
    *   O un mapa muy "bajito" (tipo tira) que se expanda al tocar.

## Estrategia Técnica
*   Usaremos **Leaflet** (`react-leaflet`) porque es gratis, ligero y open source (no requiere API Key de Google que cuesta dinero).
*   Estilo visual: Mapas limpios (OpenStreetMap carto light) para no chocar con el diseño pastel.

## Pasos
1.  Crear migración SQL.
2.  Actualizar formulario de configuración.
3.  Implementar componente `StoreMap`.
4.  Integrar en Footer.
