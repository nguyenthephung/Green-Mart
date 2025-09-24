import { useResponsive } from '../../../hooks/useResponsive';

interface Item {
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
  image: string;
}

interface OrderSummaryProps {
  id: string;
  items: Item[];
  deliveryFee: number;
  payWith: string;
  deliveryAddress: string;
}

export default function OrderSummary({
  id,
  items,
  deliveryFee,
  payWith,
  deliveryAddress,
}: OrderSummaryProps) {
  const { isMobile } = useResponsive();
  const subtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  const total = subtotal + deliveryFee;

  return (
    <div
      className={`bg-app-card rounded-2xl ${isMobile ? 'p-4' : 'p-6'} space-y-4 shadow-lg border-app-border`}
    >
      <div className="text-center pb-4 border-b border-app-border">
        <h3
          className={`font-bold text-app-primary ${isMobile ? 'text-base' : 'text-lg'} flex items-center justify-center gap-2`}
        >
          <svg
            className="w-5 h-5 text-brand-green"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Tóm tắt đơn hàng
        </h3>
        <div className={`text-app-secondary ${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
          Mã đơn: #{id}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className={`text-app-secondary ${isMobile ? 'text-sm' : ''}`}>Tạm tính</span>
          <span className={`font-semibold text-app-primary ${isMobile ? 'text-sm' : ''}`}>
            {subtotal.toLocaleString()}₫
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-app-secondary ${isMobile ? 'text-sm' : ''}`}>Phí giao hàng</span>
          <span className={`font-semibold text-app-primary ${isMobile ? 'text-sm' : ''}`}>
            {deliveryFee.toLocaleString()}₫
          </span>
        </div>

        <div className="border-t border-app-border pt-3">
          <div className="flex justify-between items-center">
            <span className={`font-bold text-app-primary ${isMobile ? 'text-sm' : ''}`}>
              Tổng cộng
            </span>
            <span className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} text-brand-green`}>
              {total.toLocaleString()}₫
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-app-border">
        <div className={`bg-app-secondary ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-brand-green"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className={`font-semibold text-app-primary ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Thanh toán
            </span>
          </div>
          <div className={`text-app-secondary ${isMobile ? 'text-xs' : 'text-sm'} break-words`}>
            {payWith}
          </div>
        </div>

        <div className={`bg-app-secondary ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-brand-green"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className={`font-semibold text-app-primary ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Địa chỉ giao hàng
            </span>
          </div>
          <div className={`text-app-secondary ${isMobile ? 'text-xs' : 'text-sm'} break-words`}>
            {deliveryAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
