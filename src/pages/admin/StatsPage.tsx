import { useState, useEffect } from 'react';
import { useCurrentStore } from '../../hooks/useCurrentStore';
import { statsService, ShopStatsSummary } from '../../modules/stats/services/statsService';
import { Loading } from '../../components/dashboard/Loading';
import { FaEye, FaWhatsapp, FaShoppingCart, FaChartLine } from 'react-icons/fa';

const StatsPage = () => {
    const { storeId, loading: storeLoading } = useCurrentStore();
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

    if (storeLoading) return <Loading message='Cargando Estadísticas...' />;

    return (
        <div className='w-full shadow-lg border border-gray-200 bg-white p-0 rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden'>
            <div className='flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-8'>
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
                    <div>
                        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Estadísticas e Insights</h1>
                        <p className="text-gray-500 text-sm mt-1">Monitorea el rendimiento de tu tienda en tiempo real.</p>
                    </div>
                </div>

                {/* Metrics Summary Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                                <FaEye size={24} />
                            </div>
                            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">TOTAL</span>
                        </div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Visitas del Catálogo</h3>
                        <p className="text-3xl font-black text-blue-900">{statsLoading ? '...' : stats?.visits || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                                <FaWhatsapp size={24} />
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">INTENCIÓN</span>
                        </div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Clics en WhatsApp</h3>
                        <p className="text-3xl font-black text-emerald-900">{statsLoading ? '...' : stats?.whatsapp_clicks || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                                <FaShoppingCart size={24} />
                            </div>
                            <span className="text-xs font-bold text-purple-500 bg-purple-50 px-2 py-1 rounded-full">VENTAS</span>
                        </div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Pedidos Registrados</h3>
                        <p className="text-3xl font-black text-purple-900">{statsLoading ? '...' : stats?.orders || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                                <FaChartLine size={24} />
                            </div>
                            <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">EFICIENCIA</span>
                        </div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Tasa de Conversión</h3>
                        <p className="text-3xl font-black text-amber-900">
                            {statsLoading ? '...' : `${stats?.conversion_rate.toFixed(1) || 0}%`}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-white p-4 rounded-full shadow-inner mb-2">
                        <span className="text-4xl">🚀</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Próximamente: Gráficos Detallados</h2>
                    <p className="text-gray-500 max-w-md">Estamos trabajando para mostrarte la evolución de tus visitas y ventas día por día, y cuáles son tus productos más populares.</p>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
