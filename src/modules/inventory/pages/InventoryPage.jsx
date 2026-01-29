import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { useProducts } from '../../../hooks/useProducts';
import { useStoreConfig } from '../hooks/useStoreConfig';
import { Loading } from '../../../components/dashboard/Loading';
import SearchBar from '../../../components/SearchBar';
import StockBadge from '../components/StockBadge';
import StockAdjustment from '../components/StockAdjustment';
import Swal from 'sweetalert2';
import { FiPackage, FiAlertCircle, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';

const InventoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { stockEnabled, loading: configLoading } = useStoreConfig();
  const [inventoryData, setInventoryData] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cargar datos extendidos de inventario
  useEffect(() => {
    if (user?.id && stockEnabled) {
      loadInventory();
    }
  }, [user?.id, stockEnabled]);

  const loadInventory = async () => {
    try {
      setLoadingInventory(true);
      const data = await inventoryService.fetchUserInventory(user.id);
      setInventoryData(data);
    } catch (error) {
      console.error('Error loading full inventory:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Unificar la lista de productos con la data de inventario
  const combinedData = useMemo(() => {
    if (!products) return [];
    return products.map(product => {
      const stockInfo = inventoryData.find(i => i.product_id === product.id);
      return {
        ...product,
        quantity: stockInfo?.quantity ?? 0,
        min_stock_alert: stockInfo?.min_stock_alert ?? 5,
        track_stock: stockInfo?.track_stock ?? true,
        inventory_id: stockInfo?.id,
        // Usar imagen de producto o placeholder
        thumbnail: product.image_url || null
      };
    });
  }, [products, inventoryData]);

  // Calcular métricas basadas en la data combinada (realidad de la tienda)
  const stats = useMemo(() => {
    return {
      total: combinedData.length,
      outOfStock: combinedData.filter(i => i.quantity <= 0).length,
      lowStock: combinedData.filter(i => i.quantity > 0 && i.quantity <= i.min_stock_alert).length,
      healthy: combinedData.filter(i => i.quantity > i.min_stock_alert).length
    };
  }, [combinedData]);

  const filteredProducts = useMemo(() => {
    if (!combinedData) return [];
    if (!searchTerm) return combinedData;

    const searchLower = searchTerm.toLowerCase();
    return combinedData.filter((product) => {
      const matchesName = product.name?.toLowerCase().includes(searchLower);
      const matchesSKU = product.sku?.toLowerCase().includes(searchLower);
      const displayId = product.display_id || product.id;
      const matchesID = displayId.toString().includes(searchLower);
      return matchesName || matchesSKU || matchesID;
    });
  }, [combinedData, searchTerm]);

  if (productsLoading || configLoading) return <Loading message="Cargando Inventario..." />;

  if (!stockEnabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-200 animate-fade-in">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#5FAFB8]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative text-center max-w-2xl">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <FiPackage className="text-5xl text-[#5FAFB8]" />
            <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-full shadow-lg">
              <FiCheckCircle size={16} />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tighter italic mb-4">
            Motor de Stock <span className="text-[#5FAFB8]">Inteligente</span>
          </h2>

          <p className="text-lg text-gray-500 font-medium mb-12 px-4 italic leading-relaxed">
            "No vendas lo que no tienes. Eleva el profesionalismo de tu tienda con gestión en tiempo real y etiquetas de disponibilidad dinámicas."
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-2">🔄</p>
              <p className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-tighter">Sincronización Real</p>
              <p className="text-xs text-gray-400">Actualización instantánea entre tu depósito y la web.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-2">🏷️</p>
              <p className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-tighter">Etiquetas Dinámicas</p>
              <p className="text-xs text-gray-400">Avisos automáticos de 'Agotado' o 'Últimas unidades'.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-2xl mb-2">🛡️</p>
              <p className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-tighter">Cero Frustración</p>
              <p className="text-xs text-gray-400">Evita que tus clientes pidan productos sin existencias.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/5491136458514?text=${encodeURIComponent('Hola! Me interesa activar el Motor de Stock Inteligente en mi tienda Clicando. ¿Me das más info?')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-10 py-4 bg-[#5FAFB8] text-[#1e293b] rounded-2xl font-black text-lg shadow-xl shadow-[#5FAFB8]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              SOLICITAR ACTIVACIÓN PREMIUM
            </a>
            <button
              onClick={() => navigate('/admin/producto')}
              className="w-full md:w-auto px-10 py-4 bg-white text-gray-400 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-200"
            >
              <FiArrowLeft /> VOLVER AL PANEL
            </button>
          </div>
        </div>
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

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <FiPackage size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Productos</p>
            <p className="text-xl font-black text-gray-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg text-red-600">
            <FiXCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Agotados</p>
            <p className="text-xl font-black text-red-800">{stats.outOfStock}</p>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <FiAlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Stock Bajo</p>
            <p className="text-xl font-black text-orange-800">{stats.lowStock}</p>
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Stock Saludable</p>
            <p className="text-xl font-black text-emerald-800">{stats.healthy}</p>
          </div>
        </div>
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
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-md border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                            Sin foto
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.categories?.name || 'Sin Categoría'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const quantity = product.quantity || 0;
                        const minAlert = product.min_stock_alert || 5;

                        if (quantity <= 0) return <span className="text-red-500 font-bold flex items-center gap-1">❌ Agotado</span>;
                        if (quantity <= minAlert) return <span className="text-orange-500 font-bold flex items-center gap-1">⚠️ Últimas {quantity}</span>;
                        return <span className="text-emerald-500 font-bold flex items-center gap-1">✅ Disponible ({quantity})</span>;
                      })()}
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
                    loadInventory(); // Recargar métricas tras ajuste
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
