import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductById } from '../hooks/useProductById';
import styles from './ProductDetail.module.css';
import placeholder from '../assets/placeholder.jpg';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import SEO from './shared/SEO';

const ProductDetail = () => {
  const { productId } = useParams();
  const { product, loading, error } = useProductById(productId);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

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

  // Combinar imagen principal y galería
  const allImages = [imageUrl, ...(product.gallery_images || [])].filter(Boolean);

  const displayImage = selectedImage || imageUrl;

  const handleAddToCart = () => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) {
      alert("Por favor, ingresa una cantidad válida.");
      return;
    }
    addToCart(product, numQuantity);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url, // Or full array if available
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "ARS", // Assuming ARS based on context
      "price": product.price,
      "availability": "https://schema.org/InStock" // Need actual logic if stock tracking exists
    }
  };

  return (
    <div className={styles.container}>
      <SEO
        title={product.name}
        description={product.description}
        image={imageUrl}
        type="product"
        url={window.location.href}
        schema={jsonLd}
      />
      <div className={styles.imageContainer}>
        {/* Imagen Principal */}
        <div className="w-full relative rounded-xl overflow-hidden mb-4 shadow-sm">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-auto object-contain"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
        </div>

        {/* Galería de Miniaturas (Solo si hay más de 1 imagen) */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`flex justify-center items-center aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${displayImage === img
                  ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-opacity-20 transform scale-95'
                  : 'border-transparent hover:border-gray-300'
                  }`}
              >
                <img
                  src={img}
                  alt={`Vista ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
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
