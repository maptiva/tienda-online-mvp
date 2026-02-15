# Plan de Mejoras para Tienda Online SaaS

Este documento resume el análisis, diagnóstico y plan de acción para mejorar la plataforma SaaS.

## 1. Análisis Inicial (09/12/2025)

Se realizó un análisis estático del código fuente.

- **Stack Tecnológico:** React 19, Vite, Supabase, TailwindCSS.
- **Fortalezas:**
    - Buena cohesión de código (lógica separada de la UI en hooks).
    - Patrón de autenticación sólido.
    - Herramientas modernas y actualizadas.

## 2. Diagnóstico y Áreas de Mejora

Se identificaron las siguientes áreas clave para mejorar, ordenadas por prioridad:

1.  **Seguridad (Crítico):** Se detectó una política de seguridad a nivel de fila (RLS) en la tabla `stores` que expone públicamente **todos los datos de todas las tiendas**, incluyendo información potencialmente sensible.
2.  **Arquitectura de Datos (Importante):** Las tablas `products` y `categories` se vinculan directamente a un `user_id` en lugar de a un `store_id`. Este diseño es frágil, difícil de mantener y no es escalable.
3.  **Rendimiento (Medio):** La aplicación no utiliza carga diferida ("lazy loading") para las rutas, lo que resulta en tiempos de carga inicial más lentos para el usuario final.
4.  **Manejo de Estado (Medio):** Existe un uso mixto de React Context (`CartContext`) y Zustand (`useCategoryStore`). El estado que cambia frecuentemente, como el del carrito, puede causar re-renders innecesarios con Context.
5.  **Mantenibilidad (Bajo):** Hay una mezcla inconsistente de tipos de archivo (`.js`, `.jsx`, `.tsx`). Estandarizar a TypeScript (`.tsx`) mejoraría la robustez y facilidad de mantenimiento.
6.  **Calidad del Código (Bajo):** No se encontró un framework de pruebas automatizadas (como Vitest), lo cual es una oportunidad para mejorar la fiabilidad del código a largo plazo.

## 3. Plan de Acción Acordado

Para abordar estos puntos de forma segura y controlada, se acordó el siguiente flujo de trabajo:

1.  **Trabajo en Rama Aislada:** Todos los cambios se realizarán en una nueva rama de Git llamada `feature/mejoras-gemini`. La rama `main` permanecerá intacta hasta que aprobemos y fusionemos los cambios.
2.  **Verificación Local:** Podrás cambiar a esta nueva rama en tu entorno local (`git checkout feature/mejoras-gemini`) y probar todas las mejoras ejecutando tu servidor de desarrollo (`npm run dev`) en `http://localhost:5173`.

### Pasos a Seguir:

1.  **Corregir la Falla de Seguridad (Prioridad #1):**
    - Crear la rama `feature/mejoras-gemini`.
    - Modificar `sql/03_implement_rls.sql` para eliminar la política insegura `USING (true)` en la tabla `stores`.
    - **Efecto esperado:** Brecha de seguridad cerrada. Posible efecto secundario temporal: el directorio público de tiendas puede dejar de funcionar hasta que se reconstruya de forma segura.

2.  **Refactorizar la Arquitectura de Datos:**
    - Modificar los scripts SQL para que `products` y `categories` se relacionen con `store_id`.
    - Actualizar las políticas RLS para reflejar esta nueva arquitectura correcta.

3.  **Optimizar el Rendimiento:**
    - Implementar `React.lazy` en `src/App.jsx` para cargar componentes de rutas de forma diferida.

4.  **Unificar el Manejo de Estado:**
    - Migrar la lógica de `CartContext.jsx` a un nuevo store de Zustand para optimizar el rendimiento.

## 4. Próximos Pasos (al retomar)

1.  Ejecutar el comando para crear la nueva rama: `git checkout -b feature/mejoras-gemini`.
2.  Proceder con el **Paso 1** del plan: Corregir la falla de seguridad.
