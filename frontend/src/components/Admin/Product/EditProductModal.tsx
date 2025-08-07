import React, { useRef, useState, useEffect } from 'react';
import type { AdminProduct } from '../../../types/AdminProduct';
import { useCategoryStore } from '../../../stores/useCategoryStore';
import NumberInput from '../../ui/NumberInput';
import ProductDescriptionEditor from '../ProductDescriptionEditor';

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
  useEffect(() => {
    setEditProduct(product);
    setEditImagePreview(product?.image || '');
    setEditImagesPreview(product?.images || []);
    setErrors({});
    // Set parent/sub on open
    if (product) {
      const parent = categories.find((cat: any) => cat.subs.includes(product.category));
      setParentCategory(parent ? parent.id : '');
      setSubCategory(product.category || '');
    }
  }, [product, show, categories]);
  const [errors, setErrors] = useState<any>({});
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [editImagesPreview, setEditImagesPreview] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editMultiFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditProduct(product);
    setEditImagePreview(product?.image || '');
    setEditImagesPreview(product?.images || []);
    setErrors({});
  }, [product, show]);

  const validate = (prod: AdminProduct | null) => {
    const err: any = {};
    if (!prod?.name) err.name = 'Tên sản phẩm bắt buộc';
    if (!prod?.category) err.category = 'Chọn danh mục';
    if (!prod?.price || prod.price <= 0) err.price = 'Giá phải lớn hơn 0';
    if (!prod?.image) err.image = 'Chọn ảnh đại diện';
    if (!prod?.stock || prod.stock < 0) err.stock = 'Tồn kho không hợp lệ';
    return err;
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setEditImagePreview(ev.target?.result as string);
        setEditProduct(prev => prev ? { ...prev, image: ev.target?.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const arr: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
          arr.push(ev.target?.result as string);
          if (arr.length === files.length) {
            setEditImagesPreview(arr);
            setEditProduct(prev => prev ? { ...prev, images: arr } : null);
          }
        };
        reader.readAsDataURL(file);
      });
    }
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
  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4 text-green-700">Không có dữ liệu danh mục</h2>
          <button className="bg-green-600 text-white py-2 px-4 rounded font-semibold hover:bg-green-700 mt-4" onClick={onClose}>Đóng</button>
        </div>
      </div>
    );
  }
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục cha <span className="text-red-500">*</span></label>
            <select
              className={`w-full border px-3 py-2 rounded ${errors.category ? 'border-red-400' : ''}`}
              value={parentCategory}
              onChange={e => {
                setParentCategory(e.target.value);
                setSubCategory('');
                setEditProduct(prev => prev ? { ...prev, category: '' } : null);
              }}
              disabled={!Array.isArray(categories) || categories.length === 0}
              style={isDarkMode ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#374151' } : {}}
            >
              <option value="">Chọn danh mục cha...</option>
              {Array.isArray(categories) && categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            {(() => {
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
                      disabled={!Array.isArray(categories) || categories.length === 0}
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
                let unit = '';
                if (type === 'weight') unit = 'kg';
                if (type === 'count') unit = 'hộp';
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
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" className="hidden" ref={editFileInputRef} onChange={handleEditImageChange} />
                <button
                  type="button"
                  className="border px-3 py-1 rounded text-sm"
                  style={isDarkMode ? { backgroundColor: '#f3f4f6', color: '#23272f', borderColor: '#e5e7eb' } : {}}
                  onClick={() => editFileInputRef.current?.click()}
                >Chọn ảnh</button>
                {editImagePreview && <img src={editImagePreview} alt="avatar" className="w-12 h-12 object-cover rounded border" />}
              </div>
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
                <div className="flex gap-1 overflow-x-auto">
                  {editImagesPreview.map((img, idx) => <img key={idx} src={img} alt="mô tả" className="w-10 h-10 object-cover rounded border" />)}
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
