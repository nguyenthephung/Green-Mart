import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/Guest/Home';
import { FaShoppingCart, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCart } from '../../reduxSlice/CartContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => String(p.id) === id);
  const { addToCart } = useCart();
  const imgRef = useRef<HTMLImageElement>(null);
  const imgRefs = React.useRef<{ [key: number]: React.RefObject<HTMLImageElement | null> }>({});

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
      price: product.price,
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
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl shadow-xl transform transition-all duration-400 hover:shadow-2xl hover:-translate-y-2"
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
      )}
    </div>
  );
};

export default ProductDetailPage;
