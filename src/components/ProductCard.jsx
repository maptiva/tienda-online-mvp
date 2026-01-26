import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { FaWhatsapp } from 'react-icons/fa';
import { useStoreConfig } from '../modules/inventory/hooks/useStoreConfig';
import StockBadge from '../modules/inventory/components/StockBadge';
import { useStock } from '../modules/inventory/hooks/useStock';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { storeName } = useParams();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const { stockEnabled, loading: configLoading } = useStoreConfig();
  const { inventory } = stockEnabled ? useStock(product.id) : { inventory: null };

  if (!product) {
    return null;
  }

  const imageUrl = product.image_url;

  const handleAddToCart = () => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) {
      alert("Por favor, ingresa una cantidad válida.");
      return;
    }
    
    // Verificar stock si está habilitado
    if (stockEnabled && inventory) {
      const availableQuantity = inventory.quantity;
      if (availableQuantity < numQuantity) {
        alert(`Stock insuficiente. Solo hay ${availableQuantity} unidades disponibles.`);
        return;
      }
    }
    
    addToCart(product, numQuantity);
  };

  // Verificar si el botón de compra debe estar deshabilitado
  const isPurchaseDisabled = () => {
    if (!stockEnabled || !inventory) return false;
    return inventory.quantity <= 0;
  };

  return (
    <div
      className='rounded-xl shadow-md transition-all duration-300 flex flex-col h-full group overflow-hidden'
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid var(--color-border)`
      }}
    >
      {/* Imagen: llega hasta los bordes, esquinas superiores redondeadas */}
      <Link to={`/${storeName}/product/${product.id}`} className='block'>
        <div className="w-full aspect-square overflow-hidden flex items-center justify-center bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('bg-gray-100');
                e.target.parentElement.innerHTML = '<span class="text-gray-400 text-sm font-medium">Sin Imagen</span>';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-slate-700">
              <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">Sin Imagen</span>
            </div>
          )}
        </div>
      </Link>

      {/* Contenido con padding */}
      <div className='p-4 flex flex-col flex-grow'>
        <Link to={`/${storeName}/product/${product.id}`}>
          <h3
            className='font-bold text-lg line-clamp-2 min-h-[3rem] flex items-center justify-center text-center mb-2'
            style={{ color: 'var(--color-text-main)' }}
          >
            {product.name}
          </h3>
        </Link>

        <div className='flex-grow flex flex-col justify-between'>
          <p
            className='text-base line-clamp-3 mb-3 text-center'
            style={{ color: 'var(--color-text-light)' }}
          >
            {product.description}
          </p>

          <div>
            {/* Stock Badge - Mostrar solo si está habilitado para esta tienda */}
            {stockEnabled && (
              <div className="mb-2 flex justify-center">
                <StockBadge productId={product.id} className="text-xs" />
              </div>
            )}

            {product.price_on_request ? (
              // Mostrar botón "Consultar Precio"
              <a
                href={`https://wa.me/${product.store_whatsapp}?text=${encodeURIComponent(
                  `Hola! Me interesa el producto "${product.name}" y quisiera consultar el precio.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className='flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-all duration-300 w-full shadow-md hover:shadow-lg'
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-primary-text)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-primary-darker)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-primary)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <FaWhatsapp size={20} />
                Consultar Precio
              </a>
            ) : (
              // Mostrar precio y botón agregar (comportamiento normal)
              <>
                <p
                  className='font-bold text-2xl mb-4 text-center'
                  style={{
                    color: theme === 'light' ? 'var(--color-primary-darker)' : 'var(--color-primary)'
                  }}
                >
                  ${product.price ? product.price.toFixed(2) : '0.00'}
                </p>

                <div className='grid grid-cols-2 gap-2 items-center'>
                  <input
                    type="number"
                    className='text-center rounded-lg py-2 focus:outline-none w-full transition-all duration-300 font-semibold'
                    style={{
                      backgroundColor: theme === 'light' ? 'var(--color-background-light)' : 'var(--color-background)',
                      color: 'var(--color-text-main)',
                      border: `1px solid var(--color-border)`
                    }}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)';
                    }}
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={isPurchaseDisabled()}
                    className='font-bold py-2 px-3 rounded-lg transition-all duration-300 w-full'
                    style={{
                      backgroundColor: isPurchaseDisabled() ? '#9ca3af' : 'var(--color-primary)',
                      color: isPurchaseDisabled() ? '#6b7280' : 'var(--color-primary-text)',
                      cursor: isPurchaseDisabled() ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isPurchaseDisabled()) {
                        e.target.style.backgroundColor = 'var(--color-primary-darker)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPurchaseDisabled()) {
                        e.target.style.backgroundColor = 'var(--color-primary)';
                      }
                    }}
                  >
                    {isPurchaseDisabled() ? 'Agotado' : 'Agregar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;