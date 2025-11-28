import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// La imagen de placeholder ya no es necesaria por defecto,
// pero la podemos mantener como fallback si la imagen del producto no carga.
import placeholder from '../assets/placeholder.jpg';
import { useTheme } from '../context/ThemeContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { storeName } = useParams();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);


  // Si no hay producto, no renderizamos nada o un esqueleto. Por ahora, nada.
  if (!product) {
    return null;
  }

  const imageUrl = product.image_url || placeholder;

  const handleAddToCart = () => {
    // Asegurarse de que la cantidad sea un número antes de agregar
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) {
      alert("Por favor, ingresa una cantidad válida.");
      return;
    }
    addToCart(product, numQuantity);
  };


  // Truncar descripción a 100 caracteres
  const truncatedDescription = product.description && product.description.length > 100
    ? product.description.substring(0, 100) + '...'
    : product.description;

  return (
    <div className='bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1.5 hover:shadow-orange-500/10 hover:border-orange-500/30 h-full'>
      <Link to={`/${storeName}/product/${product.id}`} className='flex justify-center flex-col items-center w-full'>
        <div className="w-full aspect-square mb-4 flex items-center justify-center p-0.5">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-56 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
        </div>
        <h3 className='font-bold text-xl text-white line-clamp-2 min-h-[3.5rem] flex items-center'>{product.name}</h3>
      </Link>

      <div className='flex-grow flex flex-col justify-between'>
        <p className={`text-base mt-2 line-clamp-4 ${theme === 'light' ? 'text-white' : 'text-white'}`}>{product.description}</p>

        <div className='mt-4'>
          <p className='font-bold text-orange-500 text-2xl mb-4'>${product.price ? product.price.toFixed(2) : '0.00'}</p>

          <div className='grid grid-cols-2 gap-2 items-center justify-between'>
            <input
              type="number"
              className='bg-slate-900/50 border border-slate-600 text-white text-center rounded-lg py-2 focus:outline-none focus:border-orange-500 w-full transition-colors duration-300'
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
            <button onClick={handleAddToCart} className='bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-lg shadow-orange-500/20 w-full'>
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;