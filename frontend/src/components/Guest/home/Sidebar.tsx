import React, { useState } from 'react';
import LuckyWheel from './LuckyWheel';

interface SidebarProps {
  isVisible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible = true }) => {
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) return null;

  const sidebarActions = [
    {
      id: 'lucky-wheel',
      title: 'Vòng quay may mắn',
      icon: '🎰',
      description: 'Quay để nhận ưu đãi',
      color: 'from-orange-500 to-red-500',
      hoverColor: 'from-orange-600 to-red-600',
      action: () => setShowLuckyWheel(true),
    },
    {
      id: 'support',
      title: 'Hỗ trợ khách hàng',
      icon: '💬',
      description: 'Chat với chúng tôi',
      color: 'from-blue-500 to-indigo-500',
      hoverColor: 'from-blue-600 to-indigo-600',
      action: () => console.log('Open support chat'),
    },
    {
      id: 'feedback',
      title: 'Góp ý',
      icon: '📝',
      description: 'Chia sẻ ý kiến',
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'from-green-600 to-emerald-600',
      action: () => console.log('Open feedback form'),
    },
    {
      id: 'call',
      title: 'Hotline',
      icon: '📞',
      description: '1900 1234',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'from-purple-600 to-pink-600',
      action: () => window.open('tel:19001234'),
    },
  ];

  return (
    <>
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ${isMinimized ? 'translate-x-16' : 'translate-x-0'}`}>
        <div className="flex flex-col gap-3">
          {/* Minimize/Maximize Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group hover:scale-110"
            title={isMinimized ? 'Mở rộng' : 'Thu gọn'}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={isMinimized ? "M13 7l5 5m0 0l-5 5m5-5H6" : "M11 17l-5-5m0 0l5-5m-5 5h12"} />
            </svg>
          </button>

          {/* Action Buttons */}
          <div className={`flex flex-col gap-3 transition-all duration-500 ${isMinimized ? 'opacity-0 scale-75 translate-x-8 pointer-events-none' : 'opacity-100 scale-100 translate-x-0'}`}>
            {sidebarActions.map((action, index) => (
              <div key={action.id} className="group relative" style={{ animationDelay: `${index * 0.1}s` }}>
                <button
                  onClick={action.action}
                  className={`w-12 h-12 bg-gradient-to-r ${action.color} hover:${action.hoverColor} text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95`}
                  title={action.title}
                >
                  <span className="text-xl animate-pulse">{action.icon}</span>
                </button>
                
                {/* Tooltip */}
                <div className="absolute right-14 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover:scale-100">
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-sm">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs text-gray-300">{action.description}</div>
                    {/* Arrow */}
                    <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2">
                      <div className="w-0 h-0 border-l-4 border-l-gray-900 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll to top button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${isMinimized ? 'opacity-50' : 'opacity-100'}`}
            title="Lên đầu trang"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lucky Wheel Modal */}
      {showLuckyWheel && (
        <LuckyWheel onClose={() => setShowLuckyWheel(false)} />
      )}
    </>
  );
};

export default Sidebar;
