import React, { memo, useMemo } from 'react';
import CartItem from "./CartItem";

interface CartItemType {
  id: string | number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  unit: string;
  type?: 'count' | 'weight';
  weight?: number;
  category?: string;
}

interface OptimizedCartListProps {
  items: CartItemType[];
  onQuantityChange: (id: string | number, value: number, unit?: string, type?: 'count' | 'weight') => void;
  onRemove: (id: string | number, unit?: string, type?: 'count' | 'weight') => void;
}

// Memoized CartItem component
const MemoizedCartItem = memo(CartItem);

// Memoized calculation for cart totals
const useCartTotals = (items: CartItemType[]) => {
  return useMemo(() => {
    const total = items.reduce((sum, item) => {
      if (item.type === 'weight') {
        return sum + (item.price * (item.weight || 0));
      } else {
        return sum + (item.price * item.quantity);
      }
    }, 0);
    return total;
  }, [items]);
};

const OptimizedCartList: React.FC<OptimizedCartListProps> = memo(({ 
  items, 
  onQuantityChange, 
  onRemove 
}) => {
  const total = useCartTotals(items);

  // Virtual scrolling for large lists
  const maxDisplayItems = 50; // Show max 50 items at once
  const displayItems = useMemo(() => {
    return items.slice(0, maxDisplayItems);
  }, [items, maxDisplayItems]);

  const remainingItems = items.length - maxDisplayItems;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          🛒 Giỏ hàng
          <span className="text-sm font-normal text-gray-500">({items.length} sản phẩm)</span>
        </h2>
        {items.length > 0 && (
          <div className="text-sm text-gray-500 break-all">
            Tổng: {total.toLocaleString()} ₫
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <>
          {/* Optimized scrollable container */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scroll-smooth">
            {displayItems.map((item) => (
              <MemoizedCartItem
                key={`${item.id}-${item.unit}-${item.type}`}
                item={{
                  ...item,
                  id: String(item.id) // Ensure id is string
                }}
                onQuantityChange={(id, value) => onQuantityChange(id, value, item.unit, item.type)}
                onRemove={(id) => {
                  console.log('[OptimizedCartList] onRemove called with:', { id, item, unit: item.unit, type: item.type });
                  onRemove(id, item.unit, item.type);
                }}
              />
            ))}
          </div>

          {/* Show remaining items indicator */}
          {remainingItems > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-700">
                Và {remainingItems} sản phẩm khác... 
                <button 
                  className="text-blue-600 hover:underline ml-1"
                  onClick={() => {
                    // Could implement pagination or load more functionality
                    console.log('Load more items');
                  }}
                >
                  Xem tất cả
                </button>
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-gray-500">Giỏ hàng trống.</p>
        </div>
      )}
    </div>
  );
});

OptimizedCartList.displayName = 'OptimizedCartList';

export default OptimizedCartList;
