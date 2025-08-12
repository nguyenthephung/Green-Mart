import React, { useRef, useState, useEffect } from 'react';
import type { AdminProduct } from '../../../types/AdminProduct';
import { useCategoryStore } from '../../../stores/useCategoryStore';
import NumberInput from '../../ui/NumberInput';
import ProductDescriptionEditor from '../ProductDescriptionEditor';
import ImageUpload from '../../ui/ImageUpload';
import { useFileUpload } from '../../../hooks/useFileUpload';

interface EditProductModalProps {
  show: boolean;
  product: AdminProduct | null;
  onClose: () => void;
  onSave: (product: AdminProduct) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ show, product, onClose, onSave }) => {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(product);
  const [parentCategory, setParentCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const { categories = [] } = useCategoryStore();
  const { uploadFile } = useFileUpload();
  
  useEffect(() => {
    setEditProduct(product);
    setEditImagesPreview(product?.images || []);
    setErrors({});
    // Set parent/sub on open
    if (product) {
      const parent = categories.find((cat: any) => cat.subs.includes(product.category));
      if (parent) {
        // Category exists as subcategory
        setParentCategory(parent.id);
        setSubCategory(product.category);
      } else {
        // Check if it's a parent category
        const parentCat = categories.find((cat: any) => cat.name === product.category);
        if (parentCat) {
          setParentCategory(parentCat.id);
          setSubCategory('');
          // Update product category to use parent name
          setEditProduct(prev => prev ? { ...prev, category: parentCat.name } : null);
        } else {
          // Category doesn't exist - reset to empty
          setParentCategory('');
          setSubCategory('');
          // Keep original category name for display
        }
      }
    }
  }, [product, show, categories]);
  const [errors, setErrors] = useState<any>({});
  const [editImagesPreview, setEditImagesPreview] = useState<string[]>([]);
  const editMultiFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditProduct(product);
    setEditImagesPreview(product?.images || []);
    setErrors({});
  }, [product, show]);

  const validate = (prod: AdminProduct | null) => {
    const err: any = {};
    if (!prod?.name) err.name = 'Tên sản phẩm bắt buộc';
    // Only require category if categories are available
    if (Array.isArray(categories) && categories.length > 0 && !prod?.category) {
      err.category = 'Chọn danh mục';
    }
    if (!prod?.price || prod.price <= 0) err.price = 'Giá phải lớn hơn 0';
    if (!prod?.image) err.image = 'Chọn ảnh đại diện';
    if (!prod?.stock || prod.stock < 0) err.stock = 'Tồn kho không hợp lệ';
    return err;
  };

  // Handle main image upload using ImageUpload component
  const handleMainImageUpload = (imageUrl: string) => {
    setEditProduct(prev => prev ? { ...prev, image: imageUrl } : null);
  };

  const handleEditImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const fileArray = Array.from(files);
        const uploadPromises = fileArray.map(file => uploadFile(file, 'products'));
        const uploadResults = await Promise.all(uploadPromises);

        const successfulUploads = uploadResults
          .filter((result: any) => result && result.url)
          .map((result: any) => result.url);

        if (successfulUploads.length > 0) {
          setEditImagesPreview(prev => prev.concat(successfulUploads));
          setEditProduct(prev => prev ? {
            ...prev,
            images: (prev.images || []).concat(successfulUploads)
          } : null);
        }
      } catch (error) {
        console.error('Error uploading additional images:', error);
      }
    }
    // Always reset input so user can re-upload same files
    if (editMultiFileInputRef.current) editMultiFileInputRef.current.value = '';
  };

  const handleSave = () => {
    const err = validate(editProduct);
    setErrors(err);
    if (Object.keys(err).length > 0 || !editProduct) return;
    
    // Calculate salePrice if product is on sale
    const updatedProduct = {
      ...editProduct,
      salePrice: editProduct.isSale && editProduct.discountAmount 
        ? editProduct.price - editProduct.discountAmount 
        : undefined
    };
    
    onSave(updatedProduct);
  };

  if (!show || !editProduct) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl my-8 animate-fadeIn">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={isDarkMode ? { color: '#fff' } : { color: '#15803d' }}>Sửa sản phẩm</h2>
        <div className="max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <input className={`w-full border px-3 py-2 rounded ${errors.name ? 'border-red-400' : ''}`} placeholder="Tên sản phẩm" value={editProduct.name} onChange={e => setEditProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}} />
            {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Danh mục cha {Array.isArray(categories) && categories.length > 0 && <span className="text-red-500">*</span>}
            </label>
            
            {/* No categories warning */}
            {(!Array.isArray(categories) || categories.length === 0) && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <span>⚠️</span>
                  <span className="font-medium">Không có dữ liệu danh mục</span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">
                  Không thể tải danh mục. Bạn có thể chỉnh sửa các thông tin khác và lưu sản phẩm với danh mục hiện tại.
                </p>
              </div>
            )}
            
            {/* Current category display when no categories available */}
            {(!Array.isArray(categories) || categories.length === 0) && editProduct?.category && (
              <div className="mb-3 p-2 bg-gray-100 border border-gray-300 rounded-lg">
                <div className="text-sm text-gray-600">Danh mục hiện tại:</div>
                <div className="font-medium text-gray-800">{editProduct.category}</div>
              </div>
            )}

            {(() => {
              // Check if current product category is deleted
              const currentCategoryExists = categories.some((cat: any) => 
                cat.name === editProduct?.category || cat.subs?.includes(editProduct?.category)
              );
              
              if (editProduct?.category && Array.isArray(categories) && categories.length > 0 && !currentCategoryExists) {
                return (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <span>⚠️</span>
                      <span className="font-medium">Cảnh báo: Danh mục đã bị xóa</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Danh mục "<strong>{editProduct.category}</strong>" đã bị xóa. Vui lòng chọn danh mục mới cho sản phẩm này.
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Category select - only show if categories are available */}
            {Array.isArray(categories) && categories.length > 0 && (
              <select
                className={`w-full border px-3 py-2 rounded ${errors.category ? 'border-red-400' : ''}`}
                value={parentCategory}
                onChange={e => {
                  setParentCategory(e.target.value);
                  setSubCategory('');
                  setEditProduct(prev => prev ? { ...prev, category: '' } : null);
                }}
                style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
              >
                <option value="">Chọn danh mục cha...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            )}
            {(() => {
              // Only show subcategory if categories are available
              if (!Array.isArray(categories) || categories.length === 0) return null;
              
              const parentCat = categories.find((cat: any) => cat.id === parentCategory);
              if (parentCategory && parentCat && Array.isArray(parentCat.subs) && parentCat.subs.length > 0) {
                return (
                  <div className="mt-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục con <span className="text-red-500">*</span></label>
                    <select
                      className={`w-full border px-3 py-2 rounded ${errors.category ? 'border-red-400' : ''}`}
                      value={subCategory}
                      onChange={e => {
                        setSubCategory(e.target.value);
                        setEditProduct(prev => prev ? { ...prev, category: e.target.value } : null);
                      }}
                      style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
                    >
                      <option value="">Chọn danh mục con...</option>
                      {parentCat.subs.map((sub: string, idx: number) => (
                        <option key={sub + '-' + idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })()}
            {errors.category && <div className="text-red-500 text-xs">{errors.category}</div>}
            <NumberInput
              value={editProduct.price || 0}
              onChange={(value) => setEditProduct(prev => prev ? { ...prev, price: value } : null)}
              placeholder="Giá"
            />
            {errors.price && <div className="text-red-500 text-xs">{errors.price}</div>}
            <input className={`w-full border px-3 py-2 rounded ${errors.stock ? 'border-red-400' : ''}`} placeholder="Tồn kho" type="number" value={editProduct.stock} onChange={e => setEditProduct(prev => prev ? { ...prev, stock: Number(e.target.value) } : null)}
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}} />
            {errors.stock && <div className="text-red-500 text-xs">{errors.stock}</div>}
            <label className="block text-sm font-semibold text-gray-700 mb-2">Loại sản phẩm <span className="text-red-500">*</span></label>
            <select
              className="w-full border px-3 py-2 rounded mb-2"
              value={editProduct.type || 'count'}
              onChange={e => {
                const type = e.target.value as 'count' | 'weight';
                // Only update unit if it's not already set or if it doesn't match the type
                let unit = editProduct.unit || '';
                if (type === 'weight' && (!unit || unit === 'hộp')) unit = 'kg';
                if (type === 'count' && (!unit || unit === 'kg')) unit = 'hộp';
                setEditProduct(prev => prev ? { ...prev, type, unit } : null);
              }}
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
            >
              <option value="count">Đếm số lượng (hộp, chai, cái...)</option>
              <option value="weight">Cân ký (kg, g...)</option>
            </select>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn vị <span className="text-red-500">*</span></label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={editProduct.unit || ''}
              onChange={e => setEditProduct(prev => prev ? { ...prev, unit: e.target.value } : null)}
              disabled={!editProduct.type}
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
            >
              <option value="">Chọn đơn vị...</option>
              {editProduct.type === 'weight' ? (
                <>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </>
              ) : (
                <>
                  <option value="hộp">hộp</option>
                  <option value="chai">chai</option>
                  <option value="cái">cái</option>
                  <option value="bịch">bịch</option>
                </>
              )}
            </select>
            <input className="w-full border px-3 py-2 rounded" placeholder="Thương hiệu" value={editProduct.brand || ''} onChange={e => setEditProduct(prev => prev ? { ...prev, brand: e.target.value } : null)}
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}} />
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={isDarkMode ? { color: '#fff' } : {}}>Ảnh đại diện <span className="text-red-500">*</span></label>
              <ImageUpload
                value={editProduct?.image || ''}
                onChange={handleMainImageUpload}
                placeholder="Chọn ảnh đại diện sản phẩm"
                maxSize={5}
                className="w-full"
              />
              {errors.image && <div className="text-red-500 text-xs">{errors.image}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={isDarkMode ? { color: '#fff' } : {}}>Ảnh mô tả (có thể chọn nhiều)</label>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" multiple className="hidden" ref={editMultiFileInputRef} onChange={handleEditImagesChange} />
                <button
                  type="button"
                  className="border px-3 py-1 rounded text-sm"
                  style={isDarkMode ? { backgroundColor: '#f3f4f6', color: '#23272f', borderColor: '#e5e7eb' } : {}}
                  onClick={() => editMultiFileInputRef.current?.click()}
                >Chọn ảnh</button>
                <div className="flex gap-3 overflow-x-auto py-2">
                  {editImagesPreview.map((img, idx) => (
                    <div key={idx} className="relative group w-24 h-24">
                      <img src={img} alt="mô tả" className="w-full h-full object-cover rounded-lg border shadow" />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = editImagesPreview.filter((_, i) => i !== idx);
                          setEditImagesPreview(newImages);
                          setEditProduct(prev => prev ? { ...prev, images: newImages } : null);
                          // If all images are removed, reset the file input
                          if (newImages.length === 0 && editMultiFileInputRef.current) {
                            editMultiFileInputRef.current.value = '';
                          }
                        }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full text-base font-bold hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center justify-center"
                        title="Xóa ảnh"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả sản phẩm</label>
              <ProductDescriptionEditor
                product={editProduct}
                onChange={(field, value) => setEditProduct(prev => prev ? { ...prev, [field]: value } : null)}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox" 
                    id="isSale"
                    checked={!!editProduct.isSale} 
                    onChange={e => setEditProduct(prev => prev ? { 
                      ...prev, 
                      isSale: e.target.checked,
                      discountAmount: e.target.checked ? prev.discountAmount : 0
                    } : null)} 
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isSale" className="text-sm font-medium cursor-pointer" style={{ color: '#111' }}>
                    🏷️ Sản phẩm khuyến mãi
                  </label>
                </div>
                {editProduct.isSale && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#111' }}>Số tiền giảm giá (đ)</label>
                      <NumberInput
                        value={editProduct.discountAmount || 0}
                        onChange={(value) => setEditProduct(prev => prev ? { ...prev, discountAmount: value } : null)}
                        placeholder="Nhập số tiền giảm..."
                      />
                    </div>
                    {editProduct.discountAmount && editProduct.discountAmount > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="text-xs text-gray-600">Giá gốc: <span className="font-medium">{editProduct.price?.toLocaleString()}đ</span></div>
                        <div className="text-xs text-red-600">Giảm: <span className="font-medium">{editProduct.discountAmount.toLocaleString()}đ</span></div>
                        <div className="text-sm font-bold text-green-700">
                          Giá bán: {((editProduct.price || 0) - editProduct.discountAmount).toLocaleString()}đ
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox" 
                    id="isFeatured"
                    checked={!!editProduct.isFeatured} 
                    onChange={e => setEditProduct(prev => prev ? { ...prev, isFeatured: e.target.checked } : null)} 
                    className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-yellow-700 cursor-pointer">
                    ⭐ Sản phẩm nổi bật
                  </label>
                </div>
                <div className="text-xs text-gray-500">Đánh dấu để sản phẩm xuất hiện ở mục nổi bật trên trang chủ.</div>
              </div>
            </div>
            
            <select className="w-full border px-3 py-2 rounded" value={editProduct.status} onChange={e => setEditProduct(prev => prev ? { ...prev, status: e.target.value as 'active' | 'inactive' } : null)}
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}>
              <option value="active">✅ Đang bán</option>
              <option value="inactive">❌ Ẩn</option>
            </select>
          </div>
        </div>
        </div>
        <button className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 mt-4 flex items-center justify-center gap-2" onClick={handleSave}>
          <span className="material-icons">Lưu</span>
        </button>
      </div>
    </div>
  );
};

export default EditProductModal;
