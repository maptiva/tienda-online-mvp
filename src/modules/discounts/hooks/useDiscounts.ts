import { useMemo } from 'react';

export interface DiscountSettings {
    enabled: boolean;
    cash_discount?: number;
    transfer_discount?: number;
}

/**
 * Hook para gestionar la lógica de descuentos por método de pago.
 * @param discountSettings - Configuración de descuentos de la tienda.
 * @param subtotal - Monto total del carrito antes de descuentos.
 */
export const useDiscounts = (discountSettings: DiscountSettings | any, subtotal: number) => {
    const settings = useMemo<DiscountSettings>(() => {
        if (!discountSettings || typeof discountSettings !== 'object') {
            return { enabled: false, cash_discount: 0, transfer_discount: 0 };
        }
        return discountSettings as DiscountSettings;
    }, [discountSettings]);

    const calculateDiscount = (paymentMethod: string): number => {
        if (!settings.enabled || subtotal <= 0) return 0;

        let percentage = 0;
        if (paymentMethod === 'cash') percentage = settings.cash_discount || 0;
        if (paymentMethod === 'transfer') percentage = settings.transfer_discount || 0;

        return (subtotal * (percentage / 100));
    };

    const getPercentageFor = (paymentMethod: string): number => {
        if (!settings.enabled) return 0;
        if (paymentMethod === 'cash') return settings.cash_discount || 0;
        if (paymentMethod === 'transfer') return settings.transfer_discount || 0;
        return 0;
    };

    return {
        isEnabled: settings.enabled,
        calculateDiscount,
        getPercentageFor,
        settings
    };
};
