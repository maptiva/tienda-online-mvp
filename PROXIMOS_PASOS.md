# 🚀 Próximos Pasos - Migración SaaS

## 📋 Checklist Rápido

### Sesión 2: Frontend Público Dinámico

- [ ] **1. Modificar rutas en `App.jsx`**
  - Cambiar `/` a `/:storeName`
  - Mantener rutas admin sin cambios

- [ ] **2. Crear hook `useStoreByName`**
  - Hook para obtener datos de tienda por nombre
  - Consultar tabla `stores` con filtro por `store_name`

- [ ] **3. Modificar `PublicLayout.jsx`**
  - Obtener `storeName` de URL
  - Usar hook `useStoreByName`
  - Pasar datos de tienda a componentes hijos
  - Manejar caso de tienda no encontrada

- [ ] **4. Modificar `Header.jsx`**
  - Recibir props de tienda
  - Mostrar logo dinámico
  - Mostrar nombre de tienda
  - Mostrar contacto/redes dinámicos

- [ ] **5. Modificar `ProductList.jsx`**
  - Recibir `user_id` de la tienda
  - Filtrar productos por ese `user_id`
  - Mostrar mensaje si no hay productos

- [ ] **6. Actualizar políticas RLS**
  - Permitir lectura pública de productos
  - Permitir lectura pública de categorías
  - Mantener restricciones de escritura

### Sesión 3: Pruebas y Validación

- [ ] **7. Crear segunda tienda de prueba**
  - Nuevo usuario en Supabase
  - Configurar tienda con nombre diferente
  - Crear productos de prueba

- [ ] **8. Probar aislamiento**
  - Verificar URLs independientes
  - Verificar que cada tienda muestre solo sus productos
  - Verificar que admin muestre solo datos propios

- [ ] **9. Mejorar UX**
  - Página 404 para tiendas no encontradas
  - Loaders mientras cargan datos
  - Mensajes de error amigables

### Sesión 4: Migración y Deploy

- [ ] **10. Migrar datos de producción**
  - Exportar productos de "David CAMISETAS"
  - Importar a `tienda-online-dev`
  - Verificar imágenes

- [ ] **11. Configurar para producción**
  - Actualizar `.env` para producción
  - Probar build: `npm run build`
  - Deploy a GitHub Pages

- [ ] **12. Verificación final**
  - Probar todas las funcionalidades
  - Verificar URLs públicas
  - Confirmar que todo funciona

---

## 🎯 Prioridad Alta (Hacer Primero)

1. **Frontend público dinámico** (Pasos 1-5)
2. **Actualizar políticas RLS para lectura pública** (Paso 6)
3. **Probar con segunda tienda** (Pasos 7-8)

---

## 📝 Código de Referencia para Próxima Sesión

### Hook `useStoreByName` (a crear)

```javascript
// src/hooks/useStoreByName.js
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useStoreByName = (storeName) => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('store_name', storeName)
          .single();

        if (error) throw error;
        setStore(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (storeName) {
      fetchStore();
    }
  }, [storeName]);

  return { store, loading, error };
};
```

### Políticas RLS para Lectura Pública

```sql
-- Permitir lectura pública de productos
CREATE POLICY "Public can view all products"
  ON products FOR SELECT
  USING (true);

-- Permitir lectura pública de categorías
CREATE POLICY "Public can view all categories"
  ON categories FOR SELECT
  USING (true);
```

---

## ⏱️ Estimación de Tiempo

- **Sesión 2:** 2-3 horas (Frontend público)
- **Sesión 3:** 1-2 horas (Pruebas)
- **Sesión 4:** 1-2 horas (Migración y deploy)

**Total restante:** ~5-7 horas de trabajo

---

## 🔗 Enlaces Útiles

- **Supabase Dev:** https://supabase.com (proyecto: tienda-online-dev)
- **Localhost:** http://localhost:5173/tienda-online-mvp/
- **Plan Original:** Ver archivo `Plan_SaaS.txt`

---

¡Cuando retomes, empieza por el **Paso 1** del checklist! 🚀
