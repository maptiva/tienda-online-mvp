# Contexto para Consulta de Debugging

Estamos desarrollando una funcionalidad de "Directorio de Tiendas" en una aplicación React + Supabase.

## El Problema
Tenemos dos componentes que realizan prácticamente la misma consulta a la tabla `stores` de Supabase:
1.  `StoreDirectory.jsx` (Modal): **Funciona correctamente.**
2.  `LandingPage.jsx` (Sección Home): **Falla con error 400 (Bad Request).**

El usuario confirma que las columnas `is_demo` y `coming_soon` existen en la base de datos.
Sin embargo, `LandingPage` no logra traer datos, ni siquiera simplificando la query (aunque hubo problemas aplicando la simplificación en el editor).

## Código que Funciona (`StoreDirectory.jsx`)
```javascript
const { data, error } = await supabase
    .from('stores')
    .select('id, store_name, store_slug, logo_url, is_demo, coming_soon')
    .or('is_active.eq.true,coming_soon.eq.true')
    .order('created_at', { ascending: false });
```

## Código que Falla (`LandingPage.jsx`)
```javascript
const { data } = await supabase
    .from('stores')
    .select('id, store_name, store_slug, logo_url, is_demo, coming_soon')
    .or('is_active.eq.true,coming_soon.eq.true') // Sospecha principal: Sintaxis del OR o columna inexistente
    .order('created_at', { ascending: false })
    .limit(4);
```

## Hipótesis y Dudas
1.  ¿Es posible que la columna `is_active` falte en la base de datos y `StoreDirectory.jsx` esté funcionando por alguna razón de caché o versión anterior?
2.  ¿Hay alguna diferencia sutil en cómo Supabase maneja `.or()` cuando se combina con `.limit()`?
3.  ¿El error 400 podría deberse a un problema de importación o inicialización del cliente `supabase` en `LandingPage.jsx` que difiera de `StoreDirectory.jsx`?

## Objetivo
Identificar por qué `LandingPage.jsx` recibe un 400 Bad Request con una query idéntica a la que funciona en otro componente.
