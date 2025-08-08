import React from 'react';
import { useToastContext } from '../../contexts/ToastContext';
import ToastItem from './ToastItem';

const ToastContainer: React.FC = () => {
  const { toasts } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 w-auto max-w-sm sm:max-w-md lg:max-w-lg">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
