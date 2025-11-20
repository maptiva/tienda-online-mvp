import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import { CartProvider } from './context/CartContext';
import favicon from './assets/logo.png';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './router/ProtectedRoute';
import ProductForm from './components/ProductForm';
import { Error404 } from './pages/Error404';
import CategoriaPage from './pages/dashboard/CategoriaPage.tsx';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import StoreSettings from './pages/StoreSettings';
import LandingPage from './pages/LandingPage';


function App() {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = favicon;
    }
  }, []);

  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/:storeName" element={<PublicLayout />}>
          <Route index element={<ProductList />} />
          <Route path="product/:productId" element={<ProductDetail />} />
        </Route>


        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="producto" element={<AdminDashboard />} />
          <Route path="categoria" element={<CategoriaPage />} />
          <Route path="settings" element={<StoreSettings />} />
          <Route path="new" element={<ProductForm />} />
          <Route path="edit/:productId" element={<ProductForm />} />
        </Route>

        <Route path='*' element={<Error404 />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
