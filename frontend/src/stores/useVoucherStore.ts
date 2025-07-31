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
  fetchAllVouchers: () => Promise<void>;
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
 fetchAllVouchers: async () => {
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
  addVoucher: (voucher) => set(state => ({ vouchers: [voucher, ...state.vouchers] })),
  setVouchers: (vouchers) => set({ vouchers }),
  getRandomVoucher: () => {
    const vs = get().vouchers.filter(v => v.isActive && v.usedPercent < 100);
    if (vs.length === 0) return null;
    return vs[Math.floor(Math.random() * vs.length)];
  },
}));
