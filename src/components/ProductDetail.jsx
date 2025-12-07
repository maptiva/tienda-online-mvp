import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductById } from '../hooks/useProductById';
import styles from './ProductDetail.module.css';
import placeholder from '../assets/placeholder.jpg';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

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
      Swal.fire({
        icon: 'error',
        title: 'Cantidad Inválida',
        text: 'Por favor, ingresa una cantidad válida.',
        confirmButtonColor: 'var(--color-primary)'
      });
      return;
    }
    addToCart(product, numQuantity);
    Swal.fire({
      icon: 'success',
      title: '¡Añadido!',
      text: `${product.name} ha sido añadido a tu pedido.`,
      timer: 1500,
      showConfirmButton: false
    });
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
        <h1 className="text-text-main">{product.name}</h1>

        <p className="font-bold text-3xl my-4 text-primary-darker dark:text-primary">
          ${product.price ? product.price.toFixed(2) : '0.00'}
        </p>

        <h3 className="text-xl font-bold mt-6 mb-3 text-text-main">
          Descripción:
        </h3>
        <p className={`${styles.description} text-text-light`}>
          {product.description}
        </p>

        <div className={styles.actions}>
          <input
            type="number"
            className="text-center rounded-lg py-2 px-4 bg-white text-slate-800 border border-border focus:outline-none focus:border-primary transition-colors duration-300 font-semibold"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
          <button
            onClick={handleAddToCart}
            className="font-bold py-2 px-6 rounded-lg bg-primary text-primary-text hover:bg-primary-darker transition-colors duration-300"
          >
            Agregar al Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
