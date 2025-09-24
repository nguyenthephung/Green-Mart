import React, { useState, useMemo, useEffect } from 'react';
import { useBannerStore } from '../../stores/useBannerStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import type { Banner } from '../../services/bannerService';
import Pagination from '../../components/Admin/Product/Pagination';
import ImageUpload from '../../components/ui/ImageUpload';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { LoadingSpinner } from '../../components/Loading';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type SortField = 'title' | 'position' | 'priority' | 'clickCount' | 'createdAt' | 'startDate';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterPosition = 'all' | 'hero' | 'sidebar' | 'footer' | 'category' | 'sale' | 'featured';
type FilterStatus = 'all' | 'active' | 'inactive';

const AdminBanners: React.FC = () => {
  // Store state
  const {
    banners,
    loading,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
  } = useBannerStore();

  const { fetchCategories } = useCategoryStore();

  // Local state
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [viewBanner, setViewBanner] = useState<Banner | null>(null);
  const [showView, setShowView] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterPosition, setFilterPosition] = useState<FilterPosition>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load banners and categories on component mount
  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, [fetchBanners, fetchCategories]);

  // Filter and sort logic
  const filteredAndSortedBanners = useMemo(() => {
    let filtered = banners.filter(banner => {
      const matchesSearch =
        banner.title.toLowerCase().includes(search.toLowerCase()) ||
        (banner.subtitle && banner.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        (banner.description && banner.description.toLowerCase().includes(search.toLowerCase()));

      const matchesPosition = filterPosition === 'all' || banner.position === filterPosition;
      const matchesStatus =
        filterStatus === 'all' ||
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

  const handleAddBanner = async (newBanner: any) => {
    try {
      await createBanner(newBanner);
      setShowAdd(false);
    } catch (error) {
      console.error('Error creating banner:', error);
      // Error is handled by the store
    }
  };

  const handleEditBanner = async (updatedBanner: Banner) => {
    try {
      await updateBanner(updatedBanner._id, updatedBanner);
      setShowEdit(false);
      setEditBanner(null);
    } catch (error) {
      console.error('Error updating banner:', error);
      // Error is handled by the store
    }
  };

  const handleDeleteBanner = async () => {
    if (!deleteId) return;
    try {
      await deleteBanner(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting banner:', error);
      // Error is handled by the store
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBannerStatus(id);
    } catch (error) {
      console.error('Error toggling banner status:', error);
      // Error is handled by the store
    }
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
      case 'hero':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sidebar':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'footer':
        return 'bg-gray-100 text-red-800 border-gray-200';
      case 'category':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sale':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'featured':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPositionText = (position: string) => {
    switch (position) {
      case 'hero':
        return 'Hero Banner';
      case 'sidebar':
        return 'Sidebar';
      case 'footer':
        return 'Footer';
      case 'category':
        return 'Category';
      case 'sale':
        return 'Sale Banner';
      case 'featured':
        return 'Featured Banner';
      default:
        return position;
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
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 min-h-screen transition-colors duration-300">
      {/* Enhanced Header with Stats Cards */}
      <div className="bg-app-card dark:bg-app-card backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight font-serif text-gray-600 dark:text-gray-400 mt-1">
                  Quản lý Banner
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Tạo và quản lý banner quảng cáo
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Tổng Banner</p>
                    <p className="text-2xl font-bold">{totalBanners}</p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Đang hoạt động</p>
                    <p className="text-2xl font-bold">{activeBanners}</p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Hero Banner</p>
                    <p className="text-2xl font-bold">{herobanners}</p>
                  </div>
                  <MapPinIcon className="w-8 h-8 text-red-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Tổng Click</p>
                    <p className="text-2xl font-bold">{totalClicks}</p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg ${
                showFilters
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200'
                  : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 hover:shadow-xl'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              Bộ lọc
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium shadow-lg ${
                  viewMode === 'table'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-xl'
                }`}
                title="Xem dạng bảng"
              >
                <ListBulletIcon className="w-5 h-5" />
                Bảng
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium shadow-lg ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-xl'
                }`}
                title="Xem dạng thẻ"
              >
                <Squares2X2Icon className="w-5 h-5" />
                Thẻ
              </button>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm Banner
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 animate-slideDown">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FunnelIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Bộ lọc và tìm kiếm
              </h3>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setFilterPosition('all');
                setFilterStatus('all');
                setSortField('priority');
                setSortOrder('asc');
              }}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
            >
              🔄 Đặt lại
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tìm kiếm
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tiêu đề, mô tả banner..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white group-hover:shadow-lg"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Vị trí
              </label>
              <select
                value={filterPosition}
                onChange={e => setFilterPosition(e.target.value as FilterPosition)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="all">Tất cả vị trí</option>
                <option value="hero">🏆 Hero Banner</option>
                <option value="sidebar">📍 Sidebar</option>
                <option value="footer">📄 Footer</option>
                <option value="category">🗂️ Category</option>
                <option value="sale">🔥 Sale Banner</option>
                <option value="featured">⭐ Featured Banner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as FilterStatus)}
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
                onChange={e => {
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
                    <div className="flex items-center gap-1">Vị trí {getSortIcon('position')}</div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-1">Ưu tiên {getSortIcon('priority')}</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('clickCount')}
                  >
                    <div className="flex items-center gap-1">Click {getSortIcon('clickCount')}</div>
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
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {currentBanners.map(banner => (
                  <tr
                    key={banner._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-12 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                          {banner.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {banner.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(banner.position)}`}
                      >
                        {getPositionText(banner.position)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {banner.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(banner._id)}
                        className={
                          `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ` +
                          (banner.isActive
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                            : 'custom-inactive-status hover:bg-yellow-200 dark:hover:bg-yellow-800')
                        }
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
                          onClick={() => setDeleteId(banner._id)}
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
        /* Enhanced Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {currentBanners.map(banner => (
            <div
              key={banner._id}
              className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 flex flex-col"
            >
              {/* Banner Image */}
              <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden relative flex-shrink-0">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Priority Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold">
                    #{banner.priority}
                  </span>
                </div>

                {/* Status Toggle */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleStatus(banner._id)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                      banner.isActive
                        ? 'bg-green-500/90 text-white hover:bg-green-600'
                        : 'bg-gray-400/90 text-white hover:bg-gray-500'
                    }`}
                  >
                    {banner.isActive ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <XCircleIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Position Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getPositionColor(banner.position)}`}
                    >
                      {getPositionText(banner.position)}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <ChartBarIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{banner.clickCount}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {banner.description}
                      </p>
                    )}
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <div className="flex-1">
                      <div>Từ: {formatDate(banner.startDate)}</div>
                      {banner.endDate && <div>Đến: {formatDate(banner.endDate)}</div>}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                  <button
                    onClick={() => openViewModal(banner)}
                    className="flex-1 px-3 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Xem
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex-1 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteId(banner._id)}
                    className="px-3 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium flex items-center justify-center hover:scale-105"
                  >
                    <TrashIcon className="w-4 h-4" />
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
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <LoadingSpinner
            size="lg"
            text="Đang xử lý..."
            subText="Vui lòng chờ trong giây lát"
            variant="primary"
          />
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddBannerModal show={showAdd} onAdd={handleAddBanner} onClose={() => setShowAdd(false)} />
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
          bannerTitle={banners.find(b => b._id === deleteId)?.title || ''}
          onConfirm={handleDeleteBanner}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

// Modal components (enhanced with category support)
const AddBannerModal: React.FC<{
  show: boolean;
  onAdd: (banner: Omit<Banner, '_id' | 'clickCount' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}> = ({ show, onAdd, onClose }) => {
  const { categories } = useCategoryStore();
  const { handleError } = useErrorHandler();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: 'Xem thêm',
    isActive: true,
    position: 'hero' as Banner['position'],
    categoryId: '',
    priority: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  if (!show) return null;

  const handleImageUpload = (imageData: string) => {
    setFormData({ ...formData, imageUrl: imageData });
  };

  const handleAdd = async () => {
    try {
      if (!formData.title.trim()) {
        handleError('Vui lòng nhập tiêu đề banner', 'Validation Error');
        return;
      }
      if (!formData.imageUrl.trim()) {
        handleError('Vui lòng chọn hình ảnh banner', 'Validation Error');
        return;
      }

      await onAdd({
        ...formData,
        categoryId: formData.categoryId || undefined,
        endDate: formData.endDate || undefined,
      });

      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        buttonText: 'Xem thêm',
        isActive: true,
        position: 'hero',
        categoryId: '',
        priority: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    } catch (error: any) {
      handleError(error.message || 'Có lỗi khi thêm banner', 'Add Banner Error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px',
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thêm Banner Mới</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề banner"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tiêu đề phụ
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Nhập tiêu đề phụ (tùy chọn)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết banner"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hình ảnh Banner *
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={handleImageUpload}
                  className="w-full"
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  URL Liên kết
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com/target"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Văn bản nút
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Xem thêm"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Vị trí Banner
                </label>
                <select
                  value={formData.position}
                  onChange={e =>
                    setFormData({ ...formData, position: e.target.value as Banner['position'] })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="hero">🏆 Hero Banner</option>
                  <option value="sidebar">📍 Sidebar</option>
                  <option value="footer">📄 Footer</option>
                  <option value="category">🗂️ Category</option>
                  <option value="sale">🔥 Sale Banner</option>
                  <option value="featured">⭐ Featured Banner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Danh mục (tùy chọn)
                </label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  disabled={formData.position !== 'category'}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    formData.position !== 'category' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {formData.position === 'category'
                      ? 'Chọn danh mục...'
                      : 'Chỉ áp dụng cho Category Banner'}
                  </option>
                  {formData.position === 'category' &&
                    categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                {formData.position !== 'category' && (
                  <p className="text-xs text-gray-500 mt-1">
                    * Chỉ có thể chọn danh mục khi vị trí là "Category"
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ưu tiên
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={e =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                  }
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ngày kết thúc (tùy chọn)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <label className="text-gray-900 dark:text-white font-medium">Kích hoạt ngay</label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Thêm Banner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditBannerModal: React.FC<{
  show: boolean;
  banner: Banner;
  onSave: (banner: Banner) => void;
  onClose: () => void;
}> = ({ show, banner, onSave, onClose }) => {
  const { categories } = useCategoryStore();
  const { handleError } = useErrorHandler();
  const [formData, setFormData] = useState(banner);

  if (!show) return null;

  const handleImageUpload = (imageData: string) => {
    setFormData({ ...formData, imageUrl: imageData });
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        handleError('Vui lòng nhập tiêu đề banner', 'Validation Error');
        return;
      }
      if (!formData.imageUrl.trim()) {
        handleError('Vui lòng chọn hình ảnh banner', 'Validation Error');
        return;
      }

      await onSave(formData);
    } catch (error: any) {
      handleError(error.message || 'Có lỗi khi cập nhật banner', 'Edit Banner Error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px',
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <PencilSquareIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chỉnh sửa Banner</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề banner"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tiêu đề phụ
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Nhập tiêu đề phụ (tùy chọn)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết banner"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hình ảnh Banner *
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={handleImageUpload}
                  className="w-full"
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  URL Liên kết
                </label>
                <input
                  type="url"
                  value={formData.linkUrl || ''}
                  onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com/target"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Văn bản nút
                </label>
                <input
                  type="text"
                  value={formData.buttonText || 'Xem thêm'}
                  onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Xem thêm"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Vị trí Banner
                </label>
                <select
                  value={formData.position}
                  onChange={e =>
                    setFormData({ ...formData, position: e.target.value as Banner['position'] })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="hero">🏆 Hero Banner</option>
                  <option value="sidebar">📍 Sidebar</option>
                  <option value="footer">📄 Footer</option>
                  <option value="category">🗂️ Category</option>
                  <option value="sale">🔥 Sale Banner</option>
                  <option value="featured">⭐ Featured Banner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Danh mục (tùy chọn)
                </label>
                <select
                  value={formData.categoryId || ''}
                  onChange={e =>
                    setFormData({ ...formData, categoryId: e.target.value || undefined })
                  }
                  disabled={formData.position !== 'category'}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formData.position !== 'category' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {formData.position === 'category'
                      ? 'Chọn danh mục...'
                      : 'Chỉ áp dụng cho Category Banner'}
                  </option>
                  {formData.position === 'category' &&
                    categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                {formData.position !== 'category' && (
                  <p className="text-xs text-gray-500 mt-1">
                    * Chỉ có thể chọn danh mục khi vị trí là "Category"
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ưu tiên
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={e =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                  }
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ngày kết thúc (tùy chọn)
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-gray-900 dark:text-white font-medium">Đang hoạt động</label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewBannerModal: React.FC<{ show: boolean; banner: Banner; onClose: () => void }> = ({
  show,
  banner,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px',
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chi tiết banner</h2>
          <div className="space-y-4">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tiêu đề
                </label>
                <p className="text-gray-900 dark:text-white">{banner.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vị trí
                </label>
                <p className="text-gray-900 dark:text-white">{banner.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ưu tiên
                </label>
                <p className="text-gray-900 dark:text-white">{banner.priority}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái
                </label>
                <p className="text-gray-900 dark:text-white">
                  {banner.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lượt click
                </label>
                <p className="text-gray-900 dark:text-white">
                  {banner.clickCount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày tạo
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(banner.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            {banner.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mô tả
                </label>
                <p className="text-gray-900 dark:text-white">{banner.description}</p>
              </div>
            )}
            {banner.linkUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Liên kết
                </label>
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {banner.linkUrl}
                </a>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteBannerModal: React.FC<{
  show: boolean;
  bannerTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ show, bannerTitle, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px',
        }}
      >
        <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-red-400">Xác nhận xóa</h2>
        <p className="mb-6 text-gray-900 dark:text-white">
          Bạn có chắc chắn muốn xóa banner <strong>"{bannerTitle}"</strong> không?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
