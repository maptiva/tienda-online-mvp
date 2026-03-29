import React from 'react';
import { FaMoneyBillWave, FaUniversity, FaWhatsapp } from 'react-icons/fa';

interface DiscountSettings {
    enabled: boolean;
    cash_discount: number;
    transfer_discount: number;
}

interface PaymentMethodSelectorProps {
    selectedMethod: string;
    onMethodChange: (method: string) => void;
    discountSettings: DiscountSettings | null | undefined;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
    selectedMethod, 
    onMethodChange, 
    discountSettings 
}) => {
    if (!discountSettings || !discountSettings.enabled) {
        return null;
    }

    const methods = [
        {
            id: 'cash',
            label: 'Efectivo',
            icon: <FaMoneyBillWave />,
            discount: discountSettings.cash_discount || 0,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200'
        },
        {
            id: 'transfer',
            label: 'Transferencia',
            icon: <FaUniversity />,
            discount: discountSettings.transfer_discount || 0,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            id: 'whatsapp',
            label: 'Otro / WhatsApp',
            icon: <FaWhatsapp />,
            discount: 0,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
        }
    ];

    return (
        <div className="mt-6 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">
                Selecciona Método de Pago para aplicar descuento:
            </h4>
            <div className="grid grid-cols-1 gap-2">
                {methods.map((method) => (
                    <button
                        key={method.id}
                        onClick={() => onMethodChange(method.id)}
                        className={`
                            flex items-center justify-between p-3 rounded-xl border-2 transition-all
                            ${selectedMethod === method.id 
                                ? `${method.bgColor} ${method.color} ${method.borderColor} ring-2 ring-offset-1 ring-${method.color.replace('text-', '')}` 
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`text-lg ${method.color}`}>{method.icon}</span>
                            <span className="font-bold text-sm">{method.label}</span>
                        </div>
                        {method.discount > 0 && (
                            <span className={`font-black text-sm ${method.color}`}>
                                -{method.discount}%
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;
