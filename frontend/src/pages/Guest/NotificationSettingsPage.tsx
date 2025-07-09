import React, { useState } from 'react';

const defaultSettings = {
  orderUpdates: true,
  promotions: true,
  system: false,
};

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState(defaultSettings);

  const handleChange = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Cài đặt thông báo</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-lg">Thông báo đơn hàng</span>
          <input type="checkbox" checked={settings.orderUpdates} onChange={() => handleChange('orderUpdates')} className="w-5 h-5 accent-green-600" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg">Khuyến mãi & Ưu đãi</span>
          <input type="checkbox" checked={settings.promotions} onChange={() => handleChange('promotions')} className="w-5 h-5 accent-green-600" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg">Thông báo hệ thống</span>
          <input type="checkbox" checked={settings.system} onChange={() => handleChange('system')} className="w-5 h-5 accent-green-600" />
        </div>
      </div>
      <div className="mt-8 text-right">
        <button className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 font-semibold">Lưu thay đổi</button>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
