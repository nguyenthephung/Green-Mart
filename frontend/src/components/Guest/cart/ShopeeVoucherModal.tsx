import React from 'react';
import type { Voucher } from '../../../types/Voucher';

interface ShopeeVoucherModalProps {
  open: boolean;
  vouchers: Voucher[];
  selectedVoucher?: Voucher | null;
  onSelect: (voucher: Voucher | null) => void;
  onClose: () => void;
}

const ShopeeVoucherModal: React.FC<ShopeeVoucherModalProps> = ({ open, vouchers, selectedVoucher, onSelect, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex justify-center items-start pt-[120px]">
      <div className="bg-white rounded-2xl shadow-2xl mx-auto p-0 relative flex flex-col gap-0" style={{ minWidth: '320px', maxWidth: '95vw', width: 'fit-content' }}>
        <div className="p-0">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
            onClick={onClose}
            aria-label="Đóng"
          >
            &times;
          </button>
          <h2 className="text-lg font-bold text-green-700 mb-2 flex items-center gap-2 px-6 pt-6">
            🎫 Chọn mã giảm giá
          </h2>
          <div className="flex flex-col gap-2 px-6 pb-6">
            {vouchers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Không có mã giảm giá nào khả dụng</div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {vouchers.map((voucher) => (
                  <button
                    key={String(voucher._id)}
                    className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-150 w-full text-left ${selectedVoucher?._id === voucher._id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50'}`}
                    onClick={() => onSelect(voucher)}
                  >
                    <span className="font-semibold text-green-700 text-lg break-words">{voucher.code}</span>
                    <span className="text-sm text-gray-600 break-words">{voucher.description}</span>
                    <div className="flex items-center gap-3 mt-2 w-full">
                      <span className="text-sm font-bold text-red-600">
                        {voucher.discountType === 'percent' 
                          ? `Giảm ${voucher.discountValue}%` 
                          : `Giảm ${voucher.discountValue.toLocaleString()}₫`}
                      </span>
                      <span className="text-xs text-gray-400">• Đơn tối thiểu: {voucher.minOrder.toLocaleString()}₫</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
// ...existing code...
};

export default ShopeeVoucherModal;
