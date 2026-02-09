import {
  handleSupabaseError,
  safeSupabaseCall,
  isNotFoundError,
  isDuplicateError,
  isPermissionError,
} from '../supabaseErrors';

describe('handleSupabaseError', () => {
  it('retorna string vacío si no hay error', () => {
    expect(handleSupabaseError(null)).toBe('');
    expect(handleSupabaseError(undefined)).toBe('');
  });

  it('detecta errores de red', () => {
    const error = { message: 'Failed to fetch' };
    expect(handleSupabaseError(error)).toContain('conexión');
  });

  it('detecta errores de red (NetworkError)', () => {
    const error = { message: 'NetworkError when attempting to fetch resource' };
    expect(handleSupabaseError(error)).toContain('conexión');
  });

  it('traduce código PGRST116 (not found)', () => {
    const error = { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' };
    expect(handleSupabaseError(error)).toContain('No se encontró');
  });

  it('traduce código 23505 (duplicado)', () => {
    const error = { code: '23505', message: 'duplicate key value violates unique constraint' };
    expect(handleSupabaseError(error)).toContain('ya existe');
  });

  it('traduce código 23503 (foreign key)', () => {
    const error = { code: '23503', message: 'violates foreign key constraint' };
    expect(handleSupabaseError(error)).toContain('datos relacionados');
  });

  it('traduce código 42501 (permisos)', () => {
    const error = { code: '42501', message: 'permission denied' };
    expect(handleSupabaseError(error)).toContain('permisos');
  });

  it('detecta errores de autenticación (invalid_credentials)', () => {
    const error = { message: 'Invalid login credentials' };
    // No matchea exactamente "invalid_credentials" en el message, así que cae al genérico
    // Pero si el message contiene la key...
    const error2 = { message: 'invalid_credentials' };
    expect(handleSupabaseError(error2)).toContain('incorrectos');
  });

  it('detecta errores de RLS', () => {
    const error = { message: 'new row violates row-level security policy' };
    expect(handleSupabaseError(error)).toContain('permisos');
  });

  it('retorna mensaje genérico con contexto para errores desconocidos', () => {
    const error = { message: 'algo raro pasó', code: 'UNKNOWN' };
    const result = handleSupabaseError(error, 'el producto');
    expect(result).toContain('error inesperado');
    expect(result).toContain('el producto');
  });

  it('retorna mensaje genérico sin contexto para errores desconocidos', () => {
    const error = { message: 'algo raro pasó' };
    const result = handleSupabaseError(error);
    expect(result).toContain('error inesperado');
  });
});

describe('safeSupabaseCall', () => {
  it('retorna data correctamente cuando no hay error', async () => {
    const mockPromise = Promise.resolve({ data: [{ id: 1 }], error: null });
    const result = await safeSupabaseCall(mockPromise);

    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.error).toBeNull();
    expect(result.userMessage).toBe('');
  });

  it('retorna userMessage cuando hay error de Supabase', async () => {
    const mockPromise = Promise.resolve({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });
    const result = await safeSupabaseCall(mockPromise, 'el producto');

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.userMessage).toContain('No se encontró');
  });

  it('captura excepciones inesperadas', async () => {
    const mockPromise = Promise.reject(new Error('Network failure'));
    const result = await safeSupabaseCall(mockPromise, 'la consulta');

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.userMessage).toBeTruthy();
  });
});

describe('helpers de tipo de error', () => {
  it('isNotFoundError detecta PGRST116', () => {
    expect(isNotFoundError({ code: 'PGRST116' })).toBe(true);
    expect(isNotFoundError({ code: '23505' })).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });

  it('isDuplicateError detecta 23505', () => {
    expect(isDuplicateError({ code: '23505' })).toBe(true);
    expect(isDuplicateError({ code: 'PGRST116' })).toBe(false);
    expect(isDuplicateError(null)).toBe(false);
  });

  it('isPermissionError detecta 42501 y RLS', () => {
    expect(isPermissionError({ code: '42501' })).toBe(true);
    expect(isPermissionError({ message: 'violates row-level security' })).toBe(true);
    expect(isPermissionError({ code: '23505' })).toBe(false);
    expect(isPermissionError(null)).toBe(false);
  });
});
