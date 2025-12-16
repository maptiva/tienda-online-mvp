import React, { useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartModal from './CartModal';
import CategoriaList from './public/CategoriaList';
import { useStoreByName } from '../hooks/useStoreByName';
import SEO from './shared/SEO';

const PublicLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { storeName } = useParams();
  const location = useLocation();
  const { store, loading, error } = useStoreByName(storeName);

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": store.store_name,
    "image": store.logo_url,
    "telephone": store.whatsapp_number,
    "url": window.location.href
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title={store.store_name}
        description={`Bienvenido a ${store.store_name}. Explora nuestro catálogo de productos.`}
        name={store.store_name}
        image={store.logo_url}
        url={window.location.href}
        schema={jsonLd}
      />
      <Header storeData={store} onCartClick={() => setIsCartOpen(true)} />
      {isProductListPage && <CategoriaList userId={store.user_id} />}
      <main className="!mt-0 flex-grow">
        <Outlet context={{ store }} />
      </main>
      <Footer storeName={store.store_name} storeData={store} />
      <WhatsAppButton
        phoneNumber={store.whatsapp_number}
        customMessage={store.whatsapp_message}
      />
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        whatsappNumber={store.whatsapp_number}
      />
    </div>
  );
};

export default PublicLayout;
