import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabase';
import { usePayments } from '../../../hooks/crm/usePayments';
import { Link } from 'react-router-dom';
import BarChartView from './BarChartView';

// Componente para obtener ingresos por mes
const useMonthlyRevenue = ({ selectedYear }) => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMonthlyRevenue = async () => {
            try {
                console.log('🔍 Consultando pagos para año:', selectedYear);

                // Consultar todos los pagos sin filtro de fecha primero
                const { data: allPayments, error: allError } = await supabase
                    .from('payments')
                    .select('amount, created_at')
                    .order('created_at', { ascending: false })
                    .limit(100);

                console.log('📊 Total pagos encontrados:', allPayments?.length || 0);
                if (allPayments?.length > 0) {
                    console.log('📅 Primer pago:', allPayments[0]);
                    console.log('📅 Último pago:', allPayments[allPayments.length - 1]);
                }

                if (allError) {
                    console.error('❌ Error en consulta:', allError);
                    throw allError;
                }

                // Filtrar por año en JavaScript (más confiable)
                const filteredPayments = allPayments?.filter(payment => {
                    const paymentDate = new Date(payment.created_at);
                    return paymentDate.getFullYear() === selectedYear;
                }) || [];

                console.log(`💰 Pagos del año ${selectedYear}:`, filteredPayments.length);

                // Agrupar por mes
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthlyTotals = Array(12).fill(0);

                filteredPayments.forEach(payment => {
                    const month = new Date(payment.created_at).getMonth();
                    monthlyTotals[month] += payment.amount || 0;
                });

                console.log('📊 Totales por mes:', monthlyTotals);

                // Crear array con datos por mes
                const formattedData = monthlyTotals.map((total, index) => ({
                    month: months[index],
                    shortMonth: months[index],
                    fullMonth: months[index],
                    total,
                    monthIndex: index + 1
                }));

                setMonthlyData(formattedData);
            } catch (error) {
                console.error('❌ Error fetching monthly revenue:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyRevenue();
    }, [selectedYear]);

    return { monthlyData, loading, error };
};

