import { getStoragePath } from '../storageUtils';

describe('getStoragePath', () => {
  const bucket = 'product-images';

  it('extrae el path correcto de una URL de Supabase', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/product-images/user-123/foto.webp';
    expect(getStoragePath(url, bucket)).toBe('user-123/foto.webp');
  });

  it('elimina query params de la URL', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/product-images/img.webp?t=123456';
    expect(getStoragePath(url, bucket)).toBe('img.webp');
  });

  it('retorna null si la URL es null o undefined', () => {
    expect(getStoragePath(null, bucket)).toBeNull();
    expect(getStoragePath(undefined, bucket)).toBeNull();
  });

  it('retorna null si la URL es un string vacío', () => {
    expect(getStoragePath('', bucket)).toBeNull();
  });

  it('retorna null si no es un string', () => {
    expect(getStoragePath(123, bucket)).toBeNull();
    expect(getStoragePath({}, bucket)).toBeNull();
  });

  it('retorna null si el bucket no se encuentra en la URL', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/otro-bucket/img.webp';
    expect(getStoragePath(url, bucket)).toBeNull();
  });

  it('maneja paths con múltiples niveles de carpetas', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/product-images/user-1/cat-2/sub/foto.webp';
    expect(getStoragePath(url, bucket)).toBe('user-1/cat-2/sub/foto.webp');
  });
});
