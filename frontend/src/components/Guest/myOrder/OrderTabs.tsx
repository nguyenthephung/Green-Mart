const OrderTabs = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const tabs = ["Tất cả", "Đang xử lý", "Hoàn thành", "Đã hủy"];

  return (
    <div className="flex gap-3 mb-6">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-5 py-2 rounded-full border font-bold shadow-md transition-all duration-200 text-base ${
            activeTab === tab ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white border-gray-700 scale-105 shadow-lg" : "text-gray-700 border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900"
          }`}
          style={activeTab === tab ? {textShadow:'0 2px 8px #fff, 0 1px 2px #111'} : {}}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default OrderTabs;
