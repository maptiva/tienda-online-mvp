import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase"
import { Categoria } from "../../interfaces/Categoria";

export const useCategories = () => {
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                console.log(data)
                setCategories(data as any)
            } catch (error) {
                console.log(error)
                setError(error);
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, []);


    return { categories, loading, error }
}