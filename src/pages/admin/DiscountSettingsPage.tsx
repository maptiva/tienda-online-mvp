import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useCurrentStore } from '../../hooks/useCurrentStore';
import Swal from 'sweetalert2';
import { Loading } from '../../components/dashboard/Loading';
import { FaPercent, FaMoneyBillWave, FaUniversity, FaToggleOn } from 'react-icons/fa';

interface DiscountSettings {
    enabled: boolean;
    cash_discount: number;
    transfer_discount: number;
}

const DiscountSettingsPage = () => {
    const { user } = useAuth();
    const { storeId, loading: storeLoading } = useCurrentStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [discountSettings, setDiscountSettings] = useState<DiscountSettings>({
        enabled: false,
        cash_discount: 0,
        transfer_discount: 0
    });

    useEffect(() => {
        if (storeId) {
            loadDiscountSettings();
        }
    }, [storeId]);

    const loadDiscountSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('stores')
                .select('discount_settings')
                .eq('id', storeId)
                .single();

            if (error) throw error;
            if (data?.discount_settings) {
                setDiscountSettings(data.discount_settings);
            }
        } catch (error) {
            console.error('Error loading discounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        setDiscountSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDiscountSettings(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('stores')
                .update({ discount_settings: discountSettings })
                .eq('id', storeId);

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Los descuentos se han configurado correctamente.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading || storeLoading) return <Loading message='Cargando configuración de descuentos...' />;

    return (
        <div className='w-full shadow-lg border border-gray-200 bg-white p-0 rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden'>
            <div className='flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-8'>
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                            <FaPercent size={24} />
                        </div>
                        <div>
                            <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Configuración de Descuentos</h1>
                            <p className="text-gray-500 text-sm mt-1">Incentiva tus ventas con beneficios por medio de pago.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
                    <div className={`p-6 rounded-3xl border-2 transition-all ${discountSettings.enabled ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${discountSettings.enabled ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                                    <FaToggleOn size={32} className={discountSettings.enabled ? '' : 'opacity-50'} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Sistema de Descuentos</h3>
                                    <p className="text-gray-600 text-sm">{discountSettings.enabled ? 'Activo y visible en el carrito' : 'Inactivo actualmente'}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${discountSettings.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${discountSettings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {discountSettings.enabled && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-4 text-emerald-700">
                                            <FaMoneyBillWave />
                                            <label className="text-xs font-black uppercase tracking-widest">Efectivo</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="cash_discount"
                                                value={discountSettings.cash_discount}
                                                onChange={handleInputChange}
                                                className="w-full text-3xl font-black p-4 pr-12 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors"
                                                min="0"
                                                max="100"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-300">%</span>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-4 text-emerald-700">
                                            <FaUniversity />
                                            <label className="text-xs font-black uppercase tracking-widest">Transferencia</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="transfer_discount"
                                                value={discountSettings.transfer_discount}
                                                onChange={handleInputChange}
                                                className="w-full text-3xl font-black p-4 pr-12 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors"
                                                min="0"
                                                max="100"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-300">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-100/50 p-4 rounded-xl flex items-start gap-3">
                                    <span className="text-emerald-600 mt-0.5">💡</span>
                                    <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                                        Estos porcentajes se descontarán automáticamente del **subtotal** cuando el cliente elija el método correspondiente en el carrito de compras.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-all active:scale-95 uppercase tracking-widest"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DiscountSettingsPage;
