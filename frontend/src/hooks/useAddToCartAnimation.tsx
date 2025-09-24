import { useCallback } from 'react';

interface AddToCartAnimationOptions {
  sourceElement: HTMLElement;
  targetElement?: HTMLElement;
  onComplete?: () => void;
}

export const useAddToCartAnimation = () => {
  const triggerAnimation = useCallback(
    ({ sourceElement, targetElement, onComplete }: AddToCartAnimationOptions) => {
      // Tìm target element (cart icon) nếu không được cung cấp
      const target = targetElement || (document.querySelector('[data-cart-icon]') as HTMLElement);

      if (!target) {
        onComplete?.();
        return;
      }

      // Lấy vị trí của source và target
      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      // Tạo element animation
      const flyingElement = document.createElement('div');
      flyingElement.className =
        'fixed pointer-events-none z-[9999] transition-all duration-700 ease-out';
      flyingElement.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
      flyingElement.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
      flyingElement.style.width = '40px';
      flyingElement.style.height = '40px';
      flyingElement.style.transform = 'translate(-50%, -50%) scale(1)';
      flyingElement.style.borderRadius = '50%';
      flyingElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      flyingElement.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.4)';
      flyingElement.innerHTML = `
      <div class="w-full h-full flex items-center justify-center text-white font-bold">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H4M7 13l-2.293 2.293c-.39.39-.39 1.02 0 1.41L6.4 18H20M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </div>
    `;

      document.body.appendChild(flyingElement);

      // Trigger animation sau một frame để đảm bảo element đã được render
      requestAnimationFrame(() => {
        flyingElement.style.left = `${targetRect.left + targetRect.width / 2}px`;
        flyingElement.style.top = `${targetRect.top + targetRect.height / 2}px`;
        flyingElement.style.transform = 'translate(-50%, -50%) scale(0.3)';
        flyingElement.style.opacity = '0';
      });

      // Cleanup và callback
      setTimeout(() => {
        if (flyingElement.parentNode) {
          flyingElement.parentNode.removeChild(flyingElement);
        }

        // Tạo hiệu ứng rung ở cart icon
        if (target) {
          target.classList.add('animate-bounce');
          setTimeout(() => {
            target.classList.remove('animate-bounce');
          }, 600);
        }

        onComplete?.();
      }, 700);
    },
    []
  );

  return { triggerAnimation };
};

// Component wrapper cho cart icon để dễ target
export const CartIconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div data-cart-icon className={className}>
      {children}
    </div>
  );
};
