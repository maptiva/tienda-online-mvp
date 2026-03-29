import { describe, it, expect } from 'vitest';
import {
  handleSupabaseError,
  safeSupabaseCall,
  isNotFoundError,
  isDuplicateError,
  isPermissionError,
} from '../supabaseErrors';
import type { SupabaseError } from '../supabaseErrors';

describe('handleSupabaseError', () => {
  it('retorna string vacío si no hay error', () => {
    expect(handleSupabaseError(null)).toBe('');
    expect(handleSupabaseError(undefined as any)).toBe('');
  });

  it('detecta errores de red', () => {
    const error: SupabaseError = { message: 'Failed to fetch' };
    expect(handleSupabaseError(error)).toContain('conexión');
  });

  it('detecta errores de red (NetworkError)', () => {
    const error: SupabaseError = { message: 'NetworkError when attempting to fetch resource' };
    expect(handleSupabaseError(error)).toContain('conexión');
  });

  it('traduce código PGRST116 (not found)', () => {
    const error: SupabaseError = { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' };
    expect(handleSupabaseError(error)).toContain('No se encontró');
  });

  it('traduce código 23505 (duplicado)', () => {
    const error: SupabaseError = { code: '23505', message: 'duplicate key value violates unique constraint' };
    expect(handleSupabaseError(error)).toContain('ya existe');
  });

  it('traduce código 23503 (foreign key)', () => {
    const error: SupabaseError = { code: '23503', message: 'violates foreign key constraint' };
    expect(handleSupabaseError(error)).toContain('datos relacionados');
  });

  it('traduce código 42501 (permisos)', () => {
    const error: SupabaseError = { code: '42501', message: 'permission denied' };
    expect(handleSupabaseError(error)).toContain('permisos');
  });

  it('detecta errores de autenticación (invalid_credentials)', () => {
    const error: SupabaseError = { message: 'invalid_credentials' };
    expect(handleSupabaseError(error)).toContain('incorrectos');
  });

  it('detecta errores de RLS', () => {
    const error: SupabaseError = { message: 'new row violates row-level security policy' };
    expect(handleSupabaseError(error)).toContain('permisos');
  });

  it('retorna mensaje con contexto para errores desconocidos', () => {
    const error: SupabaseError = { message: 'algo raro pasó', code: 'UNKNOWN' };
    const result = handleSupabaseError(error, 'el producto');
    expect(result).toContain('error inesperado');
    expect(result).toContain('el producto');
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
      error: { code: 'PGRST116', message: 'not found' } as SupabaseError,
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
    expect(isNotFoundError({ code: 'PGRST116' } as SupabaseError)).toBe(true);
    expect(isNotFoundError({ code: '23505' } as SupabaseError)).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });

  it('isDuplicateError detecta 23505', () => {
    expect(isDuplicateError({ code: '23505' } as SupabaseError)).toBe(true);
    expect(isDuplicateError({ code: 'PGRST116' } as SupabaseError)).toBe(false);
    expect(isDuplicateError(null)).toBe(false);
  });

  it('isPermissionError detecta 42501 y RLS', () => {
    expect(isPermissionError({ code: '42501' } as SupabaseError)).toBe(true);
    expect(isPermissionError({ message: 'violates row-level security' } as SupabaseError)).toBe(true);
    expect(isPermissionError({ code: '23505' } as SupabaseError)).toBe(false);
    expect(isPermissionError(null)).toBe(false);
  });
});
