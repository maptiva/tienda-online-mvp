import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import placeholder from '../assets/placeholder.jpg';
import { useTheme } from '../context/ThemeContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { storeName } = useParams();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return null;
  }

  const imageUrl = product.image_url || placeholder;

  const handleAddToCart = () => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) {
      alert("Por favor, ingresa una cantidad válida.");
      return;
    }
    addToCart(product, numQuantity);
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
        <div className="w-full aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
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
                className='font-bold py-2 px-3 rounded-lg transition-all duration-300 w-full'
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-primary-text)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-primary-darker)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-primary)';
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;