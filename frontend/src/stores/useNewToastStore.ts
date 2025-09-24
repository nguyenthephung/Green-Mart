import { create } from 'zustand';
import type { ToastData } from '../components/ui/Toast/NewToast';

interface NewToastState {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  // Convenience methods
  showSuccess: (
    title: string,
    message?: string,
    duration?: number,
    actions?: ToastData['actions']
  ) => string;
  showError: (
    title: string,
    message?: string,
    duration?: number,
    actions?: ToastData['actions']
  ) => string;
  showWarning: (
    title: string,
    message?: string,
    duration?: number,
    actions?: ToastData['actions']
  ) => string;
  showInfo: (
    title: string,
    message?: string,
    duration?: number,
    actions?: ToastData['actions']
  ) => string;
}

const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useNewToastStore = create<NewToastState>((set, get) => ({
  toasts: [],

  addToast: toast => {
    const id = generateId();
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default 5 seconds
    };

    set(state => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  showSuccess: (title, message, duration = 5000, actions) => {
    return get().addToast({
      type: 'success',
      title,
      message,
      duration,
      actions,
    });
  },

  showError: (title, message, duration = 8000, actions) => {
    return get().addToast({
      type: 'error',
      title,
      message,
      duration,
      actions,
    });
  },

  showWarning: (title, message, duration = 6000, actions) => {
    return get().addToast({
      type: 'warning',
      title,
      message,
      duration,
      actions,
    });
  },

  showInfo: (title, message, duration = 5000, actions) => {
    return get().addToast({
      type: 'info',
      title,
      message,
      duration,
      actions,
    });
  },
}));
