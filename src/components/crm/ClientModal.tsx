import React, { useState, useEffect } from 'react';
import { type Client } from '../../schemas/client.schema';
import { type StoreWithMeta } from '../../hooks/crm/useClients';

export interface ClientFormData {
    name: string;
    contact_email: string;
    contact_phone: string;
    notes: string;
    enable_stock: boolean;
    payment_exempt: boolean;
    billing_info: {
        cuit: string;
        address: string;
    };
}

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: ClientFormData, storeId: string | number, clientId?: string | number) => void;
    getRealStores: () => Promise<StoreWithMeta[]>;
    editingClient?: (Client & { stores?: StoreWithMeta[] }) | null;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSubmit, getRealStores, editingClient = null }) => {
    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        contact_email: '',
        contact_phone: '',
        notes: '',
        enable_stock: false,
        payment_exempt: false,
        billing_info: { cuit: '', address: '' }
    });
    const [stores, setStores] = useState<StoreWithMeta[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string | number>('');
    const [loadingStores, setLoadingStores] = useState(false);

    // Efecto para cargar datos si estamos editando
    useEffect(() => {
        if (editingClient) {
            setFormData({
                name: editingClient.name || '',
                contact_email: editingClient.contact_email || '',
                contact_phone: editingClient.contact_phone || '',
                notes: editingClient.notes || '',
                enable_stock: editingClient.stores?.[0]?.enable_stock || false,
                payment_exempt: editingClient.stores?.[0]?.payment_exempt || false,
                billing_info: (editingClient.billing_info as { cuit: string; address: string } | null) || { cuit: '', address: '' }
            });
            // Si tiene tienda, seleccionarla
            if (editingClient.stores && editingClient.stores.length > 0) {
                setSelectedStoreId(editingClient.stores[0].id);
            } else {
                setSelectedStoreId('');
            }
        } else {
            // Limpiar formulario para nuevo cliente
            setFormData({
                name: '',
                contact_email: '',
                contact_phone: '',
                notes: '',
                enable_stock: false,
                payment_exempt: false,
                billing_info: { cuit: '', address: '' }
            });
            setSelectedStoreId('');
        }
    }, [editingClient, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const fetchStores = async () => {
                setLoadingStores(true);
                const data = await getRealStores();
                setStores(data);
                setLoadingStores(false);
            };
            fetchStores();
        }
    }, [isOpen, getRealStores]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, selectedStoreId, editingClient?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-r from-[#5FAFB8] to-[#4a9098] p-6 text-white">
                    <h2 className="text-xl font-bold italic tracking-tight">
                        {editingClient ? 'Editar Cliente Maestro' : 'Nuevo Cliente Maestro'}
                    </h2>
                    <p className="text-emerald-50 text-xs mt-1">
                        {editingClient ? `Modificando a ${editingClient.name}` : 'Registra una nueva entidad comercial y vincula su tienda.'}
                    </p>
                </div>

                <form onSubmit={handleFormSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información Básica */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Información Básica</h3>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre / Razón Social</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#5FAFB8]/30 transition-all outline-none bg-gray-50 text-gray-700"
                                    placeholder="Ej: Alejandro Maptiva o Juan Pérez"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Email de Contacto</label>
                                <input
                                    type="email"
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#5FAFB8]/30 transition-all outline-none bg-gray-50 text-gray-700"
                                    placeholder="cliente@ejemplo.com"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#5FAFB8]/30 transition-all outline-none bg-gray-50 text-gray-700"
                                    placeholder="+54 9 11 ..."
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Facturación y Tienda */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Vínculos y Facturación</h3>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Vincular Tienda Existente</label>
                                <select
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#5FAFB8]/30 transition-all outline-none bg-gray-50 text-gray-700"
                                    value={selectedStoreId}
                                    onChange={(e) => setSelectedStoreId(e.target.value)}
                                >
                                    <option value="">Seleccionar una tienda...</option>
                                    {loadingStores ? (
                                        <option disabled>Cargando tiendas...</option>
                                    ) : (
                                        stores.filter(s => !s.client_id || s.client_id === editingClient?.id).map(store => (
                                            <option key={store.id} value={store.id}>{store.store_name}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">CUIT / ID Fiscal</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#5FAFB8]/30 transition-all outline-none bg-gray-50 text-gray-700"
                                    placeholder="20-XXXXXXXX-X"
                                    value={formData.billing_info.cuit}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        billing_info: { ...formData.billing_info, cuit: e.target.value }
                                    })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Dirección Legal</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#5FAFB8]/30 transition-all outline-none bg-gray-50 text-gray-700"
                                    placeholder="Calle 123, Ciudad"
                                    value={formData.billing_info.address}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        billing_info: { ...formData.billing_info, address: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Master Switches */}
                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Configuración del Servicio</h3>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📦</span>
                                <div>
                                    <p className="text-sm font-black text-gray-800">Motor de Stock Inteligente</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Habilita tableros de inventario y validación de compra</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.enable_stock}
                                    onChange={(e) => setFormData({ ...formData, enable_stock: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5FAFB8]"></div>
                            </label>
                        </div>
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">💎</span>
                                <div>
                                    <p className="text-sm font-black text-gray-800">Exención de Pago</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">El cliente no requiere cobro mensual</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.payment_exempt}
                                    onChange={(e) => setFormData({ ...formData, payment_exempt: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all"
                        >
                            Cerrar
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 rounded-xl bg-[#5FAFB8] text-[#1e293b] text-sm font-black shadow-lg shadow-[#5FAFB8]/20 hover:opacity-90 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                        >
                            {editingClient ? 'Guardar Cambios' : 'Crear Cliente Maestro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;
