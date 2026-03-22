import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { storeSchema } from '../schemas/store.schema';
import { safeValidate } from '../utils/zodHelpers';
import type { Store } from '../schemas/store.schema';

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);

        const { data: rawStores, error } = await supabase
          .from('stores')
          .select('id, store_name, logo_url, latitude, longitude, address, city, category, store_slug, is_demo, coming_soon, is_active')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) {
          throw error;
        }

        // Validar los datos con Zod
        const validatedStores: Store[] = [];
        const storeErrors: string[] = [];

        (rawStores || []).forEach((rawStore) => {
          const { data: validatedStore, error: validationError } = safeValidate(storeSchema, rawStore);
          if (validationError) {
            storeErrors.push(...validationError.issues.map(e => e.message));
          } else if (validatedStore) {
            validatedStores.push(validatedStore);
          }
        });

        if (storeErrors.length > 0) {
          console.warn("Validation errors for stores:", storeErrors);
        }

        setStores(validatedStores);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error };
};
