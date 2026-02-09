import { z } from 'zod';

/**
 * Resultado de validación con safeParse
 */
export interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  error: z.ZodError | null;
  formattedErrors?: Record<string, string>;
}

/**
 * Valida datos usando un schema de Zod
 * Retorna un objeto estructurado con el resultado
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      error: null
    };
  }

  // Formatear errores para mostrar en UI
  const formattedErrors: Record<string, string> = {};
  const issues = result.error.issues;
  
  for (const issue of issues) {
    const path = issue.path.join('.');
    formattedErrors[path] = issue.message;
  }

  // Log del error en desarrollo
  console.error(`[Zod Validation Error]${context ? ` [${context}]` : ''}:`, {
    issues: result.error.issues,
    formattedErrors
  });

  return {
    success: false,
    data: null,
    error: result.error,
    formattedErrors
  };
}

/**
 * Valida un array de datos y filtra los válidos
 * Útil para validar respuestas de Supabase
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[],
  context?: string
): { valid: T[]; invalid: unknown[] } {
  const valid: T[] = [];
  const invalid: unknown[] = [];

  data.forEach((item, index) => {
    const result = safeValidate(schema, item, `${context}[${index}]`);
    if (result.success && result.data) {
      valid.push(result.data);
    } else {
      invalid.push(item);
    }
  });

  return { valid, invalid };
}

/**
 * Obtiene mensajes de error user-friendly desde un ZodError
 */
export function getUserFriendlyError(error: z.ZodError): string {
  const messages = error.issues.map((issue) => {
    const path = issue.path.join(' > ');
    return `${path}: ${issue.message}`;
  });

  return messages.join('\n');
}

/**
 * Verifica si un campo tiene error específico
 */
export function hasFieldError(error: z.ZodError | null, fieldPath: string): boolean {
  if (!error) return false;
  return error.issues.some((issue) => issue.path.join('.') === fieldPath);
}

/**
 * Obtiene el mensaje de error para un campo específico
 */
export function getFieldError(error: z.ZodError | null, fieldPath: string): string | undefined {
  if (!error) return undefined;
  const fieldError = error.issues.find((issue) => issue.path.join('.') === fieldPath);
  return fieldError?.message;
}
