const OrderTabs = ({ activeTab, setActiveTab, counts = {}, tabs }: { activeTab: string; setActiveTab: (tab: string) => void; counts?: Record<string, number>; tabs?: string[] }) => {
  const defaultTabs = [
    { label: "Tất cả", key: "Tất cả" },
    { label: "Chờ xác nhận", key: "Chờ xác nhận" },
    { label: "Chờ giao hàng", key: "Chờ giao hàng" },
    { label: "Đã hủy", key: "Đã hủy" },
  ];
  const tabList = tabs ? tabs.map(t => ({ label: t, key: t })) : defaultTabs;

  return (
    <div className="flex gap-3 mb-6 border-b pb-2 overflow-x-auto">
      {tabList.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`relative px-5 py-2 rounded-t-lg font-bold transition-all duration-200 text-base border-b-4 ${
            activeTab === tab.key
              ? "border-orange-500 text-orange-600 bg-white" : "border-transparent text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-orange-600"
          }`}
          style={activeTab === tab.key ? { fontWeight: 900 } : {}}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span className="ml-2 inline-block min-w-[22px] px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold align-middle animate-pulse">
              {counts[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default OrderTabs;
