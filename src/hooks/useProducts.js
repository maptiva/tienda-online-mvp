import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useProductStore } from '../store/useProductStore';

export const useProducts = (userId = null) => {
  const { user } = useAuth();

  // Determinar el ID objetivo (Tienda pública o usuario logueado)
  const targetId = userId || user?.id;

  const { productsCache, setProducts } = useProductStore();
  const cachedProducts = targetId ? productsCache[targetId] : null;

  // Si ya tenemos datos en cache, NO mostramos loading (false). Si no, sí (true).
  const [loading, setLoading] = useState(!cachedProducts);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no tenemos targetId (ej: logout y sin userId), no hacemos nada
    if (!targetId) return;

    const fetchProducts = async () => {
      try {
        // Si no hay cache, activamos loading. Si hay, dejámoslo en false (UI instantánea)
        if (!cachedProducts) {
          setLoading(true);
        }

        let query = supabase
          .from('products')
          .select('*, categories(name)')
          .order('id', { ascending: true });

        query = query.eq('user_id', targetId);

        const { data, error } = await query;

        if (error) throw error;

        // Guardamos en el Store Global (Cache)
        setProducts(targetId, data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    // Estrategia: "Cache-first".
    // Si ya tenemos datos, no hacemos fetch de nuevo para evitar parpadeos.
    // (Podríamos hacer fetch en background si quisiéramos actualizar, pero para scroll UX es mejor esto)
    if (!cachedProducts) {
      fetchProducts();
    } else {
      // Opcional: Podríamos re-validar en background aquí si quisiéramos datos frescos siempre.
      // Por ahora, para evitar el salto de scroll, confiamos en el cache.
    }

  }, [targetId, cachedProducts, setProducts]);

  // Devolvemos lo del cache si existe, o array vacío
  return { products: cachedProducts || [], loading, error };
};