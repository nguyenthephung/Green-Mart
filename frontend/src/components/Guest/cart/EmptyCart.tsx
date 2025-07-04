import { useNavigate } from 'react-router-dom';

export default function EmptyCart() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
      <img
        src="https://ngoctamduc.vn/wp-content/uploads/2019/12/icon-cart-1.png"
        alt="Giỏ hàng trống"
        className="w-48 h-48 mb-8 opacity-80 drop-shadow-lg"
        style={{filter:'grayscale(0.2)'}}
      />
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Giỏ hàng của bạn đang trống</h2>
      <p className="text-gray-500 mb-8">Hãy tiếp tục mua sắm để thêm sản phẩm vào giỏ hàng.</p>
      <button
        className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-gray-800 transition"
        onClick={() => navigate('/home')}
      >
        Tiếp tục mua hàng
      </button>
    </div>
  );
}
