import { create } from 'zustand';
import api from '../services/api';

export const useCartStore = create((set, get) => ({
  items: [],
  totalPrice: 0,
  totalItems: 0,
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/cart');
      if (res.data?.success) {
        const cart = res.data.data;
        set({
          items: cart.items || [],
          totalPrice: cart.totalPrice || 0,
          totalItems: cart.totalItems || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    const res = await api.post('/cart/items', { productId, quantity });
    if (res.data?.success) {
      const cart = res.data.data;
      set({
        items: cart.items || [],
        totalPrice: cart.totalPrice || 0,
        totalItems: cart.totalItems || 0,
      });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    if (res.data?.success) {
      const cart = res.data.data;
      set({
        items: cart.items || [],
        totalPrice: cart.totalPrice || 0,
        totalItems: cart.totalItems || 0,
      });
    }
  },

  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    if (res.data?.success) {
      const cart = res.data.data;
      set({
        items: cart.items || [],
        totalPrice: cart.totalPrice || 0,
        totalItems: cart.totalItems || 0,
      });
    }
  },

  clearCart: async () => {
    await api.delete('/cart');
    set({ items: [], totalPrice: 0, totalItems: 0 });
  },

  reset: () => {
    set({ items: [], totalPrice: 0, totalItems: 0 });
  },
}));
