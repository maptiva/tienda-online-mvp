import React, { useEffect } from 'react';
import { usePayments } from '../../../hooks/crm/usePayments';

const Payments = () => {
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
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentType = (notes) => {
        if (notes?.includes('ACTIVACION')) return { label: '🚀 Activación', color: 'emerald' };
        if (notes?.includes('MANTENIMIENTO')) return { label: '🛠️ Mantenimiento', color: 'blue' };
        return { label: '💰 Pago', color: 'gray' };
    };

    if (loading && payments.length === 0) {
        return <div className="p-10 text-center text-gray-400">Cargando historial de pagos...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-800 tracking-tighter italic">Historial de Pagos</h1>
                <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold">Registro Completo de Ingresos</p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Método</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Notas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-8 py-20 text-center">
                                    <p className="text-gray-300 text-lg font-medium italic">No hay pagos registrados todavía.</p>
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => {
                                const paymentType = getPaymentType(payment.notes);
                                return (
                                    <tr key={payment.id} className="group hover:bg-emerald-50/30 transition-all text-xs lg:text-sm">
                                        <td className="px-8 py-6">
                                            <p className="text-gray-600 font-medium">{formatDate(payment.created_at)}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-800">{payment.clients?.name || 'Sin cliente'}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${paymentType.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                                    paymentType.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {paymentType.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="text-lg font-black text-emerald-600">{formatCurrency(payment.amount)}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600">{payment.payment_method}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs text-gray-400 italic max-w-xs truncate">{payment.notes || '-'}</p>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {payments.length > 0 && (
                <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Total Registrado</span>
                        <span className="text-3xl font-black text-emerald-600">
                            {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
