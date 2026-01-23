# Diagnóstico y Plan de Implementación de Testing

Este documento resume el estado actual del proyecto `tienda-online-mvp` y detalla el plan de acción para implementar una estrategia de testing automatizado, solicitado el 2026-01-22.

## 1. Diagnóstico del Proyecto

El proyecto es una plataforma de **E-commerce Multi-Tenant** que ha superado su fase inicial de MVP y ahora opera con clientes reales.

- **Stack Tecnológico:** React, Vite, Supabase, con una mezcla de JavaScript y TypeScript.
- **Arquitectura:** Su punto más fuerte es la arquitectura multi-tenant implementada con Row-Level Security (RLS) en Supabase, lo que garantiza un aislamiento de datos robusto y escalable.
- **Estructura del Código:** El frontend sigue las mejores prácticas, con una separación clara de responsabilidades (componentes, hooks, páginas, servicios).

### Evaluación de Salud

- **Puntos Fuertes:**
  - Arquitectura de datos sólida y segura.
  - Estructura de código limpia y mantenible.
  - Uso de hooks personalizados para separar la lógica de la UI.
  - Adopción progresiva de TypeScript.

- **Principal Área de Mejora Crítica:**
  - **Ausencia total de pruebas automatizadas.** Para un proyecto en producción y en crecimiento, esta es la mayor área de riesgo. La falta de tests puede provocar regresiones (que funcionalidades antiguas se rompan con cambios nuevos) y dificulta la refactorización segura.

## 2. Plan de Acción para Implementar Testing

Para mitigar este riesgo y profesionalizar el ciclo de desarrollo, se implementará un sistema de pruebas utilizando herramientas estándar en el ecosistema de Vite y React.

- **Herramientas Seleccionadas:**
  - **Vitest:** El framework de testing nativo de Vite. Rápido y con una API compatible con Jest.
  - **React Testing Library (RTL):** Para probar componentes de React desde la perspectiva del usuario final, lo que resulta en pruebas más estables.
  - **jsdom:** Para simular un entorno de navegador y poder renderizar componentes en la terminal.

### Pasos a Seguir

El plan se ejecutará en el siguiente orden:

1.  **Instalar Dependencias de Desarrollo:**
    - Se añadirán `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react` y `@testing-library/jest-dom` al `package.json`.

2.  **Configurar `vite.config.js`:**
    - Se modificará el archivo para integrar Vitest, definir `jsdom` como entorno de prueba y apuntar a un archivo de setup.

3.  **Crear Archivo de Setup Global (`src/setupTests.js`):**
    - Este archivo importará matchers adicionales de RTL para que estén disponibles en todas las pruebas (ej. `toBeInTheDocument`).

4.  **Añadir Scripts a `package.json`:**
    - Se crearán los comandos `npm run test` (para ejecución única) y `npm run test:ui` (para la interfaz visual interactiva de Vitest).

5.  **Escribir Primera Prueba Unitaria:**
    - Como prueba de concepto, se creará un archivo `WhatsAppButton.test.jsx` para validar el comportamiento del componente `WhatsAppButton`. Esto servirá como ejemplo y plantilla para futuras pruebas.

6.  **Verificación y Siguientes Pasos:**
    - Se ejecutarán las pruebas para confirmar que todo el sistema funciona. A partir de ahí, se definirá una estrategia para dar prioridad a las pruebas de las funcionalidades más críticas (hooks de datos, lógica de carrito, autenticación).
