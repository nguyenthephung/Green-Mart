import React from 'react';

interface ConfirmDeleteModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, onCancel, onConfirm }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50">
      <div 
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative animate-fadeIn"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px'
        }}
      >
        <h2 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2"><span className="material-icons text-red-500">warning</span>Xác nhận xóa sản phẩm</h2>
        <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
        <div className="flex gap-4 mt-6 justify-end">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onCancel}>Hủy</button>
          <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
