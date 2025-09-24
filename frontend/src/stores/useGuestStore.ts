import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GuestUser } from '../types/GuestOrder';

interface GuestStore {
  guestInfo: GuestUser | null;
  deliveryType: 'pickup' | 'delivery';
  setGuestInfo: (info: GuestUser) => void;
  setDeliveryType: (type: 'pickup' | 'delivery') => void;
  clearGuestInfo: () => void;
}

export const useGuestStore = create<GuestStore>()(
  persist(
    set => ({
      guestInfo: null,
      deliveryType: 'delivery',

      setGuestInfo: (info: GuestUser) => {
        set({ guestInfo: info });
      },

      setDeliveryType: (type: 'pickup' | 'delivery') => {
        set({ deliveryType: type });
      },

      clearGuestInfo: () => {
        set({ guestInfo: null });
      },
    }),
    {
      name: 'guest-store',
    }
  )
);
