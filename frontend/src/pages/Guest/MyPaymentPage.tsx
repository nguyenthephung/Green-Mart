import React, { useState } from 'react';
import { useUser } from '../../reduxSlice/UserContext';
import DashboardLayout from '../../layouts/DashboardLayout';

const MyPayments: React.FC = () => {
  const { payments, setPayments } = useUser();
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

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex justify-between items-center py-4 border-b">
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">{payment.method}</p>
                <p className="text-gray-500">{payment.expiry}</p>
              </div>
              <button onClick={() => handleDeletePayment(payment.id)} className="text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Xóa</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex justify-between items-center py-4">
            <button className="text-gray-800 font-semibold" onClick={() => setShowAddModal(true)}>
              + Thêm phương thức thanh toán
            </button>
          </div>
        </div>
        {showAddModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Thêm phương thức thanh toán mới</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="method" className="block font-semibold text-gray-600">
                    Phương thức thanh toán
                  </label>
                  <input
                    id="method"
                    type="text"
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    placeholder="Nhập phương thức (Ví dụ: Visa, Momo...)"
                  />
                </div>
                <div>
                  <label htmlFor="expiry" className="block font-semibold text-gray-600">
                    Ngày hết hạn
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    value={newPayment.expiry}
                    onChange={(e) => setNewPayment({ ...newPayment, expiry: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowAddModal(false)}>
                    Hủy
                  </button>
                  <button className="px-4 py-2 bg-gray-900 text-white rounded" onClick={handleAddPayment}>
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