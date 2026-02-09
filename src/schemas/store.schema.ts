import { z } from 'zod';

/**
 * Schema de validación para tiendas
 */
export const storeSchema = z.object({
  id: z.string().uuid(),
  store_name: z.string().min(1, 'El nombre de la tienda es requerido'),
  user_id: z.string().uuid(),
  logo_url: z.string().url('URL de logo inválida').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  contact_phone: z.string().optional(),
  instagram_url: z.string().url('URL de Instagram inválida').optional().or(z.literal('')),
  whatsapp_number: z.string().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Tipo inferido del schema para uso en TypeScript
export type Store = z.infer<typeof storeSchema>;

// Schema para crear tienda
export const createStoreSchema = storeSchema.pick({
  store_name: true,
  logo_url: true,
  address: true,
  city: true,
  category: true,
  contact_phone: true,
  instagram_url: true,
  whatsapp_number: true
});

// Schema para actualizar tienda
export const updateStoreSchema = storeSchema.partial();
