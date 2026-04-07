import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStores } from '../useStores';
import { supabase } from '../../services/supabase';

// Mock de Supabase
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        not: vi.fn(() => ({
          not: vi.fn(() => Promise.resolve({
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440000',
                store_name: 'Test Store',
                store_slug: 'test-store',
                user_id: '550e8400-e29b-41d4-a716-446655440001',
                latitude: -34.6037,
                longitude: -58.3816,
                category: 'Tienda',
                is_active: true
              }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('useStores hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useStores());
    expect(result.current.stores).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('debe cargar tiendas exitosamente', async () => {
    const { result } = renderHook(() => useStores());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stores).toHaveLength(1);
    expect(result.current.stores[0].store_name).toBe('Test Store');
    expect(result.current.error).toBeNull();
  });

  it('debe manejar errores de Supabase', async () => {
    // Mock de error para este test específico
    // Usamos un Error real para que err.message funcione en el catch
    const databaseError = new Error('Database error');
    (supabase.from as unknown as { mockImplementationOnce: Function }).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        not: vi.fn(() => ({
          not: vi.fn(() => Promise.resolve({
            data: null,
            error: databaseError
          }))
        }))
      }))
    }));

    const { result } = renderHook(() => useStores());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.stores).toEqual([]);
  });
});
