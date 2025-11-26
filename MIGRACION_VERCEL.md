# Guía de Migración a Vercel - Paso a Paso

## 🎯 Objetivo
Migrar tu SaaS de GitHub Pages a Vercel para tener deploy automático, mejor rendimiento y dominio personalizado.

---

## 📋 Paso 1: Crear Cuenta en Vercel

### 1.1 Ir a Vercel
1. Abre tu navegador
2. Ve a: **https://vercel.com**
3. Click en **"Sign Up"** (Registrarse)

### 1.2 Conectar con GitHub (RECOMENDADO)
1. Click en **"Continue with GitHub"**
2. Autoriza a Vercel a acceder a tu cuenta de GitHub
3. Selecciona tu cuenta de GitHub (maptiva)
4. Click en **"Install"** o **"Authorize Vercel"**

**¿Por qué GitHub?**
- Deploy automático cuando hagas `git push`
- No necesitas subir archivos manualmente
- Vercel detecta cambios automáticamente

### 1.3 Completar Perfil
1. Nombre: Maptiva (o tu nombre)
2. Email: (se autocompleta de GitHub)
3. Click en **"Continue"**

---

## 📋 Paso 2: Importar tu Proyecto

### 2.1 Desde el Dashboard de Vercel
1. Click en **"Add New..."** → **"Project"**
2. Verás una lista de tus repositorios de GitHub
3. Busca: **"tienda-online-mvp"**
4. Click en **"Import"**

### 2.2 Configurar el Proyecto

**Framework Preset:**
- Vercel detectará automáticamente: **"Vite"** ✅
- Si no, selecciona manualmente: **"Vite"**

**Root Directory:**
- Dejar en: **"./"** (raíz del proyecto)

**Build Command:**
- Vercel detectará: `npm run build` ✅
- Si no, escribir: `npm run build`

**Output Directory:**
- Vercel detectará: `dist` ✅
- Si no, escribir: `dist`

**Install Command:**
- Vercel detectará: `npm install` ✅

---

## 📋 Paso 3: Configurar Variables de Entorno

### 3.1 Agregar Variables
Antes de hacer deploy, necesitas agregar tus credenciales de Supabase:

1. En la página de configuración del proyecto, busca: **"Environment Variables"**
2. Click en **"Add"** o expandir la sección

### 3.2 Agregar Primera Variable

**Name:** `VITE_SUPABASE_URL`

**Value:** `https://lnvgxxzgwubhmhzxwfly.supabase.co`

**Environment:** Seleccionar todas (Production, Preview, Development)

Click en **"Add"**

### 3.3 Agregar Segunda Variable

**Name:** `VITE_SUPABASE_ANON_KEY`

**Value:** (copia desde tu archivo .env local)

Para obtener el valor:
```bash
# En tu terminal local:
type .env
```

Copia el valor completo de `VITE_SUPABASE_ANON_KEY` (es un texto largo que empieza con `eyJ...`)

**Environment:** Seleccionar todas (Production, Preview, Development)

Click en **"Add"**

---

## 📋 Paso 4: Deploy Inicial

### 4.1 Iniciar Deploy
1. Verifica que las variables de entorno estén correctas
2. Click en **"Deploy"**
3. Espera 1-3 minutos mientras Vercel:
   - Clona tu repositorio
   - Instala dependencias (`npm install`)
   - Ejecuta el build (`npm run build`)
   - Despliega a producción

### 4.2 Monitorear el Deploy
Verás un log en tiempo real con:
```
Cloning repository...
Installing dependencies...
Running build command...
Uploading build output...
Deployment ready!
```

### 4.3 ¡Éxito! 🎉
Cuando termine, verás:
- ✅ **"Deployment successful"**
- 🌐 URL de tu sitio: `tu-proyecto.vercel.app`

---

## 📋 Paso 5: Probar tu Sitio

### 5.1 Abrir el Sitio
1. Click en **"Visit"** o en la URL que aparece
2. Se abrirá tu sitio en una nueva pestaña

### 5.2 Verificar que Funcione
Prueba estas URLs (reemplaza `tu-proyecto` con tu URL real):

