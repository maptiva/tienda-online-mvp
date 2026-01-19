import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabase';
import { usePayments } from '../../../hooks/crm/usePayments';
import { Link } from 'react-router-dom';

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
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tighter italic border-b border-gray-100 pb-4">Consola de Gestión Maestro</h1>
                <p className="text-gray-400 text-[10px] md:text-xs mt-2 uppercase tracking-[0.2em] font-black opacity-50">Inteligencia Comercial CLICANDO</p>
            </div>

            <CRMStats />

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
