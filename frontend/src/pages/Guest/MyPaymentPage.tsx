import React, { useState } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import DashboardLayout from '../../layouts/DashboardLayout';

const MyPayments: React.FC = () => {
  const payments = useUserStore(state => state.payments);
  const setPayments = useUserStore(state => state.setPayments);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newPayment, setNewPayment] = useState<{ method: string; expiry: string }>({ method: '', expiry: '' });

  const handleAddPayment = () => {
    setPayments([...payments, { ...newPayment, id: payments.length + 1, isSelected: false }]);
    setNewPayment({ method: '', expiry: '' });
    setShowAddModal(false);
  };

  const handleDeletePayment = (id: number) => {
    setPayments(payments.filter((payment) => payment.id !== id));
  };

  const getPaymentIcon = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower.includes('visa')) {
      return (
        <div className="w-12 h-8 bg-blue-600 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-xs">VISA</span>
        </div>
      );
    } else if (methodLower.includes('mastercard')) {
      return (
        <div className="w-12 h-8 bg-red-600 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-xs">MC</span>
        </div>
      );
    } else if (methodLower.includes('momo')) {
      return (
        <div className="w-12 h-8 bg-pink-600 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-xs">MOMO</span>
        </div>
      );
    }
    return (
      <div className="w-12 h-8 bg-gray-600 rounded-md flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl shadow-xl border border-green-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            Phương thức thanh toán
          </h1>
          <p className="text-gray-600">Quản lý các phương thức thanh toán của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có phương thức thanh toán</h3>
              <p className="text-gray-600 mb-6">Thêm phương thức thanh toán để thanh toán dễ dàng hơn</p>
              <button 
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => setShowAddModal(true)}
              >
                Thêm phương thức đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getPaymentIcon(payment.method)}
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{payment.method}</p>
                        <p className="text-gray-600">Hết hạn: {payment.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {payment.isSelected && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Mặc định
                        </span>
                      )}
                      <button 
                        onClick={() => handleDeletePayment(payment.id)} 
                        className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition-colors duration-200 group-hover:scale-110"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="w-full py-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 font-semibold hover:border-green-400 hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Thêm phương thức thanh toán mới
              </button>
            </div>
          )}
        </div>

        {/* Add Payment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thêm phương thức thanh toán</h3>
                <p className="text-gray-600">Nhập thông tin phương thức thanh toán mới</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="method" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <input
                    id="method"
                    type="text"
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                    placeholder="Ví dụ: Visa, Mastercard, Momo..."
                  />
                </div>
                <div>
                  <label htmlFor="expiry" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày hết hạn
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    value={newPayment.expiry}
                    onChange={(e) => setNewPayment({ ...newPayment, expiry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200" 
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl" 
                    onClick={handleAddPayment}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyPayments;