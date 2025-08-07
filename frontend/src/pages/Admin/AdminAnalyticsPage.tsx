import React from 'react';
import AnalyticsDashboard from '../../components/Admin/Analytics/AnalyticsDashboard';

const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-3xl">📈</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Phân tích & Báo cáo</h1>
            <p className="text-cyan-100 text-lg">Thống kê chi tiết về hiệu suất kinh doanh</p>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard with Responsive Fixes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
