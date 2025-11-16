import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './ui/Header';
import Footer from './ui/Footer';

import CartModal from './CartModal';
import CategoriaList from './public/CategoriaList';
import WhatsAppButton from './ui/WhatsAppButton';

const PublicLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <CategoriaList />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default PublicLayout;
