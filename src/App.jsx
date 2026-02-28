import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import './App.css';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import LazyLoadFallback from './components/LazyLoadFallback';

// Critical routes - loaded immediately
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './router/ProtectedRoute';
import SuperAdminRoute from './router/SuperAdminRoute';
import LandingPage from './pages/LandingPage';

// Lazy-loaded routes - loaded on demand
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ExploreMap = lazy(() => import('./pages/ExploreMap'));
const Error404 = lazy(() => import('./pages/Error404'));

// Admin routes - lazy loaded
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProductForm = lazy(() => import('./components/ProductForm'));
const CategoriaPage = lazy(() => import('./pages/dashboard/CategoriaPage.tsx'));
const StoreSettings = lazy(() => import('./pages/StoreSettings'));
const BulkPriceUpdate = lazy(() => import('./pages/admin/BulkPriceUpdate'));
const InventoryPage = lazy(() => import('./modules/inventory/pages/InventoryPage'));

// CRM routes - lazy loaded
const CRMDashboard = lazy(() => import('./pages/admin/crm/Dashboard'));
const Clients = lazy(() => import('./pages/admin/crm/Clients'));
const Leads = lazy(() => import('./pages/admin/crm/Leads'));
const Payments = lazy(() => import('./pages/admin/crm/Payments'));


function App() {


  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ScrollToTop />
        <Suspense fallback={<LazyLoadFallback />}>
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
                <Route path="leads" element={<Leads />} />
                <Route path="payments" element={<Payments />} />
              </Route>
            </Route>

            <Route path='*' element={<Error404 />} />
          </Routes>
        </Suspense>
      </CartProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
