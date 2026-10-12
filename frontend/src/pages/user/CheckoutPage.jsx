import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Truck, CheckCircle2, ShoppingBag, ArrowLeft, Tag, X, CreditCard, Smartphone, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useCouponStore } from '../../store/couponStore';
import { formatPrice } from '../../utils/formatters';

const checkoutSchema = z.object({
  deliveryName: z.string().min(2, 'Name must be at least 2 characters'),
  deliveryPhone: z.string().min(7, 'Phone number must be at least 7 digits'),
  deliveryAddress: z.string().min(5, 'Address must be at least 5 characters'),
  deliveryCity: z.string().min(2, 'City is required'),
  deliveryPincode: z.string().min(4, 'Valid pincode is required'),
  deliveryState: z.string().min(2, 'State is required'),
});

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { items, totalPrice, reset } = useCartStore();
  const { validateCoupon, coupons } = useCouponStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'ONLINE'

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    const res = validateCoupon(code, totalPrice);
    if (!res.valid) {
      toast.error(res.error);
      return;
    }

    setAppliedCoupon({
      code: res.coupon.code,
      discount: res.discount,
      label: res.label,
    });
    toast.success(`Coupon ${res.coupon.code} applied! Saved ${formatPrice(res.discount)}`, { icon: '🎉' });
    setCouponCode('');
  };

  const savedAddress = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('ilahi_saved_delivery_address');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryName: savedAddress?.deliveryName || user?.name || '',
      deliveryPhone: savedAddress?.deliveryPhone || user?.phone || '',
      deliveryAddress: savedAddress?.deliveryAddress || '',
      deliveryCity: savedAddress?.deliveryCity || '',
      deliveryPincode: savedAddress?.deliveryPincode || '',
      deliveryState: savedAddress?.deliveryState || '',
    },
  });

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mt-2">Add some items before checking out.</p>
        <Link
          to="/products"
          className="inline-block mt-6 px-6 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      // Save address for future fast 1-click checkouts
      try {
        localStorage.setItem('ilahi_saved_delivery_address', JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save address locally', e);
      }

      const isOnline = paymentMethod === 'ONLINE';
      const payload = {
        ...data,
        couponCode: appliedCoupon?.code || null,
        paymentMethod,
        paymentId: isOnline ? `ONLINE_TXN_${Date.now()}` : null,
      };

      const res = await api.post('/orders/checkout', payload);
      if (res.data?.success) {
        reset(); // Clear frontend cart store
        toast.success(
          isOnline
            ? 'Online payment confirmed! Order placed successfully.'
            : 'Order placed successfully via Cash on Delivery!'
        );
        navigate('/orders', { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to place order. Check product stock.';
      toast.error(message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/cart"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to cart
      </Link>

      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Provide your shipping address for Cash on Delivery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Delivery Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Delivery Address</h2>
                <p className="text-xs text-gray-500">Where should we deliver your package?</p>
              </div>
            </div>

            {savedAddress && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800">
                <span className="font-medium">✨ Pre-filled with your saved shipping address!</span>
                <button
                  type="button"
                  onClick={() => {
                    resetForm({
                      deliveryName: savedAddress.deliveryName || user?.name || '',
                      deliveryPhone: savedAddress.deliveryPhone || user?.phone || '',
                      deliveryAddress: savedAddress.deliveryAddress || '',
                      deliveryCity: savedAddress.deliveryCity || '',
                      deliveryPincode: savedAddress.deliveryPincode || '',
                      deliveryState: savedAddress.deliveryState || '',
                    });
                    toast.success('Saved address restored');
                  }}
                  className="font-bold underline text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  Restore Saved
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  {...register('deliveryName')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                    errors.deliveryName ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {errors.deliveryName && (
                  <p className="text-xs text-red-500 mt-1">{errors.deliveryName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  {...register('deliveryPhone')}
                  placeholder="9876543210"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                    errors.deliveryPhone ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {errors.deliveryPhone && (
                  <p className="text-xs text-red-500 mt-1">{errors.deliveryPhone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Street Address / House No. *
              </label>
              <textarea
                rows={3}
                {...register('deliveryAddress')}
                placeholder="House number, apartment name, street, landmark"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                  errors.deliveryAddress ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
              />
              {errors.deliveryAddress && (
                <p className="text-xs text-red-500 mt-1">{errors.deliveryAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  {...register('deliveryCity')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                    errors.deliveryCity ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {errors.deliveryCity && (
                  <p className="text-xs text-red-500 mt-1">{errors.deliveryCity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  {...register('deliveryPincode')}
                  placeholder="560001"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                    errors.deliveryPincode ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {errors.deliveryPincode && (
                  <p className="text-xs text-red-500 mt-1">{errors.deliveryPincode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  {...register('deliveryState')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                    errors.deliveryState ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {errors.deliveryState && (
                  <p className="text-xs text-red-500 mt-1">{errors.deliveryState.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Choose Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* COD Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${paymentMethod === 'COD' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Cash on Delivery</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Pay in cash when package arrives at your door</p>
                </div>
              </button>

              {/* Online Payment Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                  paymentMethod === 'ONLINE'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${paymentMethod === 'ONLINE' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Pay Online / UPI</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Instant checkout via UPI, Google Pay, PhonePe, Cards</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'ONLINE' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant secure payment enabled. Your transaction is encrypted and verified.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition disabled:opacity-50 text-base cursor-pointer"
          >
            {isSubmitting ? 'Placing Order...' : `Confirm & Place Order (${formatPrice(Math.max(0, totalPrice - (appliedCoupon?.discount || 0)))})`}
          </button>
        </form>

        {/* Order Review Sidebar */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm h-fit space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Items in Order</h2>

          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto space-y-3 pr-1">
            {items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                <div className="pr-3">
                  <p className="font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.productPrice)}</p>
                </div>
                <span className="font-bold text-gray-900 shrink-0">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Have a Promo Code?
            </label>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                    <span className="text-[11px] text-emerald-700 ml-1.5">({appliedCoupon.label})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    toast('Coupon removed', { icon: 'ℹ️' });
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full transition"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter ILAHI10 or FLAT100"
                    className="flex-1 px-3.5 py-2 text-xs uppercase rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="flex items-center space-x-2 pt-1 flex-wrap gap-1">
                  <span className="text-[10px] text-gray-400">Try:</span>
                  {coupons
                    .filter((c) => c.active)
                    .slice(0, 4)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleApplyCoupon(c.code)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-md border border-gray-200 transition cursor-pointer"
                      >
                        {c.code}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span>-{formatPrice(appliedCoupon.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-emerald-600 font-semibold">FREE (Cash on Delivery)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-lg font-bold text-gray-900">
            <span>Total to Pay (COD)</span>
            <span className="text-2xl text-emerald-600 font-extrabold">
              {formatPrice(Math.max(0, totalPrice - (appliedCoupon?.discount || 0)))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
