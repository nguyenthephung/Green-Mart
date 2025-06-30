import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

interface Payment {
  id: number;
  method: string;
  expiry: string;
}

const MyPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([
    { id: 1, method: 'MasterCard 6588', expiry: 'Exp 12/2024' },
    { id: 2, method: 'MasterCard 6588', expiry: 'Exp 12/2024' },
    { id: 3, method: 'Paypal', expiry: 'Exp 12/2024' },
  ]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newPayment, setNewPayment] = useState<{ method: string; expiry: string }>({ method: '', expiry: '' });

  const handleAddPayment = () => {
    setPayments([...payments, { ...newPayment, id: payments.length + 1 }]);
    setNewPayment({ method: '', expiry: '' });
    setShowAddModal(false);
  };

  const handleDeletePayment = (id: number) => {
    setPayments(payments.filter((payment) => payment.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        
        <h2 className="text-xl font-semibold text-pink-500 mb-4">My Payments</h2>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex justify-between items-center py-4">
            <button className="text-pink-500 font-semibold" onClick={() => setShowAddModal(true)}>
              + Add Payment Method
            </button>
          </div>
        </div>
        {showAddModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Payment Method</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="method" className="block font-semibold text-gray-600">
                    Payment Method
                  </label>
                  <input
                    id="method"
                    type="text"
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label htmlFor="expiry" className="block font-semibold text-gray-600">
                    Expiry Date
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    value={newPayment.expiry}
                    onChange={(e) => setNewPayment({ ...newPayment, expiry: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-500 border border-gray-300 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPayment}
                    className="text-white bg-pink-500 px-4 py-2 rounded-md"
                  >
                    Add Payment
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