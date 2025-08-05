import React, { useState, useEffect } from 'react';
import { Star, Send, Edit3, Trash2, MessageCircle } from 'lucide-react';
import { useUserStore } from '../../../stores/useUserStore';

interface Comment {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductCommentsProps {
  productId: string;
}

const ProductComments: React.FC<ProductCommentsProps> = ({ productId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  
  const user = useUserStore(state => state.user);

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(Array.isArray(data) ? data : data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId,
          content: newComment.trim(),
          rating: newRating
        })
      });

      if (response.ok) {
        setNewComment('');
        setNewRating(5);
        fetchComments(); // Refresh comments
      } else {
        alert('Lỗi khi gửi bình luận');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Lỗi khi gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const updateComment = async (commentId: string) => {
    if (!editContent.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: editContent.trim(),
          rating: editRating
        })
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        setEditRating(5);
        fetchComments(); // Refresh comments
      } else {
        alert('Lỗi khi cập nhật bình luận');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Lỗi khi cập nhật bình luận');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchComments(); // Refresh comments
      } else {
        alert('Lỗi khi xóa bình luận');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Lỗi khi xóa bình luận');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
    setEditRating(comment.rating || 5);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditRating(5);
  };

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = comments.length > 0 
    ? comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / comments.length
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">
          Đánh giá & Bình luận ({comments.length})
        </h3>
        {comments.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            {renderStars(Math.round(averageRating))}
            <span className="text-sm text-gray-600">
              ({averageRating.toFixed(1)}/5)
            </span>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      {user ? (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-medium text-gray-700">Đánh giá của bạn:</span>
            {renderStars(newRating, true, setNewRating)}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 h-fit"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Đang gửi...' : 'Gửi'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl mb-6">
          <p className="text-gray-600 mb-3">Đăng nhập để đánh giá và bình luận</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-2">Đang tải bình luận...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Chưa có bình luận nào</p>
          <p className="text-sm text-gray-500">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{comment.userName}</h4>
                    <div className="flex items-center gap-2">
                      {comment.rating && renderStars(comment.rating)}
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {user && user.id === comment.userId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(comment)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComment(comment._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment._id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Đánh giá:</span>
                    {renderStars(editRating, true, setEditRating)}
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateComment(comment._id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductComments;
