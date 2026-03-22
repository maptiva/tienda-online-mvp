import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { storeSchema } from '../schemas/store.schema';
import { safeValidate } from '../utils/zodHelpers';
import type { Store } from '../schemas/store.schema';

export const useStoreByName = (storeName: string | null | undefined) => {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

                const { data: rawStore, error } = await supabase
                    .from('stores')
                    .select('*')
                    .eq('store_slug', storeName)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        // No rows returned
                        setError('Tienda no encontrada');
                    } else {
                        throw error;
                    }
                } else if (rawStore) {
                    // Validar los datos con Zod
                    const { data: validatedStore, error: validationError } = safeValidate(storeSchema, rawStore);
                    if (validationError) {
                        console.warn("Validation errors for store:", validationError.issues);
                        setStore(null);
                    } else if (validatedStore) {
                        setStore(validatedStore);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
                console.error('Error fetching store:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [storeName]);

    return { store, loading, error };
};
