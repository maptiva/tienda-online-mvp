import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export const useProducts = (userId = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from('products')
          .select('*, categories(name)')
          .order('id', { ascending: true });

        // Prioridad 1: Si se pasa userId (vista pública), filtrar por ese usuario
        if (userId) {
          query = query.eq('user_id', userId);
        }
        // Prioridad 2: Si hay usuario autenticado (admin), filtrar por user_id del usuario
        else if (user) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, userId]); // Recargar cuando cambie el usuario o userId

  return { products, loading, error };
};