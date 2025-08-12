import { create } from 'zustand';
import type { Toast } from '../components/ui/Toast/Toast';

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  // Convenience methods
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const newToast: Toast = {
      ...toast,
      id: generateId(),
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
  
  // Convenience methods - All disabled
  showSuccess: () => {
    // get().addToast({
    //   type: 'success',
    //   title,
    //   message,
    //   duration,
    // });
  },
  
  showError: () => {
    // get().addToast({
    //   type: 'error',
    //   title,
    //   message,
    //   duration,
    // });
  },
  
  showWarning: () => {
    // get().addToast({
    //   type: 'warning',
    //   title,
    //   message,
    //   duration,
    // });
  },
  
  showInfo: () => {
    // get().addToast({
    //   type: 'info',
    //   title,
    //   message,
    //   duration,
    // });
  },
}));
