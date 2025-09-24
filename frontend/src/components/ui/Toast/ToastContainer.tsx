import React from 'react';
import ToastComponent from './Toast';
import type { Toast } from './Toast';

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed z-[9999] pointer-events-none ${getPositionClasses()}`}>
      <div className="flex flex-col-reverse gap-2">
        {toasts.map(toast => (
          <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
