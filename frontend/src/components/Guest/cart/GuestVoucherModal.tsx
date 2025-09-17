import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GuestVoucherModalProps {
  open: boolean;
  onClose: () => void;
}

const GuestVoucherModal: React.FC<GuestVoucherModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[120] animate-fadeIn backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[121] flex justify-center items-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl mx-auto relative flex flex-col animate-slideInFromBottom my-8" style={{ minWidth: '320px', maxWidth: '440px', width: '100%' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Mã giảm giá</h2>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              onClick={onClose}
              aria-label="Đóng"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="text-center py-8">
              {/* Lock Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">Bạn cần đăng nhập để sử dụng voucher</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Đăng nhập để xem và sử dụng các mã giảm giá độc quyền dành cho thành viên của GreenMart
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Đăng nhập ngay
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestVoucherModal;