// 1. RESUMEN SIMPLE: Últimos 3 meses del año seleccionado
const SimpleSummary = ({ monthlyData, year }) => {
    const currentMonth = new Date().getMonth(); // 0-11
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Determinar qué 3 meses mostrar según el año seleccionado
    let last3Months = [];

    if (year === new Date().getFullYear()) {
        // Si es el año actual, mostrar los últimos 3 meses hasta el mes actual
        const monthsToShow = Math.min(3, currentMonth + 1);
        const startMonth = Math.max(0, currentMonth + 1 - 3);
        for (let i = startMonth; i < currentMonth + 1; i++) {
            last3Months.push({ ...monthlyData[i], monthName: months[i] });
        }
    } else {
        // Si es un año anterior, mostrar los últimos 3 meses de ese año (Oct, Nov, Dic)
        last3Months = [
            { ...monthlyData[9], monthName: months[9] },
            { ...monthlyData[10], monthName: months[10] },
            { ...monthlyData[11], monthName: months[11] }
        ];
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#5FAFB8] to-[#4a9ea8]">
                <h3 className="text-xl font-black text-white italic tracking-tight">📊 Resumen Simple</h3>
                <p className="text-[10px] text-white/80 uppercase font-black tracking-widest mt-1">
                    {year === new Date().getFullYear()
                        ? (last3Months.length >= 3 ? 'Últimos 3 meses' : `Resumen acumulado ${year}`)
                        : `Meses clave ${year}`}
                </p>
            </div>
            <div className="p-6 space-y-4">
                {last3Months.map((month, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#5FAFB8]/10 rounded-full flex items-center justify-center text-[#5FAFB8] font-bold">
                                {month.monthName?.substring(0, 3) || '--'}
                            </div>
                            <div>
                                <p className="font-black text-gray-800 italic">
                                    {month.monthName || 'Mes'}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {year}
                                </p>
                            </div>
                        </div>
                        <p className="text-lg font-black text-emerald-600 tracking-tighter">
                            {formatCurrency(month?.total || 0)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. TABLA COMPLETA: Todos los meses del año con totales
const FullTableView = ({ monthlyData }) => {
    const totalAnnual = monthlyData.reduce((acc, month) => acc + month.total, 0);
    const currentMonth = new Date().getMonth();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getPercentage = (amount) => {
        if (totalAnnual === 0) return '0%';
        return ((amount / totalAnnual) * 100).toFixed(1) + '%';
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]">
                <h3 className="text-xl font-black text-white italic tracking-tight">📋 Tabla Completa</h3>
                <p className="text-[10px] text-white/80 uppercase font-black tracking-widest mt-1">Todos los meses del año</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Mes</th>
                            <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Ingresos</th>
                            <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">% del Año</th>
                            <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {monthlyData.map((month, index) => {
                            const isCurrentMonth = index === currentMonth;
                            return (
                                <tr key={index} className={`hover:bg-gray-50 transition-colors ${isCurrentMonth ? 'bg-[#5FAFB8]/5' : ''}`}>
                                    <td className="px-4 py-3">
                                        <span className={`font-bold text-gray-800 ${isCurrentMonth ? 'text-[#5FAFB8]' : ''}`}>
                                            {month.fullMonth}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-black text-gray-800 tracking-tight">
                                            {formatCurrency(month.total)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#5FAFB8] rounded-full transition-all"
                                                    style={{ width: getPercentage(month.total) }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-bold">{getPercentage(month.total)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {isCurrentMonth ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-[#5FAFB8] text-white uppercase">
                                                Actual
                                            </span>
                                        ) : month.total > 0 ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                                                ✓
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 uppercase">
                                                -
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="bg-gray-100 font-black">
                            <td className="px-4 py-4 text-gray-800">TOTAL AÑO</td>
                            <td className="px-4 py-4 text-right text-[#5FAFB8]">{formatCurrency(totalAnnual)}</td>
                            <td className="px-4 py-4 text-right text-gray-500">100%</td>
                            <td className="px-4 py-4 text-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Anual</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Selector de visualización
const RevenueViewSelector = ({ selectedYear, onYearChange }) => {
    const [viewMode, setViewMode] = useState('simple'); // simple, bar, table
    const { monthlyData, loading, error } = useMonthlyRevenue({ selectedYear });

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1]; // 2026, 2025

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Cargando datos...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-600 font-bold">Error al cargar datos: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Selector de año */}
            <div className="flex gap-2 items-center">
                <select
                    value={selectedYear || currentYear}
                    onChange={(e) => onYearChange && onYearChange(parseInt(e.target.value))}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-700 transition-colors"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <span className="text-sm text-gray-500 font-medium flex items-center">
                    {selectedYear < currentYear && '← Ver año anterior'}
                </span>
            </div>

            {/* Selector de modo */}
            <div className="flex gap-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100">
                <button
                    onClick={() => setViewMode('simple')}
                    className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'simple'
                        ? 'bg-[#5FAFB8] text-white shadow-lg shadow-[#5FAFB8]/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    📊 Simple
                </button>
                <button
                    onClick={() => setViewMode('bar')}
                    className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'bar'
                        ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    📈 Barras
                </button>
                <button
                    onClick={() => setViewMode('table')}
                    className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table'
                        ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    📋 Tabla
                </button>
            </div>

            {/* Visualización según modo seleccionado */}
            {viewMode === 'simple' && <SimpleSummary monthlyData={monthlyData} year={selectedYear} />}
            {viewMode === 'bar' && <BarChartView monthlyData={monthlyData} />}
            {viewMode === 'table' && <FullTableView monthlyData={monthlyData} />}
        </div>
    );
};

const CRMStats = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        monthlyRevenue: 0,
        pendingLeads: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
                const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
                const { data: payments } = await supabase.from('payments').select('amount').gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

                const monthlyRevenue = payments?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

                setStats({
                    totalClients: clientsCount || 0,
                    monthlyRevenue,
                    pendingLeads: leadsCount || 0
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: 'Clientes Totales', value: stats.totalClients, icon: '👥', color: 'blue', label: 'Radar comercial' },
        { title: 'Ingresos Mes', value: `$${stats.monthlyRevenue.toLocaleString()}`, icon: '💰', color: 'emerald', label: 'Balance actual' },
        { title: 'Leads Pendientes', value: stats.pendingLeads, icon: '🔥', color: 'orange', label: 'Nuevas tiendas' },
    ];

    if (loading) return <div className="p-10 text-center text-gray-400">Accediendo a la red maestra...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between group hover:border-[#5FAFB8]/30 transition-all">
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black mb-1 opacity-70">{card.label}</p>
                        <p className="text-3xl md:text-4xl font-black text-gray-800 tracking-tighter italic">{card.value}</p>
                        <p className="text-gray-500 text-xs font-bold mt-1 uppercase opacity-60">{card.title}</p>
                    </div>
                    <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all opacity-20 group-hover:opacity-100">{card.icon}</div>
                </div>
            ))}
        </div>
    );
};

const RecentPayments = () => {
    const { payments, loading, fetchPayments } = usePayments();

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const recentPayments = payments.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black text-gray-800 italic tracking-tight">Últimos Movimientos</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Libro Diario Maestro</p>
                </div>
                <Link
                    to="/admin/crm/payments"
                    className="bg-[#5FAFB8] text-[#1e293b] p-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all active:scale-95 shadow-lg shadow-[#5FAFB8]/20"
                >
                    Ver Libro Completo →
                </Link>
            </div>

            <div className="p-6 md:p-8">
                {loading ? (
                    <p className="p-10 text-center text-gray-300 italic">Analizando registros...</p>
                ) : recentPayments.length === 0 ? (
                    <p className="p-10 text-center text-gray-300 italic font-medium">No hay registros financieros recientes.</p>
                ) : (
                    <div className="space-y-4">
                        {recentPayments.map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#5FAFB8]/10 hover:bg-white hover:shadow-lg transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                                        $
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 italic">{payment.clients?.name || 'Cliente Desconocido'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{formatDate(payment.created_at)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-emerald-600 tracking-tighter">{formatCurrency(payment.amount)}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{payment.payment_method || 'MAESTRO'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CRMDashboard = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col flex-1 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tighter italic border-b border-gray-100 pb-4">Consola de Gestión Maestro</h1>
                <p className="text-gray-400 text-[10px] md:text-xs mt-2 uppercase tracking-[0.2em] font-black opacity-50">Inteligencia Comercial CLICANDO</p>
            </div>

            <CRMStats />

            {/* Nueva sección de ingresos por mes */}
            <div className="mb-8">
                <div className="mb-4">
                    <h2 className="text-xl font-black text-gray-800 italic tracking-tight">Ingresos por Mes</h2>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Selecciona el formato de visualización</p>
                </div>
                <RevenueViewSelector
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RecentPayments />
                </div>

                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-500">👑</div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#5FAFB8] mb-4">Acceso Restringido</h4>
                        <p className="text-xl font-black italic tracking-tight leading-snug">Bienvenido de nuevo, Alejandro.</p>
                        <p className="text-sm text-gray-400 mt-4 leading-relaxed">Este portal contiene datos sensibles de clientes y flujos financieros. Solo tú tienes permiso de Auditoría Maestra.</p>
                        <div className="mt-8 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#5FAFB8] rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sesión de Alta Seguridad</span>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Tip Maestro 💡</p>
                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">Revisa el Libro Diario periódicamente para asegurar que todos los clientes estén al día con sus suscripciones.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMDashboard;
