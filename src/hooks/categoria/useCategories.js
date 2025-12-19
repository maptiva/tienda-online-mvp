import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase"

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true)
                const { data, error: fetchError } = await supabase
                    .from('categories')
                    .select('*')

                if (fetchError) throw fetchError;

                setCategories(data)
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, []);

    return { categories, loading, error }
}
