import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { ratingService } from '../../services/ratingService';
import type { Rating, CreateRatingRequest } from '../../services/ratingService';
import StarRating from '../ui/StarRating';
import InteractiveRating from '../ui/InteractiveRating';
import { FaEdit, FaTrash, FaThumbsUp } from 'react-icons/fa';

interface ProductRatingProps {
  productId: string;
  averageRating?: number;
  totalRatings?: number;
}

const ProductRating: React.FC<ProductRatingProps> = ({ 
  productId, 
  averageRating = 0, 
  totalRatings = 0 
}) => {
  const { user } = useUserStore();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRating, setEditingRating] = useState<Rating | null>(null);
  
  // Form state
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Check if user has already rated this product
  const userExistingRating = ratings.find(rating => rating.user._id === user?.id);

  useEffect(() => {
    loadRatings();
  }, [productId]);

  const loadRatings = async (pageNum = 1) => {
    setLoading(true);
    try {
      const newRatings = await ratingService.getProductRatings(productId, pageNum, 10);
      
      if (pageNum === 1) {
        setRatings(newRatings);
      } else {
        setRatings(prev => [...prev, ...newRatings]);
      }
      
      setHasMore(newRatings.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    if (userRating === 0) {
      alert('Vui lòng chọn số sao');
      return;
    }

    setSubmitting(true);
    try {
      const data: CreateRatingRequest = {
        rating: userRating,
        review: userReview.trim() || undefined,
      };

      let newRating: Rating;
      
      if (editingRating) {
        newRating = await ratingService.updateRating(editingRating._id, data);
        setRatings(prev => prev.map(r => r._id === editingRating._id ? newRating : r));
      } else {
        newRating = await ratingService.createRating(productId, data);
        setRatings(prev => [newRating, ...prev]);
      }

      // Reset form
      setUserRating(0);
      setUserReview('');
      setShowForm(false);
      setEditingRating(null);
      
      // Reload ratings to get updated data without full page reload
      setTimeout(() => {
        loadRatings(1);
        // Trigger a custom event to update product data
        window.dispatchEvent(new CustomEvent('productRatingUpdated', { 
          detail: { productId } 
        }));
      }, 500);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRating = (rating: Rating) => {
    setEditingRating(rating);
    setUserRating(rating.rating);
    setUserReview(rating.review || '');
    setShowForm(true);
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      await ratingService.deleteRating(ratingId);
      setRatings(prev => prev.filter(r => r._id !== ratingId));
      
      // Reload ratings to get updated data without full page reload
      setTimeout(() => {
        loadRatings(1);
        // Trigger a custom event to update product data
        window.dispatchEvent(new CustomEvent('productRatingUpdated', { 
          detail: { productId } 
        }));
      }, 500);
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  const handleVoteHelpful = async (ratingId: string) => {
    if (!user) {
      alert('Vui lòng đăng nhập để bình chọn');
      return;
    }

    try {
      const updatedRating = await ratingService.voteHelpful(ratingId);
      setRatings(prev => prev.map(r => r._id === ratingId ? updatedRating : r));
    } catch (error) {
      console.error('Error voting helpful:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Đánh Giá Sản Phẩm
      </h3>

      {/* Overall Rating Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size="lg" />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {totalRatings} đánh giá
            </div>
          </div>
        </div>
      </div>

      {/* User Rating Form */}
      {user && !userExistingRating && !showForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Viết Đánh Giá
          </button>
        </div>
      )}

      {user && userExistingRating && !showForm && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
            Bạn đã đánh giá sản phẩm này
          </p>
          <div className="flex items-center space-x-4">
            <StarRating rating={userExistingRating.rating} />
            <button
              onClick={() => handleEditRating(userExistingRating)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      )}

      {/* Rating Form */}
      {showForm && user && (
        <div className="mb-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingRating ? 'Chỉnh Sửa Đánh Giá' : 'Viết Đánh Giá'}
          </h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Đánh giá của bạn
            </label>
            <InteractiveRating
              initialRating={userRating}
              onRatingChange={setUserRating}
              size="lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nhận xét (tùy chọn)
            </label>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSubmitRating}
              disabled={submitting || userRating === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Đang gửi...' : editingRating ? 'Cập Nhật' : 'Gửi Đánh Giá'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingRating(null);
                setUserRating(0);
                setUserReview('');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Ratings List */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Chưa có đánh giá nào cho sản phẩm này
          </div>
        ) : (
          ratings.map((rating) => (
            <div key={rating._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {rating.user.name}
                    </span>
                    <StarRating rating={rating.rating} size="sm" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(rating.createdAt)}
                    </span>
                    {rating.isVerifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Đã mua hàng
                      </span>
                    )}
                  </div>
                  
                  {rating.review && (
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {rating.review}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <button
                      onClick={() => handleVoteHelpful(rating._id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <FaThumbsUp className="w-3 h-3" />
                      <span>Hữu ích ({rating.helpfulVotes})</span>
                    </button>
                  </div>
                </div>

                {user && rating.user._id === user.id && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEditRating(rating)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Chỉnh sửa"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRating(rating._id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Xóa"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && ratings.length > 0 && (
          <div className="text-center pt-4">
            <button
              onClick={() => loadRatings(page + 1)}
              disabled={loading}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRating;
