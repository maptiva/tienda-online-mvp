import React from 'react';
import { useStock } from '../hooks/useStock';

const StockBadge = ({ productId, className = "" }) => {
  const { inventory, loading, error } = useStock(productId);

  if (loading) {
    return (
      <div className={`text-sm ${className}`}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-2 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
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
      <div className={`text-sm ${className}`}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-2 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-2 w-2 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const { quantity, track_stock } = inventory;

  if (!track_stock) {
    return null; // No mostrar nada si no se está trackeando el stock
  }

  const getStockDisplay = () => {
    const minAlert = inventory?.min_stock_alert || 5;
    
    if (quantity <= 0) {
      return {
        text: "Agotado",
        color: "text-red-600 font-semibold",
        icon: "❌",
        disabled: true
      };
    }
    
    if (quantity <= minAlert) {
      return {
        text: `¡Últimas ${quantity} unidades!`,
        color: "text-orange-500 font-medium",
        icon: "⚠️",
        disabled: false
      };
    }
    
    return {
      text: "Disponible",
      color: "text-green-600",
      icon: "✅",
      disabled: false
    };
  };

  const stockDisplay = getStockDisplay();

  return (
    <div className={`text-sm ${stockDisplay.color} ${className}`}>
      <span className="mr-1">{stockDisplay.icon}</span>
      {stockDisplay.text}
    </div>
  );
};

export default StockBadge;