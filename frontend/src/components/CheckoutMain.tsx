import type { FC } from 'react';
import { MapPin, CreditCard, ChevronRight, CalendarDays } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  image: string;
}

interface CheckoutMainProps {
  items: Item[];
}

const CheckoutMain: FC<CheckoutMainProps> = ({ items }) => {
  const visibleItems = items.slice(0, 10);
  const remainingCount = items.length - visibleItems.length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6 w-full">
      {/* Checkout Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-full border border-green-700">
            <CalendarDays className="h-5 w-5 text-green-700" />
          </div>
          <h2 className="text-xl font-semibold">Checkout</h2>
        </div>
        <div className="text-sm text-gray-700 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-green-700" />
          <span>Deliver Tomorrow, Sep 17, 8am–10am</span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-xl p-4 border hover:border-green-700 transition cursor-pointer">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-gray-700">Delivery info</p>
            <div className="mt-1 text-sm text-green-700 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>2118 Thornridge Cir, Syracuse, Connecticut 35624</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 hover:text-green-700" />
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl p-4 border hover:border-green-700 transition cursor-pointer">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-gray-700">Payment Method</p>
            <div className="mt-1 text-sm text-green-700 flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span>Mastercard **** 3434</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 hover:text-green-700" />
        </div>
      </div>

      {/* Review Order */}
      <div className="bg-white rounded-xl p-4 border hover:border-green-700 transition cursor-pointer">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-gray-700">Review Order</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 justify-between flex items-center space-x-2">
          <div className="flex items-center space-x-2">
          {visibleItems.map((item, index) => (
            <img
              key={index}
              src={item.image}
              alt={item.name}
              className="w-15 h-15 rounded object-cover"
            />
          ))}
          {remainingCount > 0 && (
            <div className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-700 rounded text-sm font-medium">
              +{remainingCount}
            </div>
          )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 hover:text-green-700" />
        </div>
      </div>
    </div>
  );
};

export default CheckoutMain;
