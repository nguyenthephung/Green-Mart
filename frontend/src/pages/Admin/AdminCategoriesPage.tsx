import React, { useState, useMemo } from 'react';
import { adminCategories } from '../../data/Admin/categories';
import type { Category } from '../../data/Admin/categories';
import Pagination from '../../components/Admin/Pagination';



type SortField = 'name' | 'productCount' | 'status' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'active' | 'inactive';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(adminCategories);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const handleAddCategory = (newCategory: Omit<Category, 'id'>) => {
    setIsLoading(true);
    setTimeout(() => {
      const id = Math.max(...categories.map(c => c.id)) + 1;
      setCategories([...categories, { ...newCategory, id }]);
      setShowAdd(false);
      setIsLoading(false);
    }, 800);
  };

  const handleEditCategory = (updatedCategory: Category) => {
    setIsLoading(true);
    setTimeout(() => {
      setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      setShowEdit(false);
      setEditCategory(null);
      setIsLoading(false);
    }, 800);
  };

  const handleDeleteCategory = () => {
    if (!deleteId) return;
    setIsLoading(true);
    setTimeout(() => {
      setCategories(categories.filter(c => c.id !== deleteId));
      setDeleteId(null);
      setIsLoading(false);
    }, 500);
  };

  const handleToggleStatus = (id: number) => {
    setCategories(categories.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString().split('T')[0] } : c
    ));
  };

  const openEditModal = (category: Category) => {
    setEditCategory(category);
    setShowEdit(true);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.status === 'active').length;
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
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
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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
              Thêm danh mục
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
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
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {category.icon}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={category.description}>
                        {category.description || 'Chưa có mô tả'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{category.productCount}</span>
                        <span className="ml-2 text-xs text-gray-500">sản phẩm</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(category.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${getStatusColor(category.status)}`}
                      >
                        {category.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          disabled={category.productCount > 0}
                        >
                          {category.productCount > 0 ? '🔒' : '🗑️'}
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
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-3xl">
                    {category.icon}
                  </div>
                  <button
                    onClick={() => handleToggleStatus(category.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getStatusColor(category.status)}`}
                  >
                    {category.status === 'active' ? '✅' : '❌'}
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description || 'Chưa có mô tả'}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{category.productCount}</div>
                    <div className="text-xs text-gray-500">Sản phẩm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">{formatDate(category.updatedAt)}</div>
                    <div className="text-xs text-gray-500">Cập nhật</div>
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
                    disabled={category.productCount > 0}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {category.productCount > 0 ? '🔒' : 'Xóa'}
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
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-700">Đang xử lý...</span>
            </div>
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
    </div>
  );
};

// Modal components (simplified for now)
const AddCategoryModal: React.FC<{show: boolean, onAdd: (cat: Omit<Category, 'id'>) => void, onClose: () => void}> = ({ show, onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [description, setDescription] = useState('');

  if (!show) return null;

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      icon,
      description: description.trim(),
      productCount: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setName('');
    setIcon('📁');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Thêm danh mục mới</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Icon (emoji)"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả danh mục"
            className="w-full px-4 py-2 border rounded-lg h-20"
          />
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Hủy</button>
          <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Thêm</button>
        </div>
      </div>
    </div>
  );
};

const EditCategoryModal: React.FC<{show: boolean, category: Category, onSave: (cat: Category) => void, onClose: () => void}> = ({ show, category, onSave, onClose }) => {
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon);
  const [description, setDescription] = useState(category.description || '');

  if (!show) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...category,
      name: name.trim(),
      icon,
      description: description.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Sửa danh mục</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Icon (emoji)"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả danh mục"
            className="w-full px-4 py-2 border rounded-lg h-20"
          />
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Hủy</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Lưu</button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteCategoryModal: React.FC<{show: boolean, categoryName: string, onConfirm: () => void, onCancel: () => void}> = ({ show, categoryName, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-red-700">Xác nhận xóa</h2>
        <p className="mb-6">Bạn có chắc chắn muốn xóa danh mục <strong>"{categoryName}"</strong> không?</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border rounded-lg">Hủy</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Xóa</button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
