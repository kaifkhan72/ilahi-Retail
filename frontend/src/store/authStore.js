import { create } from 'zustand';
import api from '../services/api';
import axios from 'axios';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null, // In-memory JWT access token
  isAuthenticated: false,
  isLoading: true, // Used for initial session restoration check

  setAuth: (accessToken, user) => {
    set({
      accessToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateUser: (updatedUser) => {
    set({ user: updatedUser });
  },

  // Called on app mount to restore session via HttpOnly refresh cookie
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
      if (res.data?.success) {
        const { accessToken, user } = res.data.data;
        set({
          accessToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        get().clearAuth();
      }
    } catch (err) {
      get().clearAuth();
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user } = res.data.data;
    get().setAuth(accessToken, user);
    return user;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { accessToken, user } = res.data.data;
    get().setAuth(accessToken, user);
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      get().clearAuth();
    }
  },

  isAdmin: () => {
    const { user } = get();
    return user?.roles?.includes('ROLE_ADMIN') || false;
  },
}));
