import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useProductById = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single(); // .single() es importante para obtener un solo objeto en lugar de un array

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
  }, [productId]); // Se ejecuta cada vez que productId cambia

  return { product, loading, error };
};
