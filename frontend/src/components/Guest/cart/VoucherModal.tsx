import React from 'react';

const demoVouchers = [
  {
    id: 1,
    code: 'GREEN10',
    description: 'Giảm 10% cho sản phẩm Thịt Heo',
    discountType: 'percent' as const,
    discountValue: 10,
    minOrder: 100000,
    type: 'product' as const,
    productIds: [1],
  },
  {
    id: 2,
    code: 'FREESHIP',
    description: 'Giảm 20.000đ phí ship cho đơn từ 100.000đ',
    discountType: 'amount' as const,
    discountValue: 20000,
    minOrder: 100000,
    type: 'freeship' as const,
  },
];

interface VoucherModalProps {
  open: boolean;
  onClose: () => void;
  type: 'product' | 'freeship';
  selectedVoucher: any;
  onSelect: (voucher: any) => void;
}

const VoucherModal: React.FC<VoucherModalProps> = ({
  open,
  onClose,
  type,
  selectedVoucher,
  onSelect,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {type === 'product' ? 'Chọn voucher sản phẩm' : 'Chọn voucher miễn phí vận chuyển'}
        </h3>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {demoVouchers
            .filter(v => v.type === type)
            .map(v => (
              <div
                key={v.id}
                className={`flex justify-between items-center p-3 border rounded-lg ${selectedVoucher && selectedVoucher.id === v.id ? 'bg-green-100 border-green-600' : 'bg-gray-50'}`}
              >
                <div>
                  <div className="font-bold text-green-700">{v.code}</div>
                  <div className="text-gray-700 text-sm">{v.description}</div>
                  <div className="text-xs text-gray-500">
                    {v.discountType === 'percent'
                      ? `Giảm ${v.discountValue}%`
                      : `Giảm ${v.discountValue.toLocaleString()}đ`}
                    {v.minOrder ? ` | Đơn tối thiểu: ${v.minOrder.toLocaleString()}đ` : ''}
                  </div>
                </div>
                <button
                  className={`ml-4 px-3 py-1 rounded ${selectedVoucher && selectedVoucher.id === v.id ? 'bg-gray-400 text-white' : 'bg-green-600 text-white'}`}
                  onClick={() =>
                    onSelect(selectedVoucher && selectedVoucher.id === v.id ? null : v)
                  }
                >
                  {selectedVoucher && selectedVoucher.id === v.id ? 'Đang áp dụng' : 'Áp dụng'}
                </button>
              </div>
            ))}
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
