import { z } from 'zod';

/**
 * Schema de validación para items del carrito
 */
export const cartItemSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  price: z.number().nonnegative('El precio no puede ser negativo'),
  name: z.string().optional(),
  image_url: z.string().url('URL de imagen inválida').optional()
});

// Tipo inferido del schema para uso en TypeScript
export type CartItem = z.infer<typeof cartItemSchema>;

// Schema para el carrito completo
export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  total: z.number().nonnegative(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Tipo inferido del schema de carrito completo
export type Cart = z.infer<typeof cartSchema>;
