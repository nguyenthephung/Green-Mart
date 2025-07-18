export const slides = [
  { id: 1, image: 'https://via.placeholder.com/1200x400?text=Slide+1', title: 'Chào Mừng đến GreenMart', subtitle: 'Siêu thị tiện lợi cho mọi nhà!' },
  { id: 2, image: 'https://via.placeholder.com/1200x400?text=Slide+2', title: 'Tươi Ngon Mỗi Ngày', subtitle: 'Thực phẩm sạch, an toàn, giá tốt!' },
  { id: 3, image: 'https://via.placeholder.com/1200x400?text=Slide+3', title: 'Ưu Đãi Đặc Biệt', subtitle: 'Mua nhiều tiết kiệm nhiều!' },
];

export const products = [
  // Thịt các loại
  { id: 1, name: 'Thịt Heo Tươi', price: '199.000 VNĐ', salePrice: '159.000 VNĐ', discountAmount: 40000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/thit-heo-1-1200x676.jpg', category: 'meat', subCategory: 'Thịt Heo', isFeatured: true, descriptionImages: [] },
  { id: 22, name: 'Thịt Bò Mỹ', price: '399.000 VNĐ', salePrice: '349.000 VNĐ', discountAmount: 50000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/thit-bo-1-1200x676.jpg', category: 'meat', subCategory: 'Thịt Bò', isFeatured: true, descriptionImages: [] },
  { id: 23, name: 'Thịt Gà Ta', price: '120.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/thit-ga-1-1200x676.jpg', category: 'meat', subCategory: 'Thịt Gà', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 2, name: 'Cá Hồi Phi Lê', price: '299.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/ca-hoi-1-1200x676.jpg', category: 'meat', subCategory: 'Cá', isFeatured: true, isSale: false, descriptionImages: [] },
  { id: 26, name: 'Cá Basa Cắt Khúc', price: '89.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/ca-basa-1-1200x676.jpg', category: 'meat', subCategory: 'Cá', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 3, name: 'Trứng Gà Ta', price: '39.000 VNĐ', salePrice: '29.000 VNĐ', discountAmount: 10000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/trung-ga-1-1200x676.jpg', category: 'meat', subCategory: 'Trứng', isFeatured: false, descriptionImages: [
    'https://khoinguonsangtao.vn/wp-content/uploads/2022/08/anh-que-huong-mien-tay-yen-binh.jpg',
    'https://mtv.vn/uploads/2023/02/25/meo-gg.jpg'
  ] },
  // Sữa các loại
  { id: 4, name: 'Sữa Tươi Vinamilk', price: '28.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/sua-tuoi-1-1200x676.jpg', category: 'milk', subCategory: 'Sữa Tươi', isFeatured: true, isSale: false, descriptionImages: [] },
  { id: 24, name: 'Sữa Đặc Ông Thọ', price: '22.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/sua-dac-1-1200x676.jpg', category: 'milk', subCategory: 'Sữa Đặc', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 25, name: 'Sữa Chua Vinamilk', price: '10.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/sua-chua-1-1200x676.jpg', category: 'milk', subCategory: 'Sữa Chua', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 27, name: 'Sữa Tươi TH True Milk', price: '30.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/sua-th-1-1200x676.jpg', category: 'milk', subCategory: 'Sữa Tươi', isFeatured: false, isSale: false, descriptionImages: [] },
  // Rau củ quả
  { id: 5, name: 'Rau Cải Thìa', price: '15.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/rau-cai-thia-1-1200x676.jpg', category: 'vegetables', subCategory: 'Rau Lá', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 28, name: 'Rau Muống', price: '12.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/rau-muong-1-1200x676.jpg', category: 'vegetables', subCategory: 'Rau Lá', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 6, name: 'Cà Rốt', price: '18.000 VNĐ', salePrice: '13.000 VNĐ', discountAmount: 5000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/ca-rot-1-1200x676.jpg', category: 'vegetables', subCategory: 'Củ Quả', isFeatured: false, descriptionImages: [] },
  { id: 7, name: 'Khoai Tây', price: '20.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/khoai-tay-1-1200x676.jpg', category: 'vegetables', subCategory: 'Củ Quả', isFeatured: false, isSale: false, descriptionImages: [] },
  // Trái cây
  { id: 8, name: 'Táo Mỹ', price: '45.000 VNĐ', salePrice: '35.000 VNĐ', discountAmount: 10000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/tao-my-1-1200x676.jpg', category: 'fruits', subCategory: 'Trái Cây Nhập Khẩu', isFeatured: true, descriptionImages: [] },
  { id: 9, name: 'Chuối Laba', price: '22.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/chuoi-1-1200x676.jpg', category: 'fruits', subCategory: 'Trái Cây Việt Nam', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 10, name: 'Nho Đen', price: '60.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/nho-den-1-1200x676.jpg', category: 'fruits', subCategory: 'Trái Cây Nhập Khẩu', isFeatured: true, isSale: false, descriptionImages: [] },
  // Đồ khô, gia vị
  { id: 11, name: 'Gạo ST25', price: '25.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/gao-1-1200x676.jpg', category: 'dryfood', subCategory: 'Gạo', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 29, name: 'Đậu Xanh', price: '18.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/dau-xanh-1-1200x676.jpg', category: 'dryfood', subCategory: 'Đậu', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 30, name: 'Mì Gói Hảo Hảo', price: '4.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/mi-hao-hao-1-1200x676.jpg', category: 'dryfood', subCategory: 'Mì', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 12, name: 'Nước Mắm Nam Ngư', price: '35.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/nuoc-mam-1-1200x676.jpg', category: 'spices', subCategory: 'Nước Chấm', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 13, name: 'Dầu Ăn Tường An', price: '45.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/dau-an-1-1200x676.jpg', category: 'spices', subCategory: 'Dầu Ăn', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 14, name: 'Muối I-ốt', price: '8.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/muoi-1-1200x676.jpg', category: 'spices', subCategory: 'Gia Vị', isFeatured: false, isSale: false, descriptionImages: [] },
  // Đồ uống các loại
  { id: 15, name: 'Nước Suối Lavie', price: '5.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/nuoc-suoi-1-1200x676.jpg', category: 'drink', subCategory: 'Nước Suối', isFeatured: true, isSale: false, descriptionImages: [] },
  { id: 16, name: 'Coca Cola Lon', price: '10.000 VNĐ', salePrice: '8.000 VNĐ', discountAmount: 2000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/coca-1-1200x676.jpg', category: 'drink', subCategory: 'Nước Ngọt', isFeatured: true, descriptionImages: [] },
  { id: 17, name: 'Trà Xanh Không Độ', price: '9.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/tra-xanh-1-1200x676.jpg', category: 'drink', subCategory: 'Trà', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 31, name: 'Nước Cam Ép', price: '15.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/nuoc-cam-1-1200x676.jpg', category: 'drink', subCategory: 'Nước Trái Cây', isFeatured: false, isSale: false, descriptionImages: [] },
  // Bánh kẹo
  { id: 20, name: 'Bánh Oreo', price: '12.000 VNĐ', salePrice: '9.000 VNĐ', discountAmount: 3000, isSale: true, image: 'https://cdn.tgdd.vn/2021/11/content/oreo-1-1200x676.jpg', category: 'snack', subCategory: 'Bánh', isFeatured: false, descriptionImages: [] },
  { id: 21, name: 'Kẹo Alpenliebe', price: '8.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/keo-1-1200x676.jpg', category: 'snack', subCategory: 'Kẹo', isFeatured: false, isSale: false, descriptionImages: [] },
  { id: 32, name: 'Snack Khoai Tây Lay’s', price: '18.000 VNĐ', image: 'https://cdn.tgdd.vn/2021/11/content/snack-lays-1-1200x676.jpg', category: 'snack', subCategory: 'Snack', isFeatured: false, isSale: false, descriptionImages: [] },
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