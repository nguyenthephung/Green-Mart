const OrderTabs = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const tabs = ["All", "In Progress", "Completed", "Cancelled"];

  return (
    <div className="flex gap-3 mb-6">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-1 rounded-full border ${
            activeTab === tab ? "bg-purple-100 text-purple-600 border-purple-400" : "text-gray-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default OrderTabs;
