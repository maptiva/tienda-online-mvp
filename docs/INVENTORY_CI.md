# Inventory CI — Tests de integración (Staging/Demo) ⚙️

Este documento explica cómo configurar y ejecutar los tests de integración que verifican el RPC `process_public_cart_sale` contra el entorno de *staging/demo*.

## ¿Para qué sirve? ✅
- Ejecutar los tests en CI garantiza que el *motor de stock* funcione con permisos y RLS reales antes de mergear a `main`.
- Los tests hacen backup del inventario, ejecutan casos (éxito/fallo) y restauran el estado al finalizar.

## Requisitos (GitHub) 🔐
Añade estos **Secrets** en tu repositorio (Settings → Secrets → Actions):

- **SUPABASE_URL** — url del proyecto Supabase de staging/demo (ej: `https://xyz.supabase.co`)
- **SUPABASE_SERVICE_ROLE_KEY** — _service role key_ del proyecto staging/demo (permiso amplio — mantenlo secreto)

> Nota: Usa un proyecto de staging/demo, **no** production. El Service Role Key tiene permisos amplios.

## ¿Cómo ejecutar los tests en CI? 🧪
- La Action ya está creada en `.github/workflows/inventory-ci.yml` y corre en pushes/PRs a `motor-stock-definitivo` y `main`.
- Cuando subas esta rama y configures los secrets, la Action ejecutará `npm run test:inventory`.

## Cómo ejecutar localmente (desarrollo) 🖥️
1. Exporta variables de entorno localmente (PowerShell):

```powershell
$env:SUPABASE_URL = "https://xyz.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
```

2. Instala dependencias y ejecuta:

```bash
npm ci
npm run test:inventory
```

3. Si quieres ejecutar solo un test específico, edita `tests/ci-public-cart-sale.js` y ajusta `testCases`.

## Datos de prueba usados por defecto 🧾
El script usa por defecto la tienda `baby-sweet` y productos con IDs: `15`, `16`, `17`. Cambia estos IDs si tu staging usa otros.

## Seguridad y limpieza 🔒
- El test hace backup del inventario afectado y lo restaura al finalizar. También elimina `inventory_logs` creados por el test (buscando `order_reference` único).
- Aún así, revisa manualmente los resultados en staging la primera vez.

## Pull Request (PR) — flujo recomendado 🔁
- Crea un PR de `motor-stock-definitivo` → `main` para revisión. La Action correrá en el PR y en merges posteriores a `main`.

---

Si quieres, puedo: 
- Crear el PR por ti con un resumen y checklist ✔️
- Añadir más casos de test o un seed SQL para staging ✔️

Pide lo que prefieras y lo hago.
