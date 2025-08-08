import React, { useState, useMemo } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useProductStore } from '../../stores/useProductStore';
import { LoadingSpinner } from '../../components/Loading';
// Category mới: name (tên cha), subs (mảng tên con), icon, description, ...
type Category = {
  id: string;
  name: string;
  subs: string[];
  icon: string;
  description?: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};
import Pagination from '../../components/Admin/Product/Pagination';



type SortField = 'name' | 'productCount' | 'status' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'active' | 'inactive';

const AdminCategories: React.FC = () => {
  // Store danh mục
  const {
    categories,
    error,
    fetchCategories,
    add,
    edit,
    remove,
    toggleStatus
  } = useCategoryStore();
  
  // Store sản phẩm  
  const products = useProductStore(state => state.products);
  // Loading states for each action
  const [fetchLoading, setFetchLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetchTried, setFetchTried] = useState(false);
  React.useEffect(() => {
    if (!fetchTried) {
      setFetchLoading(true);
      fetchCategories().finally(() => {
        setFetchLoading(false);
        setFetchTried(true);
      });
    }
  }, [fetchCategories, fetchTried]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // If fetch failed, stop showing loading spinner
  const showLoading = (fetchLoading || addLoading || editLoading || deleteLoading) && !error;

  // Function để lấy sản phẩm theo category (bao gồm cả subcategories)
  const getProductsByCategory = (categoryName: string, subcategories: string[] = []) => {
    // Lấy sản phẩm theo parent category
    const parentProducts = products.filter(product => product.category === categoryName);
    
    // Lấy sản phẩm theo subcategories
    const subProducts = products.filter(product => 
      subcategories.includes(product.category)
    );
    
    // Gộp lại và loại bỏ trùng lặp
    const allProducts = [...parentProducts, ...subProducts];
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    return uniqueProducts;
  };

  // Function để lấy productCount thực tế
  const getRealProductCount = (categoryName: string, subcategories: string[] = []) => {
    return getProductsByCategory(categoryName, subcategories).length;
  };

  // Function để hiển thị sản phẩm của category
  const handleShowProducts = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setShowProducts(true);
  };

  // Filter and sort logic
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(search.toLowerCase()) ||
                          (category.description?.toLowerCase() || '').includes(search.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || category.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'productCount':
          // Sử dụng productCount từ backend (đã tính đúng)
          aValue = a.productCount;
          bValue = b.productCount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [categories, search, sortField, sortOrder, filterStatus]);

  // Pagination calculations
  const totalItems = filteredAndSortedCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredAndSortedCategories.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Add category
  const handleAddCategory = React.useCallback((newCategory: Omit<Category, 'id'>) => {
    setAddLoading(true);
    // toast.loading('Đang thêm danh mục...', { toastId: 'add-category' });
    add(newCategory)
      .then(() => {
        // toast.update('add-category', { render: 'Thêm danh mục thành công!', type: 'success', isLoading: false, autoClose: 2000 });
        setShowAdd(false);
      })
      .catch((err) => {
        // toast.update('add-category', { render: 'Thêm danh mục thất bại: ' + (err?.message || err), type: 'error', isLoading: false, autoClose: 4000 });
      })
      .finally(() => setAddLoading(false));
  }, [add]);

  // Edit category
  const handleEditCategory = React.useCallback((updatedCategory: Category) => {
    setEditLoading(true);
    // toast.loading('Đang cập nhật danh mục...', { toastId: 'edit-category' });
    return edit(updatedCategory)
      .then(() => {
        // toast.update('edit-category', { render: 'Cập nhật danh mục thành công!', type: 'success', isLoading: false, autoClose: 2000 });
        setShowEdit(false);
        setEditCategory(null);
      })
      .catch((err) => {
        // toast.update('edit-category', { render: 'Cập nhật danh mục thất bại: ' + (err?.message || err), type: 'error', isLoading: false, autoClose: 4000 });
      })
      .finally(() => setEditLoading(false));
  }, [edit]);

  // Delete category
  const handleDeleteCategory = React.useCallback(() => {
    setDeleteLoading(true);
    // toast.loading('Đang xóa danh mục...', { toastId: 'delete-category' });
    if (!deleteId) {
      setDeleteLoading(false);
      return Promise.resolve();
    }
    return remove(deleteId)
      .then(() => {
        // toast.update('delete-category', { render: 'Xóa danh mục thành công!', type: 'success', isLoading: false, autoClose: 2000 });
        setDeleteId(null);
        // Force loading to false after deletion to prevent spinner flicker
        setTimeout(() => {
          const loadingElem = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-20.flex.items-center.justify-center.z-50');
          if (loadingElem) loadingElem.remove();
        }, 500);
      })
      .catch((err) => {
        // toast.update('delete-category', { render: 'Xóa danh mục thất bại: ' + (err?.message || err), type: 'error', isLoading: false, autoClose: 4000 });
      })
      .finally(() => setDeleteLoading(false));
  }, [deleteId, remove]);

  // Toggle status
  const handleToggleStatus = (id: string) => {
    toggleStatus(id);
  };

  const openEditModal = (category: Category) => {
    setEditCategory(category);
    setShowEdit(true);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.status === 'active').length;
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="min-h-screen" style={isDarkMode ? { backgroundColor: '#111827', color: '#fff' } : {}}>
      {/* Toast Container đã được tạm thời disable */}
      {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover aria-label={undefined} /> */}
      {/* Header */}
      <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quản lý danh mục</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>Tổng: <span className="font-semibold text-blue-600">{totalCategories}</span> danh mục</span>
              <span>Hoạt động: <span className="font-semibold text-green-600">{activeCategories}</span></span>
              <span>Tổng sản phẩm: <span className="font-semibold text-purple-600">{totalProducts}</span></span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2`}
          style={isDarkMode ? (showFilters ? { backgroundColor: '#23272f', color: '#fff' } : { backgroundColor: '#23272f', color: '#60a5fa' }) : (showFilters ? { backgroundColor: '#2563eb', color: '#fff' } : { backgroundColor: '#dbeafe', color: '#1e40af' })}
        >
              <span>🔍</span>
              Bộ lọc
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg transition-all duration-200`}
                style={isDarkMode ? (viewMode === 'table' ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#23272f', color: '#e5e7eb' }) : (viewMode === 'table' ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#e5e7eb', color: '#374151' })}
                title="Xem dạng bảng"
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-all duration-200`}
                style={isDarkMode ? (viewMode === 'grid' ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#23272f', color: '#e5e7eb' }) : (viewMode === 'grid' ? { backgroundColor: '#22c55e', color: '#fff' } : { backgroundColor: '#e5e7eb', color: '#374151' })}
                title="Xem dạng thẻ"
              >
                🔳
              </button>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              style={isDarkMode ? { backgroundColor: '#22c55e', color: '#fff' } : { background: 'linear-gradient(to right, #16a34a, #15803d)', color: '#fff' }}
            >
              <span className="text-lg">+</span>
              Thêm danh mục
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-xl shadow-sm border border-gray-200 p-6 mb-6 animate-slideDown" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc và tìm kiếm</h3>
            <button
              onClick={() => {
                setSearch('');
                setFilterStatus('all');
                setSortField('name');
                setSortOrder('asc');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Xóa bộ lọc
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tên danh mục, mô tả..."
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
                <option value="inactive">Ngừng hoạt động</option>
              </select>
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
                <option value="productCount-desc">Số sản phẩm giảm dần</option>
                <option value="productCount-asc">Số sản phẩm tăng dần</option>
                <option value="updatedAt-desc">Cập nhật mới nhất</option>
                <option value="updatedAt-asc">Cập nhật cũ nhất</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Categories Display */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200" style={isDarkMode ? { backgroundColor: '#23272f' } : { backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Tên danh mục {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('productCount')}
                  >
                    <div className="flex items-center gap-1">
                      Số sản phẩm {getSortIcon('productCount')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Trạng thái {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center gap-1">
                      Cập nhật {getSortIcon('updatedAt')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
                {currentCategories.map((category) => (
                  <tr key={category.id}
                    style={{ ...isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }, transition: 'none' }}
                    onMouseEnter={e => { if (isDarkMode) e.currentTarget.style.backgroundColor = '#23272f'; else e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                    onMouseLeave={e => { if (isDarkMode) e.currentTarget.style.backgroundColor = '#18181b'; else e.currentTarget.style.backgroundColor = '#fff'; }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={isDarkMode ? { backgroundColor: '#23272f' } : { backgroundColor: '#f3f4f6' }}>
                        {category.icon}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm max-w-xs truncate" title={category.description} style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                        {category.description || 'Chưa có mô tả'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>{category.productCount}</span>
                          <span className="ml-2 text-xs" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>sản phẩm</span>
                        </div>
                        <button
                          onClick={() => handleShowProducts(category.id, category.name)}
                          className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          Xem
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(category.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors`}
                        style={isDarkMode
                          ? category.status === 'active'
                            ? { backgroundColor: '#23272f', color: '#4ade80', borderColor: '#4ade80' }
                            : { backgroundColor: '#23272f', color: '#f87171', borderColor: '#f87171' }
                          : category.status === 'active'
                            ? { backgroundColor: '#bbf7d0', color: '#166534', borderColor: '#bbf7d0' }
                            : { backgroundColor: '#fecaca', color: '#991b1b', borderColor: '#fecaca' }}
                      >
                        {category.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                      {formatDate(category.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteId(category.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy danh mục</h3>
              <p className="text-gray-500">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có danh mục nào'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentCategories.map((category) => (
            <div key={category.id} className="rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1" style={isDarkMode ? { backgroundColor: '#18181b' } : { backgroundColor: '#fff' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={isDarkMode ? { backgroundColor: '#23272f' } : { backgroundColor: '#f3f4f6' }}>
                    {category.icon}
                  </div>
                  <button
                    onClick={() => handleToggleStatus(category.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors`}
                    style={isDarkMode
                      ? category.status === 'active'
                        ? { backgroundColor: '#23272f', color: '#4ade80', borderColor: '#4ade80' }
                        : { backgroundColor: '#23272f', color: '#f87171', borderColor: '#f87171' }
                      : category.status === 'active'
                        ? { backgroundColor: '#bbf7d0', color: '#166534', borderColor: '#bbf7d0' }
                        : { backgroundColor: '#fecaca', color: '#991b1b', borderColor: '#fecaca' }}
                  >
                    {category.status === 'active' ? '✅' : '❌'}
                  </button>
                </div>
                
                <h3 className="text-xl font-bold mb-2" style={isDarkMode ? { color: '#fff' } : { color: '#111827' }}>{category.name}</h3>
                
                <p className="text-sm mb-4 line-clamp-2" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>
                  {category.description || 'Chưa có mô tả'}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={isDarkMode ? { color: '#60a5fa' } : { color: '#2563eb' }}>{category.productCount}</div>
                    <div className="text-xs" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Sản phẩm</div>
                    <button
                      onClick={() => handleShowProducts(category.id, category.name)}
                      className="mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    >
                      Xem sản phẩm
                    </button>
                  </div>
                  <div className="text-center">
                    <div className="text-sm" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>{formatDate(category.updatedAt)}</div>
                    <div className="text-xs" style={isDarkMode ? { color: '#e5e7eb' } : { color: '#6b7280' }}>Cập nhật</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteId(category.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAndSortedCategories.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy danh mục</h3>
              <p className="text-gray-500">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có danh mục nào'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={Math.min(endIndex, totalItems)}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Loading indicator */}
      {showLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <LoadingSpinner
            size="lg"
            text="Đang xử lý..."
            subText="Vui lòng chờ trong giây lát"
            variant="primary"
          />
        </div>
      )}
      {/* Error indicator */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <span className="text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddCategoryModal
          show={showAdd}
          onAdd={handleAddCategory}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showEdit && editCategory && (
        <EditCategoryModal
          show={showEdit}
          category={editCategory}
          onSave={handleEditCategory}
          onClose={() => {
            setShowEdit(false);
            setEditCategory(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDeleteCategoryModal
          show={!!deleteId}
          categoryName={categories.find(c => c.id === deleteId)?.name || ''}
          onConfirm={handleDeleteCategory}
          onCancel={() => setDeleteId(null)}
        />
      )}
      
      {/* Products Modal */}
      <ProductsModal
        show={showProducts}
        onClose={() => setShowProducts(false)}
        categoryId={selectedCategoryId}
        categories={categories}
        products={products}
        getProductsByCategory={getProductsByCategory}
      />
    </div>
  );
};

// Modal components (simplified for now)


const AddCategoryModal: React.FC<{show: boolean, onAdd: (cat: Omit<Category, 'id'>) => void, onClose: () => void}> = ({ show, onAdd, onClose }) => {
  const { categories, fetchCategories } = useCategoryStore();
  const [type, setType] = useState<'parent' | 'child'>('child');
  const [name, setName] = useState(''); // tên cha
  const [subName, setSubName] = useState(''); // tên con
  const [parentId, setParentId] = useState(''); // id cha để thêm con
  const [icon, setIcon] = useState('📁');
  const [description, setDescription] = useState('');
  const isDarkMode = document.documentElement.classList.contains('dark');

  if (!show) return null;

  // Thêm danh mục cha
  const handleAddParent = async () => {
    if (!name.trim()) return;
    await Promise.resolve(onAdd({
      name: name.trim(),
      subs: [],
      icon,
      description: description.trim(),
      productCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    await fetchCategories();
    setName('');
    setIcon('📁');
    setDescription('');
  };

  // Thêm danh mục con vào cha
  const handleAddChild = async () => {
    if (!subName.trim() || !parentId) return;
    // Tìm cha, thêm con vào subs
    const parent = categories.find(c => c.id === parentId);
    if (!parent) return;
    const updatedParent: Category = {
      ...parent,
      subs: [...parent.subs, subName.trim()],
      updatedAt: new Date().toISOString()
    };
    await Promise.resolve(onAdd(updatedParent));
    await fetchCategories();
    setSubName('');
    setParentId('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          ...(isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : { backgroundColor: '#fff' }),
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px'
        }}
      >
        <h2 className="text-xl font-bold mb-4">Thêm danh mục mới</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Loại danh mục:</label>
            <select value={type} onChange={e => setType(e.target.value as 'parent' | 'child')} className="w-full px-4 py-2 border rounded-lg">
              <option value="parent">Danh mục cha</option>
              <option value="child">Thêm danh mục con vào cha</option>
            </select>
          </div>
          {type === 'parent' && (
            <>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tên danh mục cha"
                className="w-full px-4 py-2 border rounded-lg"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
              />
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="Icon (emoji)"
                className="w-full px-4 py-2 border rounded-lg"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả danh mục"
                className="w-full px-4 py-2 border rounded-lg h-20"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
              />
              <button
                onClick={handleAddParent}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg mt-2"
                style={isDarkMode ? { backgroundColor: '#22c55e', color: '#fff' } : {}}
              >Thêm danh mục cha</button>
            </>
          )}
          {type === 'child' && (
            <>
              <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="">-- Chọn danh mục cha --</option>
                {categories.map((cat, idx) => (
                  <option key={cat.id + '-' + idx} value={cat.id}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={subName}
                onChange={e => setSubName(e.target.value)}
                placeholder="Tên danh mục con"
                className="w-full px-4 py-2 border rounded-lg mt-2"
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
              />
              <button
                onClick={handleAddChild}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg mt-2"
                style={isDarkMode ? { backgroundColor: '#22c55e', color: '#fff' } : {}}
              >Thêm danh mục con</button>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg"
            style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
          >Đóng</button>
        </div>
      </div>
    </div>
  );
};

const EditCategoryModal: React.FC<{show: boolean, category: Category, onSave: (cat: Category) => void, onClose: () => void}> = ({ show, category, onSave, onClose }) => {
  const [name, setName] = useState(category.name ?? '');
  const [subs, setSubs] = useState<string[]>(category.subs ?? []);
  const [icon, setIcon] = useState(category.icon ?? '📁');
  const [description, setDescription] = useState(category.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  // Dark mode detection
  const isDarkMode = document.documentElement.classList.contains('dark');

  if (!show) return null;

  const handleSave = () => {
    if (!name.trim() || !category.id || isSaving) return;
    setIsSaving(true);
    Promise.resolve(onSave({
      ...category,
      id: category.id,
      name: name.trim(),
      subs,
      icon,
      description: description.trim(),
      updatedAt: new Date().toISOString()
    })).finally(() => setIsSaving(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          ...(isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : { backgroundColor: '#fff' }),
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px'
        }}
      >
        <h2 className="text-xl font-bold mb-4">Sửa danh mục</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
            className="w-full px-4 py-2 border rounded-lg"
            style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
          />
          <div>
            <label className="block mb-2">Danh mục con (cách nhau bởi dấu phẩy):</label>
            <input
              type="text"
              value={subs.join(', ')}
              onChange={(e) => setSubs(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Tên các danh mục con, cách nhau bởi dấu phẩy"
              className="w-full px-4 py-2 border rounded-lg"
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
            />
          </div>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Icon (emoji)"
            className="w-full px-4 py-2 border rounded-lg"
            style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả danh mục"
            className="w-full px-4 py-2 border rounded-lg h-20"
            style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
          />
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg"
            style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
            disabled={isSaving}
          >Hủy</button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
            style={isDarkMode ? { backgroundColor: '#2563eb', color: '#fff' } : {}}
            disabled={!name.trim() || isSaving}
          >{isSaving ? 'Đang lưu...' : 'Lưu'}</button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteCategoryModal: React.FC<{show: boolean, categoryName: string, onConfirm: () => void, onCancel: () => void}> = ({ show, categoryName, onConfirm, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  if (!show) return null;
  const isDarkMode = document.documentElement.classList.contains('dark');
  const handleDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    Promise.resolve(onConfirm()).finally(() => setIsDeleting(false));
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="rounded-xl p-6 w-full max-w-sm"
        style={{
          ...(isDarkMode ? { backgroundColor: '#18181b', color: '#fff' } : { backgroundColor: '#fff' }),
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px'
        }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: '#ef4444' }}>Xác nhận xóa</h2>
        <p className="mb-6">Bạn có chắc chắn muốn xóa danh mục <strong>"{categoryName}"</strong> không?</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded-lg"
            style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
            disabled={isDeleting}
          >Hủy</button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
            style={isDarkMode ? { backgroundColor: '#ef4444', color: '#fff' } : {}}
            disabled={isDeleting}
          >{isDeleting ? 'Đang xóa...' : 'Xóa'}</button>
        </div>
      </div>
    </div>
  );
};

// Products Modal Component
const ProductsModal: React.FC<{
  show: boolean;
  onClose: () => void;
  categoryId: string | null;
  categories: Category[];
  products: any[];
  getProductsByCategory: (categoryName: string, subcategories?: string[]) => any[];
}> = ({ show, onClose, categoryId, categories, products, getProductsByCategory }) => {
  if (!show || !categoryId) return null;
  
  const category = categories.find(c => c.id === categoryId);
  if (!category) return null;
  
  const categoryProducts = getProductsByCategory(category.name, category.subs || []);
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl border-0"
        style={isDarkMode ? { backgroundColor: '#111827', color: '#fff' } : { backgroundColor: '#fff' }}
      >
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Sản phẩm trong danh mục</h2>
                <p className="text-emerald-100 text-lg">
                  {category.name} • {categoryProducts.length} sản phẩm
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {categoryProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm</h3>
              <p style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
                Danh mục này chưa có sản phẩm nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  style={isDarkMode ? { borderColor: '#374151', backgroundColor: '#1f2937' } : { borderColor: '#e5e7eb' }}
                >
                  {/* Product Image */}
                  <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <h4 className="font-semibold mb-2 line-clamp-2" title={product.name}>
                    {product.name}
                  </h4>
                  
                  {/* Price */}
                  <div className="mb-2">
                    {product.salePrice && product.salePrice < product.price ? (
                      <div>
                        <span className="text-lg font-bold" style={{ color: '#ef4444' }}>
                          {product.salePrice?.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="ml-2 text-sm line-through" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
                          {product.price?.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold" style={isDarkMode ? { color: '#60a5fa' } : { color: '#2563eb' }}>
                        {product.price?.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                  
                  {/* Stock */}
                  <div className="text-sm" style={isDarkMode ? { color: '#9ca3af' } : { color: '#6b7280' }}>
                    Kho: {product.stock || 0}
                  </div>
                  
                  {/* Status */}
                  <div className="mt-2">
                    <span 
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
