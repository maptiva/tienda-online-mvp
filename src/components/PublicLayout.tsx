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
import { statsService } from '../modules/stats/services/statsService';

const PublicLayout: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { storeName } = useParams<{ storeName: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { store, loading, error } = useStoreByName(storeName);
  const { stockEnabled } = useStoreConfig();

  // Tracking de visitas
  useEffect(() => {
    if (store && !loading && !error) {
      // Registrar visita una sola vez por sesión/tienda
      const sessionKey = `tracked_visit_${store.id}`;
      const alreadyTracked = sessionStorage.getItem(sessionKey);
      
      if (!alreadyTracked && store.id) {
        statsService.trackEvent(store.id.toString(), 'visit');
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [store?.id, loading, error]);

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
    "url": window.location.href,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": store.address || "",
      "addressLocality": store.city || "",
      "addressCountry": "AR"
    }
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
      <Header 
        storeData={{
          ...store,
          about_text: store.about_text ?? undefined
        }} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      {isProductListPage && <CategoriaList userId={store.user_id as string} />}
      <main className="!mt-0 flex-grow">
        <Outlet context={{ store }} />
      </main>
      <Footer 
        storeName={store.store_name} 
        storeData={{
          address: store.address ?? undefined,
          contact_phone: store.contact_phone ?? undefined,
          business_hours: store.business_hours ?? undefined,
          instagram_url: store.instagram_url ?? undefined,
          facebook_url: store.facebook_url ?? undefined,
          tiktok_url: store.tiktok_url ?? undefined,
          latitude: store.latitude ?? undefined,
          longitude: store.longitude ?? undefined,
          show_map: store.show_map ?? undefined,
          city: store.city ?? undefined,
          category: store.category ?? undefined
        }} 
      />
      <WhatsAppButton
        phoneNumber={store.whatsapp_number}
        customMessage={store.whatsapp_message as string | undefined}
        storeId={store.id}
      />
      {isProductListPage && <ClicandoBrandButton />}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        whatsappNumber={store.whatsapp_number as string}
        storeSlug={storeName as string}
        stockEnabled={stockEnabled as boolean}
      />
    </div>
  );
};

export default PublicLayout;
