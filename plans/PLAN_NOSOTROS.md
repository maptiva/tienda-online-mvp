# Plan de Implementacion: Secciones "Nosotros"

## Resumen del Proyecto

Implementar dos secciones "Nosotros":
1. **Clicando Landing Page** (code-landing.html) - Sobre Clicando/Maptiva
2. **Tienda Online** - Modal con dos opciones:
   - "Nosotros" del comercio (texto personalizado desde admin)
   - "Acerca de Clicando" (historia, origen, funcionalidades)

---

## 1. Clicando Landing Page - Seccion "Nosotros"

### Ubicacion
Agregar nueva seccion en `code-landing.html` despues de la seccion de "Características" y antes del mapa interactivo.

### Contenido Propuesto
- Titulo: "Quiene Somos?" o "Sobre Clicando"
- Historia de Clicando: origen, creado para apoyar el emprendimiento
- Funcionalidades principales
- Beneficios para comercios locales
- Mejoras en desarrollo (referenciar PLAN_DESCUENTO_PAGO.md)
- Informacion sobre Maptiva (desarrollador)

### Diseno
- Tarjetas con iconos (similar a seccion Features)
- Fondo con gradiente suave
- Animaciones sutiles

---

## 2. Tienda Online - Modal "Nosotros"

### 2.1 Base de Datos

**Nueva columna en tabla stores:**
```sql
ALTER TABLE stores ADD COLUMN IF NOT EXISTS about_text TEXT;
```

### 2.2 Admin - StoreSettings

**Ubicacion:** `src/pages/StoreSettings.jsx`
- Agregar campo `about_text` al estado `storeData`
- Insertar textarea despues del campo "Slogan" (debajo del Logo)
- El campo debe soportar texto largo
- Guardar junto con los demas datos de la tienda

### 2.3 Frontend - Modal "Nosotros"

**Componente:** `src/components/public/AboutModal.jsx`
- Modal con dos pestanas/tabs:
  - **Pestana 1 - "Nosotros"**: Muestra `about_text` de la tienda (texto personalizado del comercio)
  - **Pestana 2 - "Acerca de Clicando"**: Contenido fijo sobre la plataforma (mismo que en landing page)
- Diseno consistente con la tienda (tema claro/oscuro)
- Boton para cerrar modal

### 2.4 Header - Navegacion

**Modificar:** `src/components/Header.jsx`

**Icono Info (Opcion recomendada):**
- Agregar icono "i" de informacion entre nombre de tienda y searchbar (desktop)
- En movil: entre nombre y carrito
- Al hacer click, abrir el Modal "Nosotros"

### 2.5 Contenido "Acerca de Clicando" (Compartido)

**Contenido del modal/pestana "Acerca de Clicando":**
- Historia: Origen de Clicando, creado para apoyar el emprendimiento local
- Funcionalidades: Catalogo online, WhatsApp integrado, 100% personalizable
- Beneficios: Sin costo de mantenimiento, facil de usar, sin conocimientos tecnicos
- Mejoras en desarrollo: Referenciar planes como PLAN_DESCUENTO_PAGO.md, etc.
- Desarrollado por Maptiva
- Links a redes sociales

---

## Orden de Implementacion Sugerido

1. **SQL**: Agregar columna `about_text` a tabla `stores`
2. **Contenido**: Crear componente con texto "Acerca de Clicando" (compartido)
3. **Admin**: Agregar campo en StoreSettings.jsx
4. **Componente**: Crear AboutModal.jsx con dos pestanas
5. **Header**: Agregar icono info que abra el modal
6. **Landing**: Agregar seccion "Nosotros" en code-landing.html (reutilizar contenido)

---

## Consideraciones Tecnicas

- El campo `about_text` soportara texto con saltos de linea
- Usar estilos existentes de la tienda para consistencia
- Mantener diseno responsive
- El acceso desde header debe ser discreto pero visible
- Reutilizar el mismo contenido de "Acerca de Clicando" en landing y en modal

---

## Archivos a Modificar/Crear

### Archivos a Modificar:
- `sql/nueva_migracion.sql` (agregar columna about_text)
- `src/pages/StoreSettings.jsx` (campo admin)
- `src/components/Header.jsx` (icono info + abrir modal)
- `code-landing.html` (seccion nosotros)

### Archivos a Crear:
- `src/components/public/AboutModal.jsx` (modal con dos pestanas)
- `src/constants/aboutClicando.js` (texto compartido de Clicando)
