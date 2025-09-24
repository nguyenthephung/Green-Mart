import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const NewToast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);

    // Auto close
    if (toast.duration && toast.duration > 0) {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoCloseTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div
      className={`
        max-w-md w-full pointer-events-auto
        ${getBackgroundColor()}
        border-l-4 ${getBorderColor()}
        rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
        transform transition-all duration-300 ease-in-out
        ${
          isVisible && !isLeaving
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>

          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {toast.title}
            </h3>

            {toast.message && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{toast.message}</p>
            )}

            {toast.actions && toast.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {toast.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.action();
                      handleClose();
                    }}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-md
                      transition-colors duration-200
                      ${
                        action.style === 'primary'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="
                inline-flex text-gray-400 hover:text-gray-600 
                dark:text-gray-500 dark:hover:text-gray-300
                transition-colors duration-200
                rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700
              "
            >
              <span className="sr-only">Đóng</span>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewToast;
