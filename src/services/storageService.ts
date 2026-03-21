import { supabase } from "./supabase";
import { getStoragePath } from "../utils/storageUtils";

/**
 * Service to handle storage operations safely, ensuring reference integrity.
 */
export const storageService = {
  /**
   * Deletes images from storage only if they are not referenced by other products.
   * @param urls - Array of public URLs to potentially delete
   * @param bucket - Bucket name (default: 'product-images')
   */
  async safeDeleteImages(urls: string[], bucket: string = 'product-images'): Promise<void> {
    if (!urls || urls.length === 0) return;

    const pathsToDelete: string[] = [];

    for (const input of urls) {
      // Si el input ya es un path (no tiene http), lo usamos directo.
      // Si es una URL, extraemos el path.
      const path = input.startsWith('http') ? getStoragePath(input, bucket) : input;
      if (!path) continue;

      const urlToMatch = input.startsWith('http') ? input : ''; 

      // Count how many products use this image_url
      const { count: mainCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .ilike('image_url', `%${path}%`);

      // Count how many products have this image in their gallery
      const { count: galleryCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .contains('gallery_images', [input]); // input podría ser URL o path

      // If count <= 1, it means ONLY the current product (which is about to be updated/deleted) uses it.
      // Wait, if we are calling this BEFORE deleting the record, the count will be at least 1.
      // If we are calling this DURING an update, the count will also be at least 1.
      if ((mainCount || 0) + (galleryCount || 0) <= 1) {
        pathsToDelete.push(path);
      } else {
        console.log(`[StorageService] Skipping deletion of ${path} - shared by other products.`);
      }
    }

    if (pathsToDelete.length > 0) {
      const { error } = await supabase.storage.from(bucket).remove(pathsToDelete);
      if (error) {
        console.error(`[StorageService] Error removing files from ${bucket}:`, error);
      } else {
        console.log(`[StorageService] Successfully removed ${pathsToDelete.length} files.`);
      }
    }
  }
};
