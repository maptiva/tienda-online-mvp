import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useShopCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('shop_categories')
                .select('*')
                .order('label', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching shop categories:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, loading, error, refreshCategories: fetchCategories };
};
