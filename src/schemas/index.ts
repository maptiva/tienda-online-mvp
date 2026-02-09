// Schemas de Productos
export { productSchema, createProductSchema, updateProductSchema, type Product } from './product.schema';

// Schemas de Categorías
export { categorySchema, createCategorySchema, updateCategorySchema, type Category } from './category.schema';

// Schemas de Tiendas
export { storeSchema, createStoreSchema, updateStoreSchema, type Store } from './store.schema';

// Schemas del Carrito
export { cartItemSchema, cartSchema, type CartItem, type Cart } from './cart.schema';

// Schemas de CRM
export { leadSchema, createLeadSchema, updateLeadSchema, type Lead } from './lead.schema';
export { clientSchema, createClientSchema, updateClientSchema, type Client } from './client.schema';
export { paymentSchema, registerPaymentSchema, updatePaymentSchema, type Payment } from './payment.schema';
