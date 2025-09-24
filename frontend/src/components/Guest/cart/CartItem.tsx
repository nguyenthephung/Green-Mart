import { Minus, Plus, Trash2 } from 'lucide-react';
import { useResponsive } from '../../../hooks/useResponsive';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
    unit?: string;
    type?: 'count' | 'weight';
    weight?: number;
    flashSale?: {
      flashSaleId: string;
      isFlashSale: boolean;
      originalPrice: number;
      discountPercentage: number;
      quantity?: number;
      sold?: number;
    };
  };
  onQuantityChange: (
    id: string,
    value: number,
    unit?: string,
    type?: 'count' | 'weight',
    flashSale?: any
  ) => void;
  onRemove: (id: string, unit?: string, type?: 'count' | 'weight', flashSale?: any) => void;
}

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const { isMobile } = useResponsive();

  // Handler cho sản phẩm đếm số lượng
  const handleDecrease = () => {
    if (item.type === 'weight') return;
    if (item.quantity === 1) {
      onRemove(item.id, item.unit, item.type, item.flashSale);
    } else {
      onQuantityChange(item.id, item.quantity - 1, item.unit, item.type, item.flashSale);
    }
  };
  const handleIncrease = () => {
    if (item.type === 'weight') return;
    // Nếu là flash sale, kiểm tra số lượng còn lại
    if (item.flashSale?.isFlashSale) {
      const maxQty = (item.flashSale.quantity || 0) - (item.flashSale.sold || 0);
      if (item.quantity >= maxQty) return; // Không cho tăng vượt quá số lượng còn lại
    }
    onQuantityChange(item.id, item.quantity + 1, item.unit, item.type, item.flashSale);
  };
  // Handler cho sản phẩm cân ký
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      onQuantityChange(item.id, value, item.unit, item.type, item.flashSale);
    }
  };
  return (
    <div
      className={`${isMobile ? 'flex flex-col gap-3 py-3' : 'flex items-center justify-between py-4'} border-b border-app-border`}
    >
      <div className="flex items-center gap-4">
        <img
          src={item.image}
          alt={item.name}
          className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} object-contain`}
        />
        <div className="min-w-0 flex-1">
          <h3 className={`font-medium text-app-primary break-words ${isMobile ? 'text-sm' : ''}`}>
            {item.name}
          </h3>

          {/* Flash Sale Badge */}
          {item.flashSale?.isFlashSale && (
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`bg-red-500 text-white px-2 py-1 rounded ${isMobile ? 'text-xs' : 'text-xs'} font-bold`}
              >
                FLASH SALE -{item.flashSale.discountPercentage}%
              </span>
            </div>
          )}

          {/* Price Display */}
          {item.flashSale?.isFlashSale ? (
            <div className="flex items-center gap-2">
              <div className={`text-red-600 font-bold ${isMobile ? 'text-sm' : ''}`}>
                {item.price.toLocaleString()} ₫
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-app-muted line-through`}>
                {item.flashSale.originalPrice.toLocaleString()} ₫
              </div>
            </div>
          ) : item.originalPrice && item.originalPrice > item.price ? (
            <div className="flex items-center gap-2">
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-app-muted line-through`}>
                {item.originalPrice.toLocaleString()} ₫
              </div>
              <div className={`text-green-700 font-bold ${isMobile ? 'text-sm' : ''}`}>
                {item.price.toLocaleString()} ₫
              </div>
            </div>
          ) : (
            <div className={`text-green-700 font-bold ${isMobile ? 'text-sm' : ''}`}>
              {item.price.toLocaleString()} ₫
            </div>
          )}

          {item.unit && (
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 break-words`}>
              Đơn vị: {item.unit}
            </div>
          )}
        </div>
      </div>
      <div className={`flex items-center ${isMobile ? 'gap-4 mt-2' : 'gap-8'}`}>
        {item.type === 'weight' ? (
          <div
            className={`flex items-center gap-2 bg-app-input rounded-full px-2 py-1 ${isMobile ? 'ml-auto' : ''}`}
          >
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={item.weight || 1}
              onChange={handleWeightChange}
              className={`${isMobile ? 'w-12' : 'w-16'} text-center font-medium text-app-primary border border-gray-300 rounded px-2 py-1`}
            />
            <span className="text-xs text-gray-500">{item.unit || 'kg'}</span>
            <button
              onClick={() => {
                onRemove(item.id, item.unit, item.type);
              }}
              className={`text-green-700 font-bold hover:underline ${isMobile ? 'text-xs' : 'text-sm'} ml-2`}
            >
              Xoá
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 bg-app-input rounded-full px-2 py-1 ${isMobile ? 'ml-auto' : ''}`}
          >
            {item.quantity === 1 ? (
              <button
                onClick={() => {
                  onRemove(item.id, item.unit, item.type);
                }}
                className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-app-card text-app-primary hover:bg-app-secondary`}
              >
                <Trash2 className={`${isMobile ? 'w-3 h-3' : 'w-5 h-5'}`} />
              </button>
            ) : (
              <button
                onClick={handleDecrease}
                className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-app-card text-app-primary hover:bg-app-secondary`}
              >
                <Minus className={`${isMobile ? 'w-3 h-3' : 'w-5 h-5'}`} />
              </button>
            )}
            <span
              className={`${isMobile ? 'w-8' : 'w-12'} text-center font-medium text-app-primary ${isMobile ? 'text-sm' : ''}`}
            >
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-app-card text-app-primary hover:bg-app-secondary`}
              aria-label="Tăng số lượng"
              disabled={
                item.flashSale?.isFlashSale &&
                item.quantity >= (item.flashSale.quantity || 0) - (item.flashSale.sold || 0)
              }
            >
              <Plus className={`${isMobile ? 'w-3 h-3' : 'w-5 h-5'}`} />
            </button>
            <button
              onClick={() => {
                onRemove(item.id, item.unit, item.type);
              }}
              className={`text-green-700 font-bold hover:underline ${isMobile ? 'text-xs' : 'text-sm'} ml-2`}
            >
              Xoá
            </button>
          </div>
        )}
        {/* Tổng giá */}
        <div className="w-25 text-right font-medium text-app-primary break-all">
          {item.type === 'weight'
            ? (item.price * (item.weight || 0)).toLocaleString()
            : (item.price * item.quantity).toLocaleString()}{' '}
          ₫
        </div>
      </div>
    </div>
  );
}
