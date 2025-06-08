import CartItem from "./CartItem";

interface CartItemType {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
}

interface CartListProps {
  items: CartItemType[];
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export default function CartList({ items, onQuantityChange, onRemove }: CartListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-h-[500px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Giỏ hàng</h2>
      {items.length > 0 ? (
        items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))
      ) : (
        <p className="text-gray-500 text-center py-10">Giỏ hàng trống.</p>
      )}
    </div>
  );
}
