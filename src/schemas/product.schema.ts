import { z } from 'zod';

/**
 * Schema de validación para productos
 * Alineado con la interfaz Product de src/interfaces/Producto.ts
 */
export const productSchema = z.object({
  id: z.union([z.string().uuid(), z.number().int()]),
  display_id: z.number().int().positive().optional(),
  sku: z.string().nullable().optional(),
  name: z.string().min(1, 'El nombre del producto es requerido'),
  price: z.number().nonnegative('El precio no puede ser negativo'),
  category_id: z.number().int().positive(),
  image_url: z.string().url('URL de imagen inválida').optional().or(z.literal('')).nullable(),
  categories: z.object({
    name: z.string()
  }).optional().nullable(),
  price_on_request: z.boolean().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  stock: z.number().int().nonnegative().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable()
});

// Tipo inferido del schema para uso en TypeScript
export type Product = z.infer<typeof productSchema>;

// Schema para crear producto (campos requeridos)
export const createProductSchema = productSchema.pick({
  name: true,
  price: true,
  category_id: true,
  image_url: true,
  description: true,
  stock: true
});

// Schema para actualizar producto (todos opcionales excepto id)
export const updateProductSchema = productSchema.partial();
