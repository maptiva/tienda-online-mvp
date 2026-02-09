import { z } from 'zod';

/**
 * Schema de validación para clientes del CRM
 */
export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre del cliente es requerido'),
  contact_email: z.string().email('Email de contacto inválido').optional(),
  contact_phone: z.string().optional(),
  billing_info: z.record(z.string(), z.any()).optional(), // JSON/Object para información de facturación
  notes: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
  enable_stock: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
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
  enable_stock: true
});

// Schema para actualizar cliente
export const updateClientSchema = clientSchema.partial();
