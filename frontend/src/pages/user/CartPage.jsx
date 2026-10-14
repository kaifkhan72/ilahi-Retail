import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { formatPrice, getImageUrl, getProductFallbackImage } from '../../utils/formatters';

export const CartPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { items, totalPrice, updateQuantity, removeItem, clearCart, isLoading } = useCartStore();

  const handleQuantityChange = async (itemId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }

    try {
      await updateQuantity(itemId, newQty);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId, name) => {
    try {
      await removeItem(itemId);
      toast.success(`${name} removed from cart`);
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        toast.success('Cart cleared');
      } catch (err) {
        toast.error('Failed to clear cart');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Sign in to view your cart</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Your shopping cart is saved in your account so you can access it on any device.
        </p>
        <Link
          to="/login"
          state={{ from: { pathname: '/cart' } }}
          className="inline-block mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is currently empty</h2>
        <p className="text-sm text-gray-500 mt-2">
          Looks like you haven't added any toys, kitchenware, or clothes yet.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm"
        >
          Explore Catalog
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-1">Review your items before proceeding to checkout</p>
        </div>

        <button
          onClick={handleClearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
            >
              <img
                src={getImageUrl(item.productImageUrl, '', item.productName)}
                alt={item.productName}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-100 shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getProductFallbackImage('', item.productName);
                }}
              />

              <div className="flex-1 w-full space-y-1">
                <Link
                  to={`/products/${item.productId}`}
                  className="font-bold text-gray-900 hover:text-emerald-600 transition text-sm sm:text-base line-clamp-1"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-gray-500">Unit Price: {formatPrice(item.productPrice)}</p>
                <p className="text-xs text-emerald-600 font-medium">
                  Subtotal: <span className="font-bold">{formatPrice(item.subtotal)}</span>
                </p>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-4 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.availableStock)}
                    disabled={item.quantity <= 1}
                    className="p-1.5 hover:bg-gray-200 text-gray-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.availableStock)}
                    disabled={item.quantity >= item.availableStock}
                    className="p-1.5 hover:bg-gray-200 text-gray-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id, item.productName)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm h-fit space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

          <div className="space-y-3 text-sm text-gray-600 pb-4 border-b border-gray-100">
            <div className="flex justify-between">
              <span>Items Total ({items.length} unique)</span>
              <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
              <span className="flex items-center">
                <Truck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Payment Method
              </span>
              <span className="font-semibold text-gray-700">Cash on Delivery</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-bold text-gray-900">
            <span>Total Amount</span>
            <span className="text-2xl text-emerald-600 font-extrabold">{formatPrice(totalPrice)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-gray-400 text-center leading-tight">
            Taxes included. Cash on Delivery is collected when the package is delivered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
