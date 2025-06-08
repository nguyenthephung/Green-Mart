import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
  };
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const handleDecrease = () => {
    if (item.quantity === 1) {
      onRemove(item.id);
    } else {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center gap-4">
        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <div className="text-sm text-gray-500 line-through">{item.originalPrice.toLocaleString()} ₫</div>
          <div className="text-green-700 font-bold">{item.price.toLocaleString()} ₫</div>
        </div>
      </div>

      <div className="flex items-center gap-8">
      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
        {item.quantity === 1 ? (
          <button
            onClick={() => onRemove(item.id)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleDecrease}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200"
          >
            <Minus className="w-5 h-5" />
          </button>
        )}

        <span className="w-12 text-center font-medium">{item.quantity}</span>

        <button
          onClick={handleIncrease}
          className="w-8 h-8 flex items-center justify-center rounded-full text-white"
          style={{ backgroundColor: '#16a34a' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
        {/* Remove text button (always visible) */}
        <button onClick={() => onRemove(item.id)} className="text-green-700 font-bold hover:underline text-sm">
          Xoá
        </button>

        {/* Total price */}
        <div className="w-25 text-right font-medium">{(item.price * item.quantity).toLocaleString()} ₫</div>
      </div>
    </div>
  );
}
