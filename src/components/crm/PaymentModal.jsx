import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, onSubmit, client }) => {
    const [paymentData, setPaymentData] = useState({
        amount: 30000,
        payment_type: 'ACTIVACION', // 'ACTIVACION' o 'MANTENIMIENTO'
        payment_method: 'Transferencia',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Encontrar la suscripción o tienda vinculada si existe
        const subscriptionId = client?.stores?.[0]?.subscriptions?.[0]?.id || null;

        onSubmit({
            ...paymentData,
            client_id: client.id,
            subscription_id: subscriptionId,
            notes: `${paymentData.payment_type}: ${paymentData.notes}`
        });
    };

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Registrar Cobro</h2>
                        <p className="text-emerald-100 text-xs mt-1">Cobro para: {client.name}</p>
                    </div>
                    <span className="text-3xl">💰</span>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Cobro</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentData({ ...paymentData, payment_type: 'ACTIVACION', amount: 30000 })}
                                className={`p-3 rounded-xl border text-sm font-bold transition-all ${paymentData.payment_type === 'ACTIVACION'
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                                    }`}
                            >
                                🚀 Activación ($30k)
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentData({ ...paymentData, payment_type: 'MANTENIMIENTO', amount: 15000 })}
                                className={`p-3 rounded-xl border text-sm font-bold transition-all ${paymentData.payment_type === 'MANTENIMIENTO'
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                                    }`}
                            >
                                🛠️ Mant. ($15k)
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Monto ($)</label>
                            <input
                                type="number"
                                className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none bg-gray-50 font-bold"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Método</label>
                            <select
                                className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none bg-gray-50"
                                value={paymentData.payment_method}
                                onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                            >
                                <option value="Transferencia">Transferencia</option>
                                <option value="MercadoPago">MercadoPago</option>
                                <option value="Efectivo">Efectivo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notas / Comentario</label>
                        <textarea
                            className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none bg-gray-50 h-20 resize-none"
                            placeholder="Ej: Pago de noviembre, promo apertura..."
                            value={paymentData.notes}
                            onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                        >
                            Confirmar Pago
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
