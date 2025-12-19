# Plan: Mejoras UX/UI Header, Footer y Landing Page

## 🎯 Objetivos

1. **Header más limpio y responsive** - Mover info de contacto al footer, agregar menú hamburguesa móvil
2. **Footer más informativo** - Centralizar info de contacto y redes sociales
3. **Landing page actualizada** - Mejorar copy y call-to-action
4. **Naming del servicio** - Definir nombre para dominio .com.ar

---

## 🎨 Nombre Elegido: **Clicando** ✅

- **Dominio:** `clicando.com.ar`
- **Por qué:** 
  - Gerundio argentino que transmite acción continua
  - Único y memorable
  - Fácil de pronunciar y recordar
  - Suena moderno pero natural
  - Corto (8 letras)
- **Tagline:** "Seguí clicando, seguí vendiendo"
- **Branding:** clicando (todo minúscula para look tech/moderno)

---

## 📱 Cambios en Header

### Estado Actual:
```
┌─────────────────────────────────────────┐
│ [Dirección] [Teléfono] [Horario]       │ ← Se oculta al scroll
├─────────────────────────────────────────┤
│ [Logo + Nombre]  [IG][FB][🛒][🌙]      │ ← Siempre visible
└─────────────────────────────────────────┘
```

### Estado Propuesto (Desktop):
```
┌─────────────────────────────────────────┐
│ [Logo + Nombre]  [🔍 Buscar...]  [🛒][🌙]│
└─────────────────────────────────────────┘
```

### Estado Propuesto (Móvil):
```
┌─────────────────────────────────────────┐
│ [☰]  [Logo]  [🛒][🌙]                   │
└─────────────────────────────────────────┘

Menú desplegable (al tocar ☰):
┌─────────────────────────────────────────┐
│ 🔍 Buscar productos...                  │
│ ────────────────────────────────────    │
│ 🏠 Inicio                               │
│ 📦 Productos                            │
│ 📞 Contacto                             │
│ ────────────────────────────────────    │
│ 📍 [Dirección]                          │
│ ☎️  [Teléfono]                          │
│ 🕐 [Horario]                            │
│ ────────────────────────────────────    │
│ [Instagram] [Facebook]                  │
└─────────────────────────────────────────┘
```

### Cambios Específicos:

1. **Eliminar** sección superior con dirección/teléfono/horario (mover al footer)
2. **Agregar** barra de búsqueda en el centro (desktop) o en menú (móvil)
3. **Agregar** menú hamburguesa para móvil
4. **Mover** redes sociales al menú móvil
5. **Mantener** carrito y tema siempre visibles

---

## 📄 Cambios en Footer

### Estado Actual:
```
┌─────────────────────────────────────────┐
│ © 2025 [Tienda] • Desarrollado por Maptiva │
│ [Disclaimer largo]                      │
│ [Términos] | [Privacidad] | [Legal]    │
└─────────────────────────────────────────┘
```

### Estado Propuesto:
```
┌─────────────────────────────────────────────────────────┐
│                    INFORMACIÓN DE CONTACTO              │
│  📍 [Dirección]    ☎️ [Teléfono]    🕐 [Horario]       │
│  [Instagram] [Facebook]                                 │
├─────────────────────────────────────────────────────────┤
│  [Términos] | [Privacidad] | [Aviso Legal]            │
│  © 2025 [Tienda] • Desarrollado por [Vitrina Digital]  │
│  [Disclaimer]                                           │
└─────────────────────────────────────────────────────────┘
```

### Cambios Específicos:

1. **Agregar** sección "Información de Contacto" arriba
2. **Incluir** dirección, teléfono, horario (del header)
3. **Incluir** redes sociales (Instagram, Facebook)
4. **Reorganizar** para mejor jerarquía visual
5. **Actualizar** "Desarrollado por Maptiva" → "Desarrollado por [Nombre Final]"

---

## 🏠 Cambios en Landing Page

