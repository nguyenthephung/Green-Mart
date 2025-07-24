const OrderTabs = ({ activeTab, setActiveTab, counts = {}, tabs }: { activeTab: string; setActiveTab: (tab: string) => void; counts?: Record<string, number>; tabs?: string[] }) => {
  const defaultTabs = [
    { label: "Tất cả", key: "Tất cả" },
    { label: "Chờ xác nhận", key: "Chờ xác nhận" },
    { label: "Chờ giao hàng", key: "Chờ giao hàng" },
    { label: "Đã hủy", key: "Đã hủy" },
  ];
  const tabList = tabs ? tabs.map(t => ({ label: t, key: t })) : defaultTabs;

  return (
    <div className="flex gap-2 overflow-x-auto">
      {tabList.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm whitespace-nowrap ${
            activeTab === tab.key
              ? "btn-primary shadow-lg shadow-brand-green/20 transform scale-105" 
              : "bg-app-secondary text-app-primary hover:bg-app-secondary/80 hover:text-brand-green"
          }`}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-xs font-bold ${
                activeTab === tab.key 
                  ? "bg-white text-brand-green" 
                  : "bg-brand-green text-white"
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};

export default OrderTabs;
