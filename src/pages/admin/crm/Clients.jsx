import React, { useEffect, useState } from 'react';
import { useClients } from '../../../hooks/crm/useClients';
import { usePayments } from '../../../hooks/crm/usePayments';
import ClientModal from '../../../components/crm/ClientModal';
import PaymentModal from '../../../components/crm/PaymentModal';
import Swal from 'sweetalert2';
import { FaSearch, FaUserPlus } from 'react-icons/fa';
import SearchBar from '../../../components/SearchBar';

const Clients = () => {
    const { clients, loading: clientsLoading, error, fetchClients, getRealStores, createClient, updateClient, deleteClient } = useClients();
    const { registerPayment, loading: paymentLoading } = usePayments();

    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Lógica de filtrado
    const filteredClients = clients.filter(client => {
        const searchLower = searchTerm.toLowerCase();
        return (
            client.name?.toLowerCase().includes(searchLower) ||
            client.contact_email?.toLowerCase().includes(searchLower) ||
            client.contact_phone?.toLowerCase().includes(searchLower) ||
            client.stores?.some(store => store.store_name?.toLowerCase().includes(searchLower))
        );
    });

    if (clientsLoading && clients.length === 0) return <div className="p-10 text-center text-gray-400">Accediendo a la red maestra...</div>;

    return (
        <div className="px-4 md:pt-0 md:px-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)]">
            <div className="mb-2">
                <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tighter italic border-b border-white pb-1 mt-0 leading-none">Gestión Clientes Maestro</h1>
                <p className="text-gray-400 text-[10px] md:text-xs mt-1 uppercase tracking-[0.2em] font-black opacity-50">Consola de Control Comercial</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <button
                    onClick={() => { setSelectedClient(null); setIsClientModalOpen(true); }}
                    className="w-full md:w-auto bg-emerald-500 text-white p-2.5 px-6 cursor-pointer hover:opacity-80 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                    <FaUserPlus className="text-lg" />
                    + Nuevo Cliente
                </button>

                {clients && (
                    <p className='text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest'>
                        Radar: <span className='text-gray-800'>{filteredClients.length}</span> de <span className='text-gray-800'>{clients.length}</span> Clientes
                    </p>
                )}
            </div>

            {/* Contenedor Maestro Estilo Admin - Wrap para Sombra */}
            <div className="flex-1 min-h-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden h-full">

                    {/* SearchBar Integrada */}
                    <div className="p-4 md:p-6 bg-gray-50/50 border-b border-gray-100">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            placeholder="Buscar por nombre, email o tienda..."
                        />
                    </div>
                    {/* ... rest of the content ... */}
                    {/* ... (this tool call needs the actual content to be safe) ... */}
                    <div className="hidden md:block overflow-x-auto border-t border-gray-100 flex-1 overflow-y-auto custom-scrollbar shadow-inner bg-gray-50/20">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-100 border-b border-gray-300 italic">
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">Identidad</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">Tiendas Vinculadas</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center border-b border-gray-200">Estado Comercial</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right border-b border-gray-200">Acciones Maestras</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <p className="text-gray-300 text-lg font-medium italic">
                                                {searchTerm ? 'No hay resultados para esa búsqueda.' : 'No hay clientes en tu radar comercial todavía.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client.id} className="group hover:bg-blue-50/30 transition-all">
                                            <td className="px-8 py-4">
                                                <p className="font-black text-gray-800 text-lg leading-tight">{client.name}</p>
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
                                            <td className="px-8 py-4 text-center">
                                                {(() => {
                                                    const payments = client.payments || [];
                                                    if (payments.length === 0) return (
                                                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-red-50 text-red-500 border border-red-100">
                                                            ● Pago Pendiente
                                                        </span>
                                                    );

                                                    const latestPayment = payments[0];
                                                    const pDate = new Date(latestPayment.created_at);
                                                    const today = new Date();

                                                    const isThisMonth = pDate.getMonth() === today.getMonth() && pDate.getFullYear() === today.getFullYear();

                                                    // Lógica de Gracia: si es antes del 11 y pagó el mes pasado
                                                    const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
                                                    const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
                                                    const isLastMonth = pDate.getMonth() === lastMonth && pDate.getFullYear() === lastMonthYear;

                                                    const isUpToDate = isThisMonth || (today.getDate() <= 10 && isLastMonth);

                                                    return (
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${isUpToDate ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-500 border border-red-100'
                                                            }`}>
                                                            {isUpToDate ? '● Pago al Día' : '● Pago Pendiente'}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-4 text-right">
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

                    {/* Vista Mobile - Cards Integradas */}
                    <div className="md:hidden overflow-y-auto px-4 py-6 space-y-4 flex-1 custom-scrollbar bg-gray-50/30 border-t border-gray-100">
                        {filteredClients.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                                <p className="text-gray-300 text-base font-medium italic">
                                    {searchTerm ? 'No hay resultados para esa búsqueda.' : 'No hay clientes en tu radar comercial todavía.'}
                                </p>
                            </div>
                        ) : (
                            filteredClients.map((client) => {
                                const payments = client.payments || [];
                                const latestPayment = payments[0];
                                let isUpToDate = false;

                                if (latestPayment) {
                                    const pDate = new Date(latestPayment.created_at);
                                    const today = new Date();
                                    const isThisMonth = pDate.getMonth() === today.getMonth() && pDate.getFullYear() === today.getFullYear();
                                    const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
                                    const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
                                    const isLastMonth = pDate.getMonth() === lastMonth && pDate.getFullYear() === lastMonthYear;
                                    isUpToDate = isThisMonth || (today.getDate() <= 10 && isLastMonth);
                                }

                                return (
                                    <div key={client.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                                        {/* Header */}
                                        <div className="mb-3">
                                            <h3 className="font-black text-gray-800 text-xl">{client.name}</h3>
                                            <div className="flex flex-col gap-1 mt-2">
                                                <span className="text-xs text-gray-400">{client.contact_email || 'Sin email'}</span>
                                                <span className="text-xs text-blue-400 font-bold">{client.contact_phone || 'Sin teléfono'}</span>
                                            </div>
                                        </div>

                                        {/* Estado */}
                                        <div className="mb-3">
                                            <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${isUpToDate ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                                {isUpToDate ? '● Pago al Día' : '● Pago Pendiente'}
                                            </span>
                                        </div>

                                        {/* Tiendas */}
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Tiendas Vinculadas</p>
                                            <div className="flex flex-wrap gap-2">
                                                {client.stores && client.stores.length > 0 ? (
                                                    client.stores.map(store => (
                                                        <div key={store.id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                            <span className="text-xs font-bold text-blue-700">{store.store_name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-300 italic">Sin tiendas vinculadas</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => handleOpenPayment(client)}
                                                className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold"
                                            >
                                                💵 Cobrar
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(client)}
                                                className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-xs font-bold"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="flex-1 bg-red-50 text-red-400 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
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
        </div >
    );
};


export default Clients;
