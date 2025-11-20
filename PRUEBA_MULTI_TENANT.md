# 🧪 Prueba Multi-Tenant - Guía Paso a Paso

## 📋 Objetivo
Crear una segunda tienda y verificar que el aislamiento de datos funciona perfectamente.

---

## 🚀 Paso 1: Crear Segundo Usuario en Supabase

1. Ve a **Supabase** → https://supabase.com
2. Selecciona el proyecto **`tienda-online-dev`** (arriba a la izquierda)
3. En el menú lateral, haz clic en **Authentication** → **Users**
4. Haz clic en **"Add user"** → **"Create new user"**
5. Completa el formulario:
   - **Email:** `tienda2@test.com`
   - **Password:** `Test123456!`
   - **Auto Confirm User:** ✅ **Activar** (importante)
6. Haz clic en **"Create user"**
7. Verifica que aparezca en la lista con status "Confirmed" ✅

---

## 🏪 Paso 2: Configurar Segunda Tienda

1. **Cierra sesión** de tu tienda actual:
   - Ve a http://localhost:5173/tienda-online-mvp/login
   - Si estás logueado, cierra sesión

2. **Inicia sesión con el nuevo usuario:**
   - Email: `tienda2@test.com`
   - Password: `Test123456!`

3. **Ve a Configuración:**
   - Haz clic en **⚙️ Configuración** (menú lateral)

4. **Completa el formulario:**
   - **Nombre de la Tienda:** `deportes-juan` (sin espacios, usa guiones)
   - **Logo:** Sube una imagen diferente a la primera tienda
   - **Teléfono:** `+54 9 11 9876-5432`
   - **WhatsApp:** `5491198765432` (diferente al de la primera tienda)
   - **Instagram:** `https://instagram.com/deportesjuan`
   - **Facebook:** `https://facebook.com/deportesjuan` (opcional)

5. **Guarda la configuración**
   - Deberías ver mensaje de éxito ✅

---

## 📦 Paso 3: Crear Productos en la Segunda Tienda

1. **Ve a Categorías:**
   - Haz clic en **🗂️ Categorías**
   - Crea 2-3 categorías diferentes:
     - Ejemplo: "Calzado Deportivo", "Ropa Deportiva", "Accesorios"

2. **Ve a Productos:**
   - Haz clic en **📦 Productos**
   - Haz clic en **"Añadir Nuevo Producto"**

3. **Crea 2-3 productos de prueba:**
   
   **Producto 1:**
   - Nombre: `Zapatillas Running Nike`
   - Descripción: `Zapatillas profesionales para running`
   - Precio: `15000`
   - Categoría: `Calzado Deportivo`
   - Stock: `20`
   - Imagen: Sube una imagen

   **Producto 2:**
   - Nombre: `Remera Adidas Deportiva`
   - Descripción: `Remera técnica para entrenamiento`
   - Precio: `8500`
   - Categoría: `Ropa Deportiva`
   - Stock: `30`
   - Imagen: Sube una imagen

   **Producto 3:**
   - Nombre: `Botella Térmica 1L`
   - Descripción: `Botella térmica de acero inoxidable`
   - Precio: `4500`
   - Categoría: `Accesorios`
   - Stock: `50`
   - Imagen: Sube una imagen

4. **Verifica en el panel admin:**
   - Deberías ver solo los 3 productos que acabas de crear
   - NO deberías ver los productos de la primera tienda ✅

---

## ✅ Paso 4: Verificar Aislamiento en Panel Admin

### 4.1 Verificar Productos
- En **📦 Productos** deberías ver **SOLO** los productos de "deportes-juan"
- **NO** deberías ver productos de "mi-primera-tienda"

### 4.2 Verificar Categorías
- En **🗂️ Categorías** deberías ver **SOLO** las categorías de "deportes-juan"
- **NO** deberías ver categorías de "mi-primera-tienda"

### 4.3 Verificar Configuración
- En **⚙️ Configuración** deberías ver **SOLO** los datos de "deportes-juan"

---

## 🌐 Paso 5: Verificar Tiendas Públicas

