import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useUser } from '../../reduxSlice/UserContext';
import { vouchers } from '../../data/Guest/vouchers';
import ShopeeVoucherModal from '../../components/Guest/cart/ShopeeVoucherModal';
import type { Voucher } from '../../types/Voucher';

const MyVoucherPage: React.FC = () => {
  const { voucher, setVoucher } = useUser();
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quản lý Voucher</h2>
        <div className="space-y-4 mb-6">
          {vouchers.map(v => (
            <div key={v.id} className={`flex justify-between items-center p-4 border rounded-lg ${voucher && voucher.id === v.id ? 'bg-green-100 border-green-600' : 'bg-green-50'}`}>
              <div>
                <div className="font-bold text-green-700 text-lg">{v.code}</div>
                <div className="text-gray-700">{v.label} - {v.description}</div>
                <div className="text-sm text-gray-500">{v.discountType === 'percent' ? `Giảm ${v.discountValue}%` : `Giảm ${v.discountValue.toLocaleString()}đ`} | Đơn tối thiểu: {v.minOrder.toLocaleString()}đ</div>
                <div className="text-xs text-gray-400 mt-1">HSD: {v.expired}</div>
                <div className="text-xs text-gray-400 mt-1">Đã dùng {v.usedPercent}%</div>
                {v.note && <div className="text-xs text-red-500 mt-1">{v.note}</div>}
              </div>
              <button
                className={`px-4 py-2 rounded ${voucher && voucher.id === v.id ? 'bg-gray-400 text-white' : 'bg-green-600 text-white'}`}
                onClick={() => setVoucher(voucher && voucher.id === v.id ? null : v)}
              >
                {voucher && voucher.id === v.id ? 'Đang áp dụng' : 'Áp dụng'}
              </button>
            </div>
          ))}
        </div>
        {/* Modal chọn nhanh (nếu muốn giữ) */}
        {/* <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
          onClick={() => setShowVoucherModal(true)}
        >
          Chọn voucher
        </button>
        <ShopeeVoucherModal
          open={showVoucherModal}
          vouchers={vouchers}
          selectedVoucher={voucher}
          onSelect={(v) => { setVoucher(v); setShowVoucherModal(false); }}
          onClose={() => setShowVoucherModal(false)}
        /> */}
        {voucher && (
          <div className="mt-6 p-4 bg-green-100 rounded text-green-800">
            Voucher đang áp dụng: <b>{voucher.code}</b> - {voucher.description}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyVoucherPage;
