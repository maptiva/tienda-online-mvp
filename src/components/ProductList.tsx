import React, { useMemo, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import SearchBar from './SearchBar';
import styles from './ProductList.module.css';
import { MdErrorOutline } from 'react-icons/md';
import { useCategory } from '../hooks/categoria/useCategory';
import { useSearchState } from '../store/useSearchStore';
import { type Store } from '../schemas/store.schema';

interface OutletContext {
  store: Store;
}

const ProductList: React.FC = () => {
  const { store } = useOutletContext<OutletContext>();
  const { categoryActive, limpiarCategoryActive } = useCategory();
  const { products, loading, error } = useProducts(store?.user_id as string);
  const { searchTerm, setSearchTerm } = useSearchState();
  const prevUserId = useRef<string | null>(null);

  // Guardar scroll en sessionStorage al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      const key = `scroll_state_${window.location.pathname}`;
      const current = JSON.parse(sessionStorage.getItem(key) || '{"scrollX":0,"scrollY":0}');
      if (window.scrollY > 0 && window.scrollY !== current.scrollY) {
        sessionStorage.setItem(key, JSON.stringify({ scrollX: window.scrollX, scrollY: window.scrollY }));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restaurar scroll al montar el componente (solo si no viene de click en logo)
  useEffect(() => {
    const isLogoNavigate = sessionStorage.getItem('logo_navigate') === 'true';
    const key = `scroll_state_${window.location.pathname}`;
    const saved = JSON.parse(sessionStorage.getItem(key) || '{"scrollX":0,"scrollY":0}');
    
    if (saved.scrollY > 0 && !isLogoNavigate) {
      requestAnimationFrame(() => {
        window.scrollTo(saved.scrollX, saved.scrollY);
      });
    } else if (isLogoNavigate) {
      sessionStorage.removeItem(key);
    }
  }, []);

  // Resetear filtros solo cuando cambia el user_id (no al volver atrás)
  useEffect(() => {
    const currentUserId = store?.user_id;
    
    // Solo limpiar si es un cambio real de tienda (no vuelve atrás)
    if (prevUserId.current !== null && prevUserId.current !== currentUserId) {
      if (categoryActive) limpiarCategoryActive();
      if (searchTerm) setSearchTerm('');
    }
    
    prevUserId.current = currentUserId || null;
  }, [store?.user_id]);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();

      // Buscar en varios campos
      const matchesName = product.name.toLowerCase().includes(searchLower);
      const matchesDescription = product.description?.toLowerCase().includes(searchLower) || false;
      const matchesCategory = product.categories?.name?.toLowerCase().includes(searchLower) || false;

      // SKU o ID
      const matchesSKU = product.sku?.toLowerCase().includes(searchLower) || false;
      const matchesID = searchLower.startsWith('#')
        ? (product.display_id || product.id).toString() === searchLower.replace('#', '')
        : (product.display_id || product.id).toString() === searchLower;

      const matchesSearch = matchesName || matchesDescription || matchesCategory || matchesSKU || matchesID;

      // Filtro por categoría activa
      if (categoryActive) {
        return matchesSearch && product.category_id === categoryActive?.id;
      }

      return matchesSearch;
    });
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
      {/* Título */}
      <div className="text-center mb-8 pt-6">
        <h2
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--color-text-main)' }}
        >
          Nuestros Productos
        </h2>
        <div className="flex items-center justify-center">
          <div
            className="h-1 w-24 rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
          ></div>
        </div>
      </div>

      <div className={`${styles.stickyBar} md:hidden`}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar por nombre, descripción o categoría..."
        />
      </div>
      
      {filteredProducts.length > 0 ? (
        <div className={styles.productosContainer}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{ 
                ...product, 
                // @ts-ignore - store_whatsapp no está en el tipo Product pero se usa en ProductCard
                store_whatsapp: store?.whatsapp_number 
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
            <p style={{ color: 'var(--color-text-light)' }}>No se encontraron productos que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;