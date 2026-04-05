# Tienda Online MVP - SaaS Multi-tenant 🚀✨

Bienvenido a la consola maestra de **Tienda Online MVP**. Este proyecto es una plataforma de comercio electrónico modular y escalable diseñada para múltiples tiendas en una sola base de datos (Multi-tenant).

## 🛡️ Estado Actual: Nivel Oro (Gold Standard)
El proyecto ha sido recientemente saneado y optimizado siguiendo los más altos estándares técnicos:

- **TypeScript (100%):** Todo el código fuente está tipado y validado (`npx tsc --noEmit` -> 0 errores).
- **Seguridad RLS:** Row Level Security activo en Supabase usando UUIDs inmutables para aislamiento total de datos.
- **TanStack Query:** Gestión de estado del servidor optimizada con caching e invalidación automática.
- **Root Clean:** El repositorio mantiene una raíz limpia y profesional.

## 📖 Base de Conocimiento (Knowledge Base)
Para entrar en contexto rápidamente, consulta la carpeta **[`/docs`](./docs)**:

1. **[Arquitectura y Patrones](./docs/architecture/PATTERNS.md):** Manual sobre seguridad RLS, UUIDs y manejo de datos con TanStack Query.
2. **[Hoja de Ruta (Roadmap)](./docs/roadmaps/ROADMAP.md):** Lista de mejoras pendientes y visión del producto.
3. **[Informe de Migración TS](./docs/TS_MIGRATION_FINAL.md):** Resumen de cómo se alcanzó el estado 100% TypeScript.

## 🚀 Inicio Rápido
```bash
# Instalar dependencias
npm install

# Iniciar entorno de desarrollo
npm run dev

# Validar integridad de tipos (Obligatorio antes de deploy)
npx tsc --noEmit
```

---
*Mantenido por Alejandro - Inteligencia Comercial y Gestión de Relevamientos.* 🏁🕵️‍♂️🔧
