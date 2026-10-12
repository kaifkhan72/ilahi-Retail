import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const DEFAULT_SETTINGS = {
  // Store Identity & Branding
  storeName: 'Ilahi Retail',
  storeTagline: 'Toys, Kitchen & Clothes at Honest Prices',
  logoText: 'IR',
  logoImageUrl: '',

  // Hero Banner & Media Images
  heroBadge: 'Premium Everyday Essentials',
  heroTitle: 'Toys, Kitchen & Clothes at',
  heroTitleHighlight: 'Ilahi Retail',
  heroSubtitle: 'Discover our carefully curated collection for your family and home. Enjoy honest prices and safe Cash on Delivery.',
  heroBgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200',
  promoBannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200',

  // Top Announcement Bar
  announcementActive: 'true',
  announcementText: '⚡ Festive Offer: Free Delivery on orders over ₹499! Use code ILAHI10 for 10% OFF',
  announcementLink: '/products',

  // Delivery & Business Rules
  freeShippingThreshold: '499',
  estimatedDeliveryDays: '2 - 4 Business Days',
  codEnabled: 'true',
  
  // Contact & Physical Location
  supportPhone: '+91 98765 43210',
  supportEmail: 'support@ilahiretail.com',
  whatsappNumber: '919876543210',
  storeAddress: 'Shop No. 14, Main Market, Ilahi Retail Center, India',
  businessHours: 'Mon - Sun: 9:00 AM - 10:00 PM',

  // Social Links
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  twitterUrl: 'https://twitter.com',
};

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      loading: false,

      fetchSettings: async () => {
        try {
          const res = await api.get('/settings');
          if (res.data?.success && res.data?.data) {
            set((state) => ({
              settings: { ...state.settings, ...res.data.data },
            }));
          }
        } catch (err) {
          console.error('Failed to fetch store settings from server', err);
        }
      },

      updateSettings: async (newSettings) => {
        // Optimistically update local store
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));

        // Persist to backend database
        try {
          // Convert all values to string for the key-value settings map
          const payload = {};
          Object.keys(newSettings).forEach((key) => {
            payload[key] = String(newSettings[key]);
          });
          const res = await api.put('/admin/settings', payload);
          if (res.data?.success && res.data?.data) {
            set((state) => ({
              settings: { ...state.settings, ...res.data.data },
            }));
          }
        } catch (err) {
          console.error('Failed to persist settings to server', err);
        }
      },

      resetSettings: async () => {
        set({ settings: DEFAULT_SETTINGS });
        try {
          const payload = {};
          Object.keys(DEFAULT_SETTINGS).forEach((key) => {
            payload[key] = String(DEFAULT_SETTINGS[key]);
          });
          await api.put('/admin/settings', payload);
        } catch (err) {
          console.error('Failed to reset settings on server', err);
        }
      },
    }),
    {
      name: 'ilahi-retail-settings',
    }
  )
);
