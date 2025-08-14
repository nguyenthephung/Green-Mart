import React, { useState, useEffect } from 'react';
import { useFlashSaleStore } from '../../stores/useFlashSaleStore';
import { useProductStore } from '../../stores/useProductStore';
import { Plus, Calendar, Clock, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import type { FlashSale, CreateFlashSaleRequest } from '../../types/FlashSale';

const AdminFlashSalePage: React.FC = () => {
  const {
    allFlashSales,
    loading,
    error,
    fetchAllFlashSales,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    toggleFlashSaleStatus,
    clearError
  } = useFlashSaleStore();

  const { products, fetchAll: fetchProducts } = useProductStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSale | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState<CreateFlashSaleRequest>({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    products: [],
    bannerImage: '',
    priority: 0
  });

  const [selectedProducts, setSelectedProducts] = useState<{
    productId: string;
    flashSalePrice: number;
    quantity: number;
  }[]>([]);

  useEffect(() => {
    fetchAllFlashSales();
    fetchProducts();
  }, [fetchAllFlashSales, fetchProducts]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreateFlashSale = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error('Vui lòng nhập tên Flash Sale');
        return;
      }
      
      if (!formData.startTime) {
        toast.error('Vui lòng chọn thời gian bắt đầu');
        return;
      }
      
      if (!formData.endTime) {
        toast.error('Vui lòng chọn thời gian kết thúc');
        return;
      }
      
      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
        return;
      }
      
      if (selectedProducts.length === 0) {
        toast.error('Vui lòng thêm ít nhất 1 sản phẩm vào Flash Sale');
        return;
      }
      
      // Validate products
      for (let i = 0; i < selectedProducts.length; i++) {
        const item = selectedProducts[i];
        if (!item.productId) {
          toast.error(`Vui lòng chọn sản phẩm cho dòng ${i + 1}`);
          return;
        }
        if (!item.flashSalePrice || item.flashSalePrice <= 0) {
          toast.error(`Vui lòng nhập giá Flash Sale hợp lệ cho dòng ${i + 1}`);
          return;
        }
        if (!item.quantity || item.quantity <= 0) {
          toast.error(`Vui lòng nhập số lượng hợp lệ cho dòng ${i + 1}`);
          return;
        }
        
        const selectedProduct = products.find((p: any) => p.id === item.productId);
        if (selectedProduct && item.flashSalePrice >= selectedProduct.price) {
          toast.error(`Giá Flash Sale phải thấp hơn giá gốc (${selectedProduct.price.toLocaleString('vi-VN')}₫) cho sản phẩm "${selectedProduct.name}"`);
          return;
        }
      }

      const flashSaleData = {
        ...formData,
        products: selectedProducts
      };

      await createFlashSale(flashSaleData);
      toast.success('Tạo Flash Sale thành công!');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
  // ...existing code (đã xóa log)...
    }
  };

  const handleUpdateFlashSale = async () => {
    try {
      if (!selectedFlashSale) return;

      // Convert startTime and endTime to ISO string if present
      const startTimeISO = formData.startTime ? new Date(formData.startTime).toISOString() : '';
      const endTimeISO = formData.endTime ? new Date(formData.endTime).toISOString() : '';

      const updateData = {
        ...formData,
        startTime: startTimeISO,
        endTime: endTimeISO,
        products: selectedProducts
      };

  // ...existing code (đã xóa log)...

      await updateFlashSale(selectedFlashSale._id, updateData);
      toast.success('Cập nhật Flash Sale thành công!');
      setShowEditModal(false);
      resetForm();
      fetchAllFlashSales(); // Refresh list after update
    } catch (error) {
  // ...existing code (đã xóa log)...
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error(`Lỗi cập nhật Flash Sale: ${errorMessage}`);
    }
  };

  const handleDeleteFlashSale = async () => {
    try {
      if (!selectedFlashSale) return;

      await deleteFlashSale(selectedFlashSale._id);
      toast.success('Xóa Flash Sale thành công!');
      setShowDeleteModal(false);
      setSelectedFlashSale(null);
    } catch (error) {
  // ...existing code (đã xóa log)...
    }
  };

  const handleToggleStatus = async (flashSale: FlashSale) => {
    try {
      await toggleFlashSaleStatus(flashSale._id);
      toast.success(`${flashSale.isActive ? 'Tắt' : 'Bật'} Flash Sale thành công!`);
    } catch (error) {
  // ...existing code (đã xóa log)...
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      products: [],
      bannerImage: '',
      priority: 0
    });
    setSelectedProducts([]);
    setSelectedFlashSale(null);
  };

  const openEditModal = (flashSale: FlashSale) => {
    setSelectedFlashSale(flashSale);
    setFormData({
      name: flashSale.name || '',
      description: flashSale.description || '',
      startTime: flashSale.startTime ? new Date(flashSale.startTime).toISOString().slice(0, 16) : '',
      endTime: flashSale.endTime ? new Date(flashSale.endTime).toISOString().slice(0, 16) : '',
      products: flashSale.products.map((p: any) => ({
        productId: p.productId || '',
        flashSalePrice: typeof p.flashSalePrice === 'number' ? p.flashSalePrice : 0,
        quantity: typeof p.quantity === 'number' ? p.quantity : 0
      })),
      bannerImage: flashSale.bannerImage || '',
      priority: typeof flashSale.priority === 'number' ? flashSale.priority : 0
    });
    setSelectedProducts(flashSale.products.map((p: any) => ({
      productId: p.productId || '',
      flashSalePrice: typeof p.flashSalePrice === 'number' ? p.flashSalePrice : 0,
      quantity: typeof p.quantity === 'number' ? p.quantity : 0
    })));
    setShowEditModal(true);
  };

  const addProductToFlashSale = () => {
    setSelectedProducts([
      ...selectedProducts,
      {
        productId: '',
        flashSalePrice: 0,
        quantity: 0
      }
    ]);
  };

  const removeProductFromFlashSale = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateSelectedProduct = (index: number, field: string, value: any) => {
    const updated = [...selectedProducts];
    const item = updated[index] || { productId: '', flashSalePrice: 0, quantity: 0 };
    updated[index] = {
      productId: item.productId ?? '',
      flashSalePrice: typeof item.flashSalePrice === 'number' ? item.flashSalePrice : 0,
      quantity: typeof item.quantity === 'number' ? item.quantity : 0,
      ...{ [field]: value }
    };
    setSelectedProducts(updated);
  };

  const getStatusBadge = (flashSale: FlashSale) => {
    const now = new Date();
    const startTime = new Date(flashSale.startTime);
    const endTime = new Date(flashSale.endTime);

    if (!flashSale.isActive) {
      return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">Tắt</span>;
    }

    if (now < startTime) {
      return <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Sắp diễn ra</span>;
    } else if (now >= startTime && now <= endTime) {
      return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Đang diễn ra</span>;
    } else {
      return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">Đã kết thúc</span>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Flash Sale</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tạo và quản lý các chương trình Flash Sale với thời gian giới hạn và giá khuyến mãi đặc biệt
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo Flash Sale
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Lưu ý khi tạo Flash Sale</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Giá Flash Sale phải thấp hơn giá gốc</li>
            <li>• Thời gian kết thúc phải sau thời gian bắt đầu</li>
            <li>• Số lượng giới hạn giúp tạo tính khan hiếm</li>
          </ul>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">⚡ Trạng thái Flash Sale</h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• <span className="text-blue-600">Sắp diễn ra</span>: Chưa đến giờ bắt đầu</li>
            <li>• <span className="text-green-600">Đang diễn ra</span>: Hiện tại đang hoạt động</li>
            <li>• <span className="text-red-600">Đã kết thúc</span>: Đã hết thời gian</li>
          </ul>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2">📊 Hiển thị trên trang chủ</h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Flash Sale sẽ tự động hiển thị khi đang hoạt động</li>
            <li>• Countdown timer tự động cập nhật</li>
            <li>• Độ ưu tiên cao sẽ hiển thị trước</li>
          </ul>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tên Flash Sale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {allFlashSales.map((flashSale: FlashSale) => (
                  <tr key={flashSale._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {flashSale.name}
                        </div>
                        {flashSale.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {flashSale.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDateTime(flashSale.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formatDateTime(flashSale.endTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {flashSale.products.length} sản phẩm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(flashSale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(flashSale)}
                          className={`p-1 rounded ${
                            flashSale.isActive 
                              ? 'text-green-600 hover:text-green-800' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title={flashSale.isActive ? 'Tắt' : 'Bật'}
                        >
                          {flashSale.isActive ? 
                            <ToggleRight className="w-5 h-5" /> : 
                            <ToggleLeft className="w-5 h-5" />
                          }
                        </button>
                        <button
                          onClick={() => openEditModal(flashSale)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFlashSale(flashSale);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {showCreateModal ? 'Tạo Flash Sale mới' : 'Sửa Flash Sale'}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên Flash Sale * <span className="text-xs text-gray-500">(Tên hiển thị cho khách hàng)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="VD: Flash Sale 11.11, Giảm giá cuối tuần..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Độ ưu tiên <span className="text-xs text-gray-500">(Số càng cao càng ưu tiên hiển thị)</span>
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0 = ưu tiên thấp, 10 = ưu tiên cao"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả <span className="text-xs text-gray-500">(Mô tả chi tiết về chương trình Flash Sale)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="VD: Flash Sale 24h với giảm giá lên đến 50% cho các sản phẩm hot..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thời gian bắt đầu * <span className="text-xs text-gray-500">(Khi nào Flash Sale bắt đầu)</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Thời gian hiện tại: {new Date().toLocaleString('vi-VN')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thời gian kết thúc * <span className="text-xs text-gray-500">(Khi nào Flash Sale kết thúc)</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.startTime && formData.endTime && 
                    `Thời lượng: ${Math.round((new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / (1000 * 60 * 60))} giờ`
                  }
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL Banner <span className="text-xs text-gray-500">(Hình ảnh banner quảng cáo - không bắt buộc)</span>
              </label>
              <input
                type="url"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com/banner-flash-sale.jpg"
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sản phẩm trong Flash Sale * <span className="text-xs text-gray-500">(Chọn sản phẩm và thiết lập giá khuyến mãi)</span>
                </label>
                <button
                  type="button"
                  onClick={addProductToFlashSale}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Thêm sản phẩm
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div>Sản phẩm</div>
                <div>Giá Flash Sale (₫)</div>
                <div>Số lượng hạn chế</div>
                <div>Thao tác</div>
              </div>

              {selectedProducts.map((item, index) => {
                // Always provide fallback values for controlled inputs
                const safeProductId = item.productId ?? '';
                const safeFlashSalePrice = typeof item.flashSalePrice === 'number' ? item.flashSalePrice : 0;
                const safeQuantity = typeof item.quantity === 'number' ? item.quantity : 0;
                const selectedProduct = products.find((p: any) => p.id === item.productId);
                const originalPrice = selectedProduct?.price || 0;
                const discountPercent = originalPrice > 0 && item.flashSalePrice > 0 
                  ? Math.round(((originalPrice - item.flashSalePrice) / originalPrice) * 100)
                  : 0;
                
                return (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-3 items-start border-b border-gray-200 dark:border-gray-600 pb-3">
                    <div>
                      <select
                        value={safeProductId}
                        onChange={(e) => updateSelectedProduct(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Chọn sản phẩm</option>
                        {products.map((product: any) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {(product.price || 0).toLocaleString('vi-VN')}₫
                          </option>
                        ))}
                      </select>
                      {selectedProduct && (
                        <p className="text-xs text-gray-500 mt-1">
                          Giá gốc: {originalPrice.toLocaleString('vi-VN')}₫
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        value={safeFlashSalePrice}
                        onChange={(e) => updateSelectedProduct(index, 'flashSalePrice', parseInt(e.target.value) || 0)}
                        placeholder="Nhập giá khuyến mãi"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {discountPercent > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Giảm {discountPercent}%
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        value={safeQuantity}
                        onChange={(e) => updateSelectedProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="Số lượng giới hạn"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Số lượng có thể bán trong Flash Sale
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeProductFromFlashSale(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {selectedProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p className="mb-2">Chưa có sản phẩm nào trong Flash Sale</p>
                  <p className="text-sm">Nhấn "Thêm sản phẩm" để bắt đầu thêm sản phẩm vào chương trình Flash Sale</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={showCreateModal ? handleCreateFlashSale : handleUpdateFlashSale}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : (showCreateModal ? 'Tạo Flash Sale' : 'Cập nhật')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedFlashSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mt-10">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Xác nhận xóa</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bạn có chắc chắn muốn xóa Flash Sale "<strong>{selectedFlashSale.name}</strong>"? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedFlashSale(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteFlashSale}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlashSalePage;
