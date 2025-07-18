import React, { useRef, useState, useEffect } from 'react';
import type { AdminProduct } from '../../data/Admin/products';
import { categories } from '../../data/Guest/Home';

interface EditProductModalProps {
  show: boolean;
  product: AdminProduct | null;
  onClose: () => void;
  onSave: (product: AdminProduct) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ show, product, onClose, onSave }) => {
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(product);
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative animate-fadeIn">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><span className="material-icons text-green-500">edit</span>Sửa sản phẩm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <input className={`w-full border px-3 py-2 rounded ${errors.name ? 'border-red-400' : ''}`} placeholder="Tên sản phẩm" value={editProduct.name} onChange={e => setEditProduct(prev => prev ? { ...prev, name: e.target.value } : null)} />
            {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
            <select className={`w-full border px-3 py-2 rounded ${errors.category ? 'border-red-400' : ''}`} value={editProduct.category} onChange={e => setEditProduct(prev => prev ? { ...prev, category: e.target.value } : null)}>
              <option value="">Chọn danh mục</option>
              {categories.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            {errors.category && <div className="text-red-500 text-xs">{errors.category}</div>}
            <input className={`w-full border px-3 py-2 rounded ${errors.price ? 'border-red-400' : ''}`} placeholder="Giá" type="number" value={editProduct.price} onChange={e => setEditProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)} />
            {errors.price && <div className="text-red-500 text-xs">{errors.price}</div>}
            <input className={`w-full border px-3 py-2 rounded ${errors.stock ? 'border-red-400' : ''}`} placeholder="Tồn kho" type="number" value={editProduct.stock} onChange={e => setEditProduct(prev => prev ? { ...prev, stock: Number(e.target.value) } : null)} />
            {errors.stock && <div className="text-red-500 text-xs">{errors.stock}</div>}
            <input className="w-full border px-3 py-2 rounded" placeholder="Đơn vị (kg, hộp, ... )" value={editProduct.unit || ''} onChange={e => setEditProduct(prev => prev ? { ...prev, unit: e.target.value } : null)} />
            <input className="w-full border px-3 py-2 rounded" placeholder="Thương hiệu" value={editProduct.brand || ''} onChange={e => setEditProduct(prev => prev ? { ...prev, brand: e.target.value } : null)} />
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Ảnh đại diện <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" className="hidden" ref={editFileInputRef} onChange={handleEditImageChange} />
                <button type="button" className="border px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 text-sm" onClick={() => editFileInputRef.current?.click()}>Chọn ảnh</button>
                {editImagePreview && <img src={editImagePreview} alt="avatar" className="w-12 h-12 object-cover rounded border" />}
              </div>
              {errors.image && <div className="text-red-500 text-xs">{errors.image}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ảnh mô tả (có thể chọn nhiều)</label>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" multiple className="hidden" ref={editMultiFileInputRef} onChange={handleEditImagesChange} />
                <button type="button" className="border px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 text-sm" onClick={() => editMultiFileInputRef.current?.click()}>Chọn ảnh</button>
                <div className="flex gap-1 overflow-x-auto">
                  {editImagesPreview.map((img, idx) => <img key={idx} src={img} alt="mô tả" className="w-10 h-10 object-cover rounded border" />)}
                </div>
              </div>
            </div>
            <textarea className="w-full border px-3 py-2 rounded min-h-[80px]" placeholder="Mô tả sản phẩm" value={editProduct.description || ''} onChange={e => setEditProduct(prev => prev ? { ...prev, description: e.target.value } : null)} />
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
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
                <label htmlFor="isSale" className="text-sm font-medium text-gray-900 cursor-pointer">
                  🏷️ Sản phẩm khuyến mãi
                </label>
              </div>
              
              {editProduct.isSale && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Số tiền giảm giá (đ)</label>
                    <input 
                      className="w-full border border-gray-300 px-2 py-1 rounded text-sm" 
                      type="number" 
                      placeholder="Nhập số tiền giảm..." 
                      value={editProduct.discountAmount || ''} 
                      onChange={e => setEditProduct(prev => prev ? { ...prev, discountAmount: Number(e.target.value) } : null)} 
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
            
            <select className="w-full border px-3 py-2 rounded" value={editProduct.status} onChange={e => setEditProduct(prev => prev ? { ...prev, status: e.target.value as 'active' | 'inactive' } : null)}>
              <option value="active">✅ Đang bán</option>
              <option value="inactive">❌ Ẩn</option>
            </select>
          </div>
        </div>
        <button className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 mt-4 flex items-center justify-center gap-2" onClick={handleSave}>
          <span className="material-icons">save</span>Lưu
        </button>
      </div>
    </div>
  );
};

export default EditProductModal;
