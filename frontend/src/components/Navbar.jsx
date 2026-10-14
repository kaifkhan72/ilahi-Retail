import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, Package, Shield, Menu, X, Heart, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useSettingsStore } from '../store/settingsStore';
import api from '../services/api';
import { formatPrice, getImageUrl, getProductFallbackImage } from '../utils/formatters';

export const Navbar = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const settings = useSettingsStore((state) => state.settings) || {};
  const totalItems = useCartStore((state) => state.totalItems);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const wishlistItems = useWishlistStore((state) => state.items) || [];
  const wishlistCount = wishlistItems.length;

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Live search debounce
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await api.get(`/products?search=${encodeURIComponent(searchTerm.trim())}&size=5`);
        if (res.data?.success) {
          setSearchResults(res.data.data.content || []);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Failed to fetch search suggestions', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setIsSearchOpen(false);
    setSearchTerm('');
    navigate(`/products/${productId}`);
  };

  const handleLogout = async () => {
    await logout();
    useCartStore.getState().reset();
    navigate('/login');
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {settings.announcementActive && settings.announcementText && (
        <div className="bg-emerald-900 text-white text-xs font-semibold py-2 px-4 text-center tracking-wide border-b border-emerald-800/80">
          <Link
            to={settings.announcementLink || '/products'}
            className="hover:underline inline-flex items-center justify-center space-x-1.5 max-w-7xl mx-auto"
          >
            <span>{settings.announcementText}</span>
          </Link>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 shrink-0">
              {settings.logoImageUrl ? (
                <img
                  src={settings.logoImageUrl}
                  alt={settings.storeName || 'Store Logo'}
                  className="h-9 w-auto max-w-[120px] object-contain rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm tracking-wider">
                  {settings.logoText || 'IR'}
                </span>
              )}
              <span className="font-bold text-xl tracking-tight text-gray-900">
                {settings.storeName || 'Ilahi Retail'}
              </span>
            </Link>

          {/* Desktop Categories */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-medium text-gray-600">
            <Link to="/products" className="px-3 py-1.5 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition">
              All Products
            </Link>
            <Link to="/products?categoryId=1" className="px-3 py-1.5 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition">
              Toys
            </Link>
            <Link to="/products?categoryId=2" className="px-3 py-1.5 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition">
              Kitchen
            </Link>
            <Link to="/products?categoryId=3" className="px-3 py-1.5 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition">
              Clothes
            </Link>
          </nav>

          {/* Search Bar with live autocomplete */}
          <div ref={searchRef} className="hidden sm:flex flex-1 max-w-xs md:max-w-md relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search toys, cookware, clothes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                className="w-full bg-gray-100 border border-transparent rounded-full py-2 pl-10 pr-9 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
              {searchLoading && (
                <Loader2 className="absolute right-3.5 top-2.5 h-4 w-4 text-emerald-600 animate-spin" />
              )}
            </form>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden divide-y divide-gray-50">
                {searchResults.length > 0 ? (
                  <>
                    <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Suggested Products
                    </div>
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProduct(item.id)}
                        className="px-4 py-2.5 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={getImageUrl(item.imageUrl, item.category?.name, item.name)}
                            alt={item.name}
                            className="w-9 h-9 object-cover rounded-lg bg-gray-100 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getProductFallbackImage(item.category?.name, item.name);
                            }}
                          />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-600 truncate transition">
                              {item.name}
                            </p>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {item.category?.name}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-3">
                          <span className="text-xs font-bold text-gray-900">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="p-2 bg-gray-50 text-center">
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                      >
                        View all results for "{searchTerm}" &rarr;
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-4 text-center text-xs text-gray-400">
                    No items found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions: Wishlist, Cart & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-700 hover:text-rose-600 hover:bg-gray-100 rounded-full transition"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative p-2 text-gray-700 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center text-sm border border-emerald-300">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 text-sm"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-rose-600"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      My Wishlist ({wishlistCount})
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>

                    {isAdmin() && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-indigo-700 font-medium hover:bg-indigo-50"
                      >
                        <Shield className="w-4 h-4 mr-2 text-indigo-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:text-emerald-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:hidden text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 space-y-2">
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>

            <Link
              to="/products"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              All Products
            </Link>
            <Link
              to="/products?categoryId=1"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Toys
            </Link>
            <Link
              to="/products?categoryId=2"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Kitchen
            </Link>
            <Link
              to="/products?categoryId=3"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Clothes
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-rose-500" />
                My Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {!isAuthenticated && (
              <div className="pt-2 border-t border-gray-200 flex space-x-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
    </>
  );
};
