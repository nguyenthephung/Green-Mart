import React, { useState, useMemo } from 'react';


import { adminUsers } from '../../data/Admin/users';
import type { User } from '../../data/Admin/users';
import Pagination from '../../components/Admin/Pagination';

type SortField = 'name' | 'email' | 'joinDate' | 'lastLogin' | 'totalOrders' | 'totalSpent';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'active' | 'inactive' | 'suspended';
type FilterRole = 'all' | 'admin' | 'user' | 'staff';

const AdminUsers: React.FC = () => {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  React.useEffect(() => {
    const checkDark = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Helper for dark mode style
  const darkBg = isDarkMode ? '#18181b' : '#f9fafb';
  const [users, setUsers] = useState<User[]>(adminUsers);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [showView, setShowView] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and sort logic
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase()) ||
                          user.phone.includes(search);
      
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesStatus && matchesRole;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'joinDate':
          aValue = new Date(a.joinDate).getTime();
          bValue = new Date(b.joinDate).getTime();
          break;
        case 'lastLogin':
          aValue = new Date(a.lastLogin).getTime();
          bValue = new Date(b.lastLogin).getTime();
          break;
        case 'totalOrders':
          aValue = a.totalOrders;
          bValue = b.totalOrders;
          break;
        case 'totalSpent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;

        default:
          return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [users, search, sortField, sortOrder, filterStatus, filterRole]);

  // Pagination calculations
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterRole, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ...rest of logic...
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const verifiedUsers = users.filter(u => u.isVerified).length;
  const totalSpent = users.reduce((sum, u) => sum + u.totalSpent, 0);

  // (no code after the return statement)
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleToggleStatus = (id: number, newStatus: 'active' | 'inactive' | 'suspended') => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: newStatus } : u
    ));
  };

  const openEditModal = (user: User) => {
    setEditUser(user);
    setShowEdit(true);
  };

  const openViewModal = (user: User) => {
    setViewUser(user);
    setShowView(true);
  };

  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    setIsLoading(true);
    setTimeout(() => {
      const id = Math.max(...users.map(u => u.id)) + 1;
      setUsers([...users, { ...newUser, id }]);
      setShowAdd(false);
      setIsLoading(false);
    }, 800);
  };

  const handleEditUser = (updatedUser: User) => {
    setIsLoading(true);
    setTimeout(() => {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setShowEdit(false);
      setEditUser(null);
      setIsLoading(false);
    }, 800);
  };

  const handleDeleteUser = () => {
    if (!deleteId) return;
    setIsLoading(true);
    setTimeout(() => {
      setUsers(users.filter(u => u.id !== deleteId));
      setDeleteId(null);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div
      className="space-y-6 min-h-screen transition-colors duration-300"
      style={{ background: darkBg }}
    >
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span>Tổng: <span className="font-semibold text-blue-600">{totalUsers}</span> người dùng</span>
              <span>Hoạt động: <span className="font-semibold text-green-600">{activeUsers}</span></span>
              <span>Đã xác thực: <span className="font-semibold text-purple-600">{verifiedUsers}</span></span>
              <span>Tổng chi tiêu: <span className="font-semibold text-orange-600">{formatPrice(totalSpent)}</span></span>
              {totalItems !== totalUsers && (
                <span>Hiển thị: <span className="font-semibold text-indigo-600">{totalItems}</span></span>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hiển thị:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">mục/trang</span>
            </div>
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
              Thêm người dùng
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-slideDown">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc và tìm kiếm</h3>
            <button
              onClick={() => {
                setSearch('');
                setFilterStatus('all');
                setFilterRole('all');
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
                  placeholder="Tên, email, số điện thoại..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white text-gray-900"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as FilterRole)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white text-gray-900"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">👑 Admin</option>
                <option value="staff">👨‍💼 Nhân viên</option>
                <option value="user">👤 Khách hàng</option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white text-gray-900"
              >
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="joinDate-desc">Tham gia mới nhất</option>
                <option value="joinDate-asc">Tham gia lâu nhất</option>
                <option value="lastLogin-desc">Đăng nhập mới nhất</option>
                <option value="totalOrders-desc">Đơn hàng nhiều nhất</option>
                <option value="totalSpent-desc">Chi tiêu nhiều nhất</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Users Display */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                style={{ background: isDarkMode ? '#23272f' : '#f9fafb', color: isDarkMode ? '#fff' : '#6b7280', borderBottom: isDarkMode ? '1px solid #23272f' : '1px solid #e5e7eb' }}
              >
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1">
                      Liên hệ {getSortIcon('email')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('totalOrders')}
                  >
                    <div className="flex items-center gap-1">
                      Đơn hàng {getSortIcon('totalOrders')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('totalSpent')}
                  >
                    <div className="flex items-center gap-1">
                      Chi tiêu {getSortIcon('totalSpent')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('lastLogin')}
                  >
                    <div className="flex items-center gap-1">
                      Đăng nhập {getSortIcon('lastLogin')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody style={{ background: isDarkMode ? '#23272f' : '#fff' }}>
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors"
                    style={{ background: isDarkMode ? '#23272f' : '#fff', cursor: 'pointer' }}
                    onMouseEnter={e => { if (e.currentTarget) e.currentTarget.style.background = isDarkMode ? '#18181b' : '#f3f4f6'; }}
                    onMouseLeave={e => { if (e.currentTarget) e.currentTarget.style.background = isDarkMode ? '#23272f' : '#fff'; }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{user.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {user.name}
                            {user.isVerified && <span className="text-blue-500 dark:text-blue-400" title="Đã xác thực">✓</span>}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' && '👑'} {user.role === 'staff' && '👨‍💼'} {user.role === 'user' && '👤'}
                        {user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => handleToggleStatus(user.id, e.target.value as any)}
                        className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${getStatusColor(user.status)}`}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                        <option value="suspended">Tạm khóa</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(user.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(user)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 p-1 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteId(user.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded transition-colors"
                          title="Xóa"
                          disabled={user.role === 'admin'}
                        >
                          {user.role === 'admin' ? '🔒' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalItems === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không tìm thấy người dùng</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có người dùng nào'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentUsers.map((user) => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-300 font-bold text-lg">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? '✅' : user.status === 'suspended' ? '🚫' : '⏸️'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role === 'admin' && '👑'} {user.role === 'staff' && '👨‍💼'} {user.role === 'user' && '👤'}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  {user.name}
                  {user.isVerified && <span className="text-blue-500 dark:text-blue-400" title="Đã xác thực">✓</span>}
                </h3>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{user.email}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{user.phone}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-base font-bold text-blue-600 dark:text-blue-400">{user.totalOrders}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Đơn hàng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-green-600 dark:text-green-400">{formatPrice(user.totalSpent)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Chi tiêu</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <div>Tham gia: {formatDate(user.joinDate)}</div>
                  <div>Đăng nhập: {formatDateTime(user.lastLogin)}</div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => openViewModal(user)}
                    className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="flex-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteId(user.id)}
                    disabled={user.role === 'admin'}
                    className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {user.role === 'admin' ? '🔒' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {totalItems === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không tìm thấy người dùng</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có người dùng nào'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-700 dark:text-gray-300">Đang xử lý...</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddUserModal
          show={showAdd}
          onAdd={handleAddUser}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showEdit && editUser && (
        <EditUserModal
          show={showEdit}
          user={editUser}
          onSave={handleEditUser}
          onClose={() => {
            setShowEdit(false);
            setEditUser(null);
          }}
        />
      )}

      {showView && viewUser && (
        <ViewUserModal
          show={showView}
          user={viewUser}
          onClose={() => {
            setShowView(false);
            setViewUser(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDeleteUserModal
          show={!!deleteId}
          userName={users.find(u => u.id === deleteId)?.name || ''}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

// Modal components (simplified for now)
const AddUserModal: React.FC<{show: boolean, onAdd: (user: Omit<User, 'id'>) => void, onClose: () => void}> = ({ show, onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'admin' | 'user' | 'staff',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    address: ''
  });

  if (!show) return null;

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    onAdd({
      ...formData,
      isVerified: false,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      address: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Thêm người dùng mới</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Họ và tên"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="Số điện thoại"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value as any})}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="user">👤 Khách hàng</option>
            <option value="staff">👨‍💼 Nhân viên</option>
            <option value="admin">👑 Admin</option>
          </select>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Địa chỉ"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Hủy</button>
          <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Thêm</button>
        </div>
      </div>
    </div>
  );
};

const EditUserModal: React.FC<{show: boolean, user: User, onSave: (user: User) => void, onClose: () => void}> = ({ show, user, onSave, onClose }) => {
  const [formData, setFormData] = useState(user);

  if (!show) return null;

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sửa thông tin người dùng</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Họ và tên"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="Số điện thoại"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value as any})}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="user">👤 Khách hàng</option>
            <option value="staff">👨‍💼 Nhân viên</option>
            <option value="admin">👑 Admin</option>
          </select>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Địa chỉ"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isVerified}
              onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
              className="w-4 h-4"
            />
            <label className="text-gray-900 dark:text-white">Đã xác thực</label>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Hủy</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Lưu</button>
        </div>
      </div>
    </div>
  );
};

const ViewUserModal: React.FC<{show: boolean, user: User, onClose: () => void}> = ({ show, user, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chi tiết người dùng</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-600 dark:text-gray-300 font-bold text-xl">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">ID: {user.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Điện thoại</label>
              <p className="text-gray-900 dark:text-white">{user.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vai trò</label>
              <p className="text-gray-900 dark:text-white">{user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
              <p className="text-gray-900 dark:text-white">{user.status === 'active' ? 'Hoạt động' : user.status === 'suspended' ? 'Tạm khóa' : 'Không hoạt động'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tham gia</label>
              <p className="text-gray-900 dark:text-white">{new Date(user.joinDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Đăng nhập cuối</label>
              <p className="text-gray-900 dark:text-white">{new Date(user.lastLogin).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tổng đơn hàng</label>
              <p className="text-gray-900 dark:text-white">{user.totalOrders}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tổng chi tiêu</label>
              <p className="text-gray-900 dark:text-white">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.totalSpent)}</p>
            </div>
          </div>
          {user.address && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label>
              <p className="text-gray-900 dark:text-white">{user.address}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Đóng</button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteUserModal: React.FC<{show: boolean, userName: string, onConfirm: () => void, onCancel: () => void}> = ({ show, userName, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-red-400">Xác nhận xóa</h2>
        <p className="mb-6 text-gray-900 dark:text-white">Bạn có chắc chắn muốn xóa người dùng <strong>"{userName}"</strong> không?</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Hủy</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Xóa</button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
