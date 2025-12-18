import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('stores')
          .select('id, store_name, logo_url, latitude, longitude, address, city, category, store_slug')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) {
          throw error;
        }

        setStores(data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error };
};
