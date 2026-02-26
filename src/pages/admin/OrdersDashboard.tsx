import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService, OrderResult } from '../../modules/orders/services/orderService';
import { useCurrentStore } from '../../hooks/useCurrentStore';
import { FaBoxOpen, FaCheckCircle, FaTimesCircle, FaClock, FaMoneyBillWave, FaUniversity } from 'react-icons/fa';

export const OrdersDashboard: React.FC = () => {
    const { user } = useAuth();
    const { storeId, loading: storeLoading, error: storeError } = useCurrentStore();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!storeId) {
                setLoading(false);
                return;
            }

            const result: OrderResult = await orderService.getStoreOrders(storeId);

            if (result.success) {
                setOrders(result.data || []);
            } else {
                setError('Error al cargar los pedidos.');
            }
            setLoading(false);
        };

        if (user && storeId) {
            fetchOrders();
        } else if (!storeLoading && !storeId) {
            setLoading(false);
        }
    }, [user, storeId, storeLoading]);

    // Combined Loading & Error Display
    if (storeLoading || loading) return <div className="p-8 text-center text-gray-500">Cargando pedidos...</div>;
    if (storeError) return <div className="p-8 text-center text-red-500">Error obteniendo datos de tu tienda: {storeError}</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Panel de Pedidos</h1>
                <p className="text-gray-500 mt-2">Gestiona los pedidos entrantes de tus clientes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <FaBoxOpen className="text-gray-300 text-6xl mb-4" />
                        <h3 className="text-lg font-bold text-gray-600">Aún no tienes pedidos</h3>
                        <p className="text-gray-400">Cuando los clientes completen sus compras, aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">Fecha</th>
                                    <th className="p-4 font-bold">Cliente</th>
                                    <th className="p-4 font-bold">Método</th>
                                    <th className="p-4 font-bold">Total</th>
                                    <th className="p-4 font-bold">Estado</th>
                                    <th className="p-4 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{order.customer_info?.name}</div>
                                            <div className="text-xs text-gray-500">{order.customer_info?.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            {order.payment_method === 'cash' ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-medium"><FaMoneyBillWave /> Efectivo</span>
                                            ) : order.payment_method === 'transfer' ? (
                                                <span className="flex items-center gap-1 text-blue-600 font-medium"><FaUniversity /> Transferencia</span>
                                            ) : (
                                                <span className="text-gray-500 font-medium">A convenir</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">${order.total}</div>
                                            {order.discount_applied > 0 && (
                                                <div className="text-xs text-emerald-500">Ahorro: ${order.discount_applied}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1 w-max">
                                                <FaClock /> Pendiente
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-blue-500 hover:text-blue-700 text-sm font-bold">Ver detalle</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
