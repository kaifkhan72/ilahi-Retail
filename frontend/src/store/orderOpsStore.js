import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrderOpsStore = create(
  persist(
    (set, get) => ({
      // Map of orderId -> { courierName: 'Delhivery', trackingAwb: '12345678', notes: '...' }
      orderMetadata: {},

      setOrderTracking: (orderId, courierName, trackingAwb, notes = '') => {
        set((state) => ({
          orderMetadata: {
            ...state.orderMetadata,
            [orderId]: {
              courierName: courierName || 'Express Courier',
              trackingAwb: trackingAwb || '',
              notes,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      getOrderTracking: (orderId) => {
        return get().orderMetadata[orderId] || null;
      },
    }),
    {
      name: 'ilahi-order-operations',
    }
  )
);
