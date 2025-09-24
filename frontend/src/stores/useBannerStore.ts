import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bannerService from '../services/bannerService';
import type {
  Banner,
  CreateBannerData,
  UpdateBannerData,
  BannerStats,
} from '../services/bannerService';

interface BannerState {
  banners: Banner[];
  loading: boolean;
  error: string | null;
  stats: BannerStats | null;

  // Actions
  fetchBanners: (position?: string, isActive?: boolean) => Promise<void>;
  fetchBannerById: (id: string) => Promise<Banner | null>;
  createBanner: (bannerData: CreateBannerData) => Promise<void>;
  updateBanner: (id: string, updateData: UpdateBannerData) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleBannerStatus: (id: string) => Promise<void>;
  incrementClickCount: (id: string) => Promise<void>;
  fetchBannerStats: () => Promise<void>;
  clearError: () => void;
}

export const useBannerStore = create<BannerState>()(
  persist(
    (set, get) => ({
      banners: [],
      loading: false,
      error: null,
      stats: null,

      fetchBanners: async (position?: string, isActive?: boolean) => {
        set({ loading: true, error: null });
        try {
          const banners = await bannerService.getAllBanners(position, isActive);
          set({ banners, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch banners';
          set({ error: errorMessage, loading: false });
          console.error('Error fetching banners:', error);
        }
      },

      fetchBannerById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const banner = await bannerService.getBannerById(id);
          set({ loading: false });
          return banner;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch banner';
          set({ error: errorMessage, loading: false });
          console.error('Error fetching banner:', error);
          return null;
        }
      },

      createBanner: async (bannerData: CreateBannerData) => {
        set({ loading: true, error: null });
        try {
          const newBanner = await bannerService.createBanner(bannerData);
          const currentBanners = get().banners;
          set({
            banners: [newBanner, ...currentBanners],
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create banner';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateBanner: async (id: string, updateData: UpdateBannerData) => {
        set({ loading: true, error: null });
        try {
          const updatedBanner = await bannerService.updateBanner(id, updateData);
          const currentBanners = get().banners;
          const updatedBanners = currentBanners.map(banner =>
            banner._id === id ? updatedBanner : banner
          );
          set({
            banners: updatedBanners,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update banner';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      deleteBanner: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await bannerService.deleteBanner(id);
          const currentBanners = get().banners;
          const filteredBanners = currentBanners.filter(banner => banner._id !== id);
          set({
            banners: filteredBanners,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete banner';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      toggleBannerStatus: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const updatedBanner = await bannerService.toggleBannerStatus(id);
          const currentBanners = get().banners;
          const updatedBanners = currentBanners.map(banner =>
            banner._id === id ? updatedBanner : banner
          );
          set({
            banners: updatedBanners,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to toggle banner status';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      incrementClickCount: async (id: string) => {
        try {
          await bannerService.incrementClickCount(id);
          // Optionally update the click count in the local state
          const currentBanners = get().banners;
          const updatedBanners = currentBanners.map(banner =>
            banner._id === id ? { ...banner, clickCount: banner.clickCount + 1 } : banner
          );
          set({ banners: updatedBanners });
        } catch (error) {
          console.error('Error incrementing click count:', error);
          // Don't throw error for click tracking as it's not critical
        }
      },

      fetchBannerStats: async () => {
        set({ loading: true, error: null });
        try {
          const stats = await bannerService.getBannerStats();
          set({ stats, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch banner stats';
          set({ error: errorMessage, loading: false });
          console.error('Error fetching banner stats:', error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'banner-store',
      partialize: state => ({
        // Only persist banners, not loading states
        banners: state.banners,
      }),
    }
  )
);
