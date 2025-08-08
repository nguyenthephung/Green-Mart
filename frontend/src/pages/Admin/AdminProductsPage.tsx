import React, { useState, useMemo } from 'react';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { toast } from 'react-toastify';
import type { AdminProduct } from '../../types/AdminProduct';
import { useProductStore } from '../../stores/useProductStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { usePagination } from '../../hooks/usePagination';
import AddProductModal from '../../components/Admin/Product/AddProductModal';
import EditProductModal from '../../components/Admin/Product/EditProductModal';
import ConfirmDeleteModal from '../../components/Admin/Product/ConfirmDeleteModal';
import PaginationControls from '../../components/ui/PaginationControls';
import { LoadingSpinner } from '../../components/Loading';

type SortField = 'name' | 'category' | 'price' | 'stock' | 'brand';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'active' | 'inactive';
// FilterCategory chỉ cần là string vì dropdown lấy từ store


const AdminProducts: React.FC = () => {
  const { products, fetchAll, add, update, remove } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  // Loading states for each action
  const [fetchLoading, setFetchLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [fetchTried, setFetchTried] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  React.useEffect(() => {
    if (!fetchTried) {
      setFetchLoading(true);
      Promise.all([
        fetchAll().catch((err: any) => setFetchError(err?.message || 'Lỗi tải sản phẩm')),
        fetchCategories().catch(() => {})
      ]).finally(() => {
        setFetchLoading(false);
        setFetchTried(true);
      });
    }
  }, [fetchTried, fetchAll, fetchCategories]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterParentCategory, setFilterParentCategory] = useState<string>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const isLoading = (fetchLoading || addLoading || editLoading || deleteLoading) && !fetchError;

  // Filter and sort logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        (product.brand?.toLowerCase() || '').includes(search.toLowerCase());

      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && product.status === 'active') ||
        (filterStatus === 'inactive' && product.status === 'inactive');

      // New logic: filter by parent and sub
      let matchesCategory = true;
      if (filterParentCategory !== 'all') {
        const parentCat = categories.find(cat => cat.id === filterParentCategory);
        if (parentCat) {
          if (filterSubCategory !== 'all') {
            matchesCategory = product.category === filterSubCategory;
          } else {
            matchesCategory = parentCat.subs.includes(product.category);
          }
        } else {
          matchesCategory = false;
        }
      }

      return matchesSearch && matchesStatus && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'brand':
          aValue = (a.brand || '').toLowerCase();
          bValue = (b.brand || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, search, sortField, sortOrder, filterStatus, filterParentCategory, filterSubCategory, categories]);

  // Use pagination hook
  const pagination = usePagination({
    data: filteredAndSortedProducts,
    itemsPerPage: 10,
    initialPage: 1
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddProduct = async (newProduct: AdminProduct) => {
    setAddLoading(true);
    setActionError(null);
    try {
      await add(newProduct);
      await fetchAll();
      // toast.success('Thêm sản phẩm thành công!');
      setShowAdd(false); // Chỉ đóng modal khi thành công
    } catch (err: any) {
      setActionError(err.message || 'Lỗi thêm sản phẩm');
      // toast.error('Thêm sản phẩm thất bại!');
      // Không đóng modal, giữ lại thông tin nhập
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditProduct = async (updatedProduct: AdminProduct) => {
    setEditLoading(true);
    setActionError(null);
    const id = updatedProduct.id ?? (updatedProduct as any)._id;
    try {
      await update(id, updatedProduct);
      await fetchAll();
      setShowEdit(false);
      setEditProduct(null);
      // toast.success('Cập nhật sản phẩm thành công!');
    } catch (err: any) {
      setActionError(err.message || 'Lỗi cập nhật sản phẩm');
      // toast.error('Cập nhật sản phẩm thất bại!');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteId || typeof deleteId !== 'string' || !deleteId.trim()) {
      setActionError('ID sản phẩm không hợp lệ');
      // toast.error('ID sản phẩm không hợp lệ!');
      return;
    }
    setDeleteLoading(true);
    setActionError(null);
    try {
      await remove(deleteId);
      await fetchAll();
      setDeleteId(null);
      // toast.success('Xóa sản phẩm thành công!');
    } catch (err: any) {
      setActionError(err.message || 'Lỗi xóa sản phẩm');
      // toast.error('Xóa sản phẩm thất bại!');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Nếu muốn cập nhật trạng thái sản phẩm, hãy gọi update(id, { status: ... })
  const handleToggleStatus = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setEditLoading(true);
    setActionError(null);
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await update(id, { status: newStatus });
      await fetchAll();
      // toast.success('Đổi trạng thái sản phẩm thành công!');
    } catch (err: any) {
      setActionError(err.message || 'Lỗi đổi trạng thái sản phẩm');
      // toast.error('Đổi trạng thái sản phẩm thất bại!');
    } finally {
      setEditLoading(false);
    }
  };

const openEditModal = (product: AdminProduct) => {
  setEditProduct(product);
  setShowEdit(true);
};

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700' 
      : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', label: 'Hết hàng' };
    if (stock <= 10) return { color: 'text-yellow-600', label: 'Sắp hết' };
    return { color: 'text-green-600', label: 'Còn hàng' };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(false);
  React.useEffect(() => {
    const checkDark = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: isDarkMode ? '#18181b' : '#f9fafb' }}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quản lý sản phẩm</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Tổng cộng: <span className="font-semibold text-green-600">      {filteredAndSortedProducts.length}</span> sản phẩm
              {search && (
                <span className="ml-2 text-sm">
                  (lọc từ {products.length} sản phẩm)
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700'
              }`}
            >
              <span>🔍</span>
              Bộ lọc
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Xem dạng bảng"
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Xem dạng thẻ"
              >
                🔳
              </button>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc và tìm kiếm</h3>
            <button
              onClick={() => {
                setSearch('');
                setFilterStatus('all');
                setFilterParentCategory('all');
                setFilterSubCategory('all');
                setSortField('name');
                setSortOrder('asc');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Xóa bộ lọc
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tên sản phẩm, danh mục, thương hiệu..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng kinh doanh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục cha</label>
              <select
                value={filterParentCategory}
                onChange={e => {
                  setFilterParentCategory(e.target.value);
                  setFilterSubCategory('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                // disabled={loadingCat}
              >
                <option value="all">Tất cả danh mục cha</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</option>
                ))}
              </select>
              {filterParentCategory !== 'all' && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục con</label>
                  {(() => {
                    const parentCat = categories.find(cat => cat.id === filterParentCategory);
                    if (!parentCat) return <div className="text-sm text-red-500">Không tìm thấy danh mục cha này.</div>;
                    if (!parentCat.subs || parentCat.subs.length === 0) {
                      return <div className="text-sm text-gray-500">Danh mục này chưa có danh mục con.</div>;
                    }
                    return (
                      <select
                        value={filterSubCategory}
                        onChange={e => setFilterSubCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      >
                        <option value="all">Tất cả danh mục con</option>
                        {parentCat.subs.map((sub, idx) => (
                          <option key={sub + '-' + idx} value={sub}>{sub}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo</label>
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortField(field as SortField);
                  setSortOrder(order as SortOrder);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="stock-asc">Tồn kho tăng dần</option>
                <option value="stock-desc">Tồn kho giảm dần</option>
                <option value="category-asc">Danh mục A-Z</option>
                <option value="brand-asc">Thương hiệu A-Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Display */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                style={{ background: isDarkMode ? '#23272f' : '#f3f4f6', borderBottom: isDarkMode ? '1px solid #23272f' : '1px solid #e5e7eb' }}
              >
                <tr>
                  <th style={{ color: isDarkMode ? '#e5e7eb' : '#6b7280', background: isDarkMode ? '#23272f' : undefined }} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th
                    style={{ color: isDarkMode ? '#e5e7eb' : '#6b7280', background: isDarkMode ? '#23272f' : undefined, cursor: 'pointer' }}
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Sản phẩm {getSortIcon('name')}
                    </div>
                  </th>
                  <th
                    style={{ color: isDarkMode ? '#e5e7eb' : '#6b7280', background: isDarkMode ? '#23272f' : undefined, cursor: 'pointer' }}
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Danh mục {getSortIcon('category')}
                    </div>
                  </th>
                  <th
                    style={{ color: isDarkMode ? '#e5e7eb' : '#6b7280', background: isDarkMode ? '#23272f' : undefined, cursor: 'pointer' }}
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Giá {getSortIcon('price')}
                    </div>
                  </th>
                  <th
                    style={{ color: isDarkMode ? '#e5e7eb' : '#6b7280', background: isDarkMode ? '#23272f' : undefined, cursor: 'pointer' }}
                    className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center gap-1">
                      Tồn kho {getSortIcon('stock')}
                    </div>
                  </th>
                  <th style={{ color: isDarkMode ? '#e5e7eb' : '#6b7280', background: isDarkMode ? '#23272f' : undefined }} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th style={{ color: isDarkMode ? '#e5e7eb' : '#6b7280', background: isDarkMode ? '#23272f' : undefined }} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Khuyến mãi
                  </th>
                  <th style={{ color: isDarkMode ? '#e5e7eb' : '#6b7280', background: isDarkMode ? '#23272f' : undefined }} className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody
                style={{ background: isDarkMode ? '#18181b' : '#fff' }}
                className="divide-y divide-gray-200 dark:divide-gray-700"
              >
                {fetchLoading ? (
                  // Show loading skeleton rows
                  [...Array(pagination.itemsPerPage)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  pagination.currentData.map((product, idx) => {
                  const stockStatus = getStockStatus(product.stock);
                  // Sử dụng product.id nếu có, nếu không thì dùng idx làm key phụ
                  const key = product.id ?? idx;
                  return (
                    <tr
                      key={key}
                      style={{ transition: 'none' }}
                      onMouseEnter={e => {
                        if (isDarkMode) e.currentTarget.style.background = '#23272f';
                        else e.currentTarget.style.background = '#f3f4f6';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '';
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {product.isSale ? (
                            <>
                              <div className="text-sm font-medium text-red-600">
                                {formatPrice(product.salePrice || 0)}
                              </div>
                              <div className="text-xs text-gray-500 line-through">
                                {formatPrice(product.price)}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${stockStatus.color}`}>
                            {product.stock} {product.unit}
                          </div>
                          <div className={`text-xs ${stockStatus.color}`}>
                            {stockStatus.label}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (!product.id || typeof product.id !== 'string') {
                              // toast.error('ID sản phẩm không hợp lệ!');
                              return;
                            }
                            handleToggleStatus(product.id);
                          }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${getStatusColor(product.status)}`}
                        >
                          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isSale ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            🏷️ Giảm {product.discountAmount?.toLocaleString()}đ
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Không có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal({ ...product, id: typeof product.id === 'string' ? product.id : String(product.id) })}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (!product.id || typeof product.id !== 'string') {
                                // toast.error('ID sản phẩm không hợp lệ!');
                                return;
                              }
                              setDeleteId(product.id);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 style={{ color: isDarkMode ? '#e5e7eb' : '#111827' }} className="text-lg font-medium mb-2">Không tìm thấy sản phẩm</h3>
              <p style={{ color: isDarkMode ? '#a1a1aa' : '#6b7280' }}>
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có sản phẩm nào'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fetchLoading ? (
            // Show loading skeleton cards
            [...Array(pagination.itemsPerPage)].map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            pagination.currentData.map((product, idx) => {
            const stockStatus = getStockStatus(product.stock);
            // Sử dụng product.id nếu có, nếu không thì dùng idx làm key phụ
            const key = product.id ?? idx;
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.isSale && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                      Giảm {product.discountAmount?.toLocaleString()}đ
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status === 'active' ? '✅' : '❌'}
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{product.brand}</p>
                  <div className="mb-3">
                    {product.isSale ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(product.salePrice || 0)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-sm font-medium ${stockStatus.color}`}>
                      {product.stock} {product.unit}
                    </div>
                    <div className={`text-xs ${stockStatus.color}`}>
                      {stockStatus.label}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal({ ...product, id: typeof product.id === 'string' ? product.id : String(product.id) })}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        if (!product.id || typeof product.id !== 'string') {
                          // toast.error('ID sản phẩm không hợp lệ!');
                          return;
                        }
                        setDeleteId(product.id);
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
            })
          )}
          
          {filteredAndSortedProducts.length === 0 && !fetchLoading && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có sản phẩm nào'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredAndSortedProducts.length > 0 && !fetchLoading && (
        <div className="mt-8">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            onFirstPage={pagination.goToFirst}
            onLastPage={pagination.goToLast}
            onPrevPage={pagination.prevPage}
            onNextPage={pagination.nextPage}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            itemsPerPage={pagination.itemsPerPage}
            onItemsPerPageChange={pagination.setItemsPerPage}
            totalItems={filteredAndSortedProducts.length}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            showItemsPerPage={true}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          />
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <LoadingSpinner
            size="lg"
            text="Đang xử lý..."
            subText="Vui lòng chờ trong giây lát"
            variant="primary"
          />
        </div>
      )}
      {fetchError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg">
            {fetchError}
          </div>
        </div>
      )}
      {/* Error notification */}
      {actionError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg">
            {actionError}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddProductModal
  show={showAdd}
  onAdd={handleAddProduct}
  onClose={() => setShowAdd(false)}
/>
      )}

      {showEdit && editProduct && (
        <EditProductModal
          show={showEdit}
          product={editProduct}
          onSave={handleEditProduct}
          onClose={() => {
            setShowEdit(false);
            setEditProduct(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDeleteModal
          show={!!deleteId}
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeleteId(null)}
          textClassName="text-gray-900 dark:text-gray-100"
        />
      )}
    {/* Toast Container đã được tạm thời disable */}
    {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label="Thông báo hệ thống" /> */}
    </div>
  );
};

export default AdminProducts;