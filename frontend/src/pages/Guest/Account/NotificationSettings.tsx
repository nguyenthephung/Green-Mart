import React, { useState, useEffect } from 'react';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { Bell, Settings, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const {
    settings,
    loadingSettings,
    error,
    fetchSettings,
    updateSettings,
    clearError
  } = useNotificationStore();

  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSettingChange = (
    category: 'order' | 'promotion' | 'system' | 'review' | 'shipping' | 'admin' | 'voucher' | 'payment' | 'account' | 'pushNotifications' | 'emailNotifications' | 'smsNotifications',
    value: boolean
  ) => {
    if (!localSettings) return;

    if (category === 'pushNotifications' || category === 'emailNotifications' || category === 'smsNotifications') {
      setLocalSettings({
        ...localSettings,
        [category]: value
      });
    } else {
      setLocalSettings({
        ...localSettings,
        settings: {
          ...localSettings.settings,
          [category]: value
        }
      });
    }
  };

  const handleSave = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateSettings(localSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
    }
  };

  const notificationTypes = [
    {
      key: 'order' as const,
      title: 'Đơn hàng',
      description: 'Thông báo về trạng thái đơn hàng, xác nhận thanh toán',
      icon: '🛍️',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      key: 'shipping' as const,
      title: 'Vận chuyển',
      description: 'Cập nhật về quá trình giao hàng, tracking',
      icon: '🚚',
      color: 'text-green-600 bg-green-50'
    },
    {
      key: 'payment' as const,
      title: 'Thanh toán',
      description: 'Thông báo thanh toán thành công, thất bại',
      icon: '💳',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      key: 'promotion' as const,
      title: 'Khuyến mãi',
      description: 'Ưu đãi đặc biệt, voucher mới, flash sale',
      icon: '🎉',
      color: 'text-pink-600 bg-pink-50'
    },
    {
      key: 'voucher' as const,
      title: 'Voucher',
      description: 'Voucher mới, voucher sắp hết hạn',
      icon: '🎫',
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      key: 'review' as const,
      title: 'Đánh giá',
      description: 'Nhắc nhở đánh giá sản phẩm, phản hồi đánh giá',
      icon: '⭐',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      key: 'account' as const,
      title: 'Tài khoản',
      description: 'Cập nhật bảo mật, thay đổi thông tin',
      icon: '👤',
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      key: 'system' as const,
      title: 'Hệ thống',
      description: 'Thông báo bảo trì, cập nhật hệ thống',
      icon: '⚙️',
      color: 'text-gray-600 bg-gray-50'
    }
  ];

  const deliveryMethods = [
    {
      key: 'pushNotifications' as const,
      title: 'Thông báo đẩy',
      description: 'Nhận thông báo trực tiếp trên trình duyệt',
      icon: '🔔',
      color: 'text-blue-600'
    },
    {
      key: 'emailNotifications' as const,
      title: 'Email',
      description: 'Gửi thông báo qua email',
      icon: '📧',
      color: 'text-green-600'
    },
    {
      key: 'smsNotifications' as const,
      title: 'SMS',
      description: 'Gửi thông báo qua tin nhắn (chỉ thông báo quan trọng)',
      icon: '📱',
      color: 'text-purple-600'
    }
  ];

  if (loadingSettings) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
            <span className="ml-3 text-gray-600">Đang tải cài đặt...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!localSettings) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải cài đặt</h3>
          <p className="text-gray-600 mb-4">Đã xảy ra lỗi khi tải cài đặt thông báo.</p>
          <button
            onClick={() => fetchSettings()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt thông báo</h1>
            <p className="text-gray-600 mt-1">
              Quản lý các loại thông báo bạn muốn nhận và cách thức nhận thông báo
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900">Có lỗi xảy ra</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Cài đặt đã được lưu thành công!</span>
          </div>
        </div>
      )}

      {/* Delivery Methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Phương thức nhận thông báo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deliveryMethods.map((method) => (
            <div
              key={method.key}
              className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className={`text-2xl ${method.color}`}>{method.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{method.title}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings[method.key]}
                        onChange={(e) => handleSettingChange(method.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{method.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Loại thông báo</h2>
        </div>

        <div className="space-y-4">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center`}>
                  <span className="text-xl">{type.icon}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.settings[type.key]}
                  onChange={(e) => handleSettingChange(type.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Lưu thay đổi</h3>
            <p className="text-sm text-gray-600 mt-1">
              Các thay đổi sẽ có hiệu lực ngay lập tức
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đặt lại
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu cài đặt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
