import React, { useRef, useState } from 'react';
import type { AdminProduct } from '../../types/AdminProduct';
import { useCategoryStore } from '../../stores/useCategoryStore';

type AddProductModalProps = {
  show: boolean;
  onClose: () => void;
  onAdd: (product: AdminProduct) => void;
};

// ...existing code...

const defaultProduct: Partial<AdminProduct> = {
  name: '',
  price: 0,
  category: '',
  image: '',
  images: [],
  stock: 0,
  status: 'active',
  description: '',
  brand: '',
  unit: '',
  isSale: false,
  discountAmount: 0,
  salePrice: 0
};

const AddProductModal: React.FC<AddProductModalProps> = ({ show, onClose, onAdd }) => {
  const [product, setProduct] = useState<Partial<AdminProduct>>(defaultProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  // Lấy danh mục từ store
  const { categories } = useCategoryStore();

  const resetForm = () => {
    setProduct(defaultProduct);
    setImagePreview('');
    setImagesPreview([]);
    setErrors({});
    setCurrentStep(1);
    setIsLoading(false);
  };

  const validate = (prod: Partial<AdminProduct>): Record<string, string> => {
    const err: Record<string, string> = {};
    if (!prod?.name?.trim()) err.name = 'Tên sản phẩm không được để trống';
    if (!prod?.category) err.category = 'Vui lòng chọn danh mục';
    if (!prod?.price || prod.price <= 0) err.price = 'Giá phải lớn hơn 0';
    if (!prod?.image?.trim()) err.image = 'Vui lòng chọn ảnh đại diện';
    if (prod?.stock === undefined || prod.stock < 0) err.stock = 'Số lượng tồn kho không hợp lệ';
    if (prod?.isSale && (!prod?.discountAmount || prod.discountAmount <= 0)) {
      err.discountAmount = 'Vui lòng nhập số tiền giảm giá';
    }
    if (prod?.isSale && prod?.discountAmount && prod?.price && prod.discountAmount >= prod.price) {
      err.discountAmount = 'Số tiền giảm giá phải nhỏ hơn giá gốc';
    }
    return err;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Kích thước ảnh không được vượt quá 5MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = ev => {
        const result = ev.target?.result as string;
        setImagePreview(result);
        setProduct(prev => ({ ...prev, image: result }));
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length > 5) {
        setErrors(prev => ({ ...prev, images: 'Chỉ được chọn tối đa 5 ảnh mô tả' }));
        return;
      }

      const arr: string[] = [];
      let loadedCount = 0;

      Array.from(files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, images: 'Mỗi ảnh không được vượt quá 5MB' }));
          return;
        }

        const reader = new FileReader();
        reader.onload = ev => {
          arr.push(ev.target?.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setImagesPreview(arr);
            setProduct(prev => ({ ...prev, images: arr }));
            setErrors(prev => ({ ...prev, images: '' }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = imagesPreview.filter((_, i) => i !== index);
    setImagesPreview(newImages);
    setProduct(prev => ({ ...prev, images: newImages }));
  };

  const calculateSalePrice = () => {
    if (product?.isSale && product?.discountAmount && product?.price) {
      return product.price - product.discountAmount;
    }
    return product?.price || 0;
  };

  const handleAdd = async () => {
    const err = validate(product);
    setErrors(err);
    
    if (Object.keys(err).length > 0) return;

    setIsLoading(true);
    
    // Calculate sale price if needed
    const newProduct: AdminProduct = {
      id: typeof product.id === 'string' && product.id ? product.id : `${Date.now()}`,
      name: product.name || '',
      price: product.price || 0,
      category: product.category || '',
      image: product.image || '',
      images: product.images || [],
      stock: product.stock || 0,
      status: product.status || 'active',
      description: product.description || '',
      brand: product.brand || '',
      unit: product.unit || '',
      isSale: !!product.isSale,
      discountAmount: product.discountAmount || 0,
      salePrice: product.isSale ? calculateSalePrice() : undefined
    };

    // Simulate API call
    setTimeout(() => {
      onAdd(newProduct);
      resetForm();
      setIsLoading(false);
    }, 1000);
  };

  const nextStep = () => {
    const err = validate(product);
    const currentStepErrors = Object.keys(err).filter(key => {
      if (currentStep === 1) return ['name', 'category', 'price', 'stock'].includes(key);
      return false;
    });
    
    if (currentStepErrors.length > 0) {
      const filteredErrors = Object.fromEntries(
        currentStepErrors.map(key => [key, err[key]])
      );
      setErrors(filteredErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: '16px'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                ➕
              </div>
              <div>
                <h2 className="text-2xl font-bold">Thêm sản phẩm mới</h2>
                <p className="text-green-100">Tạo sản phẩm mới cho cửa hàng</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              ❌
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-white' : 'text-green-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 1 ? 'bg-white text-green-600' : 'bg-green-500'
              }`}>
                1
              </div>
              <span className="hidden sm:block">Thông tin cơ bản</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 rounded"></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-white' : 'text-green-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 2 ? 'bg-white text-green-600' : 'bg-green-500'
              }`}>
                2
              </div>
              <span className="hidden sm:block">Hình ảnh & Chi tiết</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product.name || ''}
                    onChange={e => setProduct(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên sản phẩm..."
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={product.category || ''}
                    onChange={e => setProduct(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn danh mục...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá bán <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={product.price || ''}
                        onChange={e => setProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                          errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">đ</span>
                    </div>
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tồn kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={product.stock || ''}
                      onChange={e => setProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thương hiệu</label>
                    <input
                      type="text"
                      value={product.brand || ''}
                      onChange={e => setProduct(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Nhập thương hiệu..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn vị</label>
                    <input
                      type="text"
                      value={product.unit || ''}
                      onChange={e => setProduct(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="kg, hộp, chai..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={product.status || 'active'}
                    onChange={e => setProduct(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  >
                    <option value="active">✅ Đang bán</option>
                    <option value="inactive">❌ Ngừng bán</option>
                  </select>
                </div>

                {/* Sale section */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="isSale"
                      checked={!!product.isSale}
                      onChange={e => {
                        setProduct(prev => ({ 
                          ...prev, 
                          isSale: e.target.checked,
                          discountAmount: e.target.checked ? prev.discountAmount : 0,
                          salePrice: e.target.checked ? prev.salePrice : 0
                        }));
                        if (!e.target.checked) {
                          setErrors(prev => ({ ...prev, discountAmount: '' }));
                        }
                      }}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <label htmlFor="isSale" className="text-lg font-semibold text-red-700 cursor-pointer">
                      🏷️ Sản phẩm khuyến mãi
                    </label>
                  </div>

                  {product.isSale && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-red-700 mb-2">
                          Số tiền giảm giá <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={product.discountAmount || ''}
                            onChange={e => setProduct(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                              errors.discountAmount ? 'border-red-500 bg-red-50' : 'border-red-300'
                            }`}
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-3 text-red-500">đ</span>
                        </div>
                        {errors.discountAmount && <p className="text-red-500 text-sm mt-1">{errors.discountAmount}</p>}
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-red-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Giá sau giảm:</span>
                          <span className="text-lg font-bold text-red-600">
                            {calculateSalePrice().toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ảnh đại diện <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-3" />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Thay đổi ảnh
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="text-6xl mb-3">📷</div>
                        <p className="text-gray-500 mb-3">Chọn ảnh đại diện sản phẩm</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Chọn ảnh
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ảnh mô tả (tối đa 5 ảnh)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-400 transition-colors">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {imagesPreview.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {imagesPreview.length < 5 && (
                      <button
                        type="button"
                        onClick={() => multiFileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
                      >
                        + Thêm ảnh mô tả
                      </button>
                    )}
                    
                    <input
                      type="file"
                      ref={multiFileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                  </div>
                  {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả sản phẩm</label>
                <textarea
                  value={product.description || ''}
                  onChange={e => setProduct(prev => ({ ...prev, description: e.target.value }))}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-3">
            {currentStep === 2 && (
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ← Quay lại
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            
            {currentStep === 1 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Tiếp theo →
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang thêm...
                  </>
                ) : (
                  <>
                    ➕ Thêm sản phẩm
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
