# ABC: Cómo Subir Cambios a Producción

> **IMPORTANTE**: Este documento es para que cualquier agente de IA (o vos) pueda subir cambios a producción sin romper nada.

---

## 🚀 Flujo de Trabajo

### Paso 1: Siempre trabajá en una rama (branch)

```bash
# Crear y moverte a una rama nueva
git checkout -b nombre-de-tu-rama

# Ejemplo:
git checkout -b feature/nueva-seccion
git checkout -b fix/error-boton
git checkout -b mejora/mejorar-rendimiento
```

### Paso 2: Hacé tus cambios

1. Modificá los archivos que necesites
2. Probá localmente con `npm run dev`
3. Ejecutá los tests con `npm test`

### Paso 3: Commit y push

```bash
# Agregar los cambios
git add .

# Hacer commit con mensaje descriptivo
git commit -m "Descripción clara de qué cambiaste"

# Subir la rama a GitHub
git push origin nombre-de-tu-rama
```

### Paso 4: Abrir Pull Request (PR)

1. Ir a GitHub → tu repositorio
2. Verás un botón verde "Compare & pull request"
3. Clickealo
4. Agregá una descripción de los cambios
5. Clickea "Create pull request"

### Paso 5: El CI corre automáticamente

**Esto pasa solo, no necesitás hacer nada:**

1. GitHub detecta el PR nuevo
2. Ejecuta el workflow `.github/workflows/ci.yml`
3. El CI corre estas validaciones:
   - ✅ Instala dependencias
   - ✅ Compila el proyecto (`npm run build`)
   - ✅ Valida migraciones de base de datos
   - ✅ Verifica políticas RLS de seguridad
   - ✅ Ejecuta tests de seguridad
   - ✅ Ejecuta tests unitarios

### Paso 6: Revisar resultado del CI

**Si los tests pasan** ✅:
- Podés hacer "Merge pull request"
- El código se integra a `main`
- Vercel despliega automáticamente

**Si los tests fallan** ❌:
- NO se puede mergear
- El agente debe arreglar los errores
- Hacer commit y push nuevamente (el CI corre de nuevo)

---

## 📋 Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Tests unitarios
npm test

# Tests en modo watch (para desarrollo)
npm run test:watch

# Build de producción
npm run build

# Validación completa (lo que corre el CI)
npm run validate:all

# Ver estado de git
git status

# Ver ramas locales
git branch

# Ver rama actual
git branch --show-current
```

---

## 🔧 Configuración de GitHub (Manual)

### Branch Protection Rules

Para que el CI funcione como filtro de seguridad:

1. Ir a **GitHub → Settings → Branches**
2. Click **Add branch protection rule**
3. Configurar:
   - **Branch name pattern**: `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - Buscar y seleccionar: `validate`

### Secrets requeridos (ya configurados)

El CI necesita estas variables en **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|--------|-------------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (para validaciones) |

---

## ⚠️ Reglas de Oro

1. **NUNCA hagas push directo a main** - Siempre usá PR
2. **Ejecutá `npm test` antes de commitear** - Evitá que el CI falle
3. **Escribí mensajes de commit claros** - Facilitan la revisión
4. **Si el CI falla, arreglá el error primero** - No ignores los fallos

---

## 🆘 Si Algo Sale Mal

### "El CI falló"
- Ejecutá `npm run validate:all` local para ver el error
- Arreglá el problema
- Commit y push de nuevo

### "No puedo mergear"
- Verificá que el CI haya pasado (checkmark verde)
- Si hay conflictos, resolvelos localmente:
  ```bash
  git fetch origin
  git merge origin/main
  # Resolver conflictos en editor
  git add .
  git commit -m "Merge main"
  git push
  ```

### "No sé qué rama usar"
- `feature/` para funcionalidades nuevas (ej: `feature/agregar-whatsapp`)
- `fix/` para correcciones (ej: `fix/error-carrito`)
- `mejora/` para mejoras menores (ej: `mejora/rendimiento`)

---

## 📁 Estructura del Proyecto

```
tienda-online-mvp/
├── .github/workflows/ci.yml    # CI/CD automatizado
├── src/                        # Código fuente
├── tests/                      # Tests de integración
├── sql/                        # Migraciones de DB
├── scripts/                   # Scripts de utilidad
└── plans/                     # Documentación de planes
```

---

## ✅ Checklist Antes de Crear PR

- [ ] Los tests pasan (`npm test`)
- [ ] El build funciona (`npm run build`)
- [ ] Probé los cambios localmente
- [ ] Mi commit tiene mensaje descriptivo
- [ ] No dejé console.logs o código de debug

---

*Documento generado para el proyecto Maptiva/Clicando*
*Última actualización: 2026-02-27*