### 5.1 Probar Primera Tienda
1. Abre una **nueva pestaña** en tu navegador
2. Ve a: http://localhost:5173/tienda-online-mvp/mi-primera-tienda
3. **Verifica:**
   - ✅ Logo de la primera tienda
   - ✅ Teléfono de la primera tienda
   - ✅ Solo productos de la primera tienda
   - ✅ WhatsApp de la primera tienda

### 5.2 Probar Segunda Tienda
1. En **otra pestaña** (o la misma)
2. Ve a: http://localhost:5173/tienda-online-mvp/deportes-juan
3. **Verifica:**
   - ✅ Logo de "deportes-juan"
   - ✅ Teléfono de "deportes-juan"
   - ✅ Solo productos de "deportes-juan"
   - ✅ WhatsApp de "deportes-juan"

### 5.3 Comparar Lado a Lado
1. Abre **ambas URLs en pestañas diferentes**
2. Alterna entre ellas
3. **Confirma que:**
   - Son completamente independientes
   - Cada una muestra solo sus productos
   - Los logos son diferentes
   - Los contactos son diferentes

---

## 🛒 Paso 6: Probar Carrito y WhatsApp

### 6.1 En la Primera Tienda
1. Ve a: http://localhost:5173/tienda-online-mvp/mi-primera-tienda
2. Agrega un producto al carrito
3. Abre el carrito
4. Completa tus datos
5. Haz clic en "Confirmar Pedido por WhatsApp"
6. **Verifica:** Se abre WhatsApp con el número de la **primera tienda**

### 6.2 En la Segunda Tienda
1. Ve a: http://localhost:5173/tienda-online-mvp/deportes-juan
2. Agrega un producto al carrito
3. Abre el carrito
4. Completa tus datos
5. Haz clic en "Confirmar Pedido por WhatsApp"
6. **Verifica:** Se abre WhatsApp con el número de **deportes-juan**

---

## 🔍 Paso 7: Verificar en Supabase

1. Ve a **Supabase** → Proyecto `tienda-online-dev`
2. **Table Editor** → Tabla `products`
3. **Verifica:**
   - Deberías ver productos de ambas tiendas
   - Cada producto tiene un `user_id` diferente
   - Los productos están correctamente asociados

4. **Table Editor** → Tabla `stores`
5. **Verifica:**
   - Deberías ver 2 registros (2 tiendas)
   - Cada una con su `store_name` único
   - Cada una con su `user_id` diferente

---

## ✅ Checklist de Verificación

Marca cada item que funcione correctamente:

### Panel Admin:
- [ ] Usuario 2 solo ve sus productos
- [ ] Usuario 2 solo ve sus categorías
- [ ] Usuario 2 solo ve su configuración
- [ ] No hay "filtración" de datos entre usuarios

### Tiendas Públicas:
- [ ] `/mi-primera-tienda` muestra solo productos de tienda 1
- [ ] `/deportes-juan` muestra solo productos de tienda 2
- [ ] Logos diferentes en cada tienda
- [ ] Contactos diferentes en cada tienda
- [ ] Redes sociales diferentes (si configuradas)

### WhatsApp:
- [ ] Botón flotante usa número correcto en cada tienda
- [ ] Carrito envía a WhatsApp correcto en cada tienda
- [ ] Pedidos se generan con productos correctos

### Base de Datos:
- [ ] Productos tienen `user_id` correcto
- [ ] Categorías tienen `user_id` correcto
- [ ] Stores tienen `user_id` correcto
- [ ] No hay duplicados ni errores

---

## 🎉 Resultado Esperado

Si todo funciona correctamente, deberías tener:

✅ **2 tiendas completamente independientes**
✅ **Datos totalmente aislados**
✅ **URLs únicas funcionando**
✅ **WhatsApp personalizado por tienda**
✅ **Sistema SaaS Multi-Tenant FUNCIONANDO**

---

## 🐛 Si encuentras problemas

Anota cualquier problema que encuentres:
- ¿Qué no funciona?
- ¿Qué esperabas que pasara?
- ¿Qué pasó en realidad?

Y me lo comentas para arreglarlo juntos.

---

**¡Adelante! Sigue los pasos y avísame cuando termines.** 🚀
