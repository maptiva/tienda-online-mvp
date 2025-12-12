import { CgLaptop } from "react-icons/cg";
import { supabase } from "../services/supabase";

export const deleteProduct = async (id: string, imageUrl: string): Promise<boolean> => {
    try {
        // Solo intentar eliminar la imagen si existe una URL válida
        if (imageUrl && imageUrl.trim() !== '') {
            // 1. Extraer el nombre del archivo de la URL de la imagen
            const imageName = imageUrl.split('/').pop();

            if (!imageName) {
                console.error("No se pudo extraer el nombre de la imagen de la URL:", imageUrl);
                // Continuar con la eliminación del producto aunque falle la imagen
            } else {
                // 2. Eliminar la imagen del Storage
                const { error: storageError } = await supabase.storage
                    .from('product-images')
                    .remove([imageName]);

                if (storageError) {
                    console.error('Error al eliminar la imagen del Storage:', storageError);
                    // Continuar con la eliminación del producto aunque falle la imagen
                }
            }
        }

        // 3. Eliminar el registro del producto de la base de datos
        const { error: dbError } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('Error al eliminar el producto de la base de datos:', dbError);
            return false;
        }

        return true; // Éxito si ambas operaciones funcionaron
    } catch (error) {
        console.error("Error inesperado al eliminar el producto:", error);
        return false;
    }
};