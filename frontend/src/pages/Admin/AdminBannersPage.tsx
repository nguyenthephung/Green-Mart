import React, { useState, useMemo } from 'react';
import { adminBanners } from '../../data/Admin/banners';
import type { Banner } from '../../data/Admin/banners';
import Pagination from '../../components/Admin/Pagination';



type SortField = 'title' | 'position' | 'priority' | 'clickCount' | 'createdAt' | 'startDate';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterPosition = 'all' | 'hero' | 'sidebar' | 'footer' | 'category';
type FilterStatus = 'all' | 'active' | 'inactive';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(adminBanners);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [viewBanner, setViewBanner] = useState<Banner | null>(null);
  const [showView, setShowView] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterPosition, setFilterPosition] = useState<FilterPosition>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and sort logic
  const filteredAndSortedBanners = useMemo(() => {
    let filtered = banners.filter(banner => {
      const matchesSearch = banner.title.toLowerCase().includes(search.toLowerCase()) ||
                          (banner.description && banner.description.toLowerCase().includes(search.toLowerCase()));
      
      const matchesPosition = filterPosition === 'all' || banner.position === filterPosition;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && banner.isActive) ||
                           (filterStatus === 'inactive' && !banner.isActive);
      
      return matchesSearch && matchesPosition && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'position':
          aValue = a.position;
          bValue = b.position;
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        case 'clickCount':
          aValue = a.clickCount;
          bValue = b.clickCount;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [banners, search, sortField, sortOrder, filterPosition, filterStatus]);

  // Pagination calculations
  const totalItems = filteredAndSortedBanners.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBanners = filteredAndSortedBanners.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddBanner = (newBanner: Omit<Banner, 'id' | 'clickCount' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setTimeout(() => {
      const id = Math.max(...banners.map(b => b.id)) + 1;
      const now = new Date().toISOString();
      setBanners([...banners, { 
        ...newBanner, 
        id, 
        clickCount: 0, 
        createdAt: now, 
        updatedAt: now 
      }]);
      setShowAdd(false);
      setIsLoading(false);
    }, 800);
  };

  const handleEditBanner = (updatedBanner: Banner) => {
    setIsLoading(true);
    setTimeout(() => {
      setBanners(banners.map(b => 
        b.id === updatedBanner.id 
          ? { ...updatedBanner, updatedAt: new Date().toISOString() }
          : b
      ));
      setShowEdit(false);
      setEditBanner(null);
      setIsLoading(false);
    }, 800);
  };

  const handleDeleteBanner = () => {
    if (!deleteId) return;
    setIsLoading(true);
    setTimeout(() => {
      setBanners(banners.filter(b => b.id !== deleteId));
      setDeleteId(null);
      setIsLoading(false);
    }, 500);
  };

  const handleToggleStatus = (id: number) => {
    setBanners(banners.map(b => 
      b.id === id ? { ...b, isActive: !b.isActive, updatedAt: new Date().toISOString() } : b
    ));
  };

  const openEditModal = (banner: Banner) => {
    setEditBanner(banner);
    setShowEdit(true);
  };

  const openViewModal = (banner: Banner) => {
    setViewBanner(banner);
    setShowView(true);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'hero': return 'bg-red-100 text-red-800 border-red-200';
      case 'sidebar': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'footer': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'category': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPositionText = (position: string) => {
    switch (position) {
      case 'hero': return 'Hero Banner';
      case 'sidebar': return 'Sidebar';
      case 'footer': return 'Footer';
      case 'category': return 'Category';
      default: return position;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const totalBanners = banners.length;
  const activeBanners = banners.filter(b => b.isActive).length;
  const totalClicks = banners.reduce((sum, b) => sum + b.clickCount, 0);
  const herobanners = banners.filter(b => b.position === 'hero').length;

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý banner</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Tổng: <span className="font-semibold text-blue-600">{totalBanners}</span> banner</span>
              <span>Đang hoạt động: <span className="font-semibold text-green-600">{activeBanners}</span></span>
              <span>Hero banner: <span className="font-semibold text-red-600">{herobanners}</span></span>
              <span>Tổng click: <span className="font-semibold text-purple-600">{totalClicks}</span></span>
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
              Thêm banner
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc và tìm kiếm</h3>
            <button
              onClick={() => {
                setSearch('');
                setFilterPosition('all');
                setFilterStatus('all');
                setSortField('priority');
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
                  placeholder="Tiêu đề, mô tả banner..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí</label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value as FilterPosition)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="all">Tất cả vị trí</option>
                <option value="hero">🏆 Hero Banner</option>
                <option value="sidebar">📍 Sidebar</option>
                <option value="footer">📄 Footer</option>
                <option value="category">🗂️ Category</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="all">Tất cả</option>
                <option value="active">✅ Đang hoạt động</option>
                <option value="inactive">⏸️ Tạm dừng</option>
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
                <option value="priority-asc">Ưu tiên cao nhất</option>
                <option value="clickCount-desc">Click nhiều nhất</option>
                <option value="createdAt-desc">Tạo mới nhất</option>
                <option value="startDate-desc">Bắt đầu mới nhất</option>
                <option value="title-asc">Tiêu đề A-Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Banners Display */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center gap-1">
                      Vị trí {getSortIcon('position')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-1">
                      Ưu tiên {getSortIcon('priority')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('clickCount')}
                  >
                    <div className="flex items-center gap-1">
                      Click {getSortIcon('clickCount')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center gap-1">
                      Thời gian {getSortIcon('startDate')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-12 bg-gray-200 rounded-lg overflow-hidden">
                          <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                          {banner.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">{banner.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(banner.position)}`}>
                        {getPositionText(banner.position)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {banner.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(banner.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                          banner.isActive 
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {banner.isActive ? '✅ Hoạt động' : '⏸️ Tạm dừng'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {banner.clickCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(banner.startDate)}</div>
                      {banner.endDate && (
                        <div className="text-xs">đến {formatDate(banner.endDate)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(banner)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openEditModal(banner)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteId(banner.id)}
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
          
          {filteredAndSortedBanners.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🖼️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy banner</h3>
              <p className="text-gray-500">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có banner nào'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPositionColor(banner.position)}`}>
                    {getPositionText(banner.position)}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(banner.id)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                      banner.isActive 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    {banner.isActive ? '✅' : '⏸️'}
                  </button>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{banner.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Ưu tiên: {banner.priority}</span>
                  <span>{banner.clickCount} click</span>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  <div>Từ: {formatDate(banner.startDate)}</div>
                  {banner.endDate && (
                    <div>Đến: {formatDate(banner.endDate)}</div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(banner)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteId(banner.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAndSortedBanners.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🖼️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy banner</h3>
              <p className="text-gray-500">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có banner nào'}
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
        <AddBannerModal
          show={showAdd}
          onAdd={handleAddBanner}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showEdit && editBanner && (
        <EditBannerModal
          show={showEdit}
          banner={editBanner}
          onSave={handleEditBanner}
          onClose={() => {
            setShowEdit(false);
            setEditBanner(null);
          }}
        />
      )}

      {showView && viewBanner && (
        <ViewBannerModal
          show={showView}
          banner={viewBanner}
          onClose={() => {
            setShowView(false);
            setViewBanner(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDeleteBannerModal
          show={!!deleteId}
          bannerTitle={banners.find(b => b.id === deleteId)?.title || ''}
          onConfirm={handleDeleteBanner}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

// Modal components (simplified)
const AddBannerModal: React.FC<{show: boolean, onAdd: (banner: Omit<Banner, 'id' | 'clickCount' | 'createdAt' | 'updatedAt'>) => void, onClose: () => void}> = ({ show, onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    position: 'hero' as Banner['position'],
    priority: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  if (!show) return null;

  const handleAdd = () => {
    if (!formData.title.trim() || !formData.imageUrl.trim()) return;
    onAdd({
      ...formData,
      endDate: formData.endDate || undefined
    });
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
      position: 'hero',
      priority: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Thêm banner mới</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Tiêu đề banner"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Mô tả (tùy chọn)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 h-20"
            />
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="URL hình ảnh"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
              placeholder="URL liên kết (tùy chọn)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value as Banner['position']})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="hero">Hero Banner</option>
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
                <option value="category">Category</option>
              </select>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 1})}
                placeholder="Ưu tiên"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                placeholder="Ngày kết thúc"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4"
              />
              <label className="text-gray-900 dark:text-white">Kích hoạt ngay</label>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Hủy</button>
            <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Thêm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditBannerModal: React.FC<{show: boolean, banner: Banner, onSave: (banner: Banner) => void, onClose: () => void}> = ({ show, banner, onSave, onClose }) => {
  const [formData, setFormData] = useState(banner);

  if (!show) return null;

  const handleSave = () => {
    if (!formData.title.trim() || !formData.imageUrl.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sửa banner</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Tiêu đề banner"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Mô tả (tùy chọn)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 h-20"
            />
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="URL hình ảnh"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <input
              type="url"
              value={formData.linkUrl || ''}
              onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
              placeholder="URL liên kết (tùy chọn)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value as Banner['position']})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="hero">Hero Banner</option>
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
                <option value="category">Category</option>
              </select>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 1})}
                placeholder="Ưu tiên"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({...formData, endDate: e.target.value || undefined})}
                placeholder="Ngày kết thúc"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4"
              />
              <label className="text-gray-900 dark:text-white">Đang hoạt động</label>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Hủy</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewBannerModal: React.FC<{show: boolean, banner: Banner, onClose: () => void}> = ({ show, banner, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chi tiết banner</h2>
          <div className="space-y-4">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tiêu đề</label>
                <p className="text-gray-900 dark:text-white">{banner.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vị trí</label>
                <p className="text-gray-900 dark:text-white">{banner.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ưu tiên</label>
                <p className="text-gray-900 dark:text-white">{banner.priority}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
                <p className="text-gray-900 dark:text-white">{banner.isActive ? 'Đang hoạt động' : 'Tạm dừng'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lượt click</label>
                <p className="text-gray-900 dark:text-white">{banner.clickCount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày tạo</label>
                <p className="text-gray-900 dark:text-white">{new Date(banner.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
            {banner.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
                <p className="text-gray-900 dark:text-white">{banner.description}</p>
              </div>
            )}
            {banner.linkUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Liên kết</label>
                <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{banner.linkUrl}</a>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteBannerModal: React.FC<{show: boolean, bannerTitle: string, onConfirm: () => void, onCancel: () => void}> = ({ show, bannerTitle, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-red-400">Xác nhận xóa</h2>
        <p className="mb-6 text-gray-900 dark:text-white">Bạn có chắc chắn muốn xóa banner <strong>"{bannerTitle}"</strong> không?</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Hủy</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Xóa</button>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
