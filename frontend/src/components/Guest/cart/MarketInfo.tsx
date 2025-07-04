import { Calendar, ChevronRight, ShoppingCart, MapPin } from "lucide-react";

export default function MarketInfo() {
  return (
    <div className="bg-white shadow-md p-4 rounded-xl mb-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-green-50 text-green-700 p-3 rounded-full">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Local Market</h2>
          <div className="flex items-center text-sm text-green-700 font-medium">
            <MapPin className="w-4 h-4 mr-1" />
            Shopping in 07114
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 border border-green-700 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-green-50">
        <Calendar className="w-4 h-4" />
        <span>Wed 123</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
