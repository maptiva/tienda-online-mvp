import React, { useEffect, useState } from 'react';
import { useClients } from '../../../hooks/crm/useClients';
import { usePayments } from '../../../hooks/crm/usePayments';
import ClientModal from '../../../components/crm/ClientModal';
import PaymentModal from '../../../components/crm/PaymentModal';
import Swal from 'sweetalert2';

const Clients = () => {
    const { clients, loading: clientsLoading, error, fetchClients, getRealStores, createClient, updateClient, deleteClient } = useClients();
    const { registerPayment, loading: paymentLoading } = usePayments();

    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleOpenEdit = (client) => {
        setSelectedClient(client);
        setIsClientModalOpen(true);
    };

    const handleOpenPayment = (client) => {
        setSelectedClient(client);
        setIsPaymentModalOpen(true);
    };

    const handleSubmitClient = async (formData, storeId, clientId) => {
        let result;
        if (clientId) {
            result = await updateClient(clientId, formData, storeId);
        } else {
            result = await createClient(formData, storeId);
        }

        if (result.success) {
            // Cerrar modal DESPUÉS de que se complete el guardado
            setIsClientModalOpen(false);
            setSelectedClient(null);

            // Forzar un refresh adicional para asegurar que la UI se actualice
            await fetchClients();

            Swal.fire({
                title: clientId ? '¡Cambios Guardados!' : '¡Cliente Creado!',
                text: 'La base de datos se ha actualizado correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    };

    const handleRegisterPayment = async (paymentData) => {
        const result = await registerPayment(paymentData);
        if (result.success) {
            setIsPaymentModalOpen(false);
            setSelectedClient(null);
            await fetchClients(); // Recargar para ver el nuevo estado si aplica
            Swal.fire({
                title: '¡Cobro Registrado!',
                text: 'El pago ha sido procesado y guardado en el historial.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar Cliente?',
            text: "Esta acción no se puede deshacer y desvinculará sus tiendas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            const result = await deleteClient(id);
            if (result.success) {
                Swal.fire('Eliminado', 'El cliente ha sido borrado.', 'success');
            } else {
                Swal.fire('Error', result.error, 'error');
            }
        }
    };

    if (clientsLoading && clients.length === 0) return <div className="p-10 text-center text-gray-400">Accediendo a la red maestra...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter italic">Gestión Clientes Maestro</h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-bold">Consola de Control Comercial</p>
                </div>
                <button
                    onClick={() => { setSelectedClient(null); setIsClientModalOpen(true); }}
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all text-sm uppercase"
                >
                    + Nuevo Cliente
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Identidad</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Tiendas Vinculadas</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Estado Comercial</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acciones Maestras</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-8 py-20 text-center">
                                    <p className="text-gray-300 text-lg font-medium italic">No hay clientes en tu radar comercial todavía.</p>
                                </td>
                            </tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id} className="group hover:bg-blue-50/30 transition-all">
                                    <td className="px-8 py-6">
                                        <p className="font-black text-gray-800 text-lg">{client.name}</p>
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-xs text-gray-400">{client.contact_email || 'Sin email'}</span>
                                            <span className="text-xs text-blue-400 font-bold">{client.contact_phone || ''}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {client.stores && client.stores.length > 0 ? (
                                                client.stores.map(store => (
                                                    <div key={store.id} className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        <span className="text-xs font-bold text-gray-700">{store.store_name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-300 italic font-medium">
                                                    {clientsLoading ? 'Buscando tiendas...' : 'Sin tiendas vinculadas'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {(() => {
                                            // Determinar si el cliente tiene alguna suscripción activa en sus tiendas
                                            const hasActiveSub = client.stores?.some(s =>
                                                s.subscriptions?.some(sub => sub.status === 'ACTIVE')
                                            );

                                            return (
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${hasActiveSub ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-500 border border-red-100'
                                                    }`}>
                                                    {hasActiveSub ? '● Pago al Día' : '● Pago Pendiente'}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleOpenPayment(client)}
                                                className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                title="Registrar Pago"
                                            >
                                                💵
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(client)}
                                                className="bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="bg-red-50 text-red-400 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modales */}
            <ClientModal
                isOpen={isClientModalOpen}
                onClose={() => { setIsClientModalOpen(false); setSelectedClient(null); }}
                getRealStores={getRealStores}
                onSubmit={handleSubmitClient}
                editingClient={selectedClient}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => { setIsPaymentModalOpen(false); setSelectedClient(null); }}
                onSubmit={handleRegisterPayment}
                client={selectedClient}
            />
        </div>
    );
};

export default Clients;
