# 🛡️ Plan de Backup y Resguardo - Clicando MVP

## 📋 Resumen Ejecutivo

Este documento establece la estrategia de backup manual para la etapa MVP del proyecto Clicando, cubriendo tanto la base de datos (Supabase Plan Free) como el código fuente.

---

## 1. 🗄️ Backup de Base de Datos (Supabase)

### 1.1 Limitaciones del Plan Free
- ❌ Sin backups automáticos (pg_dump programado)
- ❌ Sin Point-in-Time Recovery (PITR)
- ❌ Sin replicación a otra región
- ✅ Acceso completo via SQL/CLI
- ✅ Posibilidad de crear múltiples proyectos

### 1.2 Estrategia: Proyecto Paralelo de Backup

**Sí, ES POSIBLE** crear un proyecto paralelo para backups manuales. Aquí está el proceso:

#### Opción A: Backup mediante Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI si no está instalado
npm install -g supabase

# 2. Login a Supabase
supabase login

# 3. Link al proyecto de producción
supabase link --project-ref tu-project-ref

# 4. Dump de la base de datos completa
supabase db dump -f backups/db_backup_$(date +%Y%m%d_%H%M%S).sql

# 5. Dump solo datos (sin schema)
supabase db dump -f backups/data_backup_$(date +%Y%m%d_%H%M%S).sql --data-only

# 6. Dump solo schema (estructura)
supabase db dump -f backups/schema_backup_$(date +%Y%m%d_%H%M%S).sql --schema-only
```

#### Opción B: Backup a Proyecto Paralelo

1. **Crear proyecto backup** en Supabase (ej: `clicando-backup`)
2. **Usar el script de backup** creado en `scripts/backup-database.js`
3. **Frecuencia recomendada**: Semanal o antes de cambios importantes

```bash
# Ejecutar backup hacia proyecto paralelo
npm run backup:db
```

#### Opción C: Export desde Dashboard

1. Ir a Supabase Dashboard → Table Editor
2. Para cada tabla: Export → CSV
3. Guardar en carpeta `backups/exports/`

### 1.3 Estructura de Backups Local

```
backups/
├── db/
│   ├── full/
│   │   └── backup_20260219.sql
│   ├── data/
│   │   └── data_20260219.sql
│   └── schema/
│       └── schema_20260219.sql
├── storage/
│   └── images_20260219/
└── exports/
    └── products_20260219.csv
```

### 1.4 Frecuencia de Backup DB

| Situación | Frecuencia |
|-----------|------------|
| Desarrollo activo | Antes de cada feature importante |
| Producción estable | Semanal |
| Ante migraciones | Inmediato antes de ejecutar |
| Cambios en RLS | Inmediato antes y después |

---

## 2. 💾 Backup de Código Fuente

### 2.1 Situación Actual

- ✅ Repositorio en GitHub
- ⚠️ Archivos locales difieren por datos sensibles (.env)
- ✅ `.gitignore` configurado correctamente

### 2.2 Archivos Sensibles (NUNCA al repo)

```
.env
.env.local
.env.development
.env.production
*.csv
*.xlsx
schema.sql
schema_sql.json
```

### 2.3 Estrategia de Versiones de Código

#### Workflow de Branches Recomendado

```
main (producción)
  └── develop (integración)
        └── feature/* (desarrollo)
        └── hotfix/* (correcciones urgentes)
```

#### Proceso de Resguardo

1. **Antes de cambios importantes**:
   ```bash
   # Crear branch de resguardo
   git checkout -b backup/pre-cambio-$(date +%Y%m%d)
   git push origin backup/pre-cambio-$(date +%Y%m%d)
   ```

2. **Tags de versiones**:
   ```bash
   # Crear tag de versión
   git tag -a v0.1.0 -m "MVP estable - Febrero 2026"
   git push origin v0.1.0
   ```

3. **Backup de configuración local**:
   ```bash
   # Script para respaldar configs locales
   npm run backup:config
   ```

### 2.4 Archivo de Referencia de Secrets

Mantener actualizado `.env.template` con todas las variables necesarias:

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Admin
VITE_SUPER_ADMIN_EMAILS=

# Opcionales futuras
VITE_MERCADO_PAGO_PUBLIC_KEY=
VITE_GOOGLE_ANALYTICS_ID=
```

---

## 3. 🔄 Scripts de Automatización

### 3.1 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run backup:db` | Backup completo de BD |
| `npm run backup:storage` | Backup de imágenes/storage |
| `npm run backup:config` | Backup de configuración local |
| `npm run backup:all` | Backup completo del proyecto |

### 3.2 GitHub Actions (Opcional)

Ver `.github/workflows/backup.yml` para automatización en CI/CD.

---

## 4. 📋 Checklist de Backup

### Semanal
- [ ] Ejecutar `npm run backup:db`
- [ ] Verificar que el archivo .sql se generó correctamente
- [ ] Subir backup a almacenamiento seguro (Google Drive, etc.)

### Antes de Cambios Mayores
- [ ] Crear branch de resguardo
- [ ] Backup de BD completo
- [ ] Verificar .env.template actualizado
- [ ] Documentar cambios en CHANGELOG

### Mensual
- [ ] Revisar y limpiar backups antiguos
- [ ] Verificar integridad de backups
- [ ] Actualizar documentación

---

## 5. 🔐 Almacenamiento de Backups

### Opciones Recomendadas

1. **Google Drive / Dropbox** (Gratis)
   - Carpeta sincronizada con `backups/`
   - Historial de versiones automático

2. **Repositorio Privado Secundario**
   - Crear repo `clicando-backups`
   - Solo para backups de BD (sin código)

3. **Almacenamiento Local + Cloud**
   - Copia local en `backups/`
   - Copia en la nube manual

### ⚠️ IMPORTANTE: Seguridad

- NUNCA subir archivos `.env` reales a ningún lado
- Los backups SQL pueden contener datos sensibles
- Encriptar backups si contienen PII (datos personales)

---

## 6. 🚀 Procedimiento de Restauración

### Restaurar BD desde Backup

```bash
# 1. Crear nuevo proyecto Supabase o usar existente
# 2. Restaurar schema
supabase db push --db-url "postgresql://..." -f backups/schema_backup.sql

# 3. Restaurar datos
supabase db push --db-url "postgresql://..." -f backups/data_backup.sql
```

### Restaurar Código

```bash
# Desde un tag
git checkout v0.1.0

# Desde branch de backup
git checkout backup/pre-cambio-20260219
```

---

## 7. 📞 Contacto y Responsabilidad

- **Responsable del backup**: Desarrollador principal
- **Frecuencia de revisión**: Mensual
- **Próxima revisión**: [Fecha]

---

*Documento creado: 19/02/2026*
*Última actualización: 19/02/2026*
