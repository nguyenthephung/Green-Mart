import { useResponsive } from '../../../hooks/useResponsive';

interface Item {
  name: string;
  price: number;
  oldPrice: number;
  quantity: number;
  image: string;
}

interface Props {
  items: Item[];
}

export default function OrderItems({ items }: Props) {
  const { isMobile } = useResponsive();

  return (
    <div
      className={`bg-app-card ${isMobile ? 'p-4' : 'p-6'} rounded-2xl shadow-lg border-app-border`}
    >
      <h3
        className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-app-primary mb-4 flex items-center gap-2`}
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        Chi tiết sản phẩm
      </h3>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 ${isMobile ? 'p-3' : 'p-4'} bg-app-secondary rounded-xl border-app-border hover:bg-app-secondary/80 transition-colors`}
          >
            <img
              src={item.image}
              alt={item.name}
              className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-lg object-cover border-app-border shadow-md`}
            />
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold text-app-primary mb-1 ${isMobile ? 'text-sm truncate' : ''}`}
              >
                {item.name}
              </h4>
              <div
                className={`flex items-center ${isMobile ? 'flex-col items-start gap-1' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-brand-green font-bold ${isMobile ? 'text-sm' : ''}`}>
                    {item.price.toLocaleString()}₫
                  </span>
                  {item.oldPrice > item.price && (
                    <span
                      className={`text-app-muted line-through ${isMobile ? 'text-xs' : 'text-sm'}`}
                    >
                      {item.oldPrice.toLocaleString()}₫
                    </span>
                  )}
                </div>
                <span className={`text-app-secondary font-medium ${isMobile ? 'text-sm' : ''}`}>
                  x{item.quantity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
