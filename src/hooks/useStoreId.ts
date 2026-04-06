import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

/**
 * Hook para obtener el ID numérico (BIGINT) de la tienda del usuario actual.
 */
export const useStoreId = () => {
    const { user, impersonatedUser } = useAuth();
    const [storeId, setStoreId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const targetUser = impersonatedUser || user;

    useEffect(() => {
        const fetchStoreId = async () => {
            if (!targetUser?.id) {
                setLoading(false);
                return;
            }

            try {
                const { data, error: dbError } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('user_id', targetUser.id)
                    .single();

                if (dbError) throw dbError;
                if (data) setStoreId(data.id);
            } catch (err) {
                console.error('[useStoreId] Error fetching store ID:', err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchStoreId();
    }, [targetUser?.id]);

    return { storeId, loading, error };
};
