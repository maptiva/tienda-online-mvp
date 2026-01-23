# Plan de Continuación: Directorio de Tiendas

Este documento resume el estado actual del desarrollo y los pasos necesarios para completar la integración del Directorio de Tiendas.

## Estado Actual (Snapshot)

1.  **Componentes Core (`Terminado`)**:
    *   `StoreDirectory.jsx`: Modal funcional con búsqueda y manejo de estados.
    *   `StoreCard.jsx`: Cards con soporte para badges "DEMO" y "Próximamente".
    *   `StoreDirectory.module.css`: Estilos completos.
    *   `services/supabase.js`: Cliente configurado correctamente.

2.  **Base de Datos (`Terminado`)**:
    *   Columnas `is_demo` y `coming_soon` agregadas a Supabase.

3.  **Datos de Prueba (Contexto)**:
    *   **2 Tiendas DEMO:** Configuradas como `is_demo=true`, `is_active=true`. Deben aparecer y ser clickeables con badge DEMO.
    *   **3 Tiendas PRÓXIMAMENTE:** Configuradas como `coming_soon=true`. Deben aparecer con badge y *sin* enlace.

4.  **Footer (`Terminado`)**:
    *   El botón "Ver Tiendas Clicando" abre correctamente el modal.
    *   Texto actualizado a "Te esperamos en Clicando".

4.  **Landing Page (`Pendiente`)**:
    *   Se intentó integrar la sección "Confían en Clicando" pero hubo errores de sintaxis JSX.
    *   **Estado actual:** La Landing Page funciona pero *no* muestra aún las tiendas destacadas.

## Próximos Pasos

### 1. Integración en Landing Page
El objetivo es volver a agregar la sección de tiendas destacadas sin romper la estructura del archivo.

*   [ ] **Importar dependencias:**
    ```javascript
    import { supabase } from '../services/supabase';
    import StoreDirectory from '../components/StoreDirectory';
    import { useState, useEffect } from 'react';
    ```
*   [ ] **Agregar lógica de estado y efecto:**
    *   Estado para `featuredStores` y `showDirectory`.
    *   `useEffect` para hacer fetch de las 4 tiendas más recientes.
*   [ ] **Renderizado (Cuidadoso):**
    *   Insertar el bloque de "Confían en Clicando" justo antes del div "CTA".
    *   **Importante:** Colocar el componente `<StoreDirectory />` *dentro* del último `</div>` principal de la página, no fuera.

### 2. Verificación Final
*   [ ] Probar que la Landing Page cargue sin errores.
*   [ ] Verificar que aparecen las 4 tiendas.
*   [ ] Verificar que clickear "Ver todas" abre el modal.

### 3. Despliegue
*   [ ] Ejecutar `git push`.
*   [ ] Verificar deploy en Vercel.

## Notas Técnicas
*   Si `LandingPage.jsx` da errores de sintaxis, verificar siempre que el componente retorne un solo elemento padre (`<div>...</div>`) y que todos los tags estén cerrados.
*   El componente `<StoreDirectory />` debe ser hijo directo del `<div>` contenedor principal del return.
