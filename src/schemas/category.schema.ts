import { z } from 'zod';

/**
 * Schema de validación para categorías
 * Alineado con la interfaz Categoria de src/interfaces/Categoria.ts
 */
export const categorySchema = z.object({
  id: z.union([z.number(), z.string()]),
  label: z.string().optional().nullable(), // Campo real usado en BD para shop_categories
  name: z.string().optional().nullable(), // Mantener name por compatibilidad
  description: z.string().optional().nullable(),
  emoji: z.string().optional().nullable(),
  icon_name: z.string().optional().nullable(), // Campo para iconos FaIcons
  marker_color: z.string().optional().nullable(), // Color del marcador en el mapa
  slug: z.string().optional().nullable(),
  order: z.number().int().nonnegative().optional().nullable(),
  user_id: z.string().optional().nullable(),
  parent_id: z.union([z.number(), z.string()]).optional().nullable(),
  is_active: z.boolean().optional().nullable(),
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
  parent_id: true
});

// Schema para actualizar categoría
export const updateCategorySchema = categorySchema.partial();
