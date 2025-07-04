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
    <div className="bg-white p-6 rounded-2xl mt-6 shadow-[0_4px_24px_rgba(17,17,17,0.10),0_1.5px_8px_rgba(0,0,0,0.08)] border border-gray-100">
      <table className="w-full text-base table-fixed">
        <thead>
          <tr className="text-left text-gray-800 border-b pb-2 text-lg">
            <th className="w-1/2 pb-2 font-extrabold">Sản phẩm</th>
            <th className="w-1/4 pb-2 font-extrabold">Đơn giá</th>
            <th className="w-1/4 pb-2 font-extrabold">Số lượng</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-t last:border-b hover:bg-gray-100 transition">
              <td className="flex items-center gap-3 py-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 shadow-md"
                  style={{ boxShadow: '0 2px 8px 0 rgba(17,17,17,0.10)' }}
                />
                <span className="font-bold text-gray-900 text-base drop-shadow-[0_1px_1px_rgba(17,17,17,0.10)]">
                  {item.name}
                </span>
              </td>
              <td className="text-gray-800 font-bold text-base">
                {item.price.toLocaleString()}₫
                {item.oldPrice > item.price && (
                  <span className="text-gray-400 line-through ml-1 font-semibold">
                    {item.oldPrice.toLocaleString()}₫
                  </span>
                )}
              </td>
              <td className="text-gray-700 font-bold text-base">{item.quantity}x</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
