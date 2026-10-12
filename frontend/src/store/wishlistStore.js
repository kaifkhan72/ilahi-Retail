import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchWishlist: async () => {
        try {
          const res = await api.get('/wishlist');
          if (res.data?.success && Array.isArray(res.data.data)) {
            set({ items: res.data.data });
          }
        } catch (err) {
          // Silent fallback to local persisted items if unauthenticated
        }
      },

      toggleWishlist: async (product) => {
        const { items } = get();
        const exists = items.some((item) => item.id === product.id);

        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
          try {
            await api.delete(`/wishlist/${product.id}`);
          } catch (e) {
            // Ignore unauthenticated local error
          }
          return false; // removed
        } else {
          set({ items: [...items, product] });
          try {
            await api.post(`/wishlist/${product.id}`);
          } catch (e) {
            // Ignore unauthenticated local error
          }
          return true; // added
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      removeFromWishlist: async (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
        try {
          await api.delete(`/wishlist/${productId}`);
        } catch (e) {
          // ignore
        }
      },

      clearWishlist: async () => {
        set({ items: [] });
        try {
          await api.delete('/wishlist');
        } catch (e) {
          // ignore
        }
      },
    }),
    {
      name: 'ilahi-retail-wishlist',
    }
  )
);
