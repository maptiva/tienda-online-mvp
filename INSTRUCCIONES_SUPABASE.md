# 📋 Instrucciones: Ejecutar Scripts SQL en Supabase

## Paso a Paso

### 1️⃣ Abrir SQL Editor en Supabase

1. Ve a https://supabase.com e inicia sesión
2. **Selecciona el proyecto `tienda-online-dev`** (arriba a la izquierda)
3. En el menú lateral izquierdo, haz clic en **SQL Editor** (ícono `</>`)

---

### 2️⃣ Ejecutar Script 1: Crear Tablas Base

**Archivo:** `sql/01_create_base_tables.sql`

1. Abre el archivo `sql/01_create_base_tables.sql` en tu editor
2. **Copia TODO el contenido** del archivo
3. **Pega** en el SQL Editor de Supabase
4. Haz clic en el botón **"RUN"** (verde, esquina inferior derecha)
5. Espera a ver el mensaje **"Success. No rows returned"** ✅

---

### 3️⃣ Ejecutar Script 2: Agregar Multi-Tenant

**Archivo:** `sql/02_create_stores_multitenant.sql`

1. **Limpia el editor** (borra el contenido anterior)
2. Abre el archivo `sql/02_create_stores_multitenant.sql`
3. **Copia TODO el contenido**
4. **Pega** en el SQL Editor
5. Haz clic en **"RUN"**
6. Verifica **"Success"** ✅

---

### 4️⃣ Ejecutar Script 3: Implementar RLS

**Archivo:** `sql/03_implement_rls.sql`

1. **Limpia el editor**
2. Abre el archivo `sql/03_implement_rls.sql`
3. **Copia TODO el contenido**
4. **Pega** en el SQL Editor
5. Haz clic en **"RUN"**
6. Verifica **"Success"** ✅

---

### 5️⃣ Ejecutar Script 4: Configurar Storage

**Archivo:** `sql/04_configure_storage.sql`

1. **Limpia el editor**
2. Abre el archivo `sql/04_configure_storage.sql`
3. **Copia TODO el contenido**
4. **Pega** en el SQL Editor
5. Haz clic en **"RUN"**
6. Verifica **"Success"** ✅

---

## ✅ Verificación

Después de ejecutar todos los scripts, verifica que se crearon las tablas:

1. En Supabase, ve a **Table Editor** (menú lateral)
2. Deberías ver estas tablas:
   - ✅ `categories`
   - ✅ `products`
   - ✅ `stores`

---

## ⚠️ Si hay errores

Si algún script da error:
1. **Copia el mensaje de error completo**
2. **Avísame** para ayudarte a resolverlo
3. **NO continúes** con los siguientes scripts hasta resolver el error

---

## 📞 Siguiente Paso

Una vez que todos los scripts se ejecuten correctamente, **avísame** y continuaremos con las modificaciones del frontend.
