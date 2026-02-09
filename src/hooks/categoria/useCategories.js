import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase"
import { useAuth } from "../../context/AuthContext";
import { categorySchema } from "../../schemas/category.schema";
import { safeValidate } from "../../utils/zodHelpers";

export const useCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchCategories = async () => {
            try {
                setLoading(true)
                const { data, error: fetchError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('name', { ascending: true });

                if (fetchError) throw fetchError;

                // Validar datos de categorías con Zod
                const validatedData = (data || []).map((item, index) => {
                    const result = safeValidate(categorySchema, item, `categories[${index}]`);
                    if (!result.success && result.error) {
                        console.warn(`Categoría inválida en índice ${index}:`, result.formattedErrors);
                    }
                    return result.success ? result.data : item;
                });

                setCategories(validatedData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [user]);

    return { categories, loading, error }
}
