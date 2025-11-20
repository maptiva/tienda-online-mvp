import React, { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartModal from './CartModal';
import CategoriaList from './public/CategoriaList';
import { useStoreByName } from '../hooks/useStoreByName';

const PublicLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { storeName } = useParams();
  const { store, loading, error } = useStoreByName(storeName);

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

  return (
    <div>
      <Header storeData={store} onCartClick={() => setIsCartOpen(true)} />
      <CategoriaList userId={store.user_id} />
      <main>
        <Outlet context={{ store }} />
      </main>
      <Footer storeName={store.store_name} />
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
