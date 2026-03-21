/**
 * Utility to extract the internal storage path from a Supabase public URL.
 * Example URL: https://xyz.supabase.co/storage/v1/object/public/bucket-name/folder/image.webp
 */

/**
 * Extracts the storage path from a Supabase public URL.
 * @param url - The public Supabase URL
 * @param bucketName - The name of the storage bucket
 * @returns The internal storage path or null if extraction fails
 */
export const getStoragePath = (url: string | null | undefined, bucketName: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  try {
    // Split the URL by the bucket name
    const parts = url.split(`/${bucketName}/`);

    if (parts.length < 2) {
      console.warn(`[StorageUtils] No se pudo encontrar el bucket "${bucketName}" en la URL:`, url);
      return null;
    }

    // The path is the part after the bucket name, removing any query parameters
    const path = parts[1].split('?')[0];

    return path;

  } catch (error) {
    console.error('[StorageUtils] Error al parsear la URL de storage:', error);
    return null;
  }
};
