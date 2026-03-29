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

import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './router/ProtectedRoute';
import SuperAdminRoute from './router/SuperAdminRoute';
import LandingPage from './pages/LandingPage';

const AdminSkeleton = () => (
  <div className="flex h-screen bg-gray-50">
    <div className="w-64 bg-white border-r animate-pulse" />
    <div className="flex-1 p-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse" />
      <div className="h-64 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="p-8 space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
    <div className="h-32 bg-gray-200 rounded animate-pulse" />
    <div className="h-32 bg-gray-200 rounded animate-pulse" />
  </div>
);

const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ExploreMap = lazy(() => import('./pages/ExploreMap'));
const Error404 = lazy(() => import('./pages/Error404'));

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProductForm = lazy(() => import('./components/ProductForm'));
const CategoriaPage = lazy(() => import('./pages/dashboard/CategoriaPage.tsx'));
const StoreSettings = lazy(() => import('./pages/StoreSettings'));
const BulkPriceUpdate = lazy(() => import('./pages/admin/BulkPriceUpdate'));
const InventoryPage = lazy(() => import('./modules/inventory/pages/InventoryPage'));
const OrdersDashboard = lazy(() => import('./pages/admin/OrdersDashboard'));
const DiscountSettingsPage = lazy(() => import('./pages/admin/DiscountSettingsPage'));
const StatsPage = lazy(() => import('./modules/stats/pages/StatsPage'));

const CRMDashboard = lazy(() => import('./pages/admin/crm/Dashboard'));
const Clients = lazy(() => import('./pages/admin/crm/Clients'));
const Leads = lazy(() => import('./pages/admin/crm/Leads'));
const Payments = lazy(() => import('./pages/admin/crm/Payments'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mapa" element={
            <Suspense fallback={<LazyLoadFallback />}>
              <ExploreMap />
            </Suspense>
          } />
          <Route path="/login" element={
            <Suspense fallback={<LazyLoadFallback />}>
              <Login />
            </Suspense>
          } />
          <Route path="/forgot-password" element={
            <Suspense fallback={<LazyLoadFallback />}>
              <ForgotPassword />
            </Suspense>
          } />
          <Route path="/reset-password" element={
            <Suspense fallback={<LazyLoadFallback />}>
              <ResetPassword />
            </Suspense>
          } />

          <Route path="/:storeName" element={<PublicLayout />}>
            <Route index element={<ProductList />} />
            <Route path="product/:productId" element={<ProductDetail />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute>
              <Suspense fallback={<AdminSkeleton />}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<PageSkeleton />}>
                <AdminDashboard />
              </Suspense>
            } />
            <Route path="producto" element={
              <Suspense fallback={<PageSkeleton />}>
                <AdminDashboard />
              </Suspense>
            } />
            <Route path="categoria" element={
              <Suspense fallback={<PageSkeleton />}>
                <CategoriaPage />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<PageSkeleton />}>
                <StoreSettings />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<PageSkeleton />}>
                <ProductForm />
              </Suspense>
            } />
            <Route path="edit/:productId" element={
              <Suspense fallback={<PageSkeleton />}>
                <ProductForm />
              </Suspense>
            } />
            <Route path="precios" element={
              <Suspense fallback={<PageSkeleton />}>
                <BulkPriceUpdate />
              </Suspense>
            } />
            <Route path="inventario" element={
              <Suspense fallback={<PageSkeleton />}>
                <InventoryPage />
              </Suspense>
            } />
            <Route path="orders" element={
              <Suspense fallback={<PageSkeleton />}>
                <OrdersDashboard />
              </Suspense>
            } />
            <Route path="discounts" element={
              <Suspense fallback={<PageSkeleton />}>
                <DiscountSettingsPage />
              </Suspense>
            } />
            <Route path="stats" element={
              <Suspense fallback={<PageSkeleton />}>
                <StatsPage />
              </Suspense>
            } />

            <Route path="crm" element={<SuperAdminRoute><Outlet /></SuperAdminRoute>}>
              <Route index element={
                <Suspense fallback={<PageSkeleton />}>
                  <CRMDashboard />
                </Suspense>
              } />
              <Route path="clients" element={
                <Suspense fallback={<PageSkeleton />}>
                  <Clients />
                </Suspense>
              } />
              <Route path="leads" element={
                <Suspense fallback={<PageSkeleton />}>
                  <Leads />
                </Suspense>
              } />
              <Route path="payments" element={
                <Suspense fallback={<PageSkeleton />}>
                  <Payments />
                </Suspense>
              } />
            </Route>
          </Route>

          <Route path='*' element={
            <Suspense fallback={<LazyLoadFallback />}>
              <Error404 />
            </Suspense>
          } />
        </Routes>
      </CartProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
