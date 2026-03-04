import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { useProductById } from '../hooks/useProductById';
import styles from './ProductDetail.module.css';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import SEO from './shared/SEO';
import ProductImage from './shared/ProductImage';
import { FaWhatsapp, FaTag, FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaTimes } from 'react-icons/fa';
import { useStoreConfig } from '../modules/inventory/hooks/useStoreConfig';
import StockBadge from '../modules/inventory/components/StockBadge';
import { useStock } from '../modules/inventory/hooks/useStock';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number | null;
  image_url?: string;
  gallery_images?: string[];
  price_on_request?: boolean;
  store_whatsapp?: string;
  sku?: string;
  display_id?: number;
}

const ProductDetail: React.FC = () => {
  const { store } = useOutletContext() as any;
  const { productId, storeName } = useParams<{ productId: string; storeName: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProductById(productId || '') as any;
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState<string | number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [dynamicScale, setDynamicScale] = useState(1.8);
  const [lastTap, setLastTap] = useState(0);

  const { stockEnabled } = useStoreConfig() as any;
  const { inventory } = useStock(product?.id, storeName || '') as any;

  // Bloquear scroll y manejar teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
      setShowMagnifier(false);
      setZoomLevel(1);
      setOffset({ x: 0, y: 0 });
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, currentIndex]);

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
  const allImages: string[] = imageUrl
    ? [imageUrl, ...(product.gallery_images || [])].filter(Boolean)
    : [...(product.gallery_images || [])].filter(Boolean);

  const displayImage = allImages[currentIndex] || imageUrl;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setShowMagnifier(false);
    setOffset({ x: 0, y: 0 });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setShowMagnifier(false);
    setOffset({ x: 0, y: 0 });
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showMagnifier) {
      setShowMagnifier(false);
      setOffset({ x: 0, y: 0 });
    } else {
      if (imgRef.current) {
        const img = imgRef.current;
        const containerAspect = img.clientWidth / img.clientHeight;
        const imageAspect = img.naturalWidth / img.naturalHeight;

        let renderedWidth = img.clientWidth;
        if (imageAspect < containerAspect) {
          // La imagen es más alta que el contenedor (limitada por el alto)
          renderedWidth = img.clientHeight * imageAspect;
        }

        // Calculamos el scale para que 1px de imagen = 1px de pantalla (CSS)
        const calculatedScale = Math.min(Math.max(img.naturalWidth / renderedWidth, 1.1), 3);
        setDynamicScale(calculatedScale);
      }
      setShowMagnifier(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showMagnifier) {
      setShowMagnifier(false);
      setOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showMagnifier) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !showMagnifier) return;
    setOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Soporte para dispositivos móviles (Touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Doble toque detectado
      e.preventDefault();
      if (showMagnifier) {
        setShowMagnifier(false);
        setOffset({ x: 0, y: 0 });
      } else {
        // Si no está ampliado, ampliamos
        toggleZoom({ stopPropagation: () => { } } as any);
      }
      setLastTap(0);
      return;
    }
    setLastTap(now);

    if (!showMagnifier) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !showMagnifier) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - startPos.x,
      y: touch.clientY - startPos.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleAddToCart = () => {
    const numQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : (quantity as number);
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

  // --- Lógica de Promoción (Catálogo) ---
  const isOffer = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercentage = isOffer
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  // --- Lógica de Descuento por Pago Dinámico ---
  const cashDisc = store?.discount_settings?.enabled ? (store.discount_settings.cash_discount || 0) : 0;
  const transferDisc = store?.discount_settings?.enabled ? (store.discount_settings.transfer_discount || 0) : 0;

  const bestDiscount = Math.max(cashDisc, transferDisc);
  const incentivePrice = product.price * (1 - bestDiscount / 100);

  const discountLabel = cashDisc === transferDisc
    ? 'en efectivo / con transferencia'
    : (cashDisc > transferDisc ? 'en efectivo' : 'con transferencia');

  // Preparar datos para SEO
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
      "url": window.location.href
    }
  };

  return (
    <>
      <div className={`${styles.container} min-h-[80vh]`}>
        <SEO
          title={product.name}
          name={product.name}
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
              onClick={() => imageUrl && setIsLightboxOpen(true)}
            />

            {/* Badge de Oferta sobre Imagen */}
            {isOffer && !product.price_on_request && (
              <div className="absolute top-4 left-4 z-10 animate-bounce">
                <div
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-primary-text)'
                  }}
                >
                  <FaTag size={12} />
                  {discountPercentage}% OFF
                </div>
              </div>
            )}
          </div>

          {/* Galería de Miniaturas */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                  }}
                  className={`flex justify-center items-center aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${currentIndex === idx
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

          <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4" style={{ color: 'var(--color-text-light)' }}>
            {product.sku ? `COD: ${product.sku}` : `REF: #${product.display_id || product.id}`}
          </p>

          {stockEnabled && (
            <div className="mb-6 flex justify-start">
              <StockBadge productId={product.id} storeSlug={storeName || ''} className="text-sm scale-110 origin-left" />
            </div>
          )}

          {product.price_on_request ? (
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
            >
              <FaWhatsapp size={24} />
              Consultar Precio
            </a>
          ) : (
            <div className="my-6">
              {/* Visualización de Precios con Promo */}
              <div className="flex flex-col mb-4">
                {isOffer && (
                  <span className="text-lg font-bold text-gray-400 line-through opacity-70 mb-1">
                    Antes: ${product.compare_at_price?.toFixed(2)}
                  </span>
                )}
                <p
                  className='font-black text-4xl leading-none'
                  style={{
                    color: theme === 'light' ? 'var(--color-primary-darker)' : 'var(--color-primary)'
                  }}
                >
                  ${product.price ? product.price.toFixed(2) : '0.00'}
                </p>

                {/* Llamador de Descuento por Pago Dinámico */}
                {bestDiscount > 0 && (
                  <div className="mt-3 flex items-center gap-2 bg-emerald-50 self-start px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                    <span className="text-sm font-black text-emerald-700">
                      Págalo a ${incentivePrice.toFixed(2)} {discountLabel}
                    </span>
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                      -{bestDiscount}%
                    </span>
                  </div>
                )}
              </div>

              <h3
                className='text-xl font-bold mt-8 mb-3'
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
                >
                  {stockEnabled && inventory?.quantity <= 0 ? 'Agotado' : 'Agregar al Pedido'}
                </button>
              </div>
            </div>
          )}

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

      {/* Visualizador de Imagen Premium (Lightbox + Pan-Zoom) */}
      {isLightboxOpen && displayImage && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onKeyDown={(e) => e.key === 'ArrowLeft' && handlePrev()}
        >
          {/* Botones de acción arriba */}
          <div className="absolute top-6 right-6 flex items-center gap-4 z-[10010]">
            <button
              className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md"
              onClick={toggleZoom}
              title={showMagnifier ? "Reducir" : "Ampliar"}
            >
              {showMagnifier ? <FaSearchMinus size={22} /> : <FaSearchPlus size={22} />}
            </button>
            <button
              className="text-white/80 hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
            >
              <FaTimes size={22} />
            </button>
          </div>

          {/* Navegación Izquierda */}
          {allImages.length > 1 && !showMagnifier && (
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-4 rounded-full"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            >
              <FaChevronLeft size={28} />
            </button>
          )}

          {/* Contenedor de Imagen Central */}
          <div
            className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300 ${showMagnifier ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
              }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
            onClick={!showMagnifier ? toggleZoom : undefined}
          >
            <img
              ref={imgRef}
              src={displayImage}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-300 ease-out select-none"
              style={{
                transform: showMagnifier
                  ? `translate(${offset.x}px, ${offset.y}px) scale(${dynamicScale})`
                  : 'translate(0, 0) scale(1)',
                cursor: showMagnifier ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
              draggable={false}
            />

            {/* Caption / Contador */}
            {!showMagnifier && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 text-white/90 text-[10px] px-3 py-1 rounded-full font-bold tracking-widest uppercase backdrop-blur-md">
                {currentIndex + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Navegación Derecha */}
          {allImages.length > 1 && !showMagnifier && (
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-4 rounded-full"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
            >
              <FaChevronRight size={28} />
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ProductDetail;
