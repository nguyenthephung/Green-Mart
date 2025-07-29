import React, { useEffect, useState } from 'react';
import { useVoucherStore } from '../../stores/useVoucherStore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface VoucherForm {
  code: string;
  label: string;
  description: string;
  minOrder: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  expired: string;
  onlyOn?: string;
  note?: string;
}

const defaultForm: VoucherForm = {
  code: '',
  label: '',
  description: '',
  minOrder: 0,
  discountType: 'percent',
  discountValue: 0,
  expired: '',
  onlyOn: '',
  note: '',
};


const AdminVouchersPage: React.FC = () => {

  const vouchers = useVoucherStore(state => state.vouchers);
  const loading = useVoucherStore(state => state.loading);
  const fetchAllVouchers = useVoucherStore(state => state.fetchAllVouchers);




  // Local state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editVoucher, setEditVoucher] = useState<any>(null);
  const [form, setForm] = useState<VoucherForm>(defaultForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch vouchers khi vào trang admin
  useEffect(() => {
    fetchAllVouchers();
  }, [fetchAllVouchers]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'minOrder' || name === 'discountValue' ? Number(value) : value }));
  };

  const handleAdd = async () => {
    setActionLoading(true);
    try {
      await import('../../services/voucherService').then(s => s.voucherService.create(form));
      await fetchAllVouchers();
      toast.success('Thêm voucher thành công!');
      setShowAdd(false);
      setForm(defaultForm);
    } catch (err: any) {
      toast.error('Thêm voucher thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editVoucher) return;
    setActionLoading(true);
    try {
      await import('../../services/voucherService').then(s => s.voucherService.update(editVoucher.id, form));
      await fetchAllVouchers();
      toast.success('Cập nhật voucher thành công!');
      setShowEdit(false);
      setEditVoucher(null);
      setForm(defaultForm);
    } catch (err: any) {
      toast.error('Cập nhật voucher thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await import('../../services/voucherService').then(s => s.voucherService.delete(id));
      toast.success('Xóa voucher thành công!');
      setDeleteId(null);
      await fetchAllVouchers();
    } catch (err: any) {
      toast.error('Xóa voucher thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (voucher: any) => {
    setEditVoucher(voucher);
    setForm({ ...voucher });
    setShowEdit(true);
  };



  // Stats
  const totalVouchers = vouchers.length;
  const activeVouchers = vouchers.filter(v => v.isActive).length;
  const totalUsage = vouchers.reduce((sum, v) => sum + (v.currentUsage || 0), 0);

  // Filter/search/sort state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [sortField, setSortField] = useState<'label' | 'discountValue' | 'expired' | 'isActive'>('label');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter, search, sort logic
  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      (v.description?.toLowerCase() || '').includes(search.toLowerCase());
    const now = new Date();
    const isExpired = new Date(v.expired) < now;
    const matchesStatus = filterStatus === 'all'
      || (filterStatus === 'active' && v.isActive && !isExpired)
      || (filterStatus === 'expired' && isExpired);
    return matchesSearch && matchesStatus;
  });
  const sortedVouchers = [...filteredVouchers].sort((a, b) => {
    let aValue: any, bValue: any;
    switch (sortField) {
      case 'label':
        aValue = a.label.toLowerCase(); bValue = b.label.toLowerCase(); break;
      case 'discountValue':
        aValue = a.discountValue; bValue = b.discountValue; break;
      case 'expired':
        aValue = new Date(a.expired).getTime(); bValue = new Date(b.expired).getTime(); break;
      case 'isActive':
        aValue = a.isActive ? 1 : 0; bValue = b.isActive ? 1 : 0; break;
      default: return 0;
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Thông báo hệ thống" />
      {/* Header */}
      <div className="rounded-xl shadow-sm border border-green-100 p-6 mb-6 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">Quản lý Voucher</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Tổng: <span className="font-semibold text-blue-600">{totalVouchers}</span> voucher</span>
              <span>Hoạt động: <span className="font-semibold text-green-600">{activeVouchers}</span></span>
              <span>Tổng lượt sử dụng: <span className="font-semibold text-purple-600">{totalUsage}</span></span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm mã, tên, mô tả..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="expired">Đã hết hạn</option>
              </select>
            </div>
            <button
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
              onClick={() => { setShowAdd(true); setForm(defaultForm); }}
            >
              + Thêm voucher
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow-sm border border-green-100 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-green-100 bg-green-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors" onClick={() => { setSortField('label'); setSortOrder(sortField === 'label' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">Tên {getSortIcon('label')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Mã</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Đơn tối thiểu</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors" onClick={() => { setSortField('discountValue'); setSortOrder(sortField === 'discountValue' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">Giá trị {getSortIcon('discountValue')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors" onClick={() => { setSortField('expired'); setSortOrder(sortField === 'expired' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">HSD {getSortIcon('expired')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors" onClick={() => { setSortField('isActive'); setSortOrder(sortField === 'isActive' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">Trạng thái {getSortIcon('isActive')}</div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-green-800 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100 bg-white">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr>
              ) : sortedVouchers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-lg">Không tìm thấy voucher nào</td></tr>
              ) : sortedVouchers.map((v, index) => {
                const now = new Date();
                const isExpired = new Date(v.expired) < now;
                return (
                  <tr key={v.id || index} className="transition-colors hover:bg-green-50">
                    <td className="px-6 py-4 font-semibold text-green-900">{v.label}</td>
                    <td className="px-6 py-4 font-mono">{v.code}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={v.description}>{v.description}</td>
                    <td className="px-6 py-4">{v.minOrder?.toLocaleString()}₫</td>
                    <td className="px-6 py-4">{v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue?.toLocaleString()}₫`}</td>
                    <td className="px-6 py-4">{formatDate(v.expired)}</td>
                    <td className="px-6 py-4">
                      {isExpired ? (
                        <span className="inline-block px-2 py-1 rounded bg-gray-200 text-gray-500 text-xs">Hết hạn</span>
                      ) : v.isActive ? (
                        <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Đang hoạt động</span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs">Tạm ngưng</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm font-medium"
                          title="Chỉnh sửa"
                          onClick={() => openEdit(v)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" /></svg>
                          Sửa
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-sm font-medium"
                          title="Xóa"
                          onClick={() => setDeleteId(v.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Thêm voucher mới</h2>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600 mb-2">Thông tin cơ bản</h3>
                  <input name="code" value={form.code} onChange={handleInput} placeholder="Mã voucher" className="w-full p-3 border rounded" />
                  <input name="label" value={form.label} onChange={handleInput} placeholder="Tên voucher" className="w-full p-3 border rounded" />
                  <textarea name="description" value={form.description} onChange={handleInput} placeholder="Mô tả" className="w-full p-3 border rounded min-h-[80px]" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600 mb-2">Điều kiện & Giá trị</h3>
                  <input name="minOrder" type="number" value={form.minOrder} onChange={handleInput} placeholder="Đơn tối thiểu" className="w-full p-3 border rounded" />
                  <div className="flex gap-2">
                    <select name="discountType" value={form.discountType} onChange={handleInput} className="w-1/2 p-3 border rounded">
                      <option value="percent">Phần trăm (%)</option>
                      <option value="amount">Số tiền (₫)</option>
                    </select>
                    <input name="discountValue" type="number" value={form.discountValue} onChange={handleInput} placeholder="Giá trị giảm" className="w-1/2 p-3 border rounded" />
                  </div>
                  <input name="expired" type="date" value={form.expired} onChange={handleInput} className="w-full p-3 border rounded" />
                  <h3 className="font-semibold text-green-600 mb-2 mt-4">Khác</h3>
                  <input name="onlyOn" value={form.onlyOn} onChange={handleInput} placeholder="Chỉ áp dụng cho (nếu có)" className="w-full p-3 border rounded" />
                  <input name="note" value={form.note} onChange={handleInput} placeholder="Ghi chú (nếu có)" className="w-full p-3 border rounded" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => { setShowAdd(false); setForm(defaultForm); }}>Hủy</button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Chỉnh sửa voucher</h2>
            <form onSubmit={e => { e.preventDefault(); handleEdit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-600 mb-2">Thông tin cơ bản</h3>
                  <input name="code" value={form.code} onChange={handleInput} placeholder="Mã voucher" className="w-full p-3 border rounded" />
                  <input name="label" value={form.label} onChange={handleInput} placeholder="Tên voucher" className="w-full p-3 border rounded" />
                  <textarea name="description" value={form.description} onChange={handleInput} placeholder="Mô tả" className="w-full p-3 border rounded min-h-[80px]" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-600 mb-2">Điều kiện & Giá trị</h3>
                  <input name="minOrder" type="number" value={form.minOrder} onChange={handleInput} placeholder="Đơn tối thiểu" className="w-full p-3 border rounded" />
                  <div className="flex gap-2">
                    <select name="discountType" value={form.discountType} onChange={handleInput} className="w-1/2 p-3 border rounded">
                      <option value="percent">Phần trăm (%)</option>
                      <option value="amount">Số tiền (₫)</option>
                    </select>
                    <input name="discountValue" type="number" value={form.discountValue} onChange={handleInput} placeholder="Giá trị giảm" className="w-1/2 p-3 border rounded" />
                  </div>
                  <input name="expired" type="date" value={form.expired} onChange={handleInput} className="w-full p-3 border rounded" />
                  <h3 className="font-semibold text-blue-600 mb-2 mt-4">Khác</h3>
                  <input name="onlyOn" value={form.onlyOn} onChange={handleInput} placeholder="Chỉ áp dụng cho (nếu có)" className="w-full p-3 border rounded" />
                  <input name="note" value={form.note} onChange={handleInput} placeholder="Ghi chú (nếu có)" className="w-full p-3 border rounded" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => { setShowEdit(false); setEditVoucher(null); setForm(defaultForm); }}>Hủy</button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4 text-red-700">Xác nhận xóa voucher?</h2>
            <p className="mb-6">Bạn có chắc chắn muốn xóa voucher này không?</p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold" onClick={() => handleDelete(deleteId!)} disabled={actionLoading}>
                {actionLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Thông báo hệ thống" />
    </div>
  );
};

export default AdminVouchersPage;