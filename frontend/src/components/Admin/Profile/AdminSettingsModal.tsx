import React, { useState, useEffect } from 'react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    notifications: {
      newOrders: true,
      lowStock: true,
      newUsers: false,
      systemUpdates: true,
    },
    display: {
      itemsPerPage: 10,
      defaultView: 'table' as 'table' | 'grid',
      showPreview: true,
    },
    security: {
      sessionTimeout: 30, // minutes
      requirePasswordChange: false,
      twoFactorAuth: false,
    },
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Error loading admin settings:', e);
        }
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save settings to localStorage
      localStorage.setItem('adminSettings', JSON.stringify(settings));

      // Here you could also send to server
      // await saveAdminSettings(settings);

      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const handleDisplayChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value,
      },
    }));
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt hệ thống</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-8">
            {/* Notifications Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🔔 Thông báo
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Đơn hàng mới</label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.newOrders}
                    onChange={e => handleNotificationChange('newOrders', e.target.checked)}
                    className="rounded focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Sản phẩm sắp hết hàng
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.lowStock}
                    onChange={e => handleNotificationChange('lowStock', e.target.checked)}
                    className="rounded focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Người dùng mới</label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.newUsers}
                    onChange={e => handleNotificationChange('newUsers', e.target.checked)}
                    className="rounded focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Cập nhật hệ thống
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.systemUpdates}
                    onChange={e => handleNotificationChange('systemUpdates', e.target.checked)}
                    className="rounded focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🖥️ Hiển thị
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Số mục trên mỗi trang
                  </label>
                  <select
                    value={settings.display.itemsPerPage}
                    onChange={e => handleDisplayChange('itemsPerPage', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode ? '#374151' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Chế độ xem mặc định
                  </label>
                  <select
                    value={settings.display.defaultView}
                    onChange={e => handleDisplayChange('defaultView', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode ? '#374151' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                  >
                    <option value="table">Bảng</option>
                    <option value="grid">Lưới</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Hiển thị xem trước
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.display.showPreview}
                    onChange={e => handleDisplayChange('showPreview', e.target.checked)}
                    className="rounded focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🔒 Bảo mật
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Thời gian hết phiên (phút)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.security.sessionTimeout}
                    onChange={e => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode ? '#374151' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Yêu cầu đổi mật khẩu định kỳ
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.security.requirePasswordChange}
                    onChange={e => handleSecurityChange('requirePasswordChange', e.target.checked)}
                    className="rounded focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Xác thực 2 yếu tố
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={e => handleSecurityChange('twoFactorAuth', e.target.checked)}
                    className="rounded focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-8 border-t border-gray-200 dark:border-gray-600 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
