import { z } from 'zod';

/**
 * Schema de validación para leads del CRM
 */
export const leadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre del lead es requerido'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).default('NEW'),
  notes: z.string().optional(),
  store_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Tipo inferido del schema para uso en TypeScript
export type Lead = z.infer<typeof leadSchema>;

// Schema para crear lead
export const createLeadSchema = leadSchema.pick({
  name: true,
  email: true,
  phone: true,
  source: true,
  store_id: true,
  assigned_to: true
});

// Schema para actualizar lead
export const updateLeadSchema = leadSchema.partial();
