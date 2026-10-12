import React, { useEffect, useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Eye, 
  X, 
  Truck, 
  CheckCircle2, 
  Search, 
  Printer, 
  FileText, 
  Save, 
  PackageCheck,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useSettingsStore } from '../../store/settingsStore';
import { useOrderOpsStore } from '../../store/orderOpsStore';

const STATUS_OPTIONS = ['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusBadgeStyles = {
  PLACED: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const COURIER_PARTNERS = ['Delhivery', 'BlueDart', 'DTDC', 'India Post', 'Shadowfax', 'Ecom Express', 'Local Delivery'];

export const AdminOrdersPage = () => {
  const settings = useSettingsStore((state) => state.settings) || {};
  const { orderMetadata, setOrderTracking } = useOrderOpsStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Order for Modal inspection & Packing slip
  const [activeOrder, setActiveOrder] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Form state for Courier / AWB inside modal
  const [courierName, setCourierName] = useState('Delhivery');
  const [trackingAwb, setTrackingAwb] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 20);
      if (selectedStatus && selectedStatus !== 'ALL') {
        params.append('status', selectedStatus);
      }

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

  // When active order opens, pre-fill tracking metadata
  useEffect(() => {
    if (activeOrder) {
      const existing = orderMetadata[activeOrder.id];
      setCourierName(activeOrder.courierName || existing?.courierName || 'Delhivery');
      setTrackingAwb(activeOrder.trackingNumber || existing?.trackingAwb || '');
      setOrderNotes(activeOrder.orderNotes || existing?.notes || '');
    }
  }, [activeOrder, orderMetadata]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Order #${orderId} marked as ${newStatus}`);
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

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    try {
      await api.patch(`/admin/orders/${activeOrder.id}/tracking`, {
        courierName,
        trackingNumber: trackingAwb,
        orderNotes,
      });
      setOrderTracking(activeOrder.id, courierName, trackingAwb, orderNotes);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === activeOrder.id
            ? { ...o, courierName, trackingNumber: trackingAwb, orderNotes }
            : o
        )
      );
      toast.success(`Courier tracking details saved for Order #${activeOrder.id}`, { icon: '🚚' });
    } catch (err) {
      toast.error('Failed to save tracking details');
    }
  };

  // Client-side search filtering across Order ID, Name, Phone, and City
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase().trim();
    return orders.filter((order) => {
      const idMatch = String(order.id).includes(term);
      const nameMatch = (order.deliveryName || '').toLowerCase().includes(term);
      const phoneMatch = (order.deliveryPhone || '').toLowerCase().includes(term);
      const cityMatch = (order.deliveryCity || '').toLowerCase().includes(term);
      const emailMatch = (order.customerEmail || '').toLowerCase().includes(term);
      return idMatch || nameMatch || phoneMatch || cityMatch || emailMatch;
    });
  }, [orders, searchTerm]);

  const handlePrintSlip = () => {
    window.print();
  };

  const statusCounts = useMemo(() => {
    const counts = { ALL: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    const headers = ['Order ID', 'Customer Email', 'Recipient Name', 'Phone', 'Address', 'City', 'Status', 'Courier', 'AWB', 'Total Amount', 'Created At'];
    const rows = orders.map((o) => {
      const trk = orderMetadata[o.id] || {};
      return [
        o.id,
        o.customerEmail || 'Guest',
        `"${(o.deliveryName || '').replace(/"/g, '""')}"`,
        `"${o.deliveryPhone || ''}"`,
        `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
        `"${o.deliveryCity || ''}"`,
        o.status,
        `"${trk.courierName || ''}"`,
        `"${trk.trackingAwb || ''}"`,
        o.totalAmount,
        o.createdAt,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders shipping manifest CSV exported successfully!', { icon: '📄' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <ShoppingCart className="w-7 h-7 text-emerald-600" />
            <span>Orders & Shipping Operations</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Search orders, manage fulfillment stages, assign courier AWB tracking, and print customer packing slips.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Export Manifest (CSV)</span>
          </button>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:border-emerald-500 focus:outline-none shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 border-b border-gray-100">
        {STATUS_OPTIONS.map((st) => {
          const isActive = selectedStatus === st;
          return (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setPage(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{st}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {statusCounts[st] || 0}
              </span>
            </button>
          );
        })}
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
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4">Courier / AWB</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-6 px-4 bg-gray-50/50" />
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const tracking = orderMetadata[order.id];
                  return (
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
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{order.deliveryCity}</p>
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
                          {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        {tracking?.trackingAwb ? (
                          <div className="text-[11px]">
                            <span className="font-bold text-gray-800 block">{tracking.courierName}</span>
                            <span className="text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {tracking.trackingAwb}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Not assigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setActiveOrder(order);
                              setShowSlipModal(false);
                            }}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Manage order & Courier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveOrder(order);
                              setShowSlipModal(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Print Packing Slip / Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No orders matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Operations & Tracking Modal */}
      {activeOrder && !showSlipModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order #{activeOrder.id}</h2>
                <span className="text-xs text-gray-500">Placed on {formatDate(activeOrder.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSlipModal(true)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-gray-900 flex items-center mb-1">
                <Truck className="w-4 h-4 mr-1.5 text-emerald-600" />
                Shipping & Customer Address
              </p>
              <p><strong className="text-gray-700">Recipient:</strong> {activeOrder.deliveryName}</p>
              <p><strong className="text-gray-700">Phone:</strong> {activeOrder.deliveryPhone}</p>
              <p><strong className="text-gray-700">Full Address:</strong> {activeOrder.deliveryAddress}, {activeOrder.deliveryCity}, {activeOrder.deliveryState} - {activeOrder.deliveryPincode}</p>
              <p><strong className="text-gray-700">Payment:</strong> Cash on Delivery (COD)</p>
            </div>

            {/* Courier AWB Assignment Box */}
            <form onSubmit={handleSaveTracking} className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center space-x-1.5">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Courier & Logistics Assignment</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Courier Partner</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
                  >
                    {COURIER_PARTNERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">AWB / Tracking Number</label>
                  <input
                    type="text"
                    value={trackingAwb}
                    onChange={(e) => setTrackingAwb(e.target.value)}
                    placeholder="e.g. DEL-984729184"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Internal Notes</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Fragile glassware packing completed"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Tracking Info</span>
                </button>
              </div>
            </form>

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

            <div className="flex justify-end space-x-2 pt-2">
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

      {/* Printable Invoice / Packing Slip Modal */}
      {activeOrder && showSlipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl space-y-6 my-8 print:p-0 print:shadow-none print:m-0 print:max-w-none">
            
            {/* Action Bar (hidden on print) */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 print:hidden">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
                Shipping Packing Slip & Invoice
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Area */}
            <div className="space-y-6 text-gray-900 font-sans" id="printable-invoice">
              
              {/* Header with store brand & address */}
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
                    TAX INVOICE / PACKING SLIP
                  </span>
                  <p className="text-sm font-extrabold text-gray-900 mt-2">ORDER #{activeOrder.id}</p>
                  <p className="text-xs text-gray-500">Date: {formatDate(activeOrder.createdAt)}</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1 uppercase">Payment: Cash on Delivery (COD)</p>
                </div>
              </div>

              {/* Customer Shipping Address & Courier Box */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
                <div>
                  <strong className="block text-gray-900 uppercase font-bold tracking-wider mb-1">
                    Ship To (Customer):
                  </strong>
                  <p className="font-extrabold text-sm text-gray-900">{activeOrder.deliveryName}</p>
                  <p className="text-gray-700 mt-0.5">{activeOrder.deliveryAddress}</p>
                  <p className="text-gray-700">{activeOrder.deliveryCity}, {activeOrder.deliveryState} - {activeOrder.deliveryPincode}</p>
                  <p className="font-bold text-gray-900 mt-1">Phone: {activeOrder.deliveryPhone}</p>
                </div>

                <div>
                  <strong className="block text-gray-900 uppercase font-bold tracking-wider mb-1">
                    Courier & Tracking:
                  </strong>
                  <p className="text-gray-800 font-semibold">
                    Partner: {orderMetadata[activeOrder.id]?.courierName || 'Delhivery Express'}
                  </p>
                  <p className="font-mono text-xs font-bold text-gray-900 mt-1">
                    AWB: {orderMetadata[activeOrder.id]?.trackingAwb || 'DEL-PENDING'}
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Status:</span>
                    <span className="font-bold text-emerald-800 uppercase">{activeOrder.status}</span>
                  </div>
                </div>
              </div>

              {/* Ordered Items Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-900 font-bold uppercase text-gray-700">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-semibold text-gray-900">{item.productName}</td>
                      <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 text-right">{formatPrice(item.productPrice)}</td>
                      <td className="py-2.5 text-right font-bold text-gray-900">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Grand Total & COD Amount */}
              <div className="pt-4 border-t-2 border-gray-900 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatPrice(activeOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee:</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300 flex justify-between items-center text-sm font-extrabold text-gray-900">
                    <span>COD Amount Due:</span>
                    <span className="text-base text-emerald-700">{formatPrice(activeOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Big COD Notice Box */}
              <div className="p-3 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl text-center text-xs">
                <strong className="text-amber-900 uppercase block font-extrabold tracking-wider">
                  ⚠️ CASH ON DELIVERY — COLLECT EXACT CASH: {formatPrice(activeOrder.totalAmount)}
                </strong>
                <span className="text-amber-800 text-[11px]">
                  Please collect cash payment upon physical delivery of parcel. Check seal before receiving.
                </span>
              </div>

              {/* Footer Declaration */}
              <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between items-center">
                <span>Computer generated invoice. No signature required.</span>
                <span>Thank you for shopping with {settings.storeName || 'Ilahi Retail'}!</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
