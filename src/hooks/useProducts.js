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

  // Estado de carga inicial: solo cargando si NO hay cache Y tenemos un ID objetivo
  const [loading, setLoading] = useState(!cachedProducts && !!targetId);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no tenemos targetId, no mostramos spinner
    if (!targetId) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        // Solo activamos loading visual si realmente no hay nada que mostrar (ni cache)
        if (!cachedProducts) {
          setLoading(true);
        }

        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('user_id', targetId)
          .order('id', { ascending: true });

        if (fetchError) throw fetchError;

        // Actualizamos el cache global (Store)
        setProducts(targetId, data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Estrategia: "Sentido común"
    // Siempre intentamos traer datos frescos en segundo plano para que el Admin 
    // vea sus cambios, pero el usuario ve el cache instantáneamente.
    fetchProducts();

  }, [targetId, setProducts]); // Quitamos cachedProducts de dependencias para evitar loops

  // Devolvemos lo del cache si existe, o array vacío
  return { products: cachedProducts || [], loading, error };
};