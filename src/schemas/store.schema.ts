import { z } from 'zod';

/**
 * Schema de validación para tiendas
 * Sincronizado con la base de datos Supabase lnvgxxzgwubhmhzxwfly (Plan Pro)
 */
export const storeSchema = z.object({
  id: z.union([z.string(), z.number()]),
  user_id: z.string().uuid(),
  store_name: z.string().min(1, 'El nombre de la tienda es requerido'),
  store_slug: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  instagram_url: z.string().optional().nullable().or(z.literal('')),
  facebook_url: z.string().optional().nullable().or(z.literal('')),
  tiktok_url: z.string().optional().nullable().or(z.literal('')),
  business_hours: z.string().optional().nullable(),
  whatsapp_number: z.string().optional().nullable(),
  whatsapp_message: z.string().optional().nullable().or(z.literal('')),
  short_description: z.string().optional().nullable().or(z.literal('')),
  about_text: z.string().optional().nullable().or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  show_map: z.boolean().optional().nullable().default(true),
  is_active: z.boolean().optional().nullable(),
  is_open: z.boolean().optional().nullable().default(true),
  is_demo: z.boolean().optional().nullable(),
  coming_soon: z.boolean().optional().nullable(),
  client_id: z.union([z.string(), z.number()]).optional().nullable(),
  enable_stock: z.boolean().optional().nullable(),
  payment_exempt: z.boolean().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  discount_settings: z.object({
    enabled: z.boolean().optional(),
    cash_discount: z.number().optional(),
    transfer_discount: z.number().optional()
  }).optional().nullable().or(z.any()) // Permitir Json genérico o estructura específica
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
  whatsapp_number: true,
  user_id: true
});

// Schema para actualizar tienda
export const updateStoreSchema = storeSchema.partial();
