import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useProductById } from '../hooks/useProductById';
import styles from './ProductDetail.module.css';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import SEO from './shared/SEO';
import ProductImage from './shared/ProductImage';
import { FaWhatsapp } from 'react-icons/fa';
import { useStoreConfig } from '../modules/inventory/hooks/useStoreConfig';
import StockBadge from '../modules/inventory/components/StockBadge';
import { useStock } from '../modules/inventory/hooks/useStock';
import Swal from 'sweetalert2';

const ProductDetail = () => {
  const { store } = useOutletContext();
  const { productId } = useParams();
  const { product, loading, error } = useProductById(productId);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { storeName } = useParams();
  const { stockEnabled } = useStoreConfig();
  const { inventory } = useStock(product?.id, storeName);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className={styles.loading}>Cargando producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className={styles.error}>Error al cargar el producto: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Producto no encontrado.</p>
      </div>
    );
  }

  const imageUrl = product.image_url;

  // Combinar imagen principal y galería
  const allImages = imageUrl
    ? [imageUrl, ...(product.gallery_images || [])].filter(Boolean)
    : [...(product.gallery_images || [])].filter(Boolean);

  const displayImage = selectedImage || imageUrl;

  const handleAddToCart = () => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'Por favor, ingresa una cantidad válida.',
        confirmButtonColor: 'var(--color-primary)'
      });
      return;
    }
    // Verificar stock si está habilitado
    if (stockEnabled && inventory) {
      if (inventory.quantity < numQuantity) {
        Swal.fire({
          icon: 'error',
          title: 'Stock insuficiente',
          text: `Solo hay ${inventory.quantity} unidades disponibles.`,
          confirmButtonColor: 'var(--color-primary)'
        });
        return;
      }
    }

    addToCart(product, numQuantity);
  };

  // Preparar datos para SEO (Schema.org / JSON-LD)
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const priceValidUntil = nextYear.toISOString().split('T')[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": imageUrl,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "ARS",
      "price": product.price || 0,
      "priceValidUntil": priceValidUntil,
      "availability": "https://schema.org/InStock",
      "url": window.location.href,
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "AR",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30,
        "returnMethod": "https://schema.org/ReturnInStore"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 0,
          "currency": "ARS"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "AR"
        }
      }
    }
  };

  return (
    <>
      <div className={`${styles.container} min-h-[80vh]`}>
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
          <div
            className="w-full relative rounded-xl overflow-hidden mb-4 shadow-sm cursor-pointer"
            onClick={() => imageUrl && setIsLightboxOpen(true)}
            title={imageUrl ? "Click para ampliar" : "Sin imagen disponible"}
          >
            <ProductImage
              src={displayImage}
              alt={product.name}
              variant="detail"
              showHoverEffect={false}
              className="rounded-xl"
            />
          </div>

          {/* Galería de Miniaturas (Solo si hay más de 1 imagen) */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(img);
                    // Scroll suave hacia arriba para ver la imagen principal
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
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

          {/* Identificador de producto sutil */}
          <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4" style={{ color: 'var(--color-text-light)' }}>
            {product.sku ? `COD: ${product.sku}` : `REF: #${product.display_id || product.id}`}
          </p>

          {/* Stock Badge */}
          {stockEnabled && (
            <div className="mb-6 flex justify-start">
              <StockBadge productId={product.id} storeSlug={storeName} className="text-sm scale-110 origin-left" />
            </div>
          )}

          {product.price_on_request ? (
            // Mostrar botón "Consultar Precio"
            <a
              href={`https://wa.me/${store?.whatsapp_number}?text=${encodeURIComponent(
                `Hola! Me interesa el producto "${product.name}" (REF: ${product.sku ? product.sku : '#' + (product.display_id || product.id)}) y quisiera consultar el precio.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className='flex items-center justify-center gap-3 font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl my-6 max-w-md'
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
              <FaWhatsapp size={24} />
              Consultar Precio
            </a>
          ) : (
            // Mostrar precio y botón agregar (comportamiento normal)
            <>
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
                  disabled={stockEnabled && inventory?.quantity <= 0}
                  className='font-bold py-2 px-6 rounded-lg transition-all duration-300'
                  style={{
                    backgroundColor: (stockEnabled && inventory?.quantity <= 0) ? '#9ca3af' : 'var(--color-primary)',
                    color: (stockEnabled && inventory?.quantity <= 0) ? '#6b7280' : 'var(--color-primary-text)',
                    cursor: (stockEnabled && inventory?.quantity <= 0) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!(stockEnabled && inventory?.quantity <= 0)) {
                      e.target.style.backgroundColor = 'var(--color-primary-darker)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(stockEnabled && inventory?.quantity <= 0)) {
                      e.target.style.backgroundColor = 'var(--color-primary)';
                    }
                  }}
                >
                  {stockEnabled && inventory?.quantity <= 0 ? 'Agotado' : 'Agregar al Pedido'}
                </button>
              </div>
            </>
          )}

          {/* Mostrar descripción siempre si hay "Consultar Precio" */}
          {product.price_on_request && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Visualizador de Imagen a Pantalla Completa (Lightbox) */}
      {isLightboxOpen && displayImage && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-black/50 p-3 rounded-full z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            aria-label="Cerrar vista ampliada"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            src={displayImage}
            alt={product.name}
            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      )}
    </>
  );
};

export default ProductDetail;
