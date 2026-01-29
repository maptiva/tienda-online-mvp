import React, { useState, useMemo } from 'react';
import { useProducts } from '../../../hooks/useProducts';
import { useStoreConfig } from '../hooks/useStoreConfig';
import { Loading } from '../../../components/dashboard/Loading';
import SearchBar from '../../../components/SearchBar';
import StockBadge from '../components/StockBadge';
import StockAdjustment from '../components/StockAdjustment';
import { FiPackage, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const InventoryPage = () => {
  const { products, loading: productsLoading, refreshProducts } = useProducts();
  const { stockEnabled, loading: configLoading } = useStoreConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;

    const searchLower = searchTerm.toLowerCase();
    return products.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(searchLower);
      const matchesSKU = product.sku?.toLowerCase().includes(searchLower) || false;
      const idToSearch = product.display_id || product.id;
      const matchesID = idToSearch.toString().includes(searchLower);
      return matchesName || matchesSKU || matchesID;
    });
  }, [products, searchTerm]);

  if (productsLoading || configLoading) return <Loading message="Cargando Inventario..." />;

  if (!stockEnabled) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-md">
        <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Motor de Stock Desactivado</h2>
        <p className="text-gray-600 mb-6">Debes activar el control de stock en la configuración de la tienda para usar este panel.</p>
        <button 
          onClick={() => window.location.href = '/admin/settings'}
          className="px-6 py-2 bg-[#5FAFB8] text-white rounded-lg font-bold hover:opacity-90 transition-all"
        >
          Ir a Configuración
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 md:p-8 rounded-xl shadow-xl flex flex-col h-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiPackage className="text-[#5FAFB8]" /> Gestor de Inventario
          </h1>
          <p className="text-gray-500 text-sm mt-1">Controla las existencias y alertas de stock de tus productos</p>
        </div>
      </div>

      <div className="mb-6">
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          placeholder="Buscar por nombre, SKU o REF #..."
        />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6">
        {/* Tabla de Productos */}
        <div className="flex-1 overflow-x-auto border rounded-xl shadow-sm bg-gray-50/50">
          <div className="overflow-y-auto h-full custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-sm font-bold text-gray-600">ID</th>
                  <th className="p-4 text-sm font-bold text-gray-600">Producto</th>
                  <th className="p-4 text-sm font-bold text-gray-600">Estado</th>
                  <th className="p-4 text-sm font-bold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-white transition-colors cursor-pointer ${selectedProduct?.id === product.id ? 'bg-white ring-2 ring-[#5FAFB8] ring-inset' : ''}`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <td className="p-4 text-sm font-mono text-gray-500">#{product.display_id || product.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-10 h-10 rounded-md object-cover border shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-400 font-bold uppercase">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.categories?.name || 'Sin Categoría'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StockBadge productId={product.id} />
                    </td>
                    <td className="p-4">
                      <button 
                        className="text-xs font-bold uppercase tracking-wider text-[#5FAFB8] hover:text-[#4a8a91] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de Ajuste Lateral */}
        <div className="w-full md:w-80 space-y-4">
          {selectedProduct ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-6 rounded-xl border-2 border-[#5FAFB8] shadow-lg sticky top-0">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-bold text-gray-800">Gestionar Stock</h2>
                  <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                    <FiXCircle size={20} />
                  </button>
                </div>
                
                <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {selectedProduct.image_url && <img src={selectedProduct.image_url} className="w-12 h-12 rounded object-cover border" alt="" />}
                  <div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{selectedProduct.name}</p>
                    <p className="text-xs text-gray-500">REF: #{selectedProduct.display_id || selectedProduct.id}</p>
                  </div>
                </div>

                <StockAdjustment 
                  productId={selectedProduct.id} 
                  onSuccess={() => {
                    // No necesitamos refrescar productos porque StockAdjustment usa el hook useStock
                    // que ya invalida la cache.
                  }} 
                />
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-50 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center text-gray-400 border-gray-200">
              <FiPackage size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Selecciona un producto para ajustar su stock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
