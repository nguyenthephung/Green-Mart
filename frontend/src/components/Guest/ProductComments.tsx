import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/commentService';
import type { Comment } from '../../types/comment';
import { useUserStore } from '../../stores/useUserStore';

interface ProductCommentsProps {
  productId: string;
}

const ProductComments: React.FC<ProductCommentsProps> = ({ productId }) => {
  const user = useUserStore(state => state.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Load comments khi component mount hoặc productId thay đổi
  useEffect(() => {
    if (productId) {
      loadComments();
    }
  }, [productId]);

  const loadComments = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      console.log('Loading comments for product:', productId);
      const data = await commentService.getProductComments(productId);
      console.log('Loaded comments:', data);
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || !user) return;

    try {
      setLoading(true);
      console.log('Creating comment for product:', productId, 'content:', commentInput.trim());
      const newComment = await commentService.createComment({
        productId,
        content: commentInput.trim()
      });
      console.log('Created comment:', newComment);
      setComments(prev => [newComment, ...prev]);
      setCommentInput('');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      const errorMessage = error?.message || 'Có lỗi khi thêm bình luận!';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingId(comment._id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingContent.trim() || !editingId) return;

    try {
      setLoading(true);
      const updatedComment = await commentService.updateComment(editingId, {
        content: editingContent.trim()
      });
      setComments(prev => 
        prev.map(comment => 
          comment._id === editingId ? updatedComment : comment
        )
      );
      setEditingId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Có lỗi khi cập nhật bình luận!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      setLoading(true);
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Có lỗi khi xóa bình luận!');
    } finally {
      setLoading(false);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-500">Đang tải bình luận...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-green-500 rounded-full mr-2"></span>
        Bình luận sản phẩm
        <span className="ml-2 text-base text-gray-400 font-normal">({comments.length})</span>
      </h3>
      
      {/* Add Comment - chỉ hiện khi user đã đăng nhập */}
      {user && (
        <div className="flex gap-2 mb-6">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=34d399&color=fff&size=48`}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-green-400 shadow"
          />
          <input
            type="text"
            className="flex-1 border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-green-500 bg-gray-50"
            placeholder="Chia sẻ cảm nhận về sản phẩm..."
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
            disabled={loading}
          />
          <button
            className="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
            onClick={handleAddComment}
            disabled={loading || !commentInput.trim()}
          >
            {loading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      )}
      
      {/* Comments List */}
      <div className="divide-y divide-gray-100">
        {comments.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            {user ? 'Chưa có bình luận nào. Hãy là người đầu tiên!' : 'Chưa có bình luận nào.'}
          </div>
        )}
        
        {comments.map(comment => (
          <div key={comment._id} className="py-4 flex items-start gap-3 group relative">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.fullName)}&background=bbf7d0&color=166534&size=48`}
              alt={comment.user.fullName}
              className="w-10 h-10 rounded-full border border-green-200"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-green-700">{comment.user.fullName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                </span>
                {/* Hiển thị role/tag cho user */}
                {user && comment.user._id === user.id && (
                  <span className="text-xs text-green-500 bg-green-100 px-2 py-0.5 rounded">
                    Bạn
                  </span>
                )}
                {/* Hiển thị tag Admin nếu user là admin */}
                {(comment.user as any)?.role === 'admin' && (
                  <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded font-semibold">
                    Admin
                  </span>
                )}
              </div>
              
              {editingId === comment._id ? (
                <div className="flex gap-2 items-center">
                  <input
                    className="border-2 border-green-300 rounded px-2 py-1 flex-1"
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    autoFocus
                    disabled={loading}
                  />
                  <button
                    className="text-green-600 font-bold px-2 py-1 hover:underline disabled:opacity-50"
                    onClick={handleSaveEdit}
                    disabled={loading || !editingContent.trim()}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    className="text-gray-500 px-2 py-1 hover:underline"
                    onClick={() => {
                      setEditingId(null);
                      setEditingContent('');
                    }}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="text-gray-800 leading-relaxed">{comment.content}</div>
              )}
            </div>
            
            {/* Edit/Delete buttons - for comment owner OR admin */}
            {user && (comment.user._id === user.id || user.role === 'admin') && editingId !== comment._id && (
              <div className="absolute right-0 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Only show edit button for comment owner */}
                {comment.user._id === user.id && (
                  <button
                    className="text-blue-600 text-xs px-2 py-1 hover:underline disabled:opacity-50"
                    onClick={() => handleEditComment(comment)}
                    disabled={loading}
                  >
                    Sửa
                  </button>
                )}
                {/* Show delete button for comment owner or admin */}
                <button
                  className="text-red-500 text-xs px-2 py-1 hover:underline ml-2 disabled:opacity-50"
                  onClick={() => handleDeleteComment(comment._id)}
                  disabled={loading}
                >
                  {user.role === 'admin' && comment.user._id !== user.id ? 'Xóa (Admin)' : 'Xóa'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ProductComments);
