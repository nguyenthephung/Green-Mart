import { useState, useEffect, useMemo } from 'react';
import type { Banner, SortField, SortOrder, FilterPosition, FilterStatus } from '../types/banner';
import { adminBanners } from '../data/Admin/banners';

export const useBannerManagement = () => {
  const [banners, setBanners] = useState<Banner[]>(adminBanners);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterPosition, setFilterPosition] = useState<FilterPosition>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper function to get position text
  const getPositionText = (position: string): string => {
    switch (position) {
      case 'hero':
        return 'Hero Banner';
      case 'sidebar':
        return 'Sidebar';
      case 'footer':
        return 'Footer';
      case 'category':
        return 'Category';
      default:
        return position;
    }
  };

  // Helper function to get position color
  const getPositionColor = (position: string): string => {
    switch (position) {
      case 'hero':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sidebar':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'footer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'category':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and sort logic
  const filteredAndSortedBanners = useMemo(() => {
    let filtered = banners.filter(banner => {
      const matchesSearch =
        banner.title.toLowerCase().includes(search.toLowerCase()) ||
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
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'startDate':
          aValue = a.startDate ? new Date(a.startDate) : new Date(0);
          bValue = b.startDate ? new Date(b.startDate) : new Date(0);
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

  // Pagination logic
  const totalItems = filteredAndSortedBanners.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBanners = filteredAndSortedBanners.slice(startIndex, startIndex + itemsPerPage);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CRUD operations
  const handleAddBanner = (
    newBanner: Omit<Banner, 'id' | 'clickCount' | 'createdAt' | 'updatedAt'>
  ) => {
    setIsLoading(true);
    setTimeout(() => {
      const id = Math.max(...banners.map(b => b.id)) + 1;
      const now = new Date().toISOString();
      setBanners([
        ...banners,
        {
          ...newBanner,
          id,
          clickCount: 0,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      setIsLoading(false);
    }, 800);
  };

  const handleEditBanner = (updatedBanner: Banner) => {
    setIsLoading(true);
    setTimeout(() => {
      setBanners(
        banners.map(b =>
          b.id === updatedBanner.id ? { ...updatedBanner, updatedAt: new Date().toISOString() } : b
        )
      );
      setIsLoading(false);
    }, 800);
  };

  const handleDeleteBanner = (id: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setBanners(banners.filter(b => b.id !== id));
      setIsLoading(false);
    }, 500);
  };

  const handleToggleStatus = (id: number) => {
    setBanners(
      banners.map(b =>
        b.id === id ? { ...b, isActive: !b.isActive, updatedAt: new Date().toISOString() } : b
      )
    );
  };

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPosition, filterStatus]);

  // Get sort icon
  const getSortIcon = (field: SortField): string => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    // State
    banners,
    search,
    sortField,
    sortOrder,
    filterPosition,
    filterStatus,
    isLoading,
    currentPage,
    itemsPerPage,

    // Computed values
    filteredAndSortedBanners,
    currentBanners,
    totalItems,
    totalPages,

    // Setters
    setSearch,
    setSortField,
    setSortOrder,
    setFilterPosition,
    setFilterStatus,
    setCurrentPage,
    setItemsPerPage,

    // Handlers
    handleSort,
    handleAddBanner,
    handleEditBanner,
    handleDeleteBanner,
    handleToggleStatus,

    // Helper functions
    getSortIcon,
    getPositionText,
    getPositionColor,
    formatDate,
  };
};
