
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css'; // Import the CSS module

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, category')
        .order('id', { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        console.error('Error fetching products:', error);
      } else {
        setProducts(data);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1>Panel de Administración de Productos</h1>
      <button className={styles.addProductButton} onClick={() => navigate('/admin/new')}>Añadir Nuevo Producto</button>
      {products.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <table className={styles.productsTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.category}</td>
                <td>
                  <button className={styles.editButton} onClick={() => navigate(`/admin/edit/${product.id}`)}>Editar</button>
                  <button className={styles.deleteButton}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
