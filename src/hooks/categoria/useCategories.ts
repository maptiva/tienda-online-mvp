import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase"
import { useAuth } from "../../context/AuthContext";
import { categorySchema, type Category } from "../../schemas/category.schema";
import { safeValidate } from "../../utils/zodHelpers";

/**
 * Tipo de retorno del hook useCategories
 */
export interface UseCategoriesReturn {
    categories: Category[];
    loading: boolean;
    error: Error | null;
}

export const useCategories = (): UseCategoriesReturn => {
    const { user, impersonatedUser } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Determinar el ID objetivo (Usuario impersonado o logueado)
    const targetId = impersonatedUser || user?.id;

    useEffect(() => {
        if (!targetId) {
            setLoading(false);
            return;
        }

        const fetchCategories = async () => {
            try {
                setLoading(true)
                const { data, error: fetchError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('user_id', targetId)
                    .order('name', { ascending: true });

                if (fetchError) throw fetchError;

                // Validar datos de categorías con Zod
                const validatedData = (data || []).map((item, index) => {
                    const result = safeValidate(categorySchema, item, `categories[${index}]`);
                    if (!result.success && result.error) {
                        console.warn(`Categoría inválida en índice ${index}:`, result.formattedErrors);
                    }
                    return result.success ? result.data : item;
                }) as Category[];

                setCategories(validatedData);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Error desconocido'));
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [targetId]);

    return { categories, loading, error }
}
