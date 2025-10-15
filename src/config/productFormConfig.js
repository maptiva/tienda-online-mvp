
export const formConfig = [
  { name: 'name', label: 'Nombre del Producto', type: 'text', required: true },
  { name: 'description', label: 'Descripción', type: 'textarea', required: false },
  { name: 'price', label: 'Precio', type: 'number', required: true },
  { name: 'category', label: 'Categoría', type: 'text', required: false },
  { name: 'image_url', label: 'URL de Imagen', type: 'file', required: false }, // This will be replaced by file input later
  // Add other fields as necessary based on your products table schema
];
