import { z } from 'zod';

/**
 * Schema de validación para clientes del CRM
 */
export const clientSchema = z.object({
  id: z.union([z.string().uuid(), z.number()]),
  name: z.string().min(1, 'El nombre del cliente es requerido'),
  contact_email: z.string().optional().nullable(),
  contact_phone: z.string().optional(),
  billing_info: z.any().optional().nullable(), // JSON/Object para información de facturación
  notes: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
  enable_stock: z.boolean().optional(),
  payment_exempt: z.boolean().optional(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable()
});

// Tipo inferido del schema para uso en TypeScript
export type Client = z.infer<typeof clientSchema>;

// Schema para crear cliente
export const createClientSchema = clientSchema.pick({
  name: true,
  contact_email: true,
  contact_phone: true,
  billing_info: true,
  notes: true,
  enable_stock: true,
  payment_exempt: true
});

// Schema para actualizar cliente
export const updateClientSchema = clientSchema.partial();
