import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useStoreByName = (storeName) => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!storeName) {
                    setStore(null);
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('stores')
                    .select('*')
                    .eq('store_name', storeName)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        // No rows returned
                        setError('Tienda no encontrada');
                    } else {
                        throw error;
                    }
                } else {
                    setStore(data);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching store:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [storeName]);

    return { store, loading, error };
};
