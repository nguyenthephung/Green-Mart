import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNewToastStore } from '../stores/useNewToastStore';
import type { ToastData } from '../components/ui/Toast/NewToast';

interface ToastContextType {
  toasts: ToastData[];
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast, clearToasts } =
    useNewToastStore();

  const toastManager: ToastContextType = {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll: clearToasts,
  };

  return (
    <ToastContext.Provider value={toastManager}>
      {children}
      {/* ToastContainer được quản lý bởi App.tsx */}
    </ToastContext.Provider>
  );
};
