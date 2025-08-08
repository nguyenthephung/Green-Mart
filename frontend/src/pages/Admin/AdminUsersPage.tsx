import React, { useState, useMemo, useEffect } from 'react';

import { useAdminUserStore } from '../../stores/useAdminUserStore';
// import { useToastStore } from '../../stores/useToastStore';
import { useToast } from '../../hooks/useNewToast';
import type { User, CreateUserRequest } from '../../services/adminUserService';
import Pagination from '../../components/Admin/Product/Pagination';
import AddUserModal from '../../components/Admin/User/AddUserModal';
import EditUserModal from '../../components/Admin/User/EditUserModal';
import ViewUserModal from '../../components/Admin/User/ViewUserModal';
import ConfirmDeleteUserModal from '../../components/Admin/User/ConfirmDeleteUserModal';

type SortField = 'name' | 'email' | 'createdAt' | 'totalOrders' | 'totalSpent';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type FilterStatus = 'all' | 'active' | 'inactive' | 'suspended';
type FilterRole = 'all' | 'user' | 'admin';

const AdminUsersPage: React.FC = () => {
  const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser } = useAdminUserStore();
  // const { showSuccess, showError } = useToastStore();
  const toast = useToast();
  
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter and sort logic
  const filteredAndSortedUsers = useMemo(() => {
    // Filter out null/undefined users and validate structure
    let filtered = users.filter(user => {
      return user && user.status && user.role;
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.phone && user.phone.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, filterStatus, filterRole, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    // Filter out invalid users for statistics
    const validUsers = users.filter(u => u && typeof u === 'object' && u.status && u.role);
    
    const total = validUsers.length;
    const active = validUsers.filter(u => u.status === 'active').length;
    const admins = validUsers.filter(u => u.role === 'admin').length;
    const totalOrders = validUsers.reduce((sum, u) => sum + (u.totalOrders || 0), 0);
    const totalSpent = validUsers.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

    return { total, active, admins, totalOrders, totalSpent };
  }, [users]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddUser = async (userData: CreateUserRequest) => {
    try {
      await createUser(userData);
      setShowAddModal(false);
      toast.success('Thành công!', 'Người dùng đã được thêm thành công');
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Lỗi!', 'Không thể thêm người dùng. Vui lòng thử lại');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser._id, userData);
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success('Thành công!', 'Thông tin người dùng đã được cập nhật');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Lỗi!', 'Không thể cập nhật thông tin người dùng. Vui lòng thử lại');
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteId) return;
    
    try {
      await deleteUser(deleteId);
      setDeleteId(null);
      toast.success('Thành công!', 'Người dùng đã được xóa khỏi hệ thống');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi!', 'Không thể xóa người dùng. Vui lòng thử lại');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">↑↓</span>;
    return <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-300">Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span>
          Thêm người dùng
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="text-blue-600 text-2xl">👥</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="text-green-600 text-2xl">✅</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quản trị viên</p>
              <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            </div>
            <div className="text-purple-600 text-2xl">👑</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalOrders}</p>
            </div>
            <div className="text-orange-600 text-2xl">📦</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Doanh thu</p>
              <p className="text-lg font-bold text-green-600">{formatPrice(stats.totalSpent)}</p>
            </div>
            <div className="text-green-600 text-2xl">💰</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="suspended">Tạm khóa</option>
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as FilterRole)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">Khách hàng</option>
            <option value="admin">Quản trị viên</option>
          </select>

          {/* Items per page */}
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={10}>10 / trang</option>
            <option value={25}>25 / trang</option>
            <option value={50}>50 / trang</option>
            <option value={100}>100 / trang</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              📋
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              ▦
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedUsers.length)} - {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} 
          trên tổng số {filteredAndSortedUsers.length} người dùng
        </p>
      </div>

      {/* User List */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300">
                      Người dùng <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('email')} className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300">
                      Email <SortIcon field="email" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('totalOrders')} className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300">
                      Đơn hàng <SortIcon field="totalOrders" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('totalSpent')} className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300">
                      Chi tiêu <SortIcon field="totalSpent" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300">
                      Tham gia <SortIcon field="createdAt" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-600 dark:text-gray-300 font-bold">{user.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {user.name}
                            {user.isVerified && <span className="text-blue-500 dark:text-blue-400" title="Đã xác thực">✓</span>}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {user.status === 'active' ? 'Hoạt động' : user.status === 'suspended' ? 'Tạm khóa' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.totalOrders || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatPrice(user.totalSpent || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteId(user._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedUsers.map((user) => (
            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-600 dark:text-gray-300 font-bold">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {user.name}
                    {user.isVerified && <span className="text-blue-500 dark:text-blue-400" title="Đã xác thực">✓</span>}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Vai trò:</span>
                  <span className={`font-medium ${
                    user.role === 'admin' ? 'text-purple-600 dark:text-purple-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
                  <span className={`font-medium ${
                    user.status === 'active' ? 'text-green-600 dark:text-green-400' :
                    user.status === 'suspended' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {user.status === 'active' ? 'Hoạt động' : user.status === 'suspended' ? 'Tạm khóa' : 'Không hoạt động'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Đơn hàng:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.totalOrders || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Chi tiêu:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(user.totalSpent || 0)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tham gia:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleViewUser(user)}
                  className="flex-1 text-center py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  👁️ Xem
                </button>
                <button
                  onClick={() => handleEditUser(user)}
                  className="flex-1 text-center py-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => setDeleteId(user._id)}
                  className="flex-1 text-center py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedUsers.length}
            itemsPerPage={itemsPerPage}
            startIndex={(currentPage - 1) * itemsPerPage + 1}
            endIndex={Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        show={showAddModal}
        onAdd={handleAddUser}
        onClose={() => setShowAddModal(false)}
      />

      {selectedUser && (
        <>
          <EditUserModal
            show={showEditModal}
            user={selectedUser}
            onSave={handleSaveUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
          />

          <ViewUserModal
            show={showViewModal}
            user={selectedUser}
            onClose={() => {
              setShowViewModal(false);
              setSelectedUser(null);
            }}
          />
        </>
      )}

      {deleteId && (
        <ConfirmDeleteUserModal
          show={!!deleteId}
          user={users.find(u => u._id === deleteId)!}
          onConfirm={handleDeleteUser}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