- Landing: `https://tu-proyecto.vercel.app/`
- Admin: `https://tu-proyecto.vercel.app/admin`
- Tienda 1: `https://tu-proyecto.vercel.app/mi-primera-tienda`
- Tienda 2: `https://tu-proyecto.vercel.app/baby-sweet`

### 5.3 Si Algo No Funciona
1. Ve a la pestaña **"Deployments"** en Vercel
2. Click en el deployment más reciente
3. Ve a **"Build Logs"** para ver errores
4. Verifica que las variables de entorno estén correctas

---

## 📋 Paso 6: Configurar Deploy Automático

### 6.1 ¡Ya Está Configurado! ✅
Vercel automáticamente:
- Detecta cuando haces `git push` a `main`
- Ejecuta el build
- Despliega la nueva versión
- Todo en 1-2 minutos

### 6.2 Probar Deploy Automático
1. Haz un cambio pequeño en tu código local
2. Commit: `git add . && git commit -m "test: Probar deploy automático"`
3. Push: `git push origin main`
4. Ve a Vercel Dashboard → Verás un nuevo deployment iniciándose
5. Espera 1-2 minutos
6. ¡Tu sitio se actualiza automáticamente!

---

## 📋 Paso 7: Configurar Dominio Personalizado (Opcional)

### 7.1 Si Tienes un Dominio
1. En Vercel Dashboard → Tu proyecto
2. Ve a **"Settings"** → **"Domains"**
3. Click en **"Add"**
4. Escribe tu dominio: `tudominio.com`
5. Vercel te dará instrucciones de DNS
6. Configura los registros en tu proveedor de dominio
7. Espera 24-48hs para propagación

### 7.2 Si NO Tienes Dominio
Puedes usar el dominio gratuito de Vercel:
```
tu-proyecto.vercel.app
```

O comprar uno después cuando estés listo.

---

## 📋 Paso 8: Limpiar GitHub Pages (Opcional)

### 8.1 Desactivar GitHub Pages
1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. En **"Source"**, selecciona: **"None"**
4. Click en **"Save"**

### 8.2 Eliminar Rama gh-pages (Opcional)
```bash
git push origin --delete gh-pages
```

### 8.3 Limpiar package.json
Puedes eliminar el script de deploy de GitHub Pages:

Abre `package.json` y elimina:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist",
```

Y desinstalar gh-pages:
```bash
npm uninstall gh-pages
```

---

## ✅ Checklist Final

- [ ] Cuenta de Vercel creada
- [ ] Proyecto importado desde GitHub
- [ ] Variables de entorno configuradas
- [ ] Deploy inicial exitoso
- [ ] Sitio funcionando correctamente
- [ ] Deploy automático probado
- [ ] Dominio configurado (opcional)
- [ ] GitHub Pages desactivado (opcional)

---

## 🎊 ¡Felicitaciones!

Tu SaaS ahora está en Vercel con:
- ✅ Deploy automático
- ✅ SSL gratis
- ✅ Mejor rendimiento
- ✅ Dominio personalizable
- ✅ Infraestructura profesional

---

## 🆘 Solución de Problemas

### Error: "Build failed"
- Verifica que las variables de entorno estén correctas
- Revisa los logs de build en Vercel
- Asegúrate de que `npm run build` funcione en local

### Error: "404 Not Found" en rutas
- Vercel maneja SPAs automáticamente
- No necesitas el hack de `404.html`
- Si persiste, agrega `vercel.json` (ver abajo)

### Error: "Cannot connect to Supabase"
- Verifica que `VITE_SUPABASE_URL` esté correcta
- Verifica que `VITE_SUPABASE_ANON_KEY` esté correcta
- Asegúrate de que las variables tengan el prefijo `VITE_`

---

## 📄 Archivo vercel.json (Si Necesitas)

Si tienes problemas con routing, crea este archivo en la raíz:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔗 Enlaces Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentación Vercel:** https://vercel.com/docs
- **Soporte Vercel:** https://vercel.com/support

---

**¿Listo para empezar?** Abre https://vercel.com y sigue los pasos. 🚀
