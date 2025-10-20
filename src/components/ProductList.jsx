import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import SearchBar from './SearchBar'; // Importar SearchBar
import styles from './ProductList.module.css';
import { MdErrorOutline } from 'react-icons/md';
import { useCategory } from '../hooks/categoria/useCategory';

const ProductList = () => {
  const { categoryActive } = useCategory()
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  // Usamos useMemo para no recalcular el filtro en cada render, solo si los productos o el término de búsqueda cambian
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      if (categoryActive) {
        return product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.category_id === categoryActive?.id
      } else {
        return product.name.toLowerCase().includes(searchTerm.toLowerCase())
      }
    }
    );
  }, [products, searchTerm, categoryActive]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-95 z-[1000]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#ff6900] rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-800 text-lg font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[calc(100vh-145px)] items-center justify-center py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow max-w-lg w-full flex flex-col items-center">

          <MdErrorOutline className="w-10 h-10 mb-3 text-red-600" />
          <h2 className="text-xl font-bold mb-2">¡Vaya! Ocurrió un error</h2>
          <p className="mb-1">No se pudieron cargar los productos.</p>
          <p className="text-xs text-red-500 break-all">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-[#ff6900] text-white rounded hover:bg-orange-600 font-medium transition-colors"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className='sticky top-[145px] z-40 bg-[#f4f4f4] pb-4 border-b border-slate-200'>
        <h2 className='text-3xl font-bold text-slate-800 mb-4'>Nuestros Productos</h2>
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