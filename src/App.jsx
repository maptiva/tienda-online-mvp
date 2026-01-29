import { Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';

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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ExploreMap from './pages/ExploreMap';

// CRM & Security
import SuperAdminRoute from './router/SuperAdminRoute';
import CRMDashboard from './pages/admin/crm/Dashboard';
import Clients from './pages/admin/crm/Clients';
import Payments from './pages/admin/crm/Payments';
import BulkPriceUpdate from './pages/admin/BulkPriceUpdate';
import InventoryPage from './modules/inventory/pages/InventoryPage';


function App() {


  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mapa" element={<ExploreMap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="precios" element={<BulkPriceUpdate />} />
          <Route path="inventario" element={<InventoryPage />} />

          {/* CRM Routes - PROTECTED BY SUPER ADMIN ROUTE */}
          <Route path="crm" element={<SuperAdminRoute><Outlet /></SuperAdminRoute>}>
            <Route index element={<CRMDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="payments" element={<Payments />} />
          </Route>
        </Route>

        <Route path='*' element={<Error404 />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
