import React from 'react';


interface ConfirmDeleteModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  textClassName?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, onCancel, onConfirm, textClassName }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-start">
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-sm relative animate-fadeIn"
        style={{
          marginTop: '40px',
          // Center horizontally, near top
        }}
      >
        <h2 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2"><span className="material-icons text-red-500">warning</span>Xác nhận xóa sản phẩm</h2>
        <p className={textClassName ? textClassName : 'text-gray-900 dark:text-gray-100'}>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
        <div className="flex gap-4 mt-6 justify-end">
          <button className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600" onClick={onCancel}>Hủy</button>
          <button className="px-4 py-2 rounded bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
