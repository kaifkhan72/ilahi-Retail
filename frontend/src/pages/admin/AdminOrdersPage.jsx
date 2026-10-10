import React, { useEffect, useState } from 'react';
import { ShoppingCart, Eye, X, Truck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusBadgeStyles = {
  PLACED: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Order for Modal inspection
  const [activeOrder, setActiveOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      if (res.data?.success) {
        setOrders(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Order #${orderId} updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review customer orders, update tracking status, and monitor fulfillment</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-semibold uppercase">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 font-medium focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Orders</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Recipient & Phone</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status & Action</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-6 px-4 bg-gray-50/50" />
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-extrabold text-gray-900 text-sm">
                      #{order.id}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      <span className="font-semibold block">{order.customerEmail || 'Guest'}</span>
                      <span className="text-[11px] text-gray-400">ID: {order.customerId}</span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <p className="font-semibold text-gray-900">{order.deliveryName}</p>
                      <p className="text-[11px] text-gray-500">{order.deliveryPhone}</p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-600 text-sm">
                      {formatPrice(order.totalAmount)}
                      <span className="block text-[10px] text-gray-400 font-normal">Cash on Delivery</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          statusBadgeStyles[order.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveOrder(order)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order #{activeOrder.id}</h2>
                <span className="text-xs text-gray-500">Placed on {formatDate(activeOrder.createdAt)}</span>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Details */}
            <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-gray-900 flex items-center mb-1">
                <Truck className="w-4 h-4 mr-1.5 text-emerald-600" />
                Shipping Information
              </p>
              <p><strong className="text-gray-700">Recipient:</strong> {activeOrder.deliveryName}</p>
              <p><strong className="text-gray-700">Phone:</strong> {activeOrder.deliveryPhone}</p>
              <p><strong className="text-gray-700">Address:</strong> {activeOrder.deliveryAddress}, {activeOrder.deliveryCity}, {activeOrder.deliveryState} - {activeOrder.deliveryPincode}</p>
              <p><strong className="text-gray-700">Payment:</strong> Cash on Delivery (COD)</p>
            </div>

            {/* Itemized list */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ordered Items</h3>
              <div className="divide-y divide-gray-100 text-xs">
                {activeOrder.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{item.productName}</p>
                      <p className="text-gray-500">{item.quantity} × {formatPrice(item.productPrice)}</p>
                    </div>
                    <span className="font-bold text-gray-900">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Total COD Collection</span>
              <span className="text-xl font-extrabold text-emerald-600">{formatPrice(activeOrder.totalAmount)}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
