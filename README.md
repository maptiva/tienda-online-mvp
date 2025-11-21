# Tienda Online SaaS - Multi-Tenant

Plataforma SaaS multi-tenant para tiendas online con personalización completa por cliente.

## 🚀 Características

- **Multi-tenant:** Múltiples tiendas independientes en una sola plataforma
- **Personalización completa:** Logo, colores, información de contacto por tienda
- **WhatsApp integrado:** Botón flotante y carrito con envío directo
- **Gestión de productos:** CRUD completo con imágenes
- **Categorías:** Filtrado dinámico de productos
- **Responsive:** Diseño adaptable a móviles y tablets

## 🛠️ Tecnologías

- **Frontend:** React + Vite
- **Base de Datos:** Supabase (PostgreSQL)
- **Hosting:** GitHub Pages
- **Autenticación:** Supabase Auth
- **Storage:** Supabase Storage

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/maptiva/tienda-online-mvp.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar scripts SQL en Supabase (en orden)
# Ver carpeta /sql/

# Iniciar servidor de desarrollo
npm run dev
```

## 🌐 Deploy

```bash
# Build para producción
npm run build

# Deploy a GitHub Pages
npm run deploy
```

## 📁 Estructura del Proyecto

```
/src
  /components     # Componentes reutilizables
  /pages          # Páginas principales
  /hooks          # Custom hooks
  /context        # Context API
  /services       # Servicios (Supabase)
  /store          # Estado global (Zustand)
/sql              # Scripts de base de datos
/public           # Archivos estáticos
```

## 🔐 Configuración de Base de Datos

Ejecutar los scripts SQL en orden (01 a 10) en el SQL Editor de Supabase:

1. `01_create_base_tables.sql` - Tablas base
2. `02_create_stores_multitenant.sql` - Multi-tenant
3. `03_implement_rls.sql` - Seguridad RLS
4. `04_configure_storage.sql` - Storage para logos
5. `05_configure_product_images_storage.sql` - Storage para productos
6. `06_public_read_policies.sql` - Políticas públicas
7. `07_add_whatsapp_message.sql` - WhatsApp personalizado
8. `08_update_whatsapp_messages.sql` - Actualizar mensajes
9. `09_add_address_hours.sql` - Domicilio y horarios
10. `10_add_store_slug.sql` - URLs amigables

## 📝 Licencia

Proyecto privado - Todos los derechos reservados

## 👨‍💻 Desarrollado por

[Maptiva](https://maptiva.github.io/maptiva/)
