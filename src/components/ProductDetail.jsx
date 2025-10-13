import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductById } from '../hooks/useProductById';
import styles from './ProductDetail.module.css';
import placeholder from '../assets/placeholder.jpg';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { productId } = useParams();
  const { product, loading, error } = useProductById(productId);
  const { addToCart } = useCart();
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
        <h1>{product.name}</h1>
        <p className={styles.price}>${product.price ? product.price.toFixed(2) : '0.00'}</p>
        <h3>Descripción</h3>
        <p className={styles.description}>{product.description}</p>
        {/* Aquí podrías agregar los selectores de tallas y colores */}
        <div className={styles.actions}>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
          <button onClick={handleAddToCart}>Agregar al Pedido</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
