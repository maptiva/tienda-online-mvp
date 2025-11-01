import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Product } from '../interfaces/Producto';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('id', { ascending: true });

        if (error) {
          throw error;
        };

        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  return { products, loading, error };
};