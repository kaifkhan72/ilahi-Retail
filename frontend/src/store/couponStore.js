import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_COUPONS = [
  {
    id: '1',
    code: 'ILAHI10',
    type: 'PERCENTAGE', // 'PERCENTAGE' or 'FLAT'
    value: 10,
    minOrder: 0,
    active: true,
    description: '10% Storewide Discount on all items',
  },
  {
    id: '2',
    code: 'FLAT100',
    type: 'FLAT',
    value: 100,
    minOrder: 500,
    active: true,
    description: '₹100 Flat Savings on orders over ₹500',
  },
  {
    id: '3',
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

      addCoupon: (newCoupon) => {
        const id = Date.now().toString();
        const formatted = {
          ...newCoupon,
          id,
          code: newCoupon.code.trim().toUpperCase(),
          value: Number(newCoupon.value),
          minOrder: Number(newCoupon.minOrder || 0),
          active: true,
        };
        set((state) => ({
          coupons: [formatted, ...state.coupons],
        }));
      },

      toggleCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c
          ),
        }));
      },

      deleteCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }));
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
