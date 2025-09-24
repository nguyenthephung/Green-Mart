import React, { useState } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import DashboardLayout from '../../layouts/DashboardLayout';

const MyPayments: React.FC = () => {
  const payments = useUserStore(state => state.payments);
  const setPayments = useUserStore(state => state.setPayments);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newPayment, setNewPayment] = useState<{ method: string; expiry: string }>({
    method: '',
    expiry: '',
  });

  const handleAddPayment = () => {
    setPayments([...payments, { ...newPayment, id: payments.length + 1, isSelected: false }]);
    setNewPayment({ method: '', expiry: '' });
    setShowAddModal(false);
  };

  const handleDeletePayment = (id: number) => {
    setPayments(payments.filter(payment => payment.id !== id));
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
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="bg-app-secondary p-8 rounded-3xl shadow-xl border-app-default">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-app-primary mb-2 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            Phương thức thanh toán
          </h1>
          <p className="text-app-secondary">Quản lý các phương thức thanh toán của bạn</p>
        </div>

        <div className="bg-app-card rounded-2xl shadow-lg border-app-default p-6">
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-app-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-app-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-app-primary mb-2">
                Chưa có phương thức thanh toán
              </h3>
              <p className="text-app-secondary mb-6">
                Thêm phương thức thanh toán để thanh toán dễ dàng hơn
              </p>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                Thêm phương thức đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map(payment => (
                <div
                  key={payment.id}
                  className="bg-app-secondary rounded-xl p-6 border-app-border hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getPaymentIcon(payment.method)}
                      <div>
                        <p className="text-lg font-semibold text-app-primary">{payment.method}</p>
                        <p className="text-app-secondary">Hết hạn: {payment.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {payment.isSelected && (
                        <span className="px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-sm font-medium">
                          Mặc định
                        </span>
                      )}
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="w-10 h-10 bg-red-100/50 hover:bg-red-200/50 rounded-full flex items-center justify-center text-red-600 transition-colors duration-200 group-hover:scale-110"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                className="btn-secondary w-full py-4 border-2 border-dashed hover:border-brand-green flex items-center justify-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
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
            <div className="bg-app-card rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-app-primary mb-2">
                  Thêm phương thức thanh toán
                </h3>
                <p className="text-app-secondary">Nhập thông tin phương thức thanh toán mới</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="method"
                    className="block text-sm font-semibold text-app-secondary mb-2"
                  >
                    Phương thức thanh toán
                  </label>
                  <input
                    id="method"
                    type="text"
                    value={newPayment.method}
                    onChange={e => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="form-control"
                    placeholder="Ví dụ: Visa, Mastercard, Momo..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="expiry"
                    className="block text-sm font-semibold text-app-secondary mb-2"
                  >
                    Ngày hết hạn
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    value={newPayment.expiry}
                    onChange={e => setNewPayment({ ...newPayment, expiry: e.target.value })}
                    className="form-control"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button className="btn-secondary flex-1" onClick={() => setShowAddModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-primary flex-1" onClick={handleAddPayment}>
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
