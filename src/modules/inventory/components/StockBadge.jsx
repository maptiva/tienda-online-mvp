import React from 'react';
import { useStock } from '../hooks/useStock';

const StockBadge = ({ productId, className = "" }) => {
  const { inventory, loading, error } = useStock(productId);

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
    if (quantity <= 0) {
      return "Agotado";
    }
    return `Stock: ${quantity}`;
  };

  const getStockColor = () => {
    if (quantity <= 0) {
      return "text-red-600 font-semibold";
    }
    if (quantity <= 3) {
      return "text-yellow-600 font-medium";
    }
    return "text-green-600";
  };

  return (
    <div className={`text-sm ${getStockColor()} ${className}`}>
      {getStockText()}
    </div>
  );
};

export default StockBadge;