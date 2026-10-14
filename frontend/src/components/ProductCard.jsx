import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, getImageUrl, getProductFallbackImage } from '../utils/formatters';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      toast.success(`${product.name} saved to wishlist!`, { icon: '❤️' });
    } else {
      toast('Removed from wishlist', { icon: '🤍' });
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    if (product.stock < 1) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    }
  };

    const discount = product.discountPercentage || 
      (product.originalPrice && product.originalPrice > product.price 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : null);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
      <Link to={`/products/${product.id}`} className="block relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={getImageUrl(product.imageUrl, product.category?.name, product.name)}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getProductFallbackImage(product.category?.name, product.name);
          }}
        />

        {/* Category Tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm border border-gray-100">
            {product.category?.name || 'Item'}
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm text-gray-400 hover:text-rose-500 transition cursor-pointer z-10"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
        </button>

        {/* Discount Badge */}
        {discount && discount > 0 && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 text-[10px] font-black tracking-wider uppercase bg-rose-600 text-white rounded-full shadow-sm">
              {discount}% OFF
            </span>
          </div>
        )}

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition line-clamp-1 text-sm md:text-base">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center space-x-1.5 mt-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-gray-800 ml-1">4.8</span>
            </div>
            <span className="text-[11px] text-gray-400">({product.id * 5 + 14})</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product.description || 'Quality item from Ilahi Retail'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5 flex-wrap">
              <span className="text-base md:text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-400">
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <span className="text-amber-600 font-medium">Only {product.stock} left</span>
                ) : (
                  <span className="text-emerald-600">In Stock</span>
                )
              ) : (
                <span className="text-red-500 font-medium">Out of stock</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
