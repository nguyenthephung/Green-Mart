import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
// import { useWishlist } from '../../reduxSlice/WishlistContext';
import { useCartStore } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useResponsive } from '../../hooks/useResponsive';
import DashboardLayout from '../../layouts/DashboardLayout';

const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist, isLoading } = useWishlistStore();
  const addToCart = useCartStore(state => state.addToCart);
  
  // Responsive hook
  const { isMobile } = useResponsive();

  const handleAddToCart = (item: any) => {
    try {
      // Chuẩn hóa dữ liệu addToCart giống CategoryPage, thêm unit nếu có
      const cartItem = {
        id: item.productId ?? item.id,
        name: item.productName ?? item.name,
        price: item.productPrice ?? item.price,
        image: item.productImage ?? item.image,
        inStock: item.inStock,
        category: item.category,
        unit: item.unit ?? 'kg',
        quantity: 1,
      };
      addToCart(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách yêu thích...</span>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-800">Danh sách yêu thích</h1>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                {items.length}
              </span>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Danh sách yêu thích trống
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích. 
              Hãy khám phá và thêm những sản phẩm bạn thích!
            </p>
            <Link
              to="/category"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              <Package className="w-5 h-5" />
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-50 min-h-full rounded-xl py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                {isMobile ? 'Yêu thích' : 'Danh sách yêu thích'}
              </h1>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs lg:text-sm font-medium">
                {items.length}
              </span>
            </div>
            
            {items.length > 0 && (
              <button
                onClick={clearWishlist}
                className="flex items-center gap-1 lg:gap-2 text-red-600 hover:text-red-700 font-medium text-sm lg:text-base"
              >
                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                {isMobile ? 'Xóa' : 'Xóa tất cả'}
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid gap-3 lg:gap-4">
          {items.map((item) => (
            <div key={item.productId ?? item.id} className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
              <div className={`flex items-center gap-3 lg:gap-6 ${isMobile ? 'flex-col sm:flex-row' : ''}`}>
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className={`object-cover rounded-xl ${
                      isMobile ? 'w-full h-32 sm:w-16 sm:h-16' : 'w-20 h-20'
                    }`}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className={`font-semibold text-gray-800 mb-1 ${
                    isMobile ? 'text-base text-center sm:text-left' : 'text-lg'
                  }`}>
                    {item.productName}
                  </h3>
                  <p className={`text-gray-500 mb-2 ${
                    isMobile ? 'text-xs text-center sm:text-left' : 'text-sm'
                  }`}>
                    {item.category}
                  </p>
                  
                  <div className={`flex items-center gap-2 lg:gap-3 ${
                    isMobile ? 'justify-center sm:justify-start' : ''
                  }`}>
                    <span className={`font-bold text-green-600 ${
                      isMobile ? 'text-lg' : 'text-xl'
                    }`}>
                      {formatPrice(item.productPrice)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.productPrice && (
                      <>
                        <span className={`text-gray-400 line-through ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          {formatPrice(item.originalPrice)}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                          -{item.discount}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 mt-2 ${
                    isMobile ? 'justify-center sm:justify-start' : ''
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${item.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {item.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 lg:gap-3 ${
                  isMobile ? 'w-full sm:w-auto justify-center' : ''
                }`}>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                    className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl font-medium transition-all text-sm lg:text-base ${
                      item.inStock
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4" />
                    {isMobile ? 'Thêm' : 'Thêm vào giỏ'}
                  </button>
                  
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            to="/category"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            <Package className="w-5 h-5" />
            Tiếp tục mua sắm
          </Link>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WishlistPage;
