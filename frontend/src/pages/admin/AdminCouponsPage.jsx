import { useEffect, useState, useMemo } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  IndianRupee, 
  Sparkles, 
  Copy, 
  Check, 
  Search, 
  Flame,
  Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCouponStore } from '../../store/couponStore';
import { formatPrice } from '../../utils/formatters';

export const AdminCouponsPage = () => {
  const { coupons, addCoupon, toggleCoupon, deleteCoupon, fetchAdminCoupons } = useCouponStore();

  useEffect(() => {
    fetchAdminCoupons();
  }, [fetchAdminCoupons]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: 10,
    minOrder: 0,
    description: '',
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`, { icon: '📋' });
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    if (coupons.some((c) => c.code.toLowerCase() === formData.code.trim().toLowerCase())) {
      toast.error('A coupon with this code already exists!');
      return;
    }

    addCoupon(formData);
    toast.success(`Coupon ${formData.code.toUpperCase()} created successfully!`, { icon: '🎉' });
    setFormData({
      code: '',
      type: 'PERCENTAGE',
      value: 10,
      minOrder: 0,
      description: '',
    });
    setShowAddModal(false);
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      code: preset.code,
      type: preset.type,
      value: preset.value,
      minOrder: preset.minOrder,
      description: preset.description,
    });
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch = 
        c.code.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (c.description || '').toLowerCase().includes(searchTerm.toLowerCase().trim());

      if (filterTab === 'ACTIVE') return matchesSearch && c.active;
      if (filterTab === 'DISABLED') return matchesSearch && !c.active;
      return matchesSearch;
    });
  }, [coupons, filterTab, searchTerm]);

  const activeCount = coupons.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <Tag className="w-7 h-7 text-emerald-600" />
            <span>Discount Coupons Manager</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create promotional coupon codes, set flat/percentage discount rules, and toggle campaign availability.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Total Campaigns</span>
            <span className="text-2xl font-black text-gray-900">{coupons.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Live Active Codes</span>
            <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Customer Checkout</span>
            <span className="text-xs font-bold text-gray-800">Auto-validates in real time</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'DISABLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterTab === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupon codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`p-6 rounded-3xl border transition shadow-xs flex flex-col justify-between ${
              coupon.active
                ? 'bg-white border-gray-200'
                : 'bg-gray-50/80 border-gray-200/80 opacity-75'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-lg font-black text-gray-900 tracking-wider bg-gray-100 px-3 py-1 rounded-xl inline-block border border-gray-200">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{coupon.description || 'Promotional coupon'}</p>
                </div>

                <span
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full flex items-center space-x-1 ${
                    coupon.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {coupon.active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-gray-500" />
                      <span>Disabled</span>
                    </>
                  )}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-emerald-950 font-bold">
                  <span>Customer Benefit:</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT OFF`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-800">
                  <span>Min Order Threshold:</span>
                  <span>{coupon.minOrder > 0 ? formatPrice(coupon.minOrder) : 'No Minimum'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
              <button
                onClick={() => toggleCoupon(coupon.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  coupon.active
                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                {coupon.active ? 'Disable Coupon' : 'Enable Coupon'}
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Delete coupon ${coupon.code}?`)) {
                    deleteCoupon(coupon.id);
                    toast.success('Coupon deleted');
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Create New Coupon</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Templates */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: 'SUPER20', type: 'PERCENTAGE', value: 20, minOrder: 0, description: '20% off storewide' },
                  { code: 'FLAT200', type: 'FLAT', value: 200, minOrder: 999, description: '₹200 off above ₹999' },
                  { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrder: 0, description: '10% welcome discount' },
                ].map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-lg border border-gray-200 transition cursor-pointer"
                  >
                    {preset.code}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono uppercase font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {formData.type === 'PERCENTAGE' ? 'Discount %' : 'Flat ₹ OFF'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-emerald-700 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                  placeholder="0 for no minimum"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Leave 0 if applicable to any cart total</p>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Description / Campaign Note
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 20% festive discount on all items"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
