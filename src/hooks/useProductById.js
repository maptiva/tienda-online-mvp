import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useProductStore } from '../store/useProductStore';

export const useProductById = (productId) => {
  const { findProduct } = useProductStore();
  const cachedProduct = findProduct(productId);

  const [product, setProduct] = useState(cachedProduct || null);
  const [loading, setLoading] = useState(!cachedProduct);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    // Si ya lo tenemos en cache, actualizamos el estado (por si acaso cambió productId) y evitamos fetch
    if (cachedProduct) {
      setProduct(cachedProduct);
      setLoading(false);
      // Podríamos hacer un fetch silencioso aquí si quisiéramos revalidar
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error(`Error fetching product with id ${productId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, cachedProduct]);

  return { product, loading, error };
};
