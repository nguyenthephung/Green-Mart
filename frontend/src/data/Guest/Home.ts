export const slides = [
  { id: 1, image: 'https://via.placeholder.com/1200x400?text=Slide+1', title: 'Chào Mừng đến GreenMart', subtitle: 'Siêu thị tiện lợi cho mọi nhà!' },
  { id: 2, image: 'https://via.placeholder.com/1200x400?text=Slide+2', title: 'Tươi Ngon Mỗi Ngày', subtitle: 'Thực phẩm sạch, an toàn, giá tốt!' },
  { id: 3, image: 'https://via.placeholder.com/1200x400?text=Slide+3', title: 'Ưu Đãi Đặc Biệt', subtitle: 'Mua nhiều tiết kiệm nhiều!' },
];

export const products = [
  // Thịt các loại
  { id: 1, name: 'Thịt Heo Tươi', discountAmount: 40000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/thit-heo-1-1200x676.jpg', category: 'meat', subCategory: 'Thịt Heo', isFeatured: true, descriptionImages: [], units: [ { type: 'kg', price: 199000, salePrice: 159000, stock: 20 } ] },
  { id: 22, name: 'Thịt Bò Mỹ', discountAmount: 50000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/thit-bo-1-1200x676.jpg', category: 'meat', subCategory: 'Thịt Bò', isFeatured: true, descriptionImages: [], units: [ { type: 'kg', price: 399000, salePrice: 349000, stock: 10 } ] },
  { id: 23, name: 'Thịt Gà Ta', image: 'https://cdn.tgdd.vn/2021/11/content/thit-ga-1-1200x676.jpg', category: 'meat', subCategory: 'Thịt Gà', isFeatured: false, descriptionImages: [], units: [ { type: 'kg', price: 120000, stock: 15 } ] },
  { id: 2, name: 'Cá Hồi Phi Lê', image: 'https://cdn.tgdd.vn/2021/11/content/ca-hoi-1-1200x676.jpg', category: 'meat', subCategory: 'Cá', isFeatured: true, descriptionImages: [], units: [ { type: 'kg', price: 299000, stock: 8 } ] },
  { id: 26, name: 'Cá Basa Cắt Khúc', image: 'https://cdn.tgdd.vn/2021/11/content/ca-basa-1-1200x676.jpg', category: 'meat', subCategory: 'Cá', isFeatured: false, descriptionImages: [], units: [ { type: 'kg', price: 89000, stock: 12 } ] },
  { id: 3, name: 'Trứng Gà Ta', discountAmount: 10000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/trung-ga-1-1200x676.jpg', category: 'meat', subCategory: 'Trứng', isFeatured: false, descriptionImages: [
    'https://khoinguonsangtao.vn/wp-content/uploads/2022/08/anh-que-huong-mien-tay-yen-binh.jpg',
    'https://mtv.vn/uploads/2023/02/25/meo-gg.jpg'
  ], units: [ { type: 'hộp', price: 39000, salePrice: 29000, stock: 30 } ] },
  // Sữa các loại
  { id: 4, name: 'Sữa Tươi Vinamilk', image: 'https://cdn.tgdd.vn/2021/11/content/sua-tuoi-1-1200x676.jpg', category: 'milk', subCategory: 'Sữa Tươi', isFeatured: true, descriptionImages: [], units: [ { type: 'hộp', price: 28000, stock: 40 } ] },
  { id: 24, name: 'Sữa Đặc Ông Thọ', image: 'https://cdn.tgdd.vn/2021/11/content/sua-dac-1-1200x676.jpg', category: 'milk', subCategory: 'Sữa Đặc', isFeatured: false, descriptionImages: [], units: [ { type: 'lon', price: 22000, stock: 35 } ] },
  { id: 25, name: 'Sữa Chua Vinamilk', image: 'https://cdn.tgdd.vn/2021/11/content/sua-chua-1-1200x676.jpg', category: 'milk', subCategory: 'Sữa Chua', isFeatured: false, descriptionImages: [], units: [ { type: 'hũ', price: 10000, stock: 60 } ] },
  { id: 27, name: 'Sữa Tươi TH True Milk', image: 'https://cdn.tgdd.vn/2021/11/content/sua-th-1-1200x676.jpg', category: 'milk', subCategory: 'Sữa Tươi', isFeatured: false, descriptionImages: [], units: [ { type: 'hộp', price: 30000, stock: 25 } ] },
  // Rau củ quả
  { id: 5, name: 'Rau Cải Thìa', image: 'https://cdn.tgdd.vn/2021/11/content/rau-cai-thia-1-1200x676.jpg', category: 'vegetables', subCategory: 'Rau Lá', isFeatured: false, descriptionImages: [], units: [ { type: 'bó', price: 15000, stock: 30 } ] },
  { id: 28, name: 'Rau Muống', image: 'https://cdn.tgdd.vn/2021/11/content/rau-muong-1-1200x676.jpg', category: 'vegetables', subCategory: 'Rau Lá', isFeatured: false, descriptionImages: [], units: [ { type: 'bó', price: 12000, stock: 25 } ] },
  { id: 6, name: 'Cà Rốt', discountAmount: 5000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/ca-rot-1-1200x676.jpg', category: 'vegetables', subCategory: 'Củ Quả', isFeatured: false, descriptionImages: [], units: [ { type: 'kg', price: 18000, salePrice: 13000, stock: 18 } ] },
  { id: 7, name: 'Khoai Tây', image: 'https://cdn.tgdd.vn/2021/11/content/khoai-tay-1-1200x676.jpg', category: 'vegetables', subCategory: 'Củ Quả', isFeatured: false, descriptionImages: [], units: [ { type: 'kg', price: 20000, stock: 20 } ] },
  // Trái cây
  { id: 8, name: 'Táo Mỹ', discountAmount: 10000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/tao-my-1-1200x676.jpg', category: 'fruits', subCategory: 'Trái Cây Nhập Khẩu', isFeatured: true, descriptionImages: [], units: [ { type: 'kg', price: 45000, salePrice: 35000, stock: 10 } ] },
  { id: 9, name: 'Chuối Laba', image: 'https://cdn.tgdd.vn/2021/11/content/chuoi-1-1200x676.jpg', category: 'fruits', subCategory: 'Trái Cây Việt Nam', isFeatured: false, descriptionImages: [], units: [ { type: 'nải', price: 22000, stock: 15 } ] },
  { id: 10, name: 'Nho Đen', image: 'https://cdn.tgdd.vn/2021/11/content/nho-den-1-1200x676.jpg', category: 'fruits', subCategory: 'Trái Cây Nhập Khẩu', isFeatured: true, descriptionImages: [], units: [ { type: 'kg', price: 60000, stock: 8 } ] },
  // Đồ khô, gia vị
  { id: 11, name: 'Gạo ST25', image: 'https://cdn.tgdd.vn/2021/11/content/gao-1-1200x676.jpg', category: 'dryfood', subCategory: 'Gạo', isFeatured: false, descriptionImages: [], units: [ { type: 'kg', price: 25000, stock: 50 } ] },
  { id: 29, name: 'Đậu Xanh', image: 'https://cdn.tgdd.vn/2021/11/content/dau-xanh-1-1200x676.jpg', category: 'dryfood', subCategory: 'Đậu', isFeatured: false, descriptionImages: [], units: [ { type: 'kg', price: 18000, stock: 40 } ] },
  { id: 30, name: 'Mì Gói Hảo Hảo', image: 'https://cdn.tgdd.vn/2021/11/content/mi-hao-hao-1-1200x676.jpg', category: 'dryfood', subCategory: 'Mì', isFeatured: false, descriptionImages: [], units: [ { type: 'gói', price: 4000, stock: 100 } ] },
  { id: 12, name: 'Nước Mắm Nam Ngư', image: 'https://cdn.tgdd.vn/2021/11/content/nuoc-mam-1-1200x676.jpg', category: 'spices', subCategory: 'Nước Chấm', isFeatured: false, descriptionImages: [], units: [ { type: 'chai', price: 35000, stock: 30 } ] },
  { id: 13, name: 'Dầu Ăn Tường An', image: 'https://cdn.tgdd.vn/2021/11/content/dau-an-1-1200x676.jpg', category: 'spices', subCategory: 'Dầu Ăn', isFeatured: false, descriptionImages: [], units: [ { type: 'chai', price: 45000, stock: 25 } ] },
  { id: 14, name: 'Muối I-ốt', image: 'https://cdn.tgdd.vn/2021/11/content/muoi-1-1200x676.jpg', category: 'spices', subCategory: 'Gia Vị', isFeatured: false, descriptionImages: [], units: [ { type: 'gói', price: 8000, stock: 60 } ] },
  // Đồ uống các loại
  { id: 15, name: 'Nước Suối Lavie', image: 'https://cdn.tgdd.vn/2021/11/content/nuoc-suoi-1-1200x676.jpg', category: 'drink', subCategory: 'Nước Suối', isFeatured: true, descriptionImages: [], units: [ { type: 'chai', price: 5000, stock: 100 } ] },
  { id: 16, name: 'Coca Cola Lon', discountAmount: 2000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/coca-1-1200x676.jpg', category: 'drink', subCategory: 'Nước Ngọt', isFeatured: true, descriptionImages: [], units: [ { type: 'lon', price: 10000, salePrice: 8000, stock: 80 } ] },
  { id: 17, name: 'Trà Xanh Không Độ', image: 'https://cdn.tgdd.vn/2021/11/content/tra-xanh-1-1200x676.jpg', category: 'drink', subCategory: 'Trà', isFeatured: false, descriptionImages: [], units: [ { type: 'chai', price: 9000, stock: 60 } ] },
  { id: 31, name: 'Nước Cam Ép', image: 'https://cdn.tgdd.vn/2021/11/content/nuoc-cam-1-1200x676.jpg', category: 'drink', subCategory: 'Nước Trái Cây', isFeatured: false, descriptionImages: [], units: [ { type: 'chai', price: 15000, stock: 40 } ] },
  // Bánh kẹo
  { id: 20, name: 'Bánh Oreo', discountAmount: 3000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/oreo-1-1200x676.jpg', category: 'snack', subCategory: 'Bánh', isFeatured: false, descriptionImages: [], units: [ { type: 'gói', price: 12000, salePrice: 9000, stock: 50 } ] },
  { id: 21, name: 'Kẹo Alpenliebe', image: 'https://cdn.tgdd.vn/2021/11/content/keo-1-1200x676.jpg', category: 'snack', subCategory: 'Kẹo', isFeatured: false, descriptionImages: [], units: [ { type: 'gói', price: 8000, stock: 60 } ] },
  { id: 32, name: 'Snack Khoai Tây Lay’s', image: 'https://cdn.tgdd.vn/2021/11/content/snack-lays-1-1200x676.jpg', category: 'snack', subCategory: 'Snack', isFeatured: false, descriptionImages: [], units: [ { type: 'gói', price: 18000, stock: 40 } ] },
];

export const topDeals = [
  { id: 1, name: 'Ưu Đãi Thịt Cá', discount: '30% Giảm Giá', image: 'https://cdn.tgdd.vn/2021/11/content/thit-heo-1-1200x676.jpg', category: 'meat' },
  { id: 2, name: 'Ưu Đãi Rau Củ', discount: '20% Giảm Giá', image: 'https://cdn.tgdd.vn/2021/11/content/rau-cai-thia-1-1200x676.jpg', category: 'vegetables' },
  { id: 3, name: 'Ưu Đãi Đồ Uống', discount: '10% Giảm Giá', image: 'https://cdn.tgdd.vn/2021/11/content/coca-1-1200x676.jpg', category: 'drink' },
];

export const testimonials = [
  { id: 1, name: 'Nguyễn Văn A', text: 'Rất hài lòng với dịch vụ, sản phẩm chất lượng tuyệt vời!', image: 'https://via.placeholder.com/50x50?text=NV+A' },
  { id: 2, name: 'Trần Thị B', text: 'Giao hàng nhanh chóng, giá cả hợp lý!', image: 'https://via.placeholder.com/50x50?text=TT+B' },
];

// Danh mục sản phẩm lấy từ các category có trong products
export const categories = [
  { name: 'Thịt', value: 'meat', hero: '/src/assets/category-hero/meat.jpg' },
  { name: 'Sữa', value: 'milk', hero: '/src/assets/category-hero/milk.jpg' },
  { name: 'Rau củ', value: 'vegetables', hero: '/src/assets/category-hero/vegetables.jpg' },
  { name: 'Trái cây', value: 'fruits', hero: '/src/assets/category-hero/fruits.jpg' },
  { name: 'Đồ khô', value: 'dryfood', hero: '/src/assets/category-hero/dryfood.jpg' },
  { name: 'Gia vị', value: 'spices', hero: '/src/assets/category-hero/spices.jpg' },
  { name: 'Đồ uống', value: 'drink', hero: '/src/assets/category-hero/drink.jpg' },
  { name: 'Bánh kẹo', value: 'snack', hero: '/src/assets/category-hero/snack.jpg' },
];