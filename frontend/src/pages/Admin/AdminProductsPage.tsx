import React, { useState, useMemo } from 'react';
import { adminProducts } from '../../data/Admin/products';
import type { AdminProduct } from '../../data/Admin/products';
import AddProductModal from '../../components/Admin/AddProductModal';
import EditProductModal from '../../components/Admin/EditProductModal';
import ConfirmDeleteModal from '../../components/Admin/ConfirmDeleteModal';
import Pagination from '../../components/Admin/Pagination';

type SortField = 'name' | 'category' | 'price' | 'stock' | 'brand';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'active' | 'inactive';
type FilterCategory = 'all' | 'Rau củ' | 'Trái cây' | 'Thịt' | 'Sữa' | 'Đồ khô' | 'Gia vị' | 'Đồ uống' | 'Snack';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>(adminProducts);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and sort logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                          product.category.toLowerCase().includes(search.toLowerCase()) ||
                          (product.brand?.toLowerCase() || '').includes(search.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && product.status === 'active') ||
                           (filterStatus === 'inactive' && product.status === 'inactive');
      
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      
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
  }, [products, search, sortField, sortOrder, filterStatus, filterCategory]);

  // Pagination calculations
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddProduct = (newProduct: AdminProduct) => {
    setIsLoading(true);
    setTimeout(() => {
      const id = Math.max(...products.map(p => p.id)) + 1;
      setProducts([...products, { ...newProduct, id }]);
      setShowAdd(false);
      setIsLoading(false);
    }, 800);
  };

  const handleEditProduct = (updatedProduct: AdminProduct) => {
    setIsLoading(true);
    setTimeout(() => {
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setShowEdit(false);
      setEditProduct(null);
      setIsLoading(false);
    }, 800);
  };

  const handleDeleteProduct = () => {
    if (!deleteId) return;
    setIsLoading(true);
    setTimeout(() => {
      setProducts(products.filter(p => p.id !== deleteId));
      setDeleteId(null);
      setIsLoading(false);
    }, 500);
  };

  const handleToggleStatus = (id: number) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
    ));
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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
                setFilterCategory('all');
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="Rau củ">🥕 Rau củ</option>
                <option value="Trái cây">🍎 Trái cây</option>
                <option value="Thịt">🥩 Thịt</option>
                <option value="Sữa">🥛 Sữa</option>
                <option value="Đồ khô">🌾 Đồ khô</option>
                <option value="Gia vị">🧂 Gia vị</option>
                <option value="Đồ uống">🥤 Đồ uống</option>
                <option value="Snack">🍿 Snack</option>
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
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Sản phẩm {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      Danh mục {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Giá {getSortIcon('price')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center gap-1">
                      Tồn kho {getSortIcon('stock')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Khuyến mãi
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={product.images?.[0] || product.image} 
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
                          onClick={() => handleToggleStatus(product.id)}
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
                            onClick={() => openEditModal(product)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có sản phẩm nào'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={product.images?.[0] || product.image} 
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
                      onClick={() => openEditModal(product)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeleteId(product.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredAndSortedProducts.length === 0 && (
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
        />
      )}
    </div>
  );
};

export default AdminProducts;
