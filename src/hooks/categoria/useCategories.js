import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase"
import { useAuth } from "../../context/AuthContext";

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

                setCategories(data)
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
