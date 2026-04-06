import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { storeSchema } from '../schemas/store.schema';
import { safeValidate } from '../utils/zodHelpers';
import type { Store } from '../schemas/store.schema';

export interface PublicStore {
  id: number;
  store_name: string;
  logo_url: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  category: string | null;
  store_slug: string | null;
  is_demo: boolean | null;
  coming_soon: boolean | null;
  is_active: boolean | null;
  is_open: boolean | null;
  user_id: string;
}

export const useStores = () => {
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);

        // Tipamos rawStores como Record<string, unknown>[] para permitir el fallback entre queries
        // con distinto número de columnas sin errores de asignación de TS.
        let rawStores: Record<string, unknown>[] | null = null;
        let { data, error } = await supabase
          .from('stores')
          .select('id, store_name, logo_url, latitude, longitude, address, city, category, store_slug, is_demo, coming_soon, is_active, is_open, user_id')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);
 
        rawStores = data;

        if (error) {
          console.warn("⚠️ Falló la consulta avanzada de tiendas (posiblemente por columnas nuevas en Pro). Reintentando carga básica...", error);
          
          // Reintento: Carga de emergencia sin las columnas nuevas
          const { data: fallbackStores, error: fallbackError } = await supabase
            .from('stores')
            .select('id, store_name, logo_url, latitude, longitude, address, city, category, store_slug, is_demo, coming_soon, user_id')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);
            
          if (fallbackError) throw fallbackError;
          rawStores = fallbackStores;
        }

        const validatedStores: PublicStore[] = [];

        (rawStores || []).forEach((rawStore: Record<string, unknown>) => {
          // Validación robusta: permitimos el valor 0 y solo descartamos null/undefined
          const hasCoords = rawStore.latitude !== null && rawStore.latitude !== undefined && 
                           rawStore.longitude !== null && rawStore.longitude !== undefined;

          if (hasCoords) {
            validatedStores.push({
              id: Number(rawStore.id),
              store_name: String(rawStore.store_name || ''),
              logo_url: rawStore.logo_url ? String(rawStore.logo_url) : null,
              latitude: Number(rawStore.latitude),
              longitude: Number(rawStore.longitude),
              address: rawStore.address ? String(rawStore.address) : null,
              city: rawStore.city ? String(rawStore.city) : null,
              category: rawStore.category ? String(rawStore.category) : null,
              store_slug: rawStore.store_slug ? String(rawStore.store_slug) : null,
              is_demo: typeof rawStore.is_demo === 'boolean' ? rawStore.is_demo : null,
              coming_soon: typeof rawStore.coming_soon === 'boolean' ? rawStore.coming_soon : null,
              is_active: typeof rawStore.is_active === 'boolean' ? rawStore.is_active : null,
              is_open: typeof rawStore.is_open === 'boolean' ? rawStore.is_open : null,
              user_id: String(rawStore.user_id || '')
            });
          }
        });

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