### Cambios de Texto:

#### ANTES:
```javascript
<h1>Tu Tienda Online</h1>
<p>Plataforma profesional de comercio electrónico</p>

<Link to="/login">Acceder a mi Tienda</Link>
<p>¿Eres cliente? Accede directamente a tu tienda usando el enlace que te compartieron</p>
```

#### DESPUÉS:
```javascript
<h1>clicando</h1>
<p>Tu tienda online profesional en minutos</p>

<Link to="/login">Acceder a mi Tienda</Link>
<p>¿Eres cliente? Accede directamente utilizando tu usuario</p>

{/* NUEVO: Botón secundario */}
<Link to="/contacto" className="secondary-button">
  ¿Aún no tienes cuenta en Clicando?
</Link>
```

### Cambios Específicos:

1. **Actualizar** título principal con nombre final del servicio
2. **Cambiar** texto de ayuda: "usando el enlace que te compartieron" → "utilizando tu usuario"
3. **Agregar** botón secundario: "¿Aún no tienes tu Tienda Online?"
4. **Mejorar** copy para ser más directo y accionable

---

## 🔍 Nueva Funcionalidad: Búsqueda

### Componente SearchBar (Nuevo)

**Ubicación:** `src/components/SearchBar.jsx`

**Funcionalidad:**
- Input de búsqueda con icono
- Filtrado en tiempo real de productos
- Responsive (full width en móvil, width fijo en desktop)
- Integración con contexto de productos

**Ejemplo:**
```jsx
<SearchBar 
  onSearch={(query) => filterProducts(query)}
  placeholder="Buscar productos..."
/>
```

---

## 📱 Nuevo Componente: MobileMenu

### Componente MobileMenu (Nuevo)

**Ubicación:** `src/components/MobileMenu.jsx`

**Funcionalidad:**
- Menú hamburguesa (☰) que abre drawer lateral
- Incluye:
  - Barra de búsqueda
  - Links de navegación
  - Info de contacto
  - Redes sociales
- Animación suave de apertura/cierre
- Overlay oscuro al abrir

---

## 📋 Archivos a Modificar

### 1. Header.jsx
- ✂️ Eliminar sección superior (dirección, teléfono, horario)
- ➕ Agregar SearchBar (desktop)
- ➕ Agregar botón menú hamburguesa (móvil)
- ➕ Agregar MobileMenu component
- 🔄 Reorganizar layout responsive

### 2. Footer.tsx
- ➕ Agregar sección "Información de Contacto"
- ➕ Recibir props: `storeData` (dirección, teléfono, horario, redes)
- 🔄 Reorganizar estructura visual
- 📝 Actualizar texto "Desarrollado por..."

### 3. LandingPage.jsx
- 📝 Actualizar título principal
- 📝 Cambiar texto de ayuda
- ➕ Agregar botón secundario CTA
- 🎨 Mejorar copy general

### 4. PublicLayout.jsx (o donde se use Footer)
- 🔄 Pasar `storeData` como prop al Footer

### 5. Nuevos Archivos
- ➕ `src/components/SearchBar.jsx`
- ➕ `src/components/MobileMenu.jsx`

---

## 🎨 Diseño Responsive

### Breakpoints:

```css
/* Móvil: < 768px */
- Menú hamburguesa visible
- Logo centrado
- Carrito y tema a la derecha
- SearchBar en menú desplegable

/* Tablet/Desktop: >= 768px */
- Menú hamburguesa oculto
- Logo a la izquierda
- SearchBar en el centro
- Carrito y tema a la derecha
```

---

## ✅ Verificación

### Tests Manuales:

#### 1. Header Responsive
- [ ] En desktop: ver SearchBar en el centro
- [ ] En móvil: ver menú hamburguesa
- [ ] Abrir menú móvil: ver todos los elementos
- [ ] Verificar que carrito y tema siempre visibles

