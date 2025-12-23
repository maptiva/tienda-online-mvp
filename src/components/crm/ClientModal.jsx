import React, { useState, useEffect } from 'react';

const ClientModal = ({ isOpen, onClose, onSubmit, getRealStores, editingClient = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        contact_email: '',
        contact_phone: '',
        notes: '',
        billing_info: { cuit: '', address: '' }
    });
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [loadingStores, setLoadingStores] = useState(false);

    // Efecto para cargar datos si estamos editando
    useEffect(() => {
        if (editingClient) {
            setFormData({
                name: editingClient.name || '',
                contact_email: editingClient.contact_email || '',
                contact_phone: editingClient.contact_phone || '',
                notes: editingClient.notes || '',
                billing_info: editingClient.billing_info || { cuit: '', address: '' }
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, selectedStoreId, editingClient?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <h2 className="text-xl font-bold italic tracking-tight">
                        {editingClient ? 'Editar Cliente Maestro' : 'Nuevo Cliente Maestro'}
                    </h2>
                    <p className="text-blue-100 text-xs mt-1">
                        {editingClient ? `Modificando a ${editingClient.name}` : 'Registra una nueva entidad comercial y vincula su tienda.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información Básica */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Información Básica</h3>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre / Razón Social</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-gray-50"
                                    placeholder="Ej: Alejandro Maptiva o Juan Pérez"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Email de Contacto</label>
                                <input
                                    type="email"
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-gray-50"
                                    placeholder="cliente@ejemplo.com"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-gray-50"
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
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-gray-50"
                                    value={selectedStoreId}
                                    onChange={(e) => setSelectedStoreId(e.target.value)}
                                >
                                    <option value="">Seleccionar una tienda...</option>
                                    {loadingStores ? (
                                        <option disabled>Cargando tiendas...</option>
                                    ) : (
                                        // Mostrar tiendas sin cliente asignado O la que ya tiene asignada este cliente
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
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-gray-50"
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
                                    className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-gray-50"
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
                            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
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
