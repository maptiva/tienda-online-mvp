import { z } from 'zod';

/**
 * Schema de validación para pagos del CRM
 */
export const paymentSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  subscription_id: z.string().uuid().optional(),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  payment_method: z.string().optional(),
  status: z.enum(['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED']).default('COMPLETED'),
  notes: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Tipo inferido del schema para uso en TypeScript
export type Payment = z.infer<typeof paymentSchema>;

// Schema para registrar pago
export const registerPaymentSchema = paymentSchema.pick({
  client_id: true,
  subscription_id: true,
  amount: true,
  payment_method: true,
  notes: true
});

// Schema para actualizar pago
export const updatePaymentSchema = paymentSchema.partial();
