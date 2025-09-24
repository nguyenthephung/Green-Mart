import React from 'react';
import { createPortal } from 'react-dom';
import NewToast from './NewToast';
import type { ToastData } from './NewToast';

interface NewToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  maxToasts?: number;
}

const NewToastContainer: React.FC<NewToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
  maxToasts = 5,
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

  const getFlexDirection = () => {
    return position.includes('top') ? 'flex-col' : 'flex-col-reverse';
  };

  // Limit number of toasts
  const visibleToasts = toasts.slice(0, maxToasts);

  if (visibleToasts.length === 0) return null;

  const containerElement = (
    <div
      className={`
        fixed z-[9999] pointer-events-none
        ${getPositionClasses()}
      `}
      role="region"
      aria-label="Thông báo"
    >
      <div className={`flex ${getFlexDirection()} gap-3`}>
        {visibleToasts.map(toast => (
          <NewToast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );

  // Render to body using portal
  return createPortal(containerElement, document.body);
};

export default NewToastContainer;
