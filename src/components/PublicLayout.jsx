import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartModal from './CartModal';

const PublicLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div>
      <Header onCartClick={() => setIsCartOpen(true)} />
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
