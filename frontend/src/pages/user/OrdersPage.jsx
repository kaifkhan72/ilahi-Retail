import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, XCircle, ChevronRight, ShoppingBag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';

const statusColors = {
  PLACED: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders?page=0&size=20');
      if (res.data?.success) {
        setOrders(res.data.data.content || []);
      }
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel order #${orderId}?`)) {
      return;
    }

    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data?.success) {
        toast.success(`Order #${orderId} was cancelled successfully`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
        <p className="text-sm text-gray-500 mt-2">
          You haven't placed any orders with us. Explore our catalog to find toys, kitchen items, and clothes!
        </p>
        <Link
          to="/products"
          className="inline-block mt-6 px-6 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Track current orders and review previous purchases</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const isCancellable = order.status === 'PLACED';
          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Header */}
              <div className="p-6 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-gray-900 text-base">
                      Order #{order.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Placed on {formatDate(order.createdAt)} • Payment: <strong className="text-gray-700">Cash on Delivery</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Total Amount</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  {isCancellable && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="p-6 space-y-4">
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            Quantity: {item.quantity} × {formatPrice(item.productPrice)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Info */}
                <div className="pt-4 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 p-6 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 gap-2">
                  <div>
                    <span className="font-semibold text-gray-800">Delivery Address: </span>
                    {order.deliveryName} ({order.deliveryPhone}), {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState} - {order.deliveryPincode}
                  </div>
                  <div className="shrink-0 text-emerald-700 font-semibold flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-1" />
                    Cash on Delivery
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
