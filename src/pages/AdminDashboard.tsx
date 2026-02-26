import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCurrentStore } from '../hooks/useCurrentStore';
import { statsService, ShopStatsSummary } from '../modules/stats/services/statsService';

import { Loading } from '../components/dashboard/Loading';
import { ProductElement } from '../components/dashboard/ProductElement';
import { ProductCard } from '../components/dashboard/ProductCard';
import SearchBar from '../components/SearchBar';
import { FaEye, FaWhatsapp, FaShoppingCart, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { products, loading: productsLoading } = useProducts() as any;
    const { storeId, loading: storeLoading } = useCurrentStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState<ShopStatsSummary | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (storeId) {
                const data = await statsService.getStoreStatsSummary(storeId);
                setStats(data);
            }
            setStatsLoading(false);
        };
        fetchStats();
    }, [storeId]);

    // Filtrar productos por búsqueda
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (!searchTerm) return products;

        const searchLower = searchTerm.toLowerCase();
        return products.filter((product: any) => {
            const matchesName = product.name.toLowerCase().includes(searchLower);
            const matchesCategory = product.categories?.name?.toLowerCase().includes(searchLower) || false;
            const matchesSKU = product.sku?.toLowerCase().includes(searchLower) || false;
            const idToSearch = product.display_id || product.id;

            const matchesID = searchLower.startsWith('#')
                ? idToSearch.toString() === searchLower.replace('#', '')
                : idToSearch.toString().includes(searchLower);

            return matchesName || matchesCategory || matchesSKU || matchesID;
        });
    }, [products, searchTerm]);

    if (productsLoading || storeLoading) return <Loading message='Cargando Panel...' />;

    return (
        <div className='w-full shadow-lg border border-gray-200 bg-white p-0 rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden'>
            <div className='flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-8'>
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Panel de Gestión</h1>
                    <div className="flex gap-2">
                        <button
                            className='bg-blue-600 text-white p-2 px-4 cursor-pointer hover:bg-blue-700 rounded-lg font-medium transition-all active:scale-95 flex items-center gap-2'
                            onClick={() => navigate('/admin/new')}
                        >
                            + <span className="hidden md:inline">Nuevo Producto</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Summary Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <FaEye size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Visitas</span>
                        </div>
                        <p className="text-2xl font-black text-blue-900">{statsLoading ? '...' : stats?.visits || 0}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                            <FaWhatsapp size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Interés WA</span>
                        </div>
                        <p className="text-2xl font-black text-emerald-900">{statsLoading ? '...' : stats?.whatsapp_clicks || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                            <FaShoppingCart size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Pedidos</span>
                        </div>
                        <p className="text-2xl font-black text-purple-900">{statsLoading ? '...' : stats?.orders || 0}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                            <FaChartLine size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Conversión</span>
                        </div>
                        <p className="text-2xl font-black text-amber-900">
                            {statsLoading ? '...' : `${stats?.conversion_rate.toFixed(1) || 0}%`}
                        </p>
                    </div>
                </div>

                {/* Buscador */}
                <div className='mb-6'>
                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Buscar por nombre, categoría o ID..."
                    />
                </div>

                <div className='flex items-center justify-between mb-4'>
                    <h2 className="text-lg font-bold text-gray-700">Inventario de Productos</h2>
                    {products && (
                        <p className='text-sm text-gray-500 font-medium'>
                            <span className='text-gray-800'>{filteredProducts.length}</span> / {products.length} productos
                        </p>
                    )}
                </div>

                {/* Vista Desktop - Tabla */}
                <div className='overflow-hidden hidden md:flex flex-col flex-1 border border-gray-100 rounded-lg shadow-sm bg-white'>
                    <div className='overflow-y-auto flex-1 custom-scrollbar'>
                        <table className='w-full border-separate border-spacing-0'>
                            <thead className='bg-gray-50 sticky top-0 z-[40] shadow-sm'>
                                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="py-3 px-4 font-bold">ID</th>
                                    <th className="py-3 px-4 text-left font-bold">Imagen</th>
                                    <th className="py-3 px-4 text-left font-bold">Nombre</th>
                                    <th className="py-3 px-4 text-left font-bold">Precio</th>
                                    <th className="py-3 px-4 text-left font-bold">Categoría</th>
                                    <th className="py-3 px-4 font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className='text-sm divide-y divide-gray-100'>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product: any) => (
                                        <ProductElement key={product.id} product={product} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className='text-center py-12 text-gray-400'>
                                            No hay productos que coincidan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vista Mobile - Cards */}
                <div className='md:hidden flex-1 min-h-0 flex flex-col'>
                    <div className='flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3'>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className='text-center py-12 text-gray-400'>
                                No hay productos que coincidan.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
