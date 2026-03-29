import React, { useState } from 'react';
import { useStock } from '../hooks/useStock';
import { FiPlus, FiMinus } from 'react-icons/fi';

interface StockAdjustmentProps {
    productId: string;
    onSuccess?: () => void;
}

const StockAdjustment: React.FC<StockAdjustmentProps> = ({ productId, onSuccess }) => {
    const { inventory, adjustStock, loading } = useStock(productId);
    const [adjustment, setAdjustment] = useState(0);
    const [reason, setReason] = useState('');

    const handleAdjustment = async (type: 'increase' | 'decrease') => {
        const quantity = type === 'increase' ? Math.abs(adjustment) : -Math.abs(adjustment);

        if (quantity === 0) return;

        try {
            await adjustStock(quantity, reason || `Ajuste ${type === 'increase' ? 'entrada' : 'salida'}`);

            const Swal = (await import('sweetalert2')).default;
            Swal.fire({
                icon: 'success',
                title: 'Stock actualizado',
                text: `Se ha registrado el ajuste de ${Math.abs(adjustment)} unidades.`,
                timer: 1500,
                showConfirmButton: false
            });

            setAdjustment(0);
            setReason('');
            onSuccess?.();
        } catch (error) {
            console.error('Error adjusting stock:', error);
            const Swal = (await import('sweetalert2')).default;
            Swal.fire({
                icon: 'error',
                title: 'Error al ajustar stock',
                text: error instanceof Error ? error.message : 'Unknown error',
                confirmButtonColor: '#5FAFB8'
            });
        }
    };

    if (!inventory) return null;

    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Ajuste de Stock</h3>
                <span className="text-2xl font-bold text-blue-600">{inventory.quantity}</span>
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAdjustment(Math.max(0, adjustment - 1))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        <FiMinus />
                    </button>
                    <input
                        type="number"
                        value={adjustment}
                        onChange={(e) => setAdjustment(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 p-2 border rounded-lg text-center"
                        min="0"
                    />
                    <button
                        onClick={() => setAdjustment(adjustment + 1)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        <FiPlus />
                    </button>
                </div>
                <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motivo del ajuste (opcional)"
                    className="w-full p-2 border rounded-lg text-sm"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAdjustment('decrease')}
                        disabled={adjustment === 0 || loading}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        Salida
                    </button>
                    <button
                        onClick={() => handleAdjustment('increase')}
                        disabled={adjustment === 0 || loading}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                        Entrada
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockAdjustment;
