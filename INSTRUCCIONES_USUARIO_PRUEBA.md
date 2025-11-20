# Instrucciones: Crear Usuario de Prueba en Supabase

## 📝 Paso a Paso

### 1. Acceder a Supabase Authentication

1. Ve a https://supabase.com
2. Inicia sesión en tu cuenta
3. **Selecciona el proyecto `tienda-online-dev`** (arriba a la izquierda)
4. En el menú lateral, haz clic en **Authentication** (ícono de usuario)
5. Haz clic en **Users**

---

### 2. Crear Nuevo Usuario

1. Haz clic en el botón **"Add user"** (arriba a la derecha)
2. Selecciona **"Create new user"**
3. Completa el formulario:
   - **Email:** `test@tienda.com`
   - **Password:** `Test123456!`
   - **Auto Confirm User:** ✅ Activar (importante)
4. Haz clic en **"Create user"**

---

### 3. Verificar Usuario Creado

Deberías ver el usuario en la lista con:
- Email: test@tienda.com
- Status: Confirmed ✅

---

### 4. Iniciar Sesión en la App

1. Abre tu navegador en: http://localhost:5173/tienda-online-mvp/login
2. Ingresa las credenciales:
   - **Email:** `test@tienda.com`
   - **Password:** `Test123456!`
3. Haz clic en **"Iniciar Sesión"**

---

### 5. Configurar Tu Tienda

Una vez dentro del panel de administración:

1. Haz clic en **⚙️ Configuración** (en el menú lateral)
2. Completa el formulario:
   - **Nombre de la Tienda:** `Mi Primera Tienda` (o el nombre que prefieras)
   - **Logo:** Sube cualquier imagen desde tu computadora
   - **Teléfono:** `+54 9 11 1234-5678`
   - **WhatsApp:** `5491112345678`
   - **Instagram:** `https://instagram.com/mitienda`
   - **Facebook:** `https://facebook.com/mitienda` (opcional)
3. Haz clic en **"Guardar Configuración"**
4. Deberías ver un mensaje de éxito ✅

---

### 6. Crear Tu Primer Producto

1. En el menú lateral, haz clic en **📦 Productos**
2. Haz clic en **"Añadir Nuevo Producto"**
3. Completa el formulario:
   - **Nombre:** `Producto de Prueba`
   - **Descripción:** `Este es un producto de prueba`
   - **Precio:** `1500`
   - **Categoría:** (primero debes crear una categoría)
   - **Stock:** `10`
   - **Imagen:** Sube una imagen
4. Haz clic en **"Guardar Producto"**

---

### 7. Crear Categorías (si es necesario)

1. En el menú lateral, haz clic en **🗂️ Categorías**
2. Crea algunas categorías de prueba:
   - Ropa
   - Accesorios
   - Calzado
   - etc.

---

## ✅ Verificación

Después de crear productos, deberías verlos en:
- **Panel Admin:** Lista de productos
- **Vista Pública:** http://localhost:5173/tienda-online-mvp/

---

## ⚠️ Nota Importante

Si ves errores o no puedes crear productos, avísame y revisaremos juntos qué puede estar pasando.
