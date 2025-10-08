import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { useCart } from '../context/CartContext';

// La imagen de placeholder ya no es necesaria por defecto,
// pero la podemos mantener como fallback si la imagen del producto no carga.
import placeholder from '../assets/placeholder.jpg';

const ProductCard = ({ product }) => {
  // Si no hay producto, no renderizamos nada o un esqueleto. Por ahora, nada.
  if (!product) {
    return null;
  }

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

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
    <div className={styles.productoCard}>
      <Link to={`/product/${product.id}`} className={styles.cardLink}>
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src=placeholder; }} // Fallback por si la URL de la imagen está rota
        />
        <h3>{product.name}</h3>
      </Link>
      <p>{product.description}</p>
      <p className={styles.precio}>${product.price ? product.price.toFixed(2) : '0.00'}</p>
      <div className={styles.productoAcciones}>
        <input
            type="number"
            className={styles.inputCantidad}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
        />
        <button className={styles.agregarCarrito} onClick={handleAddToCart}>
            Agregar al Pedido
        </button>
      </div>
    </div>
  );
};

export default ProductCard;