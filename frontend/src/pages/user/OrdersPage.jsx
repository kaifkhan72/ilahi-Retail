import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  XCircle, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Printer,
  X,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useOrderOpsStore } from '../../store/orderOpsStore';
import { useSettingsStore } from '../../store/settingsStore';

const statusColors = {
  PLACED: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Received & verifying' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Packed at warehouse' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Out for courier delivery' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Delivered to you' },
];

const getStepIndex = (status) => {
  switch (status) {
    case 'PLACED': return 0;
    case 'CONFIRMED': return 1;
    case 'SHIPPED': return 2;
    case 'DELIVERED': return 3;
    default: return -1;
  }
};

export const OrdersPage = () => {
  const { orderMetadata } = useOrderOpsStore();
  const settings = useSettingsStore((state) => state.settings) || {};

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

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

  const handlePrint = () => {
    window.print();
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
          className="inline-block mt-6 px-6 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders & Shipments</h1>
          <p className="text-sm text-gray-500 mt-1">Track live order fulfillment, courier AWB tracking, and download invoices</p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const isCancellable = order.status === 'PLACED';
          const tracking = orderMetadata[order.id];

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

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Total COD Due</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-xl transition cursor-pointer"
                    title="View & Print Tax Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

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

              {/* Courier Tracking Banner (If Assigned) */}
              {tracking?.trackingAwb && (
                <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-900">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>
                      Dispatched with <strong className="font-bold">{tracking.courierName}</strong>
                    </span>
                    <span className="bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold text-emerald-800 border border-emerald-200">
                      AWB: {tracking.trackingAwb}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700">
                    Estimated Delivery: {settings.estimatedDeliveryDays || '2 - 4 Business Days'}
                  </span>
                </div>
              )}

              {/* Visual Order Tracking Timeline Stepper */}
              <div className="px-6 py-5 bg-white border-b border-gray-100">
                {order.status === 'CANCELLED' ? (
                  <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                    <div>
                      <p className="font-bold">This order was cancelled</p>
                      <p className="text-[11px] text-red-500 mt-0.5">No delivery will be dispatched and no payment is owed.</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting Line */}
                      <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-gray-100 -z-0">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${(Math.max(0, getStepIndex(order.status)) / (STEPS.length - 1)) * 100}%`,
                          }}
                        />
                      </div>

                      {STEPS.map((step, idx) => {
                        const currentIdx = getStepIndex(order.status);
                        const isCompleted = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                  : 'bg-white border-2 border-gray-300 text-gray-400'
                              } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                              ) : (
                                <span className="text-xs font-bold">{idx + 1}</span>
                              )}
                            </div>
                            <span
                              className={`text-xs font-bold mt-2 ${
                                isCompleted ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="text-[10px] text-gray-400 hidden sm:block max-w-[90px] leading-tight mt-0.5">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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

      {/* Invoice Modal for Customer */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl space-y-6 my-8 print:p-0 print:shadow-none print:m-0 print:max-w-none">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 print:hidden">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
                Customer Tax Invoice
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="space-y-6 text-gray-900 font-sans">
              <div className="flex items-start justify-between pb-6 border-b-2 border-gray-900">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                    {settings.storeName || 'Ilahi Retail'}
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">{settings.storeTagline}</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">{settings.storeAddress}</p>
                  <p className="text-xs text-gray-500">Ph: {settings.supportPhone} | {settings.supportEmail}</p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-gray-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    CUSTOMER TAX INVOICE
                  </span>
                  <p className="text-sm font-extrabold text-gray-900 mt-2">ORDER #{selectedInvoiceOrder.id}</p>
                  <p className="text-xs text-gray-500">Date: {formatDate(selectedInvoiceOrder.createdAt)}</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1 uppercase">Payment: Cash on Delivery (COD)</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
                <strong className="block text-gray-900 uppercase font-bold tracking-wider mb-1">
                  Billed To / Delivered To:
                </strong>
                <p className="font-extrabold text-sm text-gray-900">{selectedInvoiceOrder.deliveryName}</p>
                <p className="text-gray-700 mt-0.5">{selectedInvoiceOrder.deliveryAddress}</p>
                <p className="text-gray-700">{selectedInvoiceOrder.deliveryCity}, {selectedInvoiceOrder.deliveryState} - {selectedInvoiceOrder.deliveryPincode}</p>
                <p className="font-bold text-gray-900 mt-1">Contact: {selectedInvoiceOrder.deliveryPhone}</p>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-900 font-bold uppercase text-gray-700">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedInvoiceOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-semibold text-gray-900">{item.productName}</td>
                      <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 text-right">{formatPrice(item.productPrice)}</td>
                      <td className="py-2.5 text-right font-bold text-gray-900">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-4 border-t-2 border-gray-900 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedInvoiceOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges:</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300 flex justify-between items-center text-sm font-extrabold text-gray-900">
                    <span>Amount Payable (COD):</span>
                    <span className="text-base text-emerald-700">{formatPrice(selectedInvoiceOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-900">
                <strong className="block font-bold">Cash on Delivery (COD) Verified</strong>
                <span>Pay only upon receiving your package from the courier agent.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
