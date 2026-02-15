# 🛠️ Workflows de Desarrollo: Clicando (SaaS)

Este documento define los procesos estándar para evolucionar Clicando de forma segura, rápida y escalable. Un **Workflow** no es solo código; es el camino que sigue una idea desde que nace hasta que llega al usuario final, asegurando que no se rompa nada en el camino.

---

## 🧩 Concepto: ¿Qué es un Workflow?
Conceptualmente, un workflow es una **receta estructurada** (Pasos + Validaciones + Automatización).
1.  **Gatillo:** Qué inicia el proceso (ej: un bug, una idea local).
2.  **Pasos:** Qué hacemos (escribir código, crear tablas).
3.  **Gates (Puertas de Calidad):** Qué debe pasar para continuar (tests, linter, revisión).
4.  **Output:** El resultado final (código en producción, base de datos actualizada).

---

## 🚀 Workflows Críticos para Clicando

### 1. 🛡️ Feature Multi-tenant (Aislamiento Total)
**Objetivo:** Garantizar que los datos de la Tienda A nunca sean visibles para la Tienda B.
*   **Implementación:**
    *   **SQL:** Crear tabla -> `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
    *   **React:** Usar `store_slug` desde el contexto/URL para filtrar peticiones.
    *   **Test:** Correr `npm run test:isolation` (verifica que un usuario sin sesión no vea data privada).

### 2. 🧬 Migración de Datos (Schema Evolution)
**Objetivo:** Evolucionar la base de datos sin errores manuales y con posibilidad de "deshacer".
*   **Implementación:**
    *   **Carpeta:** `supabase/migrations/`
    *   **Formato:** `YYYYMMDDHHMM_descripcion.sql`
    *   **Regla:** No se ejecutan scripts manuales en el dashboard de Supabase; todo pasa por archivos controlados por Git.

### 3. 🔑 Public Gateway Review
**Objetivo:** Protejer las puertas de entrada públicas (catálogo, inventario).
*   **Implementación:**
    *   **Código:** Las funciones SQL con `SECURITY DEFINER` deben ser auditadas para asegurar que filtran por `store_id` siempre.
    *   **Checklist de Seguridad:**
        1. ¿La función requiere `p_store_slug`?
        2. ¿Valida que el producto pertenece al dueño de la tienda? (`p.user_id = s.user_id`)
        3. ¿La tienda tiene `enable_stock = true`?
    *   **Test:** Correr `npm run test:security` (simula ataques de acceso cruzado entre tiendas).


### 4. 🚢 Release Gold Path (Despliegue Continuo)
**Objetivo:** Desplegar en Vercel sabiendo que "lo básico" funciona.
*   **Implementación:**
    *   **Comando Maestro:** `npm run validate:all`
    *   **¿Qué hace?** Corre en cadena:
        1. Linter de Migraciones (Orden de DB).
        2. RLS Check (Seguridad multi-tenant).
        3. Security Test (Aislamiento de acceso público).
        4. Vite Build (Compilación del código).
    *   **Regla de Oro:** Si falla cualquier paso, el despliegue se detiene automáticamente.


---

## ❓ Preguntas Frecuentes

### ¿Dónde se "meten" en el código?
Se implementan en tres lugares:
1.  **Configuración:** Archivos como `.github/workflows/*.yml` o `package.json` (scripts).
2.  **Scripts de Soporte:** Carpeta `scripts/` (ej: `cleanup-storage.js`, `test-rls.js`).
3.  **Cultura de Desarrollo:** Este mismo documento (`DEVELOPMENT_WORKFLOWS.md`) que sirve de guía para el equipo (o para mí como tu copiloto).

### ¿Se pueden adaptar a otros proyectos?
**Sí, pero con matices:**
*   **Los conceptos (Aislamiento, Migraciones, QA) son universales.**
*   **La ejecución técnica cambia:** En este proyecto usamos Supabase (RLS), en otro podrías usar PostgreSQL puro o una API en Node.js con middlewares de autenticación.

### ¿Es conveniente generar unos desde cero?
No es necesario. Es mejor usar estos como **plantilla (Blueprint)** y ajustarlos. Por ejemplo, si mañana haces un proyecto de "Gestión Médica", el workflow de "Aislamiento Multi-tienda" se convierte en "Aislamiento Multi-paciente". La estructura es la misma, cambia el contexto.
