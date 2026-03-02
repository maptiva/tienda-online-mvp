import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { FaWhatsapp, FaTag } from 'react-icons/fa';
import { useStoreConfig } from '../modules/inventory/hooks/useStoreConfig';
import StockBadge from '../modules/inventory/components/StockBadge';
import { useStock } from '../modules/inventory/hooks/useStock';
import { useStoreByName } from '../hooks/useStoreByName';
import Swal from 'sweetalert2';
import ProductImage from './shared/ProductImage';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number | null;
  image_url?: string;
  price_on_request?: boolean;
  store_whatsapp?: string;
  sku?: string;
  display_id?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { storeName } = useParams<{ storeName: string }>();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState<string | number>(1);
  const { stockEnabled } = useStoreConfig() as any;
  const { inventory } = useStock(stockEnabled ? product.id : null, storeName || '') as any;
  const { store } = useStoreByName(storeName || '') as any;

  if (!product) {
    return null;
  }

  const imageUrl = product.image_url;

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

    if (stockEnabled && inventory) {
      const availableQuantity = inventory.quantity;
      if (availableQuantity < numQuantity) {
        Swal.fire({
          icon: 'error',
          title: 'Stock insuficiente',
          text: `Solo hay ${availableQuantity} unidades disponibles.`,
          confirmButtonColor: 'var(--color-primary)'
        });
        return;
      }
    }

    addToCart(product, numQuantity);
  };

  const isPurchaseDisabled = () => {
    if (!stockEnabled || !inventory) return false;
    return inventory.quantity <= 0;
  };

  // --- Lógica de Promoción (Catálogo) ---
  const isOffer = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercentage = isOffer 
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  // --- Lógica de Descuento por Pago (Global) ---
  const cashDisc = store?.discount_settings?.enabled ? (store.discount_settings.cash_discount || 0) : 0;
  const transferDisc = store?.discount_settings?.enabled ? (store.discount_settings.transfer_discount || 0) : 0;
  
  const bestDiscount = Math.max(cashDisc, transferDisc);
  const incentivePrice = product.price * (1 - bestDiscount / 100);
  
  const discountLabel = cashDisc === transferDisc 
    ? 'en efectivo / con transferencia' 
    : (cashDisc > transferDisc ? 'en efectivo' : 'con transferencia');

  return (
    <div
      className='rounded-xl shadow-md transition-all duration-300 flex flex-col h-full group overflow-hidden relative'
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid var(--color-border)`
      }}
    >
      {/* Badge de Oferta */}
      {isOffer && !product.price_on_request && (
        <div className="absolute top-3 left-3 z-10 animate-pulse">
          <div 
            className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg"
            style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'var(--color-primary-text)' 
            }}
          >
            <FaTag size={10} />
            {discountPercentage}% OFF
          </div>
        </div>
      )}

      {/* Imagen */}
      <Link to={`/${storeName}/product/${product.id}`} className='block'>
        <div className="w-full aspect-square overflow-hidden flex items-center justify-center bg-gray-100">
          <ProductImage
            src={imageUrl}
            alt={product.name}
            variant="card"
            showHoverEffect={true}
          />
        </div>
      </Link>

      {/* Contenido */}
      <div className='p-4 flex flex-col flex-grow'>
        <Link to={`/${storeName}/product/${product.id}`}>
          <h3
            className='font-bold text-lg line-clamp-2 min-h-[3rem] flex items-center justify-center text-center mb-2 leading-tight'
            style={{ color: 'var(--color-text-main)' }}
          >
            {product.name}
          </h3>
        </Link>

        <div className='flex-grow flex flex-col justify-between'>
          <p
            className='text-sm line-clamp-3 mb-3 text-center opacity-80'
            style={{ color: 'var(--color-text-light)' }}
          >
            {product.description}
          </p>

          <div>
            {stockEnabled && (
              <div className="mb-2 flex justify-center">
                <StockBadge productId={product.id} storeSlug={storeName || ''} className="text-[10px]" />
              </div>
            )}

            {product.price_on_request ? (
              <div className="mt-4">
                <a
                  href={`https://wa.me/${product.store_whatsapp}?text=${encodeURIComponent(
                    `Hola! Me interesa el producto "${product.name}" (REF: ${product.sku ? product.sku : '#' + (product.display_id || product.id)}) y quisiera consultar el precio.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='flex items-center justify-center gap-2 font-black py-3 px-4 rounded-lg transition-all duration-300 w-full shadow-md hover:shadow-lg text-sm'
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-primary-text)'
                  }}
                >
                  <FaWhatsapp size={20} />
                  Consultar Precio
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Visualización de Precios */}
                <div className="flex flex-col items-center mb-4 min-h-[4.5rem] justify-center">
                  {isOffer && (
                    <span 
                      className="text-xs font-medium line-through opacity-70 mb-0.5"
                      style={{ color: 'var(--color-text-light)' }}
                    >
                      Antes: ${product.compare_at_price?.toFixed(2)}
                    </span>
                  )}
                  <p
                    className='font-black text-2xl md:text-[26px] leading-none'
                    style={{
                      color: theme === 'light' ? 'var(--color-primary-darker)' : 'var(--color-primary)'
                    }}
                  >
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                  </p>

                  {/* Llamador de Descuento por Pago Dinámico */}
                  {bestDiscount > 0 && (
                    <div className="mt-2 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 shadow-sm animate-fade-in">
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-tighter block text-center">
                            ${incentivePrice.toFixed(2)} {discountLabel}
                        </span>
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-2 items-center w-full'>
                  <input
                    type="number"
                    className='text-center rounded-lg py-2 focus:outline-none w-full transition-all duration-300 font-bold text-sm'
                    style={{
                      backgroundColor: theme === 'light' ? 'var(--color-background-light)' : 'var(--color-background)',
                      color: 'var(--color-text-main)',
                      border: `1px solid var(--color-border)`
                    }}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={isPurchaseDisabled()}
                    className='font-black py-2 px-3 rounded-lg transition-all duration-300 w-full text-sm'
                    style={{
                      backgroundColor: isPurchaseDisabled() ? '#9ca3af' : 'var(--color-primary)',
                      color: isPurchaseDisabled() ? '#6b7280' : 'var(--color-primary-text)',
                      cursor: isPurchaseDisabled() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isPurchaseDisabled() ? 'Agotado' : 'Agregar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
