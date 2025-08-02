import React, { useState } from 'react';
import { useBannerManagement } from '../../hooks/useBannerManagement';
import BannerHeader from '../../components/Admin/Banners/BannerHeader';
import BannerFilters from '../../components/Admin/Banners/BannerFilters';
import BannerGridView from '../../components/Admin/Banners/BannerGridView';
import BannerTableView from '../../components/Admin/Banners/BannerTableView';
import { AddBannerModal, EditBannerModal, DeleteConfirmModal } from '../../components/Admin/Banners/BannerModals';
import Pagination from '../../components/Admin/Product/Pagination';
import type { Banner, ViewMode } from '../../types/banner';

const AdminBannersPage: React.FC = () => {
  // Dark mode detection - improved method
  const isDarkMode = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           document.documentElement.getAttribute('data-theme') === 'dark' ||
           localStorage.getItem('theme') === 'dark';
  })[0];
  
  const {
    // State
    isLoading,
    search,
    filterPosition,
    filterStatus,
    currentPage,
    itemsPerPage,
    
    // Computed values
    currentBanners,
    totalItems,
    totalPages,
    filteredAndSortedBanners,
    
    // Setters
    setSearch,
    setFilterPosition,
    setFilterStatus,
    setCurrentPage,
    setItemsPerPage,
    
    // Handlers
    handleAddBanner,
    handleEditBanner,
    handleDeleteBanner,
    handleToggleStatus,
    handleSort,
    
    // Helper functions
    getPositionText,
    getPositionColor,
    formatDate,
    getSortIcon
  } = useBannerManagement();

  // UI State
  const [showAdd, setShowAdd] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Stats calculations
  const totalBanners = filteredAndSortedBanners.length;
  const activeBanners = filteredAndSortedBanners.filter(b => b.isActive).length;
  const inactiveBanners = totalBanners - activeBanners;
  const totalClicks = filteredAndSortedBanners.reduce((sum, b) => sum + b.clickCount, 0);

  // Handlers
  const handleAddBannerClick = () => {
    setShowAdd(true);
  };

  const handleEditBannerClick = (banner: Banner) => {
    setEditBanner(banner);
    setShowEdit(true);
  };

  const handleViewBannerClick = (banner: Banner) => {
    // TODO: Implement view modal
    console.log('View banner:', banner);
  };

  const handleDeleteBannerClick = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      handleDeleteBanner(deleteId);
      setDeleteId(null);
    }
  };

  const handleAddSubmit = (newBanner: Omit<Banner, 'id' | 'clickCount' | 'createdAt' | 'updatedAt'>) => {
    handleAddBanner(newBanner);
    setShowAdd(false);
  };

  const handleEditSubmit = (updatedBanner: Banner) => {
    handleEditBanner(updatedBanner);
    setShowEdit(false);
    setEditBanner(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BannerHeader
        isDarkMode={isDarkMode}
        totalBanners={totalBanners}
        activeBanners={activeBanners}
        inactiveBanners={inactiveBanners}
        totalClicks={totalClicks}
        isLoading={isLoading}
        onAddBanner={handleAddBannerClick}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <BannerFilters
        isDarkMode={isDarkMode}
        search={search}
        onSearchChange={setSearch}
        filterPosition={filterPosition}
        onFilterPositionChange={setFilterPosition}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        showFilters={showFilters}
      />

      {/* Main Content */}
      <div className="mb-6">
        {viewMode === 'grid' ? (
          <BannerGridView
            isDarkMode={isDarkMode}
            currentBanners={currentBanners}
            onEditBanner={handleEditBannerClick}
            onViewBanner={handleViewBannerClick}
            onDeleteBanner={handleDeleteBannerClick}
            onToggleStatus={handleToggleStatus}
            getPositionText={getPositionText}
            getPositionColor={getPositionColor}
            formatDate={formatDate}
            totalItems={totalItems}
            search={search}
          />
        ) : (
          <BannerTableView
            isDarkMode={isDarkMode}
            currentBanners={currentBanners}
            onEditBanner={handleEditBannerClick}
            onViewBanner={handleViewBannerClick}
            onDeleteBanner={handleDeleteBannerClick}
            onToggleStatus={handleToggleStatus}
            onSort={handleSort}
            getSortIcon={getSortIcon}
            getPositionText={getPositionText}
            getPositionColor={getPositionColor}
            formatDate={formatDate}
            totalItems={totalItems}
            search={search}
          />
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={totalItems}
          startIndex={(currentPage - 1) * itemsPerPage + 1}
          endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
        />
      )}

      {/* Modals */}
      <AddBannerModal
        isDarkMode={isDarkMode}
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddSubmit}
        isLoading={isLoading}
      />

      <EditBannerModal
        isDarkMode={isDarkMode}
        isOpen={showEdit}
        banner={editBanner}
        onClose={() => {
          setShowEdit(false);
          setEditBanner(null);
        }}
        onSubmit={handleEditSubmit}
        isLoading={isLoading}
      />

      <DeleteConfirmModal
        isDarkMode={isDarkMode}
        isOpen={deleteId !== null}
        bannerId={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminBannersPage;
