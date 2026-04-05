import React from 'react';
import { useStock } from '../hooks/useStock';

interface StockBadgeProps {
    productId: string;
    storeSlug?: string | null;
    className?: string;
}

const StockBadge: React.FC<StockBadgeProps> = ({ productId, storeSlug = null, className = "" }) => {
    const { inventory, loading, error } = useStock(productId, storeSlug ?? undefined);

    if (loading) {
        return (
            <div className={`text-sm text-gray-500 ${className}`}>
                Cargando stock...
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-sm text-red-500 ${className}`}>
                Error: {error}
            </div>
        );
    }

    if (!inventory) {
        return (
            <div className={`text-sm text-gray-400 ${className}`}>
                Sin stock configurado
            </div>
        );
    }

    const { quantity, track_stock } = inventory;

    if (!track_stock) {
        return null;
    }

    const getStockText = () => {
        const minAlert = inventory?.min_stock_alert || 5;

        if (quantity <= 0) {
            return "Agotado";
        }

        if (quantity <= minAlert) {
            return `¡Últimas ${quantity} unidades!`;
        }

        return "Disponible";
    };

    const getStockStyles = () => {
        const minAlert = inventory?.min_stock_alert || 5;

        if (quantity <= 0) {
            return "bg-red-50 text-red-600 border-red-100 font-black";
        }

        if (quantity <= minAlert) {
            return "bg-orange-50 text-orange-600 border-orange-100 font-bold";
        }

        return "bg-emerald-50 text-emerald-600 border-emerald-100 font-medium";
    };

    const getStockIcon = () => {
        const minAlert = inventory?.min_stock_alert || 5;
        if (quantity <= 0) return "×";
        if (quantity <= minAlert) return "⚠️";
        return "●";
    };

    return (
        <div className={`
            inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] transition-all font-bold
            ${getStockStyles()} 
            ${className}
        `}>
            <span className="text-[12px] leading-none">{getStockIcon()}</span>
            {getStockText()}
        </div>
    );
};

export default StockBadge;
