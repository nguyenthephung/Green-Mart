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
  return (
    <div className="bg-white p-4 rounded-xl mt-6 shadow-sm">
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="text-left text-gray-500 border-b pb-2">
            <th className="w-1/2 pb-2">Item</th>
            <th className="w-1/4 pb-2">Price</th>
            <th className="w-1/4 pb-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-t last:border-b">
              <td className="flex items-center gap-3 py-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
                <span className="font-medium">{item.name}</span>
              </td>
              <td className="text-gray-800">
                ${item.price.toFixed(2)}
                {item.oldPrice > item.price && (
                  <span className="text-gray-400 line-through ml-1">
                    ${item.oldPrice.toFixed(2)}
                  </span>
                )}
              </td>
              <td className="text-gray-700">{item.quantity}x</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
