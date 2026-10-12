import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const INITIAL_COUPONS = [
  {
    id: 1,
    code: 'ILAHI10',
    type: 'PERCENTAGE',
    value: 10,
    minOrder: 0,
    active: true,
    description: '10% Storewide Discount on all items',
  },
  {
    id: 2,
    code: 'FLAT100',
    type: 'FLAT',
    value: 100,
    minOrder: 500,
    active: true,
    description: '₹100 Flat Savings on orders over ₹500',
  },
  {
    id: 3,
    code: 'FIRSTORDER',
    type: 'PERCENTAGE',
    value: 15,
    minOrder: 0,
    active: true,
    description: '15% First Order Special Discount',
  },
];

export const useCouponStore = create(
  persist(
    (set, get) => ({
      coupons: INITIAL_COUPONS,
      loading: false,

      fetchCoupons: async () => {
        try {
          const res = await api.get('/coupons');
          if (res.data?.success && Array.isArray(res.data.data)) {
            const mapped = res.data.data.map((c) => ({
              id: c.id,
              code: c.code,
              type: c.discountType,
              value: Number(c.discountValue),
              minOrder: Number(c.minOrderAmount || 0),
              active: c.active,
              description: c.description,
            }));
            set({ coupons: mapped });
          }
        } catch (e) {
          console.error('Failed to load coupons from API', e);
        }
      },

      fetchAdminCoupons: async () => {
        try {
          const res = await api.get('/admin/coupons');
          if (res.data?.success && Array.isArray(res.data.data)) {
            const mapped = res.data.data.map((c) => ({
              id: c.id,
              code: c.code,
              type: c.discountType,
              value: Number(c.discountValue),
              minOrder: Number(c.minOrderAmount || 0),
              active: c.active,
              description: c.description,
            }));
            set({ coupons: mapped });
          }
        } catch (e) {
          console.error('Failed to load admin coupons from API', e);
        }
      },

      addCoupon: async (newCoupon) => {
        const payload = {
          code: newCoupon.code.trim().toUpperCase(),
          discountType: newCoupon.type || 'PERCENTAGE',
          discountValue: Number(newCoupon.value),
          minOrderAmount: Number(newCoupon.minOrder || 0),
          active: true,
          description: newCoupon.description || '',
        };

        try {
          const res = await api.post('/admin/coupons', payload);
          if (res.data?.success && res.data.data) {
            const c = res.data.data;
            const formatted = {
              id: c.id,
              code: c.code,
              type: c.discountType,
              value: Number(c.discountValue),
              minOrder: Number(c.minOrderAmount || 0),
              active: c.active,
              description: c.description,
            };
            set((state) => ({ coupons: [formatted, ...state.coupons] }));
            return formatted;
          }
        } catch (err) {
          console.error('Failed to save coupon to server', err);
          // Fallback optimistic
          const fallback = {
            ...newCoupon,
            id: Date.now(),
            code: payload.code,
            type: payload.discountType,
            value: payload.discountValue,
            minOrder: payload.minOrderAmount,
            active: true,
          };
          set((state) => ({ coupons: [fallback, ...state.coupons] }));
        }
      },

      toggleCoupon: async (id) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c
          ),
        }));

        try {
          await api.patch(`/admin/coupons/${id}/toggle`);
        } catch (err) {
          console.error('Failed to toggle coupon on server', err);
        }
      },

      deleteCoupon: async (id) => {
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }));

        try {
          await api.delete(`/admin/coupons/${id}`);
        } catch (err) {
          console.error('Failed to delete coupon on server', err);
        }
      },

      validateCoupon: (code, orderAmount) => {
        const normalized = (code || '').trim().toUpperCase();
        const found = get().coupons.find((c) => c.code === normalized);
        
        if (!found) {
          return { valid: false, error: 'Invalid coupon code' };
        }
        if (!found.active) {
          return { valid: false, error: 'This coupon is no longer active' };
        }
        if (found.minOrder > 0 && orderAmount < found.minOrder) {
          return { 
            valid: false, 
            error: `${found.code} requires a minimum order of ₹${found.minOrder}` 
          };
        }

        let discount = 0;
        if (found.type === 'PERCENTAGE') {
          discount = Math.round((orderAmount * found.value) / 100);
        } else {
          discount = Math.min(orderAmount, found.value);
        }

        return {
          valid: true,
          coupon: found,
          discount,
          label: found.description || `${found.code} Discount`,
        };
      },
    }),
    {
      name: 'ilahi-coupon-store',
    }
  )
);
