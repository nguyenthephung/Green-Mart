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
    <div className="bg-app-card p-6 rounded-2xl shadow-lg border-app-border">
      <h3 className="text-lg font-bold text-app-primary mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        Chi tiết sản phẩm
      </h3>
      
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-app-secondary rounded-xl border-app-border hover:bg-app-secondary/80 transition-colors">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover border-app-border shadow-md"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-app-primary mb-1">{item.name}</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-brand-green font-bold">
                    {item.price.toLocaleString()}₫
                  </span>
                  {item.oldPrice > item.price && (
                    <span className="text-app-muted line-through text-sm">
                      {item.oldPrice.toLocaleString()}₫
                    </span>
                  )}
                </div>
                <span className="text-app-secondary font-medium">x{item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
