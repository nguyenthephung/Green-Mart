import React, { useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/Guest/Home';
import { FaShoppingCart, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCartStore } from '../../stores/useCartStore';
import { comments as mockComments } from '../../data/Guest/comments';
import type { Comment } from '../../data/Guest/comments';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => String(p.id) === id);
  const addToCart = useCartStore(state => state.addToCart);
  const imgRef = useRef<HTMLImageElement>(null);
  const imgRefs = React.useRef<{ [key: number]: React.RefObject<HTMLImageElement | null> }>({});

  // Thêm hook quản lý comment
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [commentInput, setCommentInput] = React.useState('');
  const [editingId, setEditingId] = React.useState<number|null>(null);
  const [editingContent, setEditingContent] = React.useState('');

  // Giả lập user hiện tại (có thể lấy từ context thực tế)
  const currentUser = { id: 2, name: 'Nguyễn Văn A', role: 'user' }; // role: 'user' | 'admin'

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  if (!product) {
    return <div className="p-6 text-center text-red-600 text-xl">Không tìm thấy sản phẩm.</div>;
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && String(p.id) !== id
  );

  // State cho ảnh lớn và index ảnh mô tả
  const [mainImage, setMainImage] = React.useState(product.image);
  const [descIndex, setDescIndex] = React.useState(0);
  const descriptionImages = product.descriptionImages || [];
  const handlePrev = () => {
    if (descriptionImages.length > 0) {
      setDescIndex((prev) => (prev - 1 + descriptionImages.length) % descriptionImages.length);
      setMainImage(descriptionImages[(descIndex - 1 + descriptionImages.length) % descriptionImages.length]);
    }
  };
  const handleNext = () => {
    if (descriptionImages.length > 0) {
      setDescIndex((prev) => (prev + 1) % descriptionImages.length);
      setMainImage(descriptionImages[(descIndex + 1) % descriptionImages.length]);
    }
  };
  React.useEffect(() => {
    if (descriptionImages.length > 0) {
      setMainImage(descriptionImages[descIndex]);
    } else {
      setMainImage(product.image);
    }
    // eslint-disable-next-line
  }, [descIndex, product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imgRef.current) {
      const img = imgRef.current;
      const cartIcon = document.getElementById('cart-fly-icon');
      if (cartIcon) {
        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        const clone = img.cloneNode(true) as HTMLImageElement;
        clone.style.position = 'fixed';
        clone.style.left = imgRect.left + 'px';
        clone.style.top = imgRect.top + 'px';
        clone.style.width = imgRect.width + 'px';
        clone.style.height = imgRect.height + 'px';
        clone.style.zIndex = '9999';
        clone.style.transition = 'all 3s cubic-bezier(.4,2,.6,1)';
        document.body.appendChild(clone);
        setTimeout(() => {
          clone.style.left = cartRect.left + cartRect.width / 2 - imgRect.width / 4 + 'px';
          clone.style.top = cartRect.top + cartRect.height / 2 - imgRect.height / 4 + 'px';
          clone.style.width = imgRect.width / 2 + 'px';
          clone.style.height = imgRect.height / 2 + 'px';
          clone.style.opacity = '0.5';
        }, 10);
        setTimeout(() => {
          document.body.removeChild(clone);
        }, 3100);
      }
    }
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: parseInt((product.price || '').replace(/\D/g, '')) || 0,
      image: product.image
    });
  };

  const handleAddToCartRelated = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (imgRefs.current[item.id]) {
      const img = imgRefs.current[item.id].current;
      const cartIcon = document.getElementById('cart-fly-icon');
      if (cartIcon && img) {
        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        const clone = img.cloneNode(true) as HTMLImageElement;
        clone.style.position = 'fixed';
        clone.style.left = imgRect.left + 'px';
        clone.style.top = imgRect.top + 'px';
        clone.style.width = imgRect.width + 'px';
        clone.style.height = imgRect.height + 'px';
        clone.style.zIndex = '9999';
        clone.style.transition = 'all 2s cubic-bezier(.4,2,.6,1)';
        clone.style.transform = 'scale(1) rotateY(0deg)';
        document.body.appendChild(clone);
        setTimeout(() => {
          clone.style.left = cartRect.left + cartRect.width / 2 - imgRect.width / 4 + 'px';
          clone.style.top = cartRect.top + cartRect.height / 2 - imgRect.height / 4 + 'px';
          clone.style.width = imgRect.width / 2 + 'px';
          clone.style.height = imgRect.height / 2 + 'px';
          clone.style.opacity = '0.7';
          clone.style.transform = 'scale(0.5) rotateY(360deg)';
          clone.style.boxShadow = '0 8px 32px 0 rgba(34,197,94,0.4)';
        }, 10);
        setTimeout(() => {
          document.body.removeChild(clone);
        }, 2100);
      }
    }
    addToCart({
      id: Number(item.id),
      name: item.name,
      price: parseInt((item.price || '').replace(/\D/g, '')) || 0,
      image: item.image
    });
  };

  // Lọc comment theo sản phẩm và đồng bộ localStorage
  React.useEffect(() => {
    const storageKey = `comments_product_${id}`;
    const local = localStorage.getItem(storageKey);
    if (local) {
      setComments(JSON.parse(local));
    } else {
      // Nếu chưa có localStorage thì lấy mock và lưu vào localStorage
      const filtered = mockComments.filter(c => c.productId === Number(id));
      setComments(filtered);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    }
  }, [id]);

  // Lưu comment vào localStorage mỗi khi thay đổi
  React.useEffect(() => {
    if (id) {
      localStorage.setItem(`comments_product_${id}`, JSON.stringify(comments));
    }
  }, [comments, id]);

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      productId: Number(id),
      userId: currentUser.id,
      userName: currentUser.name,
      content: commentInput,
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
    setCommentInput('');
  };

  const handleEditComment = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = () => {
    setComments(prev => prev.map(c => c.id === editingId ? { ...c, content: editingContent } : c));
    setEditingId(null);
    setEditingContent('');
  };

  const handleDeleteComment = (id: number) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-10 px-4 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-16">
        {/* Hình ảnh sản phẩm + gallery mô tả */}
        <div className="bg-white p-6 rounded-2xl shadow-2xl transform hover:rotate-1 transition-transform duration-500 perspective-1000">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-[400px] object-cover rounded-xl transition-transform duration-300 hover:scale-105 mb-4"
          />
          {/* Gallery mô tả */}
          {descriptionImages.length > 0 && (
            <div className="flex items-center gap-2 justify-center mt-2">
              <button
                onClick={handlePrev}
                className="p-2 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-lg hover:from-green-400 hover:to-green-600 hover:scale-110 active:scale-95 transition-all duration-200 text-2xl text-green-700 border-2 border-white"
                aria-label="prev"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transform: 'perspective(300px) rotateY(10deg)' }}
              >
                <FaChevronLeft />
              </button>
              {descriptionImages.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Mô tả ${idx + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 ${descIndex === idx ? 'border-green-600' : 'border-gray-200'}`}
                  onClick={() => { setDescIndex(idx); setMainImage(img); }}
                />
              ))}
              <button
                onClick={handleNext}
                className="p-2 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-lg hover:from-green-400 hover:to-green-600 hover:scale-110 active:scale-95 transition-all duration-200 text-2xl text-green-700 border-2 border-white"
                aria-label="next"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transform: 'perspective(300px) rotateY(-10deg)' }}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl transform hover:-rotate-1 transition-transform duration-500 perspective-1000">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-2xl text-green-600 font-semibold mb-4">{product.price}</p>

          <div className="flex items-center mb-6 text-sm text-gray-600 space-x-4">
            <span className="flex items-center"><FaCheckCircle className="text-green-500 mr-1" /> Còn hàng</span>
            <span className="flex items-center"><FaCheckCircle className="text-green-500 mr-1" /> Giao hàng 2h</span>
            <span className="flex items-center"><FaCheckCircle className="text-green-500 mr-1" /> Đổi trả 7 ngày</span>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">
            Mô tả chi tiết sản phẩm sẽ được hiển thị tại đây. Bạn có thể cung cấp thêm thông tin như thành phần, cách bảo quản, nguồn gốc,...
          </p>

          <button
            className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
            onClick={handleAddToCart}
          >
            <FaShoppingCart className="mr-2" /> Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sản phẩm liên quan</h2>
          <RelatedProductsSlider products={relatedProducts} handleAddToCartRelated={handleAddToCartRelated} imgRefs={imgRefs} />
        </div>
      )}

      {/* Bình luận sản phẩm */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-10 mt-16">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-green-500 rounded-full mr-2"></span>
          Bình luận sản phẩm
          <span className="ml-2 text-base text-gray-400 font-normal">({comments.length})</span>
        </h3>
        <div className="flex gap-2 mb-6">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=34d399&color=fff&size=48`}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full border-2 border-green-400 shadow"
          />
          <input
            type="text"
            className="flex-1 border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-green-500 bg-gray-50 text-gray-800 shadow-sm"
            placeholder="Chia sẻ cảm nhận về sản phẩm..."
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
          />
          <button
            className="bg-gradient-to-br from-green-400 to-green-600 text-white px-5 py-2 rounded-lg font-semibold shadow-lg hover:from-green-500 hover:to-green-700 transition-all duration-200"
            onClick={handleAddComment}
          >Gửi</button>
        </div>
        <div className="divide-y divide-gray-100">
          {comments.length === 0 && <div className="text-gray-400 text-center py-8">Chưa có bình luận nào. Hãy là người đầu tiên!</div>}
          {comments.map(c => (
            <div key={c.id} className="py-4 flex items-start gap-3 group relative">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.userName)}&background=bbf7d0&color=166534&size=48`}
                alt={c.userName}
                className="w-10 h-10 rounded-full border border-green-200 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-green-700 text-base truncate max-w-[120px]">{c.userName}</span>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                  {c.userId === currentUser.id && <span className="ml-2 text-xs text-green-500 bg-green-100 px-2 py-0.5 rounded">Bạn</span>}
                  {currentUser.role === 'admin' && c.userId !== currentUser.id && <span className="ml-2 text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded">Admin xóa được</span>}
                </div>
                {editingId === c.id ? (
                  <div className="flex gap-2 items-center mt-1">
                    <input
                      className="border-2 border-green-300 rounded px-2 py-1 flex-1 bg-gray-50"
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      autoFocus
                    />
                    <button className="text-green-600 font-bold px-2 py-1 hover:underline" onClick={handleSaveEdit}>Lưu</button>
                    <button className="text-gray-500 px-2 py-1 hover:underline" onClick={() => setEditingId(null)}>Hủy</button>
                  </div>
                ) : (
                  <div className="text-gray-800 text-base leading-relaxed break-words whitespace-pre-line">
                    {c.content}
                  </div>
                )}
              </div>
              {(c.userId === currentUser.id || currentUser.role === 'admin') && editingId !== c.id && (
                <div className="flex flex-col gap-1 ml-2 absolute right-0 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {c.userId === currentUser.id && (
                    <button className="text-blue-600 text-xs px-2 py-1 hover:underline" onClick={() => handleEditComment(c)}>Sửa</button>
                  )}
                  <button className="text-red-500 text-xs px-2 py-1 hover:underline" onClick={() => handleDeleteComment(c.id)}>Xóa</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RelatedProductsSlider: React.FC<{
  products: any[];
  handleAddToCartRelated: (e: React.MouseEvent, item: any) => void;
  imgRefs: React.MutableRefObject<{ [key: number]: React.RefObject<HTMLImageElement | null> }>;
}> = ({ products, handleAddToCartRelated, imgRefs }) => {
  const [start, setStart] = React.useState(0);
  const itemsPerView = 4;
  const canPrev = start > 0;
  const canNext = start + itemsPerView < products.length;

  const handlePrev = () => setStart((prev) => Math.max(0, prev - itemsPerView));
  const handleNext = () => setStart((prev) => Math.min(products.length - itemsPerView, prev + itemsPerView));

  return (
    <div className="relative">
      <button
        onClick={handlePrev}
        disabled={!canPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full shadow p-2 text-green-600 disabled:opacity-30"
        aria-label="prev"
      >
        <FaChevronLeft />
      </button>
      <div className="overflow-x-hidden">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${start * (100 / itemsPerView)}%)` }}>
          {products.slice(start, start + itemsPerView).map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl shadow-xl transform transition-all duration-400 hover:shadow-2xl hover:-translate-y-2 min-w-[220px] max-w-xs mx-2 flex-shrink-0"
            >
              <Link to={`/productdetail/${item.id}`}>
                <img
                  ref={
                    imgRefs.current[item.id] ||
                    (imgRefs.current[item.id] = React.createRef<HTMLImageElement>())
                  }
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-lg transform transition-transform duration-300 hover:scale-105"
                />
              </Link>
              <h4 className="text-lg font-medium mt-2 text-gray-800">{item.name}</h4>
              <p className="text-green-600 font-semibold">{item.price}</p>
              <button
                onClick={(e) => handleAddToCartRelated(e, item)}
                className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
              >
                <FaShoppingCart className="mr-2" /> Thêm Vào Giỏ Hàng
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handleNext}
        disabled={!canNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full shadow p-2 text-green-600 disabled:opacity-30"
        aria-label="next"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default ProductDetailPage;
