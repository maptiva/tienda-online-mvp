import React, { useEffect, useState, useMemo } from 'react';
import { usePayments } from '../../../hooks/crm/usePayments';
import SearchBar from '../../../components/SearchBar';
import { FaHistory } from 'react-icons/fa';

const Payments = () => {
    const { payments, loading, fetchPayments } = usePayments();
    const [searchTerm, setSearchTerm] = useState('');

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
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }) + ' ' + date.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getPaymentType = (notes) => {
        if (notes?.includes('ACTIVACION')) return { label: '🚀 Activación', color: 'emerald' };
        if (notes?.includes('MANTENIMIENTO')) return { label: '🛠️ Mantenimiento', color: 'blue' };
        return { label: '💰 Pago', color: 'gray' };
    };

    // Lógica de filtrado
    const filteredPayments = useMemo(() => {
        if (!payments) return [];
        if (!searchTerm) return payments;
        const searchLower = searchTerm.toLowerCase();
        return payments.filter(p =>
            p.clients?.name?.toLowerCase().includes(searchLower) ||
            p.payment_method?.toLowerCase().includes(searchLower) ||
            p.notes?.toLowerCase().includes(searchLower)
        );
    }, [payments, searchTerm]);

    if (loading && payments.length === 0) {
        return <div className="p-10 text-center text-gray-400">Cargando historial de pagos...</div>;
    }

    return (
        <div className="px-4 md:pt-0 md:px-8 md:pb-0 max-w-7xl mx-auto flex flex-col flex-1 min-h-0">
            <div className="mb-2">
                <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tighter italic border-b border-white pb-1 mt-0 leading-none">Historial de Pagos</h1>
                <p className="text-gray-400 text-[10px] md:text-xs mt-1 uppercase tracking-[0.2em] font-black opacity-50">Registro Completo de Ingresos</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                    <FaHistory className="text-lg opacity-50" />
                    <span className="text-xs font-black uppercase tracking-widest">Libro Diario Maestro</span>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 opacity-70">Total Registrado</p>
                        <p className="text-xl font-black text-emerald-600 leading-none">
                            {formatCurrency(filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
                        </p>
                    </div>
                    {payments && (
                        <p className='text-xs md:text-[10px] text-gray-400 font-bold uppercase tracking-widest border-l border-gray-200 pl-4 h-8 flex items-center'>
                            Registros: <span className='text-gray-800 ml-1'>{filteredPayments.length}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Contenedor Historial Estilo Admin - Wrap para Sombra */}
            <div className="flex-1 min-h-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden h-full">

                    {/* SearchBar Integrada */}
                    <div className="p-4 md:p-6 bg-gray-50/50 border-b border-gray-100">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            placeholder="Buscar por cliente, método o notas..."
                        />
                    </div>
                    <div className="hidden md:block overflow-x-auto border-t border-gray-100 flex-1 overflow-y-auto custom-scrollbar shadow-inner bg-gray-50/20">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-[40] bg-gray-100 shadow-sm">
                                <tr className="bg-gray-100 border-b border-gray-300 italic">
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">Fecha</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 w-1/4">Cliente</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 whitespace-nowrap">Tipo</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right border-b border-gray-200">Monto</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">Método</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">Notas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-gray-400 italic">
                                            No hay registros que coincidan con tu búsqueda.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment) => {
                                        const paymentType = getPaymentType(payment.notes);
                                        return (
                                            <tr key={payment.id} className="group hover:bg-emerald-50/30 transition-all">
                                                <td className="px-8 py-4">
                                                    <p className="text-gray-500 font-medium whitespace-nowrap leading-tight tabular-nums">{formatDate(payment.created_at)}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="font-black text-gray-800 text-lg leading-tight min-w-[200px]">{payment.clients?.name || 'Sin cliente'}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${paymentType.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                                        paymentType.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {paymentType.label}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <p className="text-xl font-black text-emerald-600 leading-none">{formatCurrency(payment.amount)}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="text-sm text-gray-600 font-bold leading-tight">{payment.payment_method}</p>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <p className="text-xs text-gray-400 italic max-w-xs truncate leading-tight">{payment.notes || '-'}</p>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Mobile - Cards */}
                    <div className="md:hidden overflow-y-auto px-4 py-6 space-y-4 flex-1 custom-scrollbar bg-gray-50/30 border-t border-gray-100">
                        {filteredPayments.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                                <p className="text-gray-300 text-base font-medium italic">
                                    {searchTerm ? 'No hay resultados para esa búsqueda.' : 'No hay pagos registrados todavía.'}
                                </p>
                            </div>
                        ) : (
                            filteredPayments.map((payment) => {
                                const paymentType = getPaymentType(payment.notes);
                                return (
                                    <div key={payment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-black text-gray-800 text-lg">{payment.clients?.name || 'Sin cliente'}</h3>
                                                <p className="text-xs text-gray-400 mt-1">{formatDate(payment.created_at)}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${paymentType.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                                paymentType.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {paymentType.label}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-3xl font-black text-emerald-600">{formatCurrency(payment.amount)}</p>
                                        </div>
                                        <div className="space-y-2 pt-3 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Método:</span>
                                                <span className="text-sm text-gray-600 font-medium">{payment.payment_method}</span>
                                            </div>
                                            {payment.notes && (
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Notas:</span>
                                                    <p className="text-xs text-gray-500 italic">{payment.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
