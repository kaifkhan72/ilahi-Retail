import React, { useState } from 'react';
import { 
  Sliders, 
  Store, 
  Megaphone, 
  Truck, 
  MapPin, 
  Save, 
  RotateCcw, 
  Image as ImageIcon, 
  Sparkles, 
  Phone, 
  Mail, 
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../store/settingsStore';

export const AdminSettingsPage = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const [formData, setFormData] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState('general');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    updateSettings(formData);
    toast.success('Website master settings saved live!', { icon: '✅' });
  };

  const handleReset = () => {
    if (window.confirm('Reset all website settings back to defaults?')) {
      resetSettings();
      setFormData({ ...useSettingsStore.getState().settings });
      toast.success('Settings restored to defaults');
    }
  };

  const tabs = [
    { id: 'general', label: 'Store Identity', icon: Store },
    { id: 'images', label: 'Images & Hero Banners', icon: ImageIcon },
    { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
    { id: 'delivery', label: 'Delivery & Shipping', icon: Truck },
    { id: 'contact', label: 'Address & Contact', icon: MapPin },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <Sliders className="w-7 h-7 text-emerald-600" />
            <span>Master Website Settings</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Control the whole website live: store names, addresses, hero images, announcement banners, and delivery rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Restore Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 space-x-2 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40 rounded-t-xl'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Tab 1: Store Identity */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center space-x-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Brand Identity & Names</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Store Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
                <p className="text-[11px] text-gray-400 mt-1">Appears in header, footer, & invoices</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Store Logo Badge Text *
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.logoText}
                  onChange={(e) => handleChange('logoText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs uppercase font-bold"
                />
                <p className="text-[11px] text-gray-400 mt-1">1-3 letters badge (e.g. IR)</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Store Tagline
                </label>
                <input
                  type="text"
                  value={formData.storeTagline}
                  onChange={(e) => handleChange('storeTagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
                <p className="text-[11px] text-gray-400 mt-1">Brand slogan in footer and metadata</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Custom Logo Image URL (Optional)
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="url"
                  value={formData.logoImageUrl || ''}
                  onChange={(e) => handleChange('logoImageUrl', e.target.value)}
                  placeholder="https://example.com/logo.png (leave blank to use badge text)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
                {formData.logoImageUrl && (
                  <img
                    src={formData.logoImageUrl}
                    alt="Logo preview"
                    className="h-10 w-auto max-w-[120px] object-contain rounded border border-gray-200 p-1"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">If provided, this image will display on the top navigation bar.</p>
            </div>
          </div>
        )}

        {/* Tab 2: Images & Hero Banners */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Homepage Hero Banners & Images</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hero Small Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroBadge}
                    onChange={(e) => handleChange('heroBadge', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">e.g. Premium Everyday Essentials</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hero Main Headline (First Part)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitle}
                    onChange={(e) => handleChange('heroTitle', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs font-bold"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">e.g. Toys, Kitchen & Clothes at</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Headline Highlighted Word (Emerald Color)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitleHighlight}
                    onChange={(e) => handleChange('heroTitleHighlight', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs text-emerald-700 font-extrabold"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">e.g. Ilahi Retail</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hero Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={formData.heroSubtitle}
                    onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Descriptive text under headline</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Hero Section Background Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.heroBgImage}
                    onChange={(e) => handleChange('heroBgImage', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">High resolution image banner URL for the homepage header</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Promo Feature Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.promoBannerImage}
                    onChange={(e) => handleChange('promoBannerImage', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Visual Preview */}
              <div className="pt-4 border-t border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-3">Live Visual Preview:</span>
                <div 
                  className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(6, 78, 59, 0.88), rgba(17, 24, 39, 0.94)), url('${formData.heroBgImage}')`
                  }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold mb-3 uppercase tracking-wider">
                    {formData.heroBadge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {formData.heroTitle} <span className="text-emerald-400">{formData.heroTitleHighlight}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-200 max-w-xl mt-2">
                    {formData.heroSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Announcement Bar */}
        {activeTab === 'announcement' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-emerald-600" />
                  <span>Top Announcement Banner</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">High-visibility banner shown across the top of the entire customer website</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcementActive}
                  onChange={(e) => handleChange('announcementActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-gray-700">
                  {formData.announcementActive ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Announcement Message Text *
                </label>
                <input
                  type="text"
                  value={formData.announcementText}
                  onChange={(e) => handleChange('announcementText', e.target.value)}
                  placeholder="e.g. ⚡ Festive Offer: Free Delivery on orders over ₹499! Use code ILAHI10"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Click Target Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.announcementLink}
                  onChange={(e) => handleChange('announcementLink', e.target.value)}
                  placeholder="/products"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>

              {/* Live Preview */}
              <div className="pt-4 border-t border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Live Header Preview:</span>
                <div className="bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-xl text-center shadow-xs">
                  {formData.announcementText || 'Your announcement message will display here'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Delivery & Shipping */}
        {activeTab === 'delivery' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Shipping & Cash on Delivery Rules</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Free Shipping Minimum Threshold (₹ INR) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs font-bold text-emerald-700"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Updates the Free Delivery progress bar in Cart Drawer and Checkout automatically
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Estimated Delivery Timeline Display
                </label>
                <input
                  type="text"
                  value={formData.estimatedDeliveryDays}
                  onChange={(e) => handleChange('estimatedDeliveryDays', e.target.value)}
                  placeholder="2 - 4 Business Days"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
                <p className="text-[11px] text-gray-400 mt-1">Shown on product pages and order confirmation</p>
              </div>

              <div className="sm:col-span-2 pt-2">
                <div className="flex items-center space-x-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="text-emerald-900 font-bold block">Cash on Delivery (COD) Enabled</strong>
                    <span className="text-emerald-700">Customers can order without upfront payment and pay upon physical receipt.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Address & Contact */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Store Address, Support Contact & Business Hours</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Support Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.supportPhone}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Customer Support Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  WhatsApp Support Number (digits only, e.g. 919876543210)
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="919876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Physical Store Business Hours
                </label>
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) => handleChange('businessHours', e.target.value)}
                  placeholder="Mon - Sun: 9:00 AM - 10:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Store Physical Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.storeAddress}
                  onChange={(e) => handleChange('storeAddress', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
                <p className="text-[11px] text-gray-400 mt-1">Displayed in website footer and printed on customer invoices</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Instagram Profile Link
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Facebook Profile Link
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Master Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
