import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';

export const MobileBottomNav = () => {
  const totalItems = useCartStore((state) => state.totalItems);
  const wishlistItems = useWishlistStore((state) => state.items) || [];
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Products', path: '/products', icon: Grid },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: totalItems > 0 ? totalItems : null,
    },
    {
      label: 'Wishlist',
      path: '/wishlist',
      icon: Heart,
      badge: wishlistItems.length > 0 ? wishlistItems.length : null,
    },
    {
      label: 'Account',
      path: isAuthenticated ? '/profile' : '/login',
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'text-emerald-600 scale-105 font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
