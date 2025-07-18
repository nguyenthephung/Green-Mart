import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultSettings, icons, descriptions } from '../../data/Guest/notifications';

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const handleChange = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };



  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 900);
  };


  // Define notification types for mapping
  const notificationTypes = [
    {
      key: 'order',
      label: 'Thông báo đơn hàng',
      color: 'green-600',
    },
    {
      key: 'promotion',
      label: 'Khuyến mãi & Ưu đãi',
      color: 'yellow-500',
    },
    {
      key: 'system',
      label: 'Thông báo hệ thống',
      color: 'blue-500',
    },
  ];

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10 relative">
      {/* Nút tắt góc phải trên cùng */}
      <button
        type="button"
        aria-label="Đóng cài đặt thông báo"
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition z-10"
        onClick={() => navigate(-1)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <h2 className="text-2xl font-bold mb-7 text-green-700 flex items-center gap-2">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        Cài đặt thông báo
      </h2>
      <div className="space-y-7">
        {notificationTypes.map(({ key, label, color }) => (
          <div key={key} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:shadow transition relative group">
            {icons[key as keyof typeof icons]}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">{label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Toggle ${key}`}
                    className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors focus:outline-none ${settings[key as keyof typeof settings] ? `bg-${color}` : 'bg-gray-300'}`}
                    onClick={() => handleChange(key as keyof typeof settings)}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform bg-white rounded-full shadow transition-transform ${settings[key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
              <div className="text-gray-500 text-sm mt-1">{descriptions[key as keyof typeof descriptions]}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-right">
        <button
          className={`px-7 py-2.5 rounded font-semibold text-white transition-colors focus:outline-none ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : saved ? 'Đã lưu' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
