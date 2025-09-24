import React, { useEffect, useState } from 'react';
import type { ToastData } from './Toast/NewToast';
import { useToastContext } from '../../contexts/ToastContext';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ToastItemProps {
  toast: ToastData;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToastContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          titleColor: 'text-green-800 dark:text-green-300',
          messageColor: 'text-green-700 dark:text-green-400',
          icon: CheckCircleIcon,
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-800 dark:text-red-300',
          messageColor: 'text-red-700 dark:text-red-400',
          icon: XCircleIcon,
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          titleColor: 'text-yellow-800 dark:text-yellow-300',
          messageColor: 'text-yellow-700 dark:text-yellow-400',
          icon: ExclamationTriangleIcon,
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-800 dark:text-blue-300',
          messageColor: 'text-blue-700 dark:text-blue-400',
          icon: InformationCircleIcon,
        };
      default:
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          titleColor: 'text-gray-800 dark:text-gray-300',
          messageColor: 'text-gray-700 dark:text-gray-400',
          icon: InformationCircleIcon,
        };
    }
  };

  const styles = getToastStyles();
  const IconComponent = styles.icon;

  return (
    <div
      className={`
        ${styles.bgColor} ${styles.borderColor}
        border rounded-lg shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95' : 'scale-100'}
        p-4 min-w-[350px] max-w-[500px] w-auto
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
        </div>

        <div className="flex-1 pr-2">
          <h4 className={`text-sm font-semibold ${styles.titleColor} mb-1`}>{toast.title}</h4>
          <p className={`text-sm ${styles.messageColor} leading-relaxed`}>{toast.message}</p>
        </div>

        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Đóng thông báo"
        >
          <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </button>
      </div>

      {/* Progress bar */}
      <div className={`mt-3 h-1 ${styles.borderColor} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${styles.iconColor.replace('text-', 'bg-')} opacity-60 animate-toast-progress`}
          style={{
            animation: `toast-progress ${toast.duration || 5000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

export default ToastItem;
