import React, { useEffect, useState } from 'react';
import { useClients } from '../../../hooks/crm/useClients';
import { usePayments } from '../../../hooks/crm/usePayments';
import ClientModal from '../../../components/crm/ClientModal';
import PaymentModal from '../../../components/crm/PaymentModal';
import Swal from 'sweetalert2';
import { FaUserPlus } from 'react-icons/fa';
import SearchBar from '../../../components/SearchBar';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Client } from '../../../schemas/client.schema';

interface ClientWithRelations extends Client {
    stores?: { id: string; user_id: string; store_name: string }[];
    payments?: { created_at: string }[];
}

const Clients: React.FC = () => {
    const { clients, loading: clientsLoading, fetchClients, getRealStores, createClient, updateClient, archiveClient, reactivateClient, pagination, nextPage, prevPage } = useClients();
    const { registerPayment, loading: paymentLoading } = usePayments();
    const { setImpersonatedUser, isMaster } = useAuth();
    const navigate = useNavigate();

    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    const handleImpersonate = (userId: string, storeName: string) => {
        Swal.fire({
            title: `¡Modo Gestión Activo!`,
            text: `Ahora estás viendo y editando la tienda de ${storeName}.`,
            icon: 'info',
            confirmButtonText: 'Ir al Panel Admin',
            showCancelButton: true,
            cancelButtonText: 'Quedarme aquí'
        }).then((result) => {
            if (result.isConfirmed) {
                setImpersonatedUser({ id: userId, storeName });
                navigate('/admin');
            }
        });
    };

    useEffect(() => {
        fetchClients(showArchived);
    }, [fetchClients, showArchived]);

    const handleOpenEdit = (client: ClientWithRelations) => {
        setSelectedClient(client);
        setIsClientModalOpen(true);
    };

    const handleOpenPayment = (client: ClientWithRelations) => {
        setSelectedClient(client);
        setIsPaymentModalOpen(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmitClient = async (formData: any, storeId: any, clientId?: any) => {
        let result;
        if (clientId) {
            result = await updateClient(clientId, formData, storeId);
        } else {
            result = await createClient(formData, storeId);
        }

        if (result.success) {
            setIsClientModalOpen(false);
            setSelectedClient(null);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRegisterPayment = async (paymentData: any) => {
        const result = await registerPayment(paymentData);
        if (result.success) {
            setIsPaymentModalOpen(false);
            setSelectedClient(null);
            await fetchClients();
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

    const handleArchive = async (id: string) => {
        const confirm = await Swal.fire({
            title: '¿Dar de baja cliente?',
            text: "El cliente será archivado y su tienda quedará vacante, pero conservadorás su historial contable.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Sí, dar de baja',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            const result = await archiveClient(id);
            if (result.success) {
                Swal.fire('Archivado', 'El cliente ha sido dado de baja.', 'success');
            } else {
                Swal.fire('Error', result.error, 'error');
            }
        }
    };

    const handleReactivate = async (id: string) => {
        const confirm = await Swal.fire({
            title: '¿Reactivar cliente?',
            text: "El cliente volverá al radar de gestión activa.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            const result = await reactivateClient(id);
            if (result.success) {
                Swal.fire('Reactivado', 'El cliente está activo nuevamente.', 'success');
            } else {
                Swal.fire('Error', result.error, 'error');
            }
        }
    };

    const filteredClients = (clients as ClientWithRelations[]).filter(client => {
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
        <div className="px-4 md:pt-0 md:px-8 max-w-7xl mx-auto flex flex-col flex-1 min-h-0">
            <div className="mb-2 flex justify-between items-end border-b border-white pb-1 mt-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tighter italic leading-none">
                        {showArchived ? 'Archivo de Clientes' : 'Gestión Clientes Maestro'}
                    </h1>
                    <p className="text-gray-400 text-[10px] md:text-xs mt-1 uppercase tracking-[0.2em] font-black opacity-50">
                        {showArchived ? 'Historial de Bajas y Auditoría' : 'Consola de Control Comercial'}
                    </p>
                </div>

                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`text-[10px] p-2 px-4 rounded-full font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${showArchived
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                >
                    {showArchived ? '● Viendo Archivados' : 'Ver Archivados'}
                </button>
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
                    <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest">
                        {showArchived ? "Archivo:" : "Radar:"} <span className="text-gray-800">{filteredClients.length}</span> de <span className="text-gray-800">{pagination.totalItems}</span> Clientes
                    </p>
                )}
            </div>

            <div className="flex-1 min-h-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden h-full">

                    <div className="p-4 md:p-6 bg-gray-50/50 border-b border-gray-100">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            placeholder="Buscar por nombre, email o tienda..."
                        />
                    </div>

                    <div className="hidden md:block overflow-x-auto border-t border-gray-100 flex-1 overflow-y-auto custom-scrollbar shadow-inner bg-gray-50/20">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-[40] bg-gray-100 shadow-sm">
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
                                        <tr key={String(client.id)} className="group hover:bg-blue-50/30 transition-all">
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
                                                            <button
                                                                key={store.id}
                                                                onClick={() => isMaster && handleImpersonate(store.user_id, store.store_name)}
                                                                className={`flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm transition-all ${isMaster ? 'hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer group/store' : ''}`}
                                                                title={isMaster ? 'Gestionar esta tienda' : ''}
                                                            >
                                                                <span className={`w-2 h-2 rounded-full ${isMaster ? 'bg-blue-500 group-hover/store:bg-white' : 'bg-blue-500'}`}></span>
                                                                <span className="text-xs font-bold text-gray-700 group-hover/store:text-white">{store.store_name}</span>
                                                            </button>
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
                                                    {showArchived ? (
                                                        <button
                                                            onClick={() => handleReactivate(client.id)}
                                                            className="bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                            title="Reactivar Cliente"
                                                        >
                                                            ↩
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenPayment(client)}
                                                                className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                title="Registrar Pago"
                                                            >
                                                                💰
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenEdit(client)}
                                                                className="bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                title="Editar Cliente"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleArchive(client.id)}
                                                                className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                                title="Archivar Cliente"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={prevPage}
                                disabled={!pagination.hasPrevPage || clientsLoading}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-200 shadow-sm hover:bg-gray-100 text-gray-600"
                            >
                                ← Anterior
                            </button>

                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                Página {pagination.page} de {pagination.totalPages}
                            </span>

                            <button
                                onClick={nextPage}
                                disabled={!pagination.hasNextPage || clientsLoading}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-200 shadow-sm hover:bg-gray-100 text-gray-600"
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </div>

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
        </div>
    );
};

export default Clients;
