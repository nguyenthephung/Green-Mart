import React, { useState } from 'react';
import type { Voucher } from '../../../types/Voucher';

interface ShopeeVoucherModalProps {
  open: boolean;
  vouchers: Voucher[];
  selectedVoucher?: Voucher | null;
  onSelect: (voucher: Voucher | null) => void;
  onClose: () => void;
}

const ShopeeVoucherModal: React.FC<ShopeeVoucherModalProps> = ({ open, vouchers, selectedVoucher, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(selectedVoucher || null);

  if (!open) return null;

  // Lọc voucher theo search
  const filteredVouchers = vouchers.filter(v =>
    v.code.toLowerCase().includes(search.toLowerCase()) ||
    v.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-overlay">
      <div className="bg-app-card rounded-xl shadow-xl w-full max-w-lg mx-auto relative animate-fadeIn border border-app-border">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-app-border px-6 py-4">
          <h2 className="text-lg font-semibold text-app-primary">Chọn Voucher</h2>
          <button className="text-app-muted hover:text-red-500 text-xl" onClick={onClose}>&times;</button>
        </div>
        {/* Input mã voucher + search */}
        <div className="flex gap-2 px-6 py-4 border-b border-app-border items-center">
          <input
            type="text"
            className="flex-1 border border-app-border rounded px-3 py-2 text-sm bg-app-input text-app-primary placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tìm kiếm voucher theo mã hoặc tên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            type="text"
            className="w-32 border border-app-border rounded px-3 py-2 text-sm bg-app-input text-app-primary placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Mã Voucher"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
          />
          <button
            className="bg-app-secondary px-4 py-2 rounded text-sm font-medium text-app-secondary disabled:opacity-50 hover:bg-brand-green hover:text-white transition-all duration-200"
            disabled={!inputCode.trim()}
            onClick={() => console.log('Apply code:', inputCode.trim())}
          >
            Áp dụng
          </button>
        </div>
        {/* Danh sách voucher */}
        <div className="max-h-80 overflow-y-auto px-6 py-2 custom-scrollbar">
          {filteredVouchers.length === 0 && (
            <div className="text-center text-app-muted py-8">Không tìm thấy voucher phù hợp</div>
          )}
          {filteredVouchers.map((v) => (
            <div
              key={v.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-app-border mb-3 transition-all duration-200 ${
                v.disabled 
                  ? 'opacity-50 bg-app-secondary' 
                  : 'hover:border-brand-green hover:shadow-md bg-app-card'
              } ${
                currentVoucher?.id === v.id 
                  ? 'border-brand-green ring-2 ring-green-500/20' 
                  : ''
              }`}
            >
              <div className="flex-shrink-0 w-14 h-14 bg-orange-100 rounded flex items-center justify-center">
                <span className="text-orange-500 text-2xl font-bold">{v.label[0]}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-orange-600">{v.label}</span>
                  {v.onlyOn && <span className="text-xs bg-app-secondary text-app-muted px-2 py-0.5 rounded">Chỉ có trên {v.onlyOn}</span>}
                </div>
                <div className="text-xs text-app-secondary mt-1">{v.description}</div>
                <div className="text-xs text-app-muted mt-1">Đơn tối thiểu: {v.minOrder.toLocaleString()}đ</div>
                <div className="text-xs text-app-muted mt-1">HSD: {v.expired}</div>
                <div className="text-xs text-app-muted mt-1">Đã dùng {v.usedPercent}%</div>
                {v.note && <div className="text-xs text-red-500 mt-1">{v.note}</div>}
              </div>
              <input
                type="radio"
                className="w-5 h-5 accent-brand-green"
                checked={currentVoucher?.id === v.id}
                disabled={v.disabled}
                onChange={() => setCurrentVoucher(v)}
              />
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center border-t border-app-border px-6 py-4 bg-app-secondary rounded-b-xl">
          <button
            className="px-4 py-2 rounded bg-app-secondary text-app-secondary font-medium hover:bg-app-input transition-all duration-200"
            onClick={() => { setCurrentVoucher(null); onClose(); }}
          >
            Trở lại
          </button>
          <button
            className="px-6 py-2 rounded bg-brand-green text-white font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => { onSelect(currentVoucher); onClose(); }}
            disabled={currentVoucher?.disabled}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopeeVoucherModal;
