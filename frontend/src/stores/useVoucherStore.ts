import { create } from 'zustand';
import { voucherService } from '../services/voucherService';

export interface Voucher {
  _id: string;
  id: string;
  code: string;
  label: string;
  description: string;
  minOrder: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  expired: string;
  usedPercent: number;
  maxUsage?: number;
  currentUsage: number;
  onlyOn?: string;
  isActive: boolean;
  note?: string;
}

interface VoucherStoreState {
  vouchers: Voucher[];
  loading: boolean;
  error: string | null;
  fetchVouchers: () => Promise<void>;
  addVoucher: (voucher: Voucher) => void;
  setVouchers: (vouchers: Voucher[]) => void;
  getRandomVoucher: () => Voucher | null;
}

export const useVoucherStore = create<VoucherStoreState>((set, get) => ({
  vouchers: [],
  loading: false,
  error: null,
  fetchVouchers: async () => {
    set({ loading: true, error: null });
    try {
      const res: any = await voucherService.getAll();
      let vouchers: any[] = [];
      if (Array.isArray(res)) {
        vouchers = res.map((v: any) => ({ ...v, id: v.id || v._id }));
      } else if (Array.isArray(res?.data)) {
        vouchers = res.data.map((v: any) => ({ ...v, id: v.id || v._id }));
      }
      set({ vouchers, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Không thể tải voucher', loading: false });
    }
  },
  addVoucher: voucher => set(state => ({ vouchers: [voucher, ...state.vouchers] })),
  setVouchers: vouchers => set({ vouchers }),
  getRandomVoucher: () => {
    const vouchers = get().vouchers;
    console.log('getRandomVoucher: All vouchers:', vouchers);

    // Filter valid vouchers: active and not fully used
    const validVouchers = vouchers.filter(v => {
      const isActive = v.isActive === true;
      const notFullyUsed = !v.maxUsage || v.currentUsage < v.maxUsage;
      const notExpired = new Date(v.expired) >= new Date();

      console.log(`Voucher ${v.code}:`, {
        isActive,
        notFullyUsed,
        notExpired,
        currentUsage: v.currentUsage,
        maxUsage: v.maxUsage,
        expired: v.expired,
      });

      return isActive && notFullyUsed && notExpired;
    });

    console.log('getRandomVoucher: Valid vouchers:', validVouchers);

    if (validVouchers.length === 0) return null;
    return validVouchers[Math.floor(Math.random() * validVouchers.length)];
  },
}));
