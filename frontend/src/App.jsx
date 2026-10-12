import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

import { CartDrawer } from './components/CartDrawer';

import { useSettingsStore } from './store/settingsStore';
import { useWishlistStore } from './store/wishlistStore';

export function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    // Attempt silent refresh on initial load to restore session from cookie
    checkAuth();
    fetchSettings();
  }, [checkAuth, fetchSettings]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <CartDrawer />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
