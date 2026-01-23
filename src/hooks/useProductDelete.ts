import { supabase } from "../services/supabase";
import { getStoragePath } from "../utils/storageUtils";

export const deleteProduct = async (id: string, imageUrl: string): Promise<boolean> => {
    try {
        console.log(`[Storage] Iniciando proceso de eliminación para producto ID: ${id}`);

        // 1. Obtener datos actuales del producto (especialmente la galería)
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('image_url, gallery_images')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.warn('[Storage] No se pudo obtener la galería del producto antes de borrar:', fetchError);
        }

        const imagesToDelete: string[] = [];

        // 2. Preparar rutas de imágenes para borrar
        // Imagen principal
        if (imageUrl) {
            const path = getStoragePath(imageUrl, 'product-images');
            if (path) imagesToDelete.push(path);
        } else if (product?.image_url) {
            const path = getStoragePath(product.image_url, 'product-images');
            if (path) imagesToDelete.push(path);
        }

        // Galería
        if (product?.gallery_images && Array.isArray(product.gallery_images)) {
            product.gallery_images.forEach((url: string) => {
                const path = getStoragePath(url, 'product-images');
                if (path) imagesToDelete.push(path);
            });
        }

        // 3. Eliminar archivos del Storage
        if (imagesToDelete.length > 0) {
            console.log('[Storage] Eliminando archivos físicos:', imagesToDelete);
            const { error: storageError } = await supabase.storage
                .from('product-images')
                .remove(imagesToDelete);

            if (storageError) {
                console.error('[Storage] Error al eliminar archivos físicos:', storageError);
            } else {
                console.log('[Storage] Archivos físicos eliminados con éxito.');
            }
        }

        // 4. Eliminar el registro del producto de la base de datos
        const { error: dbError } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('[Database] Error al eliminar el producto de la DB:', dbError);
            return false;
        }

        console.log('[Storage] Producto y archivos eliminados completamente.');
        return true;
    } catch (error) {
        console.error("[Storage] Error inesperado al eliminar el producto:", error);
        return false;
    }
};