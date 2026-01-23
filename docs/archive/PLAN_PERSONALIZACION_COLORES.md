# Plan: Personalización de Colores por Tienda

## 🎯 Objetivo

Permitir que cada usuario personalice los colores de su tienda desde el panel de administración, aplicando automáticamente los cambios en toda la tienda pública.

---

## 🎨 Colores Personalizables (Propuesta)

### Nivel 1: Básico (MVP)
- **Color Primario** - Botones principales, enlaces, acentos
- **Color Secundario** - Botones secundarios, hover states

### Nivel 2: Intermedio (Futuro)
- Color de fondo del header
- Color de texto del header
- Color de fondo de cards
- Color de precios

### Nivel 3: Avanzado (Futuro)
- Paleta completa personalizable
- Modo oscuro/claro
- Gradientes personalizados

---

## 🏗️ Arquitectura Propuesta

### 1. Base de Datos (Supabase)

Agregar columnas a la tabla `stores`:

\`\`\`sql
ALTER TABLE stores 
ADD COLUMN primary_color VARCHAR(7) DEFAULT '#ff6900',
ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#f97316';
\`\`\`

### 2. Backend (StoreSettings.jsx)

Agregar campos de color en el formulario:

\`\`\`jsx
<div>
  <label>Color Primario</label>
  <input 
    type="color" 
    name="primary_color"
    value={storeData.primary_color || '#ff6900'}
    onChange={handleInputChange}
  />
</div>
\`\`\`

### 3. Frontend (PublicLayout.jsx)

Inyectar variables CSS dinámicas:

\`\`\`jsx
useEffect(() => {
  if (storeConfig?.primary_color) {
    document.documentElement.style.setProperty('--color-primary', storeConfig.primary_color);
    document.documentElement.style.setProperty('--color-secondary', storeConfig.secondary_color);
  }
}, [storeConfig]);
\`\`\`

### 4. Componentes (ProductCard, ProductList, etc.)

Reemplazar colores hardcodeados con variables CSS:

\`\`\`jsx
// Antes:
className="bg-orange-500 hover:bg-orange-600"

// Después:
className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
\`\`\`

---

## 📋 Implementación Paso a Paso

### Fase 1: Preparación (Base de Datos)
- [ ] Crear migración SQL para agregar columnas de color
- [ ] Ejecutar migración en Supabase
- [ ] Verificar que las columnas existan

### Fase 2: Panel de Administración
- [ ] Modificar `StoreSettings.jsx`
- [ ] Agregar inputs de tipo `color` para primario y secundario
- [ ] Agregar preview en tiempo real
- [ ] Guardar colores en base de datos

### Fase 3: Aplicación en Tienda Pública
- [ ] Modificar `PublicLayout.jsx` para cargar colores
- [ ] Inyectar variables CSS dinámicas
- [ ] Crear utilidad para generar variantes (hover, dark, light)

### Fase 4: Actualizar Componentes
- [ ] `ProductCard.jsx` - Botones y precios
- [ ] `ProductList.jsx` - Botón "Ver más"
- [ ] `Header.jsx` - Enlaces y botones
- [ ] `CartModal.jsx` - Botón de checkout
- [ ] `WhatsAppButton.jsx` - Botón flotante

### Fase 5: Mejoras UX
- [ ] Agregar paleta de colores predefinidos
- [ ] Preview en tiempo real en StoreSettings
- [ ] Validación de contraste (accesibilidad)
- [ ] Reset a colores por defecto

---

## 🎨 Ejemplo de UI en StoreSettings

\`\`\`jsx
<div className="color-customization">
  <h3>🎨 Personalización de Colores</h3>
  
  <div className="color-picker-group">
    <div>
      <label>Color Primario</label>
      <input type="color" value={primary_color} />
      <span>{primary_color}</span>
    </div>
    
    <div>
      <label>Color Secundario</label>
      <input type="color" value={secondary_color} />
      <span>{secondary_color}</span>
    </div>
  </div>
  
  <div className="color-presets">
    <p>Paletas predefinidas:</p>
    <button onClick={() => applyPreset('orange')}>🟠 Naranja</button>
    <button onClick={() => applyPreset('blue')}>🔵 Azul</button>
    <button onClick={() => applyPreset('green')}>🟢 Verde</button>
    <button onClick={() => applyPreset('purple')}>🟣 Morado</button>
  </div>
  
  <div className="preview">
    <h4>Vista Previa:</h4>
    <button style={{backgroundColor: primary_color}}>
      Botón Primario
    </button>
    <button style={{backgroundColor: secondary_color}}>
      Botón Secundario
    </button>
  </div>
</div>
\`\`\`

---

## 🛠️ Utilidad para Generar Variantes

\`\`\`javascript
// src/utils/colorUtils.js

export function generateColorVariants(hexColor) {
  // Convertir hex a HSL
  const hsl = hexToHSL(hexColor);
  
  return {
    base: hexColor,
    light: adjustLightness(hsl, 10),  // +10% lightness
    dark: adjustLightness(hsl, -10),  // -10% lightness
    hover: adjustLightness(hsl, -15), // Para hover states
  };
}
\`\`\`

---

## ⚠️ Consideraciones

### Accesibilidad
- Validar contraste mínimo (WCAG AA: 4.5:1 para texto)
- Advertir si el color elegido tiene bajo contraste

### Performance
- Inyectar CSS variables solo una vez al cargar la tienda
- No re-renderizar componentes innecesariamente

### Compatibilidad
- CSS variables son soportadas por todos los navegadores modernos
- Fallback a colores por defecto si no hay personalización

---

## 🚀 Estimación de Tiempo

- **Fase 1 (DB):** 15 minutos
- **Fase 2 (Admin):** 1-2 horas
- **Fase 3 (Inyección CSS):** 30 minutos
- **Fase 4 (Componentes):** 2-3 horas
- **Fase 5 (UX):** 1-2 horas

**Total estimado:** 5-8 horas de desarrollo

---

## 📝 Notas Adicionales

### Alternativas Evaluadas

1. **Tailwind JIT con colores dinámicos**
   - ❌ No funciona bien con colores en runtime
   - ✅ CSS variables es mejor opción

2. **Styled Components**
   - ✅ Funciona, pero agrega dependencia
   - ❌ CSS variables es más simple

3. **Inline styles**
   - ✅ Funciona
   - ❌ Pierde beneficios de Tailwind

**Decisión:** CSS Variables + Tailwind

---

## 🎯 Próximos Pasos

1. ¿Aprobar el plan?
2. ¿Comenzar con Fase 1 (Base de Datos)?
3. ¿Ajustar alcance (más o menos colores personalizables)?
