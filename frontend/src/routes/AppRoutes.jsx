import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';
import { ProfilePage } from '../pages/user/ProfilePage';

// Placeholder stubs for pages to be fully implemented in Part 6 and Part 7
const HomePage = React.lazy(() => import('../pages/user/HomePage'));
const ProductsPage = React.lazy(() => import('../pages/user/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('../pages/user/ProductDetailPage'));
const CartPage = React.lazy(() => import('../pages/user/CartPage'));
const CheckoutPage = React.lazy(() => import('../pages/user/CheckoutPage'));
const OrdersPage = React.lazy(() => import('../pages/user/OrdersPage'));

// Admin pages
const AdminDashboardPage = React.lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminProductsPage = React.lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminCategoriesPage = React.lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = React.lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminCustomersPage = React.lazy(() => import('../pages/admin/AdminCustomersPage'));

export const AppRoutes = () => {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <Routes>
        {/* Customer Storefront Routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};
