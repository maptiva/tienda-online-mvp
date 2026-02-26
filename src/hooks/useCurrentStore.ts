import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export const useCurrentStore = () => {
    const { user, impersonatedUser } = useAuth();
    const targetId = impersonatedUser || user?.id;

    const [storeId, setStoreId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!targetId) {
            setLoading(false);
            return;
        }

        const fetchStoreId = async () => {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('user_id', targetId)
                    .single();

                if (fetchError) throw fetchError;
                setStoreId(data?.id || null);
            } catch (err: any) {
                console.error("Error fetching current store:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreId();
    }, [targetId]);

    return { storeId, loading, error };
};
