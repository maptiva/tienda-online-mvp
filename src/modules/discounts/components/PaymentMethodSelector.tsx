import React from 'react';
import { FaMoneyBillWave, FaUniversity } from 'react-icons/fa';

interface PaymentMethodSelectorProps {
    selectedMethod: string;
    onChange: (method: string) => void;
    discounts: {
        cash: number;
        transfer: number;
    };
}

/**
 * Componente para seleccionar el método de pago en el carrito.
 */
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    selectedMethod,
    onChange,
    discounts
}) => {
    const methods = [
        {
            id: 'cash',
            label: 'Efectivo',
            icon: <FaMoneyBillWave />,
            info: discounts.cash > 0 ? `${discounts.cash}% OFF` : null
        },
        {
            id: 'transfer',
            label: 'Transferencia',
            icon: <FaUniversity />,
            info: discounts.transfer > 0 ? `${discounts.transfer}% OFF` : null
        },
        {
            id: 'other',
            label: 'Otro / A convenir',
            icon: null,
            info: null
        }
    ];

    return (
        <div className="mt-4 mb-6">
            <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-500">Método de Pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {methods.map((method) => (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => onChange(method.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedMethod === method.id
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                            }`}
                    >
                        <div className="flex items-center gap-2 font-bold">
                            <span className={selectedMethod === method.id ? 'text-emerald-600' : 'text-gray-400'}>
                                {method.icon}
                            </span>
                            {method.label}
                        </div>
                        {method.info && (
                            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                                {method.info}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
