import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/formatters';

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleMoveToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    try {
      await addToCart(product.id, 1);
      removeFromWishlist(product.id);
      toast.success(`${product.name} moved to cart!`);
    } catch (err) {
      toast.error('Failed to move item to cart');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4 border border-rose-100 shadow-xs">
          <Heart className="w-10 h-10 stroke-1 fill-rose-100" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Wishlist is Empty</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Explore our collections of toys, kitchenware, and apparel to save your favorite items for later!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition"
        >
          Explore Catalog
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <span>My Wishlist</span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review your favorite products and move them to cart</p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear your wishlist?')) {
              clearWishlist();
              toast.success('Wishlist cleared');
            }
          }}
          className="text-xs font-semibold text-gray-500 hover:text-red-600 self-start sm:self-auto transition"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => {
          const discount = product.discountPercentage || 
            (product.originalPrice && product.originalPrice > product.price 
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
              : null);

          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <Link to={`/products/${product.id}`} className="block w-full h-full">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-12 h-12 stroke-1" />
                    </div>
                  )}
                </Link>

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 text-[11px] font-semibold uppercase bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm">
                    {product.category?.name || 'Item'}
                  </span>
                </div>

                {discount && discount > 0 && (
                  <div className="absolute top-2.5 right-12">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-rose-600 text-white rounded-full shadow-sm">
                      {discount}% OFF
                    </span>
                  </div>
                )}

                {/* Remove from wishlist button */}
                <button
                  onClick={() => {
                    removeFromWishlist(product.id);
                    toast.success('Removed from wishlist');
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm transition"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition line-clamp-1 text-sm">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-base font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock <= 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{product.stock > 0 ? 'Move to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