#### 2. Footer con Info
- [ ] Ver dirección, teléfono, horario en footer
- [ ] Ver redes sociales en footer
- [ ] Verificar responsive (stack en móvil)

#### 3. Landing Page
- [ ] Ver nuevo texto actualizado
- [ ] Ver botón secundario CTA
- [ ] Probar ambos botones (login y contacto)

#### 4. Búsqueda
- [ ] Escribir en SearchBar
- [ ] Ver resultados filtrados en tiempo real
- [ ] Probar en móvil (desde menú)

#### 5. Navegación Móvil
- [ ] Abrir menú hamburguesa
- [ ] Navegar por las opciones
- [ ] Cerrar menú (botón X o overlay)

---

## 🚀 Fases de Implementación

### Fase 1: Componentes Nuevos (1-2 horas)
1. Crear `SearchBar.jsx`
2. Crear `MobileMenu.jsx`
3. Probar componentes aislados

### Fase 2: Header Refactor (1 hora)
1. Eliminar sección superior
2. Integrar SearchBar
3. Integrar MobileMenu
4. Ajustar responsive

### Fase 3: Footer Refactor (30 min)
1. Agregar sección de contacto
2. Recibir y mostrar `storeData`
3. Reorganizar layout

### Fase 4: Landing Page (15 min)
1. Actualizar textos
2. Agregar botón secundario
3. Ajustar estilos

### Fase 5: Testing (30 min)
1. Probar en desktop
2. Probar en móvil
3. Probar en tablet
4. Verificar todas las funcionalidades

**Tiempo total estimado:** 4-5 horas

---

## 💡 Decisiones de Diseño

### Colores:
- Mantener naranja (#ff6900) como color primario
- Mantener tema claro/oscuro existente

### Iconos:
- Usar react-icons (ya instalado)
- Menú hamburguesa: `HiMenu` / `HiX`
- Búsqueda: `HiSearch`

### Animaciones:
- Menú móvil: slide-in desde izquierda
- Overlay: fade-in
- Duración: 300ms (consistente con tema actual)

---

## ⚠️ Consideraciones Importantes

### No Romper:
- ✅ Funcionalidad de carrito
- ✅ Toggle de tema claro/oscuro
- ✅ Scroll behavior del header
- ✅ Links de redes sociales
- ✅ Avisos legales en footer

### Mantener Compatibilidad:
- ✅ Todas las props existentes
- ✅ Contextos (Cart, Theme)
- ✅ Rutas de navegación

---

## 🎯 Resultado Final Esperado

### Desktop:
```
┌────────────────────────────────────────────────────┐
│ [Logo] [🔍 Buscar productos...]  [🛒 2] [🌙]      │
└────────────────────────────────────────────────────┘

[Productos en grid...]

┌────────────────────────────────────────────────────┐
│         📍 Dirección  ☎️ Teléfono  🕐 Horario      │
│              [Instagram] [Facebook]                │
│  ──────────────────────────────────────────────   │
│  Términos | Privacidad | Aviso Legal              │
│  © 2025 Tienda • Desarrollado por Vitrina Digital │
└────────────────────────────────────────────────────┘
```

### Móvil:
```
┌──────────────────────┐
│ [☰] [Logo] [🛒2][🌙] │
└──────────────────────┘

[Productos en lista...]

┌──────────────────────┐
│   📍 Dirección       │
│   ☎️ Teléfono        │
│   🕐 Horario         │
│   [IG] [FB]          │
│  ──────────────────  │
│  Términos | Legal    │
│  © 2025 Tienda       │
└──────────────────────┘
```

---

## 📝 Próximos Pasos

1. **Decidir nombre del servicio** (de las 6 opciones propuestas)
2. **Aprobar este plan**
3. **Implementar fase por fase**
4. **Probar en local**
5. **Subir a producción**

---

## 🎉 Bonus: Felicitaciones por tu Primer Cliente!

Este rediseño hará que tu plataforma se vea aún más profesional para atraer más clientes. 🚀
