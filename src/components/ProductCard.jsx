import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// La imagen de placeholder ya no es necesaria por defecto,
// pero la podemos mantener como fallback si la imagen del producto no carga.
import placeholder from '../assets/placeholder.jpg';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { storeName } = useParams();
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
    <div className='bg-white border-[#ddd] rounded-sm p-4 text-center shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1.5'>
      <Link to={`/${storeName}/product/${product.id}`} className='flex justify-center flex-col items-center'>
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
        <h3 className='font-bold text-xl mt-4'>{product.name}</h3>
      </Link>

      <p className='text-base text-gray-600 mt-4'>{truncatedDescription}</p>

      <p className='font-bold text-[#27ae60] text-2xl mt-4'>${product.price ? product.price.toFixed(2) : '0.00'}</p>

      <div className='grid grid-cols-2 gap-2 items-center justify-between mt-4'>
        <input
          type="number"
          className='border text-center rounded-sm border-gray-400 py-2'
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
        <button onClick={handleAddToCart} className='bg-[#3498db] cursor-pointer text-white border-none py-2 px-3 rounded-sm transition-all duration-300 hover:bg-[#2980b9]'>
          Agregar
        </button>
      </div>
    </div>
  );
};

export default ProductCard;