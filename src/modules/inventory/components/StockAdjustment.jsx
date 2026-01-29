import React, { useState } from 'react';
import { useStock } from '../hooks/useStock';
import { FiPlus, FiMinus } from 'react-icons/fi';

const StockAdjustment = ({ productId, onSuccess }) => {
  const { inventory, adjustStock, loading } = useStock(productId);
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');

  const handleAdjustment = async (type) => {
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
        text: error.message,
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

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cantidad"
            min="0"
          />
        </div>

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Motivo del ajuste (opcional)"
        />

        <div className="flex gap-2">
          <button
            onClick={() => handleAdjustment('increase')}
            disabled={loading || adjustment === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiPlus />
            Entrada
          </button>

          <button
            onClick={() => handleAdjustment('decrease')}
            disabled={loading || adjustment === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiMinus />
            Salida
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;