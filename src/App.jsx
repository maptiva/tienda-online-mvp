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
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './router/ProtectedRoute';
import ProductForm from './components/ProductForm';

import { Error404 } from './pages/Error404';
import CategoriaPage from './pages/dashboard/CategoriaPage';
import { ProductPage } from './pages/dashboard/ProductPage';

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
      <main className='p-0 m-0'>
        <Routes>
          <Route path="/" element={<ProductList />} />

          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard>
                  <ProductPage />
                </AdminDashboard>
              </ProtectedRoute>
            }
          />
          <Route path="admin/categoria" element={
            <ProtectedRoute>
              <AdminDashboard>
                <CategoriaPage />
              </AdminDashboard>
            </ProtectedRoute>
          } />
          <Route
            path="/admin/new"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:productId"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route path='*' element={<Error404 />} />
        </Routes>
      </main>
      <WhatsAppButton />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Footer />
    </CartProvider>
  );
}

export default App;
