# 🧹 Script de Limpieza de Imágenes Huérfanas

## ¿Qué hace este script?

Identifica y elimina imágenes en Supabase Storage que **NO** están siendo usadas por ningún producto o tienda en la base de datos.

---

## ⚠️ Importante: Seguridad Garantizada

El script tiene **múltiples capas de seguridad**:

1. ✅ **Modo Dry-Run por defecto** - Solo muestra qué se eliminaría, sin borrar nada
2. ✅ **Verifica productos** - Compara con la tabla `products`
3. ✅ **Verifica logos** - Compara con la tabla `stores`
4. ✅ **Confirmación manual** - Pide confirmación antes de eliminar
5. ✅ **Lista detallada** - Muestra exactamente qué archivos se eliminarán

---

## 📋 Requisitos Previos

1. Node.js instalado
2. Variables de entorno configuradas en `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Cómo Usar

### Paso 1: Análisis (Dry-Run)

Primero, ejecuta el script en modo análisis para ver qué se eliminaría **sin borrar nada**:

\`\`\`bash
node scripts/cleanup-orphaned-images.js
\`\`\`

Esto mostrará:
- Cuántas imágenes están en uso
- Cuántos archivos huérfanos hay
- Lista detallada de archivos a eliminar
- Espacio total a liberar

**Ejemplo de salida:**

\`\`\`
📋 Obteniendo lista de imágenes en uso...
✅ Encontradas 12 imágenes en uso
📋 Obteniendo lista de logos en uso...
✅ Encontrados 2 logos en uso
📁 Obteniendo lista de archivos en Storage...
✅ Encontrados 25 archivos en Storage

🗑️  Archivos huérfanos encontrados (11):
────────────────────────────────────────────────────────────
1. 1638123456-abc123.png (1024.50 KB)
2. 1638123789-def456.jpg (856.30 KB)
...
────────────────────────────────────────────────────────────
📊 Espacio total a liberar: 8456.80 KB

⚠️  MODO DRY-RUN: No se eliminará nada
Para eliminar realmente, ejecuta: node cleanup-orphaned-images.js --delete
\`\`\`

### Paso 2: Revisar la Lista

**IMPORTANTE:** Revisa cuidadosamente la lista de archivos a eliminar.

Verifica que:
- ✅ No aparezcan imágenes que estés usando actualmente
- ✅ Solo aparezcan archivos antiguos/reemplazados
- ✅ Los nombres de archivo tengan sentido (timestamps antiguos)

### Paso 3: Eliminar (Solo si estás seguro)

Si todo se ve bien, ejecuta con el flag `--delete`:

\`\`\`bash
node scripts/cleanup-orphaned-images.js --delete
\`\`\`

El script pedirá confirmación final:

\`\`\`
⚠️  ADVERTENCIA: Esta acción NO se puede deshacer
¿Estás seguro de eliminar estos archivos? (s/n):
\`\`\`

Escribe `s` para confirmar o `n` para cancelar.

---

## 🛡️ ¿Qué NO se eliminará?

El script **NUNCA** eliminará:

- ✅ Imágenes usadas en productos activos
- ✅ Logos usados en tiendas activas
- ✅ Archivos referenciados en la base de datos

---

## 📊 Ejemplo de Uso Completo

\`\`\`bash
# 1. Ver qué se eliminaría (seguro)
node scripts/cleanup-orphaned-images.js

# 2. Si todo se ve bien, eliminar
node scripts/cleanup-orphaned-images.js --delete

# Salida:
# ✅ 11 archivos eliminados exitosamente
# 💾 Espacio liberado: 8456.80 KB
\`\`\`

---

## ❓ Preguntas Frecuentes

### ¿Puedo ejecutarlo varias veces?

Sí, es seguro ejecutarlo cuantas veces quieras. Si no hay archivos huérfanos, simplemente dirá:

\`\`\`
✅ No hay archivos huérfanos para eliminar
\`\`\`

### ¿Qué pasa si me equivoco?

Si ejecutas en modo dry-run (sin `--delete`), **no pasa nada**. Solo muestra información.

Si ejecutas con `--delete` pero cancelas en la confirmación, **no pasa nada**.

### ¿Cuándo debo ejecutar este script?

Recomendado:
- Después de reemplazar muchas imágenes
- Una vez al mes como mantenimiento
- Cuando notes que el storage está creciendo mucho

---

## 🔧 Solución de Problemas

### Error: "Variables de entorno no configuradas"

Asegúrate de tener el archivo `.env` con:

\`\`\`
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
\`\`\`

### Error: "Cannot find module"

Instala las dependencias:

\`\`\`bash
npm install
\`\`\`

---

## ✅ Resumen

1. **Siempre ejecuta primero sin `--delete`** para ver qué se eliminará
2. **Revisa la lista cuidadosamente**
3. **Solo elimina si estás 100% seguro**
4. **El script protege tus imágenes activas automáticamente**
