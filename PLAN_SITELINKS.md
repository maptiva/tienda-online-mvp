# Plan de Implementación: Mejora de Sitelinks (Enlaces de Sitio)

Este plan detalla los cambios para influir en cómo Google muestra Clicando en los resultados de búsqueda, buscando un estilo similar al de Tiendanube con enlaces directos a secciones clave.

## Cambios Propuestos

### Componente: Landing Page

#### [MODIFY] [LandingPage.jsx](file:///c:/Users/ALE/Desktop/TRABAJOS%20EN%20SOLIDO/MAPTIVA/tienda-online-mvp/src/pages/LandingPage.jsx)

1.  **Corrección de SearchAction:** Eliminar o ajustar la acción de búsqueda ya que la ruta `/search` no existe actualmente en el proyecto. Evitaremos errores de validación de Google.
2.  **Agregar SiteNavigationElement:** Definiremos los enlaces prioritarios que queremos que Google considere para los Sitelinks.

```javascript
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "Clicando",
          "url": "https://clicando.com.ar",
        },
        {
          "@type": "SiteNavigationElement",
          "hasPart": [
            {
              "@type": "WebPage",
              "name": "Acceso Clientes",
              "description": "Ingresá a tu panel de administración para gestionar tu tienda.",
              "url": "https://clicando.com.ar/login"
            },
            {
              "@type": "WebPage",
              "name": "Mapa de Tiendas",
              "description": "Explorá los comercios cercanos en nuestro mapa interactivo.",
              "url": "https://clicando.com.ar/mapa"
            }
          ]
        }
      ]
    };
```

## Plan de Verificación

### Verificación Técnica
1.  Inspeccionar el código fuente de la Landing Page en local.
2.  Verificar que el nuevo JSON-LD se renderiza correctamente dentro del tag `<script>`.
3.  Usar la [Herramienta de Prueba de Datos Estructurados](https://search.google.com/test/rich-results) para validar que no haya errores de sintaxis.

> [!NOTE]
> Los Sitelinks son generados algorítmicamente por Google. Proporcionar estos datos estructurados es la mejor forma de "sugerirle" a Google qué mostrar, pero el tiempo de aparición depende del motor de búsqueda.
