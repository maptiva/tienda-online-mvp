
export const formConfig = [
  { name: 'sku', label: 'Código / SKU (Opcional)', type: 'text', required: false },
  { name: 'name', label: 'Nombre del Producto', type: 'text', required: true },
  { name: 'description', label: 'Descripción', type: 'textarea', required: false },
  { name: 'price', label: 'Precio', type: 'number', required: true },
  { name: 'price_on_request', label: 'Precio a consultar (Ocultar precio y mostrar botón WhatsApp)', type: 'checkbox', required: false },
  { name: 'category_id', label: 'Categoría', type: 'select', required: true },
  { name: 'image_url', label: 'URL de Imagen', type: 'file', required: false }, // This will be replaced by file input later
  // Add other fields as necessary based on your products table schema
];
