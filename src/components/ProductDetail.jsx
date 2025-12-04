import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductById } from '../hooks/useProductById';
import styles from './ProductDetail.module.css';
import placeholder from '../assets/placeholder.jpg';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const ProductDetail = () => {
  const { productId } = useParams();
  const { product, loading, error } = useProductById(productId);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);

  if (loading) {
    return <p className={styles.loading}>Cargando producto...</p>;
  }

  if (error) {
    return <p className={styles.error}>Error al cargar el producto: {error}</p>;
  }

  if (!product) {
    return <p>Producto no encontrado.</p>;
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
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
        />
      </div>
      <div className={styles.detailsContainer}>
        <h1 style={{ color: 'var(--color-text-main)' }}>{product.name}</h1>

        <p
          className='font-bold text-3xl my-4'
          style={{
            color: theme === 'light' ? 'var(--color-primary-darker)' : 'var(--color-primary)'
          }}
        >
          ${product.price ? product.price.toFixed(2) : '0.00'}
        </p>

        <h3
          className='text-xl font-bold mt-6 mb-3'
          style={{ color: 'var(--color-text-main)' }}
        >
          Descripción:
        </h3>
        <p
          className={styles.description}
          style={{ color: 'var(--color-text-light)' }}
        >
          {product.description}
        </p>

        <div className={styles.actions}>
          <input
            type="number"
            className='text-center rounded-lg py-2 px-4 focus:outline-none transition-all duration-300 font-semibold'
            style={{
              backgroundColor: '#ffffff',
              color: '#1e293b',
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
            className='font-bold py-2 px-6 rounded-lg transition-all duration-300'
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
            Agregar al Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
