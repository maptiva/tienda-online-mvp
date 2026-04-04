import { z } from 'zod';

/**
 * Schema de validación para productos
 * Sincronizado con la base de datos Supabase lnvgxxzgwubhmhzxwfly
 */
export const productSchema = z.object({
  id: z.union([z.string().uuid(), z.number().int()]),
  display_id: z.number().int().positive().optional().nullable(),
  sku: z.string().nullable().optional(),
  name: z.string().min(1, 'El nombre del producto es requerido'),
  price: z.number().nonnegative('El precio no puede ser negativo'),
  compare_at_price: z.number().nonnegative().optional().nullable(),
  category_id: z.number().int().positive().nullable().optional(),
  image_url: z.string().optional().or(z.literal('')).nullable(),
  description: z.string().optional().nullable(),
  price_on_request: z.boolean().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  backup_price: z.number().nonnegative().optional().nullable(),
  gallery_images: z.array(z.string()).optional().nullable(),
  stock: z.number().int().nonnegative().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  // Campo virtual para joins en el frontend
  categories: z.object({
    name: z.string()
  }).optional().nullable()
});

// Tipo inferido del schema para uso en TypeScript
export type Product = z.infer<typeof productSchema>;

// Schema para crear producto
export const createProductSchema = productSchema.pick({
  name: true,
  price: true,
  compare_at_price: true,
  category_id: true,
  image_url: true,
  description: true,
  stock: true,
  price_on_request: true
});

// Schema para actualizar producto
export const updateProductSchema = productSchema.partial();
