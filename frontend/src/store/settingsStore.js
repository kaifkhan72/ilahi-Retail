import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_SETTINGS = {
  // Store Identity & Branding
  storeName: 'Ilahi Retail',
  storeTagline: 'Toys, Kitchen & Clothes at Honest Prices',
  logoText: 'IR',
  logoImageUrl: '', // Optional custom image URL for logo

  // Hero Banner & Media Images
  heroBadge: 'Premium Everyday Essentials',
  heroTitle: 'Toys, Kitchen & Clothes at',
  heroTitleHighlight: 'Ilahi Retail',
  heroSubtitle: 'Discover our carefully curated collection for your family and home. Enjoy honest prices and safe Cash on Delivery.',
  heroBgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200', // Hero background image
  promoBannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200',

  // Top Announcement Bar
  announcementActive: true,
  announcementText: '⚡ Festive Offer: Free Delivery on orders over ₹499! Use code ILAHI10 for 10% OFF',
  announcementLink: '/products',

  // Delivery & Business Rules
  freeShippingThreshold: 499,
  estimatedDeliveryDays: '2 - 4 Business Days',
  codEnabled: true,
  
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

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'ilahi-retail-settings',
    }
  )
);
