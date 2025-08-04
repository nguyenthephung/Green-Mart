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

export const useToastStore = create<ToastState>((set, get) => ({
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
  
  // Convenience methods
  showSuccess: (title, message, duration = 4000) => {
    get().addToast({
      type: 'success',
      title,
      message,
      duration,
    });
  },
  
  showError: (title, message, duration = 6000) => {
    get().addToast({
      type: 'error',
      title,
      message,
      duration,
    });
  },
  
  showWarning: (title, message, duration = 5000) => {
    get().addToast({
      type: 'warning',
      title,
      message,
      duration,
    });
  },
  
  showInfo: (title, message, duration = 4000) => {
    get().addToast({
      type: 'info',
      title,
      message,
      duration,
    });
  },
}));
