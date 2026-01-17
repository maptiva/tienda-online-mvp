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
        { title: 'Clientes Totales', value: stats.totalClients, icon: '👥', color: 'blue' },
        { title: 'Ingresos Mes', value: `$${stats.monthlyRevenue}`, icon: '💰', color: 'green' },
        { title: 'Leads Pendientes', value: stats.pendingLeads, icon: '🔥', color: 'orange' },
    ];

    if (loading) return <div className="text-gray-400">Cargando métricas...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                        <p className="text-2xl font-bold mt-1 uppercase text-gray-800">{card.value}</p>
                    </div>
                    <div className="text-3xl opacity-80">{card.icon}</div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">💰 Últimos Pagos</h3>
                <Link to="/admin/crm/payments" className="text-xs text-blue-600 hover:text-blue-700 font-semibold uppercase tracking-wider">
                    Ver todos →
                </Link>
            </div>
            {loading ? (
                <p className="text-gray-400 text-sm">Cargando...</p>
            ) : recentPayments.length === 0 ? (
                <p className="text-gray-300 text-sm italic">No hay pagos registrados</p>
            ) : (
                <div className="space-y-3">
                    {recentPayments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-all">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{payment.clients?.name || 'Sin cliente'}</p>
                                <p className="text-xs text-gray-400">{formatDate(payment.created_at)}</p>
                            </div>
                            <p className="text-sm font-black text-emerald-600">{formatCurrency(payment.amount)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CRMDashboard = () => {
    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard de Gestión</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Nivel Súper Admin Maestro</p>
                </div>
            </div>
            <CRMStats />
            <RecentPayments />
            <div className="bg-blue-50 border border-blue-100 p-4 md:p-6 rounded-xl text-blue-800 flex items-center gap-3 md:gap-4 mt-6 md:mt-8">
                <span className="text-xl md:text-2xl">👑</span>
                <p className="text-xs md:text-sm">Bienvenido Alejandro. Solo tú puedes ver esta sección comercial.</p>
            </div>
        </div>
    );
};

export default CRMDashboard;
