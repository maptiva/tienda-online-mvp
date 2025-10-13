import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import ProductList from './components/ProductList';
import WhatsAppButton from './components/WhatsAppButton';
import ProductDetail from './components/ProductDetail';
import CartModal from './components/CartModal';
import { CartProvider } from './context/CartContext';
import favicon from './assets/logo.png';
import Footer from './components/Footer';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = favicon;
    }
  }, []);

  return (
    <CartProvider>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
        </Routes>
      </main>
      <WhatsAppButton />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Footer />
    </CartProvider>
  );
}

export default App;