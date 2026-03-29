import { z } from 'zod';

/**
 * Schema de validación para tiendas
 */
export const storeSchema = z.object({
  id: z.union([z.string(), z.number()]),
  store_name: z.string().min(1, 'El nombre de la tienda es requerido'),
  user_id: z.string().uuid().optional().nullable(),
  store_slug: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  instagram_url: z.string().optional().nullable().or(z.literal('')),
  whatsapp_number: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  is_active: z.boolean().optional(),
  is_demo: z.boolean().optional().nullable(),
  coming_soon: z.boolean().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  discount_settings: z.object({
    enabled: z.boolean().optional(),
    cash_discount: z.number().optional(),
    transfer_discount: z.number().optional()
  }).optional().nullable()
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
