import React from 'react';
import type { Voucher } from '../../../types/Voucher';

interface ShopeeVoucherModalProps {
  open: boolean;
  vouchers: Voucher[];
  selectedVoucher?: Voucher | null;
  onSelect: (voucher: Voucher | null) => void;
  onClose: () => void;
}

const ShopeeVoucherModal: React.FC<ShopeeVoucherModalProps> = ({
  open,
  vouchers,
  selectedVoucher,
  onSelect,
  onClose,
}) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[120] animate-fadeIn backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[121] flex justify-center items-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-3xl shadow-2xl mx-auto relative flex flex-col max-h-[80vh] animate-slideInFromBottom my-8"
          style={{ minWidth: '320px', maxWidth: '500px', width: '100%' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Chọn mã giảm giá</h2>
                <p className="text-sm text-gray-500">{vouchers.length} voucher khả dụng</p>
              </div>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              onClick={onClose}
              aria-label="Đóng"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {vouchers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có voucher</h3>
                <p className="text-gray-500">Hiện tại không có mã giảm giá nào khả dụng</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vouchers.map(voucher => (
                  <button
                    key={String(voucher._id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group ${
                      selectedVoucher?._id === voucher._id
                        ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50 hover:shadow-md'
                    }`}
                    onClick={() => onSelect(voucher)}
                  >
                    {/* Gradient background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    {/* Voucher pattern decoration */}
                    <div className="absolute top-2 left-2 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-400 rounded-full opacity-20"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20"></div>

                    {/* Selected indicator */}
                    {selectedVoucher?._id === voucher._id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    <div className="relative">
                      {/* Code */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          {voucher.code}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 font-medium mb-3 line-clamp-2">
                        {voucher.description}
                      </p>

                      {/* Details */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-red-600 bg-gradient-to-r from-red-50 to-pink-50 px-3 py-1 rounded-lg border border-red-100">
                            {voucher.discountType === 'percent'
                              ? `Giảm ${voucher.discountValue}%`
                              : `Giảm ${voucher.discountValue.toLocaleString()}₫`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded block">
                            Đơn tối thiểu
                          </span>
                          <span className="text-sm font-semibold text-gray-700 mt-1 block">
                            {voucher.minOrder.toLocaleString()}₫
                          </span>
                        </div>
                      </div>

                      {/* Usage progress if available */}
                      {voucher.usedPercent !== undefined && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Đã sử dụng</span>
                            <span className="font-medium">{voucher.usedPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(5, voucher.usedPercent)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
  // ...existing code...
};

export default ShopeeVoucherModal;
