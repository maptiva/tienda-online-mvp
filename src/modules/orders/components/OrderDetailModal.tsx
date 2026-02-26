import React from 'react';
import { Order } from '../services/orderService';
import { FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaMoneyBillWave, FaUniversity, FaCalendarAlt, FaShoppingBag } from 'react-icons/fa';

interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const subtotal = order.total + (order.discount_applied || 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            Pedido #{order.id.toString().slice(-6).toUpperCase()}
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <FaCalendarAlt className="text-gray-400" />
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Customer Info */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                            <FaUser size={10} /> Información del Cliente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Nombre</p>
                                <p className="font-bold text-gray-800">{order.customer_info.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500">Teléfono</p>
                                <p className="font-bold text-gray-800 flex items-center gap-2">
                                    <FaPhone className="text-gray-400" size={12} />
                                    {order.customer_info.phone}
                                </p>
                            </div>
                            {order.customer_info.address && (
                                <div className="space-y-1 md:col-span-2 pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">Dirección</p>
                                    <p className="font-medium text-gray-800 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-gray-400" size={12} />
                                        {order.customer_info.address}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Order Items */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                            <FaShoppingBag size={10} /> Productos
                        </h3>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-2">Producto</th>
                                        <th className="px-4 py-2 text-center">Cant.</th>
                                        <th className="px-4 py-2 text-right">Precio</th>
                                        <th className="px-4 py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="text-sm">
                                            <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                            <td className="px-4 py-3 text-center text-gray-600">x{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">${item.price}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Payment & Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                Método de Pago
                            </h3>
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-gray-200">
                                {order.payment_method === 'cash' ? (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                        <FaMoneyBillWave size={20} />
                                        <span>Efectivo</span>
                                    </div>
                                ) : order.payment_method === 'transfer' ? (
                                    <div className="flex items-center gap-2 text-blue-600 font-bold">
                                        <FaUniversity size={20} />
                                        <span>Transferencia Bancaria</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 font-bold">A convenir</span>
                                )}
                            </div>
                        </section>

                        <section className="bg-gray-50 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount_applied > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                    <span>Descuento aplicado</span>
                                    <span>-${order.discount_applied.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-base font-bold text-gray-800">Total cobrado</span>
                                <span className="text-2xl font-black text-gray-900">${order.total.toFixed(2)}</span>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        Cerrar
                    </button>
                    {/* Aquí podrían ir botones para cambiar estado en el futuro */}
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
};
