import React from 'react';
import { useStock } from '../hooks/useStock';

const StockBadge = ({ productId, storeSlug = null, className = "" }) => {
  const { inventory, loading, error } = useStock(productId, storeSlug);

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
    return null; // No mostrar nada si no se está trackeando el stock
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

  const getStockColor = () => {
    const minAlert = inventory?.min_stock_alert || 5;

    if (quantity <= 0) {
      return "text-red-600 font-semibold";
    }

    if (quantity <= minAlert) {
      return "text-orange-500 font-medium";
    }

    return "text-green-600";
  };

  const getStockIcon = () => {
    const minAlert = inventory?.min_stock_alert || 5;

    if (quantity <= 0) {
      return "❌";
    }

    if (quantity <= minAlert) {
      return "⚠️";
    }

    return "✅";
  };

  return (
    <div className={`text-sm ${getStockColor()} ${className}`}>
      <span className="mr-1">{getStockIcon()}</span>
      {getStockText()}
    </div>
  );
};

export default StockBadge;