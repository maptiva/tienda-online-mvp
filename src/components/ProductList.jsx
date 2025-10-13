import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import SearchBar from './SearchBar'; // Importar SearchBar
import styles from './ProductList.module.css';

const ProductList = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  // Usamos useMemo para no recalcular el filtro en cada render, solo si los productos o el término de búsqueda cambian
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>Error al cargar los productos: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <div className='my-5'>
        <h2>Nuestros Productos</h2>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      {filteredProducts.length > 0 ? (
        <div className={styles.productosContainer}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p>No se encontraron productos que coincidan con la búsqueda.</p>
      )}
    </div>
  );
};

export default ProductList;