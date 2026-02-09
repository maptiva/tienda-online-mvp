/**
 * Módulo centralizado para el manejo de errores de Supabase.
 * Traduce códigos de error técnicos a mensajes amigables para el usuario.
 * 
 * Uso:
 *   import { handleSupabaseError } from '../utils/supabaseErrors';
 *   
 *   const { data, error } = await supabase.from('products').select('*');
 *   if (error) {
 *     const userMessage = handleSupabaseError(error);
 *     // Mostrar userMessage al usuario
 *   }
 */

// Mapa de códigos de error PostgREST → mensajes amigables
const POSTGREST_ERRORS = {
  'PGRST116': 'No se encontró el registro solicitado.',
  'PGRST204': 'No se encontraron resultados.',
  'PGRST301': 'Error de conexión con la base de datos. Intentá de nuevo.',
  'PGRST302': 'La consulta tardó demasiado. Intentá de nuevo.',
  '23505': 'Este registro ya existe. Verificá que no esté duplicado.',
  '23503': 'No se puede eliminar porque hay datos relacionados.',
  '23502': 'Faltan campos obligatorios.',
  '42501': 'No tenés permisos para realizar esta acción.',
  '42P01': 'Error interno: tabla no encontrada.',
  '22P02': 'El formato de los datos no es válido.',
};

// Mapa de errores de autenticación de Supabase Auth
const AUTH_ERRORS = {
  'invalid_credentials': 'Email o contraseña incorrectos.',
  'email_not_confirmed': 'Necesitás confirmar tu email antes de iniciar sesión.',
  'user_not_found': 'No se encontró una cuenta con ese email.',
  'user_already_exists': 'Ya existe una cuenta con ese email.',
  'weak_password': 'La contraseña es muy débil. Usá al menos 6 caracteres.',
  'over_request_rate_limit': 'Demasiados intentos. Esperá un momento antes de reintentar.',
  'otp_expired': 'El código de verificación expiró. Solicitá uno nuevo.',
  'same_password': 'La nueva contraseña debe ser diferente a la actual.',
  'signup_disabled': 'El registro de nuevas cuentas está deshabilitado.',
};

// Mapa de errores de Storage
const STORAGE_ERRORS = {
  'StorageApiError': 'Error al subir el archivo. Verificá el tamaño y formato.',
  'Bucket not found': 'Error de configuración de almacenamiento.',
  'The resource already exists': 'Ya existe un archivo con ese nombre.',
  'new row violates row-level security': 'No tenés permisos para subir archivos.',
};

/**
 * Procesa un error de Supabase y retorna un mensaje amigable.
 * @param {Object} error - Objeto de error de Supabase
 * @param {string} context - Contexto opcional para personalizar el mensaje (ej: 'producto', 'imagen')
 * @returns {string} Mensaje amigable para mostrar al usuario
 */
export function handleSupabaseError(error, context = '') {
  if (!error) return '';

  // 1. Verificar errores de red
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return 'Error de conexión. Verificá tu internet e intentá de nuevo.';
  }

  // 2. Verificar errores PostgREST por código
  if (error.code && POSTGREST_ERRORS[error.code]) {
    return POSTGREST_ERRORS[error.code];
  }

  // 3. Verificar errores de Auth
  if (error.message) {
    for (const [key, message] of Object.entries(AUTH_ERRORS)) {
      if (error.message.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }
  }

  // 4. Verificar errores de Storage
  if (error.message) {
    for (const [key, message] of Object.entries(STORAGE_ERRORS)) {
      if (error.message.includes(key)) {
        return message;
      }
    }
  }

  // 5. Verificar errores de RLS (Row Level Security)
  if (error.message?.includes('row-level security') || error.code === '42501') {
    return 'No tenés permisos para realizar esta acción.';
  }

  // 6. Error genérico con contexto
  const contextMsg = context ? ` al procesar ${context}` : '';
  console.error(`[SupabaseError]${contextMsg}:`, error);
  
  return `Ocurrió un error inesperado${contextMsg}. Intentá de nuevo.`;
}

/**
 * Wrapper para operaciones de Supabase que maneja errores automáticamente.
 * Retorna { data, error, userMessage }.
 * 
 * @param {Promise} supabasePromise - Promesa de Supabase (ej: supabase.from('x').select('*'))
 * @param {string} context - Contexto para el mensaje de error
 * @returns {Promise<{data: any, error: any, userMessage: string}>}
 */
export async function safeSupabaseCall(supabasePromise, context = '') {
  try {
    const { data, error } = await supabasePromise;
    
    if (error) {
      return {
        data: null,
        error,
        userMessage: handleSupabaseError(error, context),
      };
    }

    return { data, error: null, userMessage: '' };
  } catch (err) {
    return {
      data: null,
      error: err,
      userMessage: handleSupabaseError(err, context),
    };
  }
}

/**
 * Verifica si un error de Supabase es un "not found" (PGRST116).
 * Útil para diferenciar entre "no existe" y "error real".
 */
export function isNotFoundError(error) {
  return error?.code === 'PGRST116';
}

/**
 * Verifica si un error es de duplicado (unique constraint violation).
 */
export function isDuplicateError(error) {
  return error?.code === '23505';
}

/**
 * Verifica si un error es de permisos (RLS o auth).
 */
export function isPermissionError(error) {
  if (!error) return false;
  return error.code === '42501' || (error.message?.includes('row-level security') ?? false);
}
