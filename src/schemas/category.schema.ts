import { z } from 'zod';

/**
 * Schema de validación para categorías
 * Combina soporte para 'categories' (por tienda) y 'shop_categories' (rubros globales)
 */
export const categorySchema = z.object({
  id: z.union([z.number(), z.string()]),
  // Campos de categories
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  
  // Campos de shop_categories
  label: z.string().optional().nullable(),
  icon_name: z.string().optional().nullable(),
  marker_color: z.string().optional().nullable(),
  
  // Otros campos extendidos / legados
  emoji: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  order: z.number().int().nonnegative().optional().nullable(),
  parent_id: z.union([z.number(), z.string()]).optional().nullable(),
  is_active: z.boolean().optional().nullable().default(true),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable()
});

// Tipo inferido del schema para uso en TypeScript
export type Category = z.infer<typeof categorySchema>;

// Schema para crear categoría
export const createCategorySchema = categorySchema.pick({
  name: true,
  description: true,
  order: true,
  parent_id: true,
  user_id: true
});

// Schema para actualizar categoría
export const updateCategorySchema = categorySchema.partial();
