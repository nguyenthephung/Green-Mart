import React, { useEffect, useState } from 'react';
import { useVoucherStore } from '../../stores/useVoucherStore';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import NumberInput from '../../components/ui/NumberInput';

interface VoucherForm {
  code: string;
  label: string;
  description: string;
  minOrder: string | number;
  discountType: 'percent' | 'amount';
  discountValue: string | number;
  expired: string;
  onlyOn?: string;
  note?: string;
}

const defaultForm: VoucherForm = {
  code: '',
  label: '',
  description: '',
  minOrder: '',
  discountType: 'percent',
  discountValue: '',
  expired: '',
  onlyOn: '',
  note: '',
};


const AdminVouchersPage: React.FC = () => {

  const vouchers = useVoucherStore(state => state.vouchers);
  const loading = useVoucherStore(state => state.loading);
  const fetchVouchers = useVoucherStore(state => state.fetchVouchers);




  // Local state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editVoucher, setEditVoucher] = useState<any>(null);
  const [form, setForm] = useState<VoucherForm>(defaultForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State for date picker in Add Modal


  // Fetch vouchers khi vào trang admin
  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Allow empty string for number fields so user can clear 0 and type new number
    if (name === 'minOrder' || name === 'discountValue') {
      setForm(f => ({ ...f, [name]: value === '' ? '' : value }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleAdd = async () => {
    setActionLoading(true);
    try {
      // Convert minOrder and discountValue to number before submit
      const submitForm = {
        ...form,
        minOrder: form.minOrder === '' ? 0 : Number(form.minOrder),
        discountValue: form.discountValue === '' ? 0 : Number(form.discountValue),
      };
      await import('../../services/voucherService').then(s => s.voucherService.create(submitForm));
      await fetchVouchers();
      // toast.success('Thêm voucher thành công!');
      setShowAdd(false);
      setForm(defaultForm);
    } catch (err: any) {
      // toast.error('Thêm voucher thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editVoucher) return;
    setActionLoading(true);
    try {
      // Convert minOrder and discountValue to number before submit
      const submitForm = {
        ...form,
        minOrder: form.minOrder === '' ? 0 : Number(form.minOrder),
        discountValue: form.discountValue === '' ? 0 : Number(form.discountValue),
      };
      await import('../../services/voucherService').then(s => s.voucherService.update(editVoucher.id, submitForm));
      await fetchVouchers();
      // toast.success('Cập nhật voucher thành công!');
      setShowEdit(false);
      setEditVoucher(null);
      setForm(defaultForm);
    } catch (err: any) {
      // toast.error('Cập nhật voucher thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await import('../../services/voucherService').then(s => s.voucherService.delete(id));
      // toast.success('Xóa voucher thành công!');
      setDeleteId(null);
      await fetchVouchers();
    } catch (err: any) {
      // toast.error('Xóa voucher thất bại!');
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
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* ToastContainer đã được tạm thời disable */}
      {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Thông báo hệ thống" /> */}
      {/* Header */}
      <div className="rounded-xl shadow-sm border border-green-100 dark:border-gray-700 p-6 mb-6 bg-white dark:bg-gray-900">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">Quản lý Voucher</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>Tổng: <span className="font-semibold text-blue-600 dark:text-blue-400">{totalVouchers}</span> voucher</span>
              <span>Hoạt động: <span className="font-semibold text-green-600 dark:text-green-400">{activeVouchers}</span></span>
              <span>Tổng lượt sử dụng: <span className="font-semibold text-purple-600 dark:text-purple-400">{totalUsage}</span></span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm mã, tên, mô tả..."
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="expired">Đã hết hạn</option>
              </select>
            </div>
            <button
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
              onClick={() => { setShowAdd(true); setForm(defaultForm); }}
            >
              + Thêm voucher
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow-sm border border-green-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-900 dark:text-gray-100">
            <thead className="border-b border-green-100 dark:border-gray-700 bg-green-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 dark:text-green-200 uppercase tracking-wider cursor-pointer hover:bg-green-100 dark:hover:bg-gray-700 transition-colors" onClick={() => { setSortField('label'); setSortOrder(sortField === 'label' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">Tên {getSortIcon('label')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 dark:text-green-200 uppercase tracking-wider">Mã</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 dark:text-green-200 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 dark:text-green-200 uppercase tracking-wider">Đơn tối thiểu</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 dark:text-green-200 uppercase tracking-wider cursor-pointer hover:bg-green-100 dark:hover:bg-gray-700 transition-colors" onClick={() => { setSortField('discountValue'); setSortOrder(sortField === 'discountValue' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">Giá trị {getSortIcon('discountValue')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 dark:text-green-200 uppercase tracking-wider cursor-pointer hover:bg-green-100 dark:hover:bg-gray-700 transition-colors" onClick={() => { setSortField('expired'); setSortOrder(sortField === 'expired' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">HSD {getSortIcon('expired')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-800 dark:text-green-200 uppercase tracking-wider cursor-pointer hover:bg-green-100 dark:hover:bg-gray-700 transition-colors" onClick={() => { setSortField('isActive'); setSortOrder(sortField === 'isActive' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">Trạng thái {getSortIcon('isActive')}</div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-green-800 dark:text-green-200 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr>
              ) : sortedVouchers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-lg">Không tìm thấy voucher nào</td></tr>
              ) : sortedVouchers.map((v, index) => {
                const now = new Date();
                const isExpired = new Date(v.expired) < now;
                return (
                  <tr key={v.id || index} className="transition-colors bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-gray-800 border-b border-green-100 dark:border-gray-800">
                    <td className="px-6 py-4 font-semibold text-green-900 dark:text-green-200 align-middle">{v.label}</td>
                    <td className="px-6 py-4 font-mono dark:text-gray-200 align-middle">{v.code}</td>
                    <td className="px-6 py-4 max-w-xs truncate dark:text-gray-200 align-middle" title={v.description}>{v.description}</td>
                    <td className="px-6 py-4 dark:text-gray-200 align-middle">{typeof v.minOrder === 'number' ? v.minOrder.toLocaleString('vi-VN') : v.minOrder}₫</td>
                    <td className="px-6 py-4 dark:text-gray-200 align-middle">{v.discountType === 'percent' ? `${v.discountValue}%` : (typeof v.discountValue === 'number' ? v.discountValue.toLocaleString('vi-VN') : v.discountValue) + '₫'}</td>
                    <td className="px-6 py-4 dark:text-gray-200 align-middle">{formatDate(v.expired)}</td>
                    <td className="px-6 py-4 align-middle">
                      {isExpired ? (
                        <span className="inline-block px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">Hết hạn</span>
                      ) : v.isActive ? (
                        <span className="inline-block px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">Đang hoạt động</span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs">Tạm ngưng</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-sm font-medium"
                          title="Chỉnh sửa"
                          onClick={() => openEdit(v)}
                        >
                          {/* Heroicons Pencil Square */}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4L16.862 3.487z" />
                          </svg>
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors shadow-sm font-medium"
                          title="Xóa"
                          onClick={() => setDeleteId(v.id)}
                        >
                          {/* Heroicons Trash */}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V19.125A2.625 2.625 0 008.625 21.75h6.75A2.625 2.625 0 0018 19.125V7.5M4.5 7.5h15m-10.125 0V5.625A1.125 1.125 0 019.75 4.5h4.5a1.125 1.125 0 011.125 1.125V7.5" />
                          </svg>
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-2xl mt-12" style={{ position: 'relative', top: 0, transform: 'translateY(0)' }}>
            <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-300">Thêm voucher mới</h2>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600 dark:text-green-300 mb-2">Thông tin cơ bản</h3>
                  <input name="code" value={form.code} onChange={handleInput} placeholder="Mã voucher" className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                  <input name="label" value={form.label} onChange={handleInput} placeholder="Tên voucher" className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                  <textarea name="description" value={form.description} onChange={handleInput} placeholder="Mô tả" className="w-full p-3 border rounded min-h-[80px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600 dark:text-green-300 mb-2">Điều kiện & Giá trị</h3>
                  <NumberInput
                    value={typeof form.minOrder === 'string' ? Number(form.minOrder) || 0 : form.minOrder}
                    onChange={(value) => setForm({...form, minOrder: value})}
                    placeholder="Đơn tối thiểu"
                  />
                  <div className="flex gap-2">
                    <select name="discountType" value={form.discountType} onChange={handleInput} className="w-1/2 p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                      <option value="percent">Phần trăm (%)</option>
                      <option value="amount">Số tiền (₫)</option>
                    </select>
                    <NumberInput
                      value={typeof form.discountValue === 'string' ? Number(form.discountValue) || 0 : form.discountValue}
                      onChange={(value) => setForm({...form, discountValue: value})}
                      placeholder="Giá trị giảm"
                    />
                  </div>
                  <div className="relative">
                    <input
                      name="expired"
                      type="date"
                      value={form.expired}
                      onChange={handleInput}
                      placeholder="Chọn ngày hết hạn"
                      className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 pr-12"
                    />
                  </div>
                  <h3 className="font-semibold text-green-600 dark:text-green-300 mb-2 mt-4">Khác</h3>
                  <input name="onlyOn" value={form.onlyOn} onChange={handleInput} placeholder="Chỉ áp dụng cho (nếu có)" className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">* "Chỉ áp dụng cho" là <b>tên danh mục</b> hoặc <b>tên sản phẩm</b> (ví dụ: "Rau củ" hoặc "Cà chua")</p>
                  <input name="note" value={form.note} onChange={handleInput} placeholder="Ghi chú (nếu có)" className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => { setShowAdd(false); setForm(defaultForm); }}>Hủy</button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800 font-semibold"
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-2xl mt-12" style={{ position: 'relative', top: 0, transform: 'translateY(0)' }}>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">Chỉnh sửa voucher</h2>
            <form onSubmit={e => { e.preventDefault(); handleEdit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">Thông tin cơ bản</h3>
                  <input name="code" value={form.code} onChange={handleInput} placeholder="Mã voucher" className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                  <input name="label" value={form.label} onChange={handleInput} placeholder="Tên voucher" className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                  <textarea name="description" value={form.description} onChange={handleInput} placeholder="Mô tả" className="w-full p-3 border rounded min-h-[80px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">Điều kiện & Giá trị</h3>
                  <NumberInput
                    value={typeof form.minOrder === 'string' ? Number(form.minOrder) || 0 : form.minOrder}
                    onChange={(value) => setForm({...form, minOrder: value})}
                    placeholder="Đơn tối thiểu"
                  />
                  <div className="flex gap-2">
                    <select name="discountType" value={form.discountType} onChange={handleInput} className="w-1/2 p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                      <option value="percent">Phần trăm (%)</option>
                      <option value="amount">Số tiền (₫)</option>
                    </select>
                    <NumberInput
                      value={typeof form.discountValue === 'string' ? Number(form.discountValue) || 0 : form.discountValue}
                      onChange={(value) => setForm({...form, discountValue: value})}
                      placeholder="Giá trị giảm"
                    />
                  </div>
                  <input name="expired" type="date" value={form.expired} onChange={handleInput} className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" />
                  <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-2 mt-4">Khác</h3>
                  <input name="onlyOn" value={form.onlyOn} onChange={handleInput} placeholder="Chỉ áp dụng cho (nếu có)" className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                  <input name="note" value={form.note} onChange={handleInput} placeholder="Ghi chú (nếu có)" className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-700" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => { setShowEdit(false); setEditVoucher(null); setForm(defaultForm); }}>Hủy</button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 font-semibold"
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-red-300">Xác nhận xóa voucher?</h2>
            <p className="mb-6 dark:text-gray-200">Bạn có chắc chắn muốn xóa voucher này không?</p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-800 font-semibold" onClick={() => handleDelete(deleteId!)} disabled={actionLoading}>
                {actionLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVouchersPage;

