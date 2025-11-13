import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// La imagen de placeholder ya no es necesaria por defecto,
// pero la podemos mantener como fallback si la imagen del producto no carga.
import placeholder from '../assets/placeholder.jpg';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
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


  return (
    <div className='bg-white border-[#ddd] rounded-sm p-4 text-center shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1.5'>
      <Link to={`/product/${product.id}`} className='flex justify-center flex-col items-center'>
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }} // Fallback por si la URL de la imagen está rota
        />
        <h3 className='font-bold text-xl'>{product.name}</h3>
      </Link>
      <p className='text-sm'>{product.description}</p>

      <p className='font-bold text-[#27ae60] text-xl mt-auto'>${product.price ? product.price.toFixed(2) : '0.00'}</p>

      <div className='grid mt-auto grid-cols-2 gap-2 items-center justify-between'>
        <input
          type="number"
          className='border text-center rounded-sm border-gray-400'
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
        <button onClick={handleAddToCart} className='bg-[#3498db] cursor-pointer text-white border-none py-1 px-2 rounded-sm transition-all duration-300 '>
          Agregar
        </button>
      </div>
    </div >
  );
};

export default ProductCard;