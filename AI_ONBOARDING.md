# Contexto Maestro y Reglas para Agentes IA 🤖💎
*Última actualización: 9 de Abril de 2026 (Hito: Purgado de 'any' y Blindaje de Esquemas)*

Este archivo sirve como el "prompt de arranque" obligatorio para cualquier modelo o agente de IA autónomo que intervenga en la base de código de `tienda-online-mvp`. 

---

## 🎯 Instrucciones de Arranque (Copiar y pegar al agente)

Cuando comiences una sesión nueva con un agente, envíale el siguiente bloque de texto en tu primer mensaje:

```text
¡Hola! Eres un Senior Software Engineer operando en nuestro repositorio "tienda-online-mvp" (SaaS Multi-tenant).

ANTES de escribir una sola línea de código o analizar mi requerimiento principal, TIENES QUE ponerte en contexto leyendo nuestras directivas técnicas estrictas. Hemos alcanzado el "Diamond Standard" de TypeScript.

Tus acciones obligatorias de inicio:
1. Leer `docs/TS_MIGRATION_FINAL.md` para entender el estado de la migración.
2. Leer `src/schemas/*.schema.ts` del módulo en el que vayas a trabajar.

Reglas generales irrompibles para tu operación hoy:
- Código 100% TypeScript Estricto. 
- PROHIBIDO el uso de `any` o `as any`. Si hay un problema de tipos, usa `unknown` y casting explícito, pero siempre intenta resolverlo desde la raíz.
- **FLUJO OBLIGATORIO DE DATOS**: Si vas a manejar datos de la base de datos o formularios, DEBES verificar/actualizar primero el esquema en `src/schemas/`. El esquema Zod es la FUENTE DE VERDAD.
- NUNCA sobreescribas un archivo largo generando "esqueletos vacíos" o "comentarios de resumen". Si vas a editar, usa ediciones quirúrgicas.

Una vez que hayas leído la documentación y asimilado las reglas, dime "Contexto asimilado, Diamond Standard cargado 💎" y procederemos con mi pedido de desarrollo.
```

---

## ⚙️ Reglas Globales (Custom Instructions)
Te recomiendo añadir la siguiente frase de manera permanente a las **Reglas Globales** (Global Rules / Custom Instructions) de tu entorno de IA favorito:

> *"El proyecto tienda-online-mvp es 100% TypeScript Estricto. La fuente de verdad para los datos son los esquemas Zod en `src/schemas/`. Nunca sugieras soluciones con 'any'. Nunca trunques archivos ni dejes código obsoleto tras una refactorización."*

---

> _**Nota del equipo (Agentes):** Este proyecto pasó por una migración total donde se purgaron comportamientos de JavaScript. No permitas que el código regrese a ese estado de opacidad._

---

## 🗄️ Supabase - Cambio de permisos (Mayo 2026)

A partir del 30 de mayo de 2026, Supabase no expone tablas del esquema "public" a la Data API por defecto. Si creás una nueva tabla,必须 incluir grants explícitos:

```sql
-- Después de CREATE TABLE
GRANT SELECT ON public.nueva_tabla TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nueva_tabla TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nueva_tabla TO service_role;
ALTER TABLE public.nueva_tabla ENABLE ROW LEVEL SECURITY;
```

- Project ID: `lnvgxxzgwubhmhzxwfly`
- Migraciones: `supabase/migrations/`

---

## 🌿 Git Workflow

- **Ramas**: `main` (producción), `dev` (desarrollo), `fix/*` / `feat/*` (features)
- **PR a main**: Todo entra por PR manual, no hay merge automático
- **Commits**: Mensajes claros, descripción del qué y por qué
- **Tags**: Se crean manual via GitHub Actions si se necesita versión
- **Backup automático**: Cada push a main genera branches `backup/auto-YYYYMMDD-HHMMSS`
