import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import ClicandoBrandButton from './ClicandoBrandButton';
import CartModal from './CartModal';
import CategoriaList from './public/CategoriaList';
import { useStoreByName } from '../hooks/useStoreByName';
import { useStoreConfig } from '../modules/inventory/hooks/useStoreConfig';
import SEO from './shared/SEO';

export interface StoreData {
  id: number | string;
  user_id: string;
  store_name: string;
  logo_url?: string;
  whatsapp_number: string;
  whatsapp_message?: string;
  discount_settings?: any;
}

const PublicLayout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { storeName = '' } = useParams<{ storeName: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { store, loading, error } = useStoreByName(storeName) as { store: StoreData | null, loading: boolean, error: any };
  const { stockEnabled } = useStoreConfig() as { stockEnabled: boolean };

  // Invalidar cache cuando cambia la tienda
  useEffect(() => {
    if (storeName) {
      queryClient.invalidateQueries({ queryKey: ['storeConfig'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  }, [storeName, queryClient]);

  // Invalidar cache cuando cambia la tienda
  useEffect(() => {
    if (storeName) {
      queryClient.invalidateQueries({ queryKey: ['storeConfig'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  }, [storeName, queryClient]);

  // Verificar si estamos en la página de lista de productos
  const isProductListPage = location.pathname === `/${storeName}` || location.pathname === `/${storeName}/`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Cargando tienda...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Tienda no encontrada</h1>
        <p className="text-gray-600">La tienda "{storeName}" no existe.</p>
      </div>
    );
  }

  // Asegurar que la URL del logo sea absoluta
  const absoluteLogoUrl = store.logo_url?.startsWith('http')
    ? store.logo_url
    : `${window.location.origin}${store.logo_url}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": store.store_name,
    "image": absoluteLogoUrl,
    "telephone": store.whatsapp_number,
    "url": window.location.href
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title={`${store.store_name} - Catálogo Online`}
        description={`Descubre los productos de ${store.store_name}. Navega nuestro catálogo completo y realiza tu pedido por WhatsApp. ¡Compra fácil y rápido!`}
        name={store.store_name}
        image={absoluteLogoUrl}
        url={window.location.href}
        schema={jsonLd}
        siteName={store.store_name}
      />
      <Header storeData={store as any} onCartClick={() => setIsCartOpen(true)} />
      {isProductListPage && <CategoriaList userId={store.user_id} />}
      <main className="!mt-0 flex-grow">
        <Outlet context={{ store }} />
      </main>
      <Footer storeName={store.store_name} storeData={store as any} />
      <WhatsAppButton
        phoneNumber={store.whatsapp_number}
        customMessage={store.whatsapp_message}
      />
      {isProductListPage && <ClicandoBrandButton />}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        whatsappNumber={store.whatsapp_number}
        storeSlug={storeName}
        stockEnabled={stockEnabled}
        storeId={store.id}
        discountSettings={store.discount_settings}
      />
    </div>
  );
};

export default PublicLayout;
