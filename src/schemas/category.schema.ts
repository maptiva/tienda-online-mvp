import { z } from 'zod';

/**
 * Schema de validación para categorías
 * Alineado con la interfaz Categoria de src/interfaces/Categoria.ts
 */
export const categorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  description: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  user_id: z.string().uuid().optional(),
  parent_id: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Tipo inferido del schema para uso en TypeScript
export type Category = z.infer<typeof categorySchema>;

// Schema para crear categoría
export const createCategorySchema = categorySchema.pick({
  name: true,
  description: true,
  order: true,
  parent_id: true
});

// Schema para actualizar categoría
export const updateCategorySchema = categorySchema.partial();
