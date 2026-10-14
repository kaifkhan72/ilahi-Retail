import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatPrice, getImageUrl, getProductFallbackImage } from '../utils/formatters';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const settings = useSettingsStore((state) => state.settings) || {};
  const FREE_SHIPPING_THRESHOLD = settings.freeShippingThreshold || 499;
  const {
    items,
    totalPrice,
    totalItems,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCartStore();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const freeShippingProgress = Math.min(100, Math.round((totalPrice / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - totalPrice;

  const handleUpdate = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      await handleRemove(itemId);
      return;
    }
    try {
      await updateQuantity(itemId, newQty);
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between transform transition duration-300 ease-in-out">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition"
              title="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 text-xs">
            {remainingForFreeShipping > 0 ? (
              <div>
                <p className="text-emerald-900 font-medium flex items-center justify-between">
                  <span>Add <strong className="font-bold text-emerald-700">{formatPrice(remainingForFreeShipping)}</strong> more for FREE delivery</span>
                  <Truck className="w-4 h-4 text-emerald-600 ml-1 inline" />
                </p>
                <div className="w-full bg-emerald-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-emerald-800 font-bold flex items-center">
                <Truck className="w-4 h-4 mr-1.5 text-emerald-600" />
                🎉 Congratulations! You have unlocked FREE Delivery!
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Looks like you haven't added any toys, kitchen essentials, or apparel yet.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/products');
                  }}
                  className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item) => {
                const product = item.product;
                return (
                  <div key={item.id} className="py-4 flex space-x-4">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100 relative">
                      <img
                        src={getImageUrl(product?.imageUrl, product?.category?.name, product?.name)}
                        alt={product?.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getProductFallbackImage(product?.category?.name, product?.name);
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <Link
                            to={`/products/${product?.id}`}
                            onClick={closeDrawer}
                            className="font-medium text-xs sm:text-sm text-gray-900 hover:text-emerald-600 transition line-clamp-1"
                          >
                            {product?.name || 'Retail Item'}
                          </Link>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {product?.category?.name || 'Item'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50">
                          <button
                            onClick={() => handleUpdate(item.id, item.quantity, -1)}
                            className="p-1 hover:text-emerald-600 transition"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 text-gray-500" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdate(item.id, item.quantity, 1)}
                            className="p-1 hover:text-emerald-600 transition"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-bold text-gray-900">
                            {formatPrice(item.subtotalPrice || (product?.price * item.quantity))}
                          </p>
                          {product?.originalPrice && product.originalPrice > product.price && (
                            <p className="text-[10px] text-gray-400 line-through">
                              {formatPrice(product.originalPrice * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/70 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-600">
                    {totalPrice >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Estimated Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center cursor-pointer"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs transition"
                >
                  View Full Cart Page
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe checkout with Cash on Delivery</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
