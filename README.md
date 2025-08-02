# 🛒 GreenMart - Web Bán Hàng Fullstack

Dự án gồm hai phần:

- **Frontend**: Giao diện người dùng (React + Vite + TypeScript)
- **Backend**: Xử lý API (Node.js + Express)

---

## 🔧 Cài đặt

1. Tại thư mục gốc GreenMart, chạy `npm install` để cài đặt dependencies dùng chung .

2. Truy cập vào thư mục `frontend`, chạy:

   - `npm install`

3. Truy cập vào thư mục `backend`, chạy:

   - `npm install`

---

## ▶️ Chạy dự án

### Chạy riêng **Frontend**

1. Truy cập vào thư mục `frontend`

2. Chạy lệnh:

   - `npm run dev`

---

### Chạy riêng **Backend**

1. Truy cập vào thư mục `backend`

2. Chạy lệnh:

   - `npm run dev`

---

### Chạy cả **Frontend và Backend** từ thư mục gốc GreenMart

Chạy lệnh:

- `npm run dev`

---

## 💳 Payment Gateway Integration

GreenMart tích hợp với 3 cổng thanh toán chính của Việt Nam:

- **VNPay** - Cổng thanh toán hàng đầu Việt Nam
- **MoMo** - Ví điện tử phổ biến
- **ZaloPay** - Giải pháp thanh toán của Zalo

### Các tính năng thanh toán:
✅ Thanh toán ATM/Internet Banking (VNPay)  
✅ Thanh toán thẻ Visa/Master (VNPay)  
✅ Thanh toán ví MoMo  
✅ Thanh toán ZaloPay  
✅ Xác thực callback real-time  
✅ Trang test payment gateway  
✅ Tracking đơn hàng sau thanh toán  

### Setup Payment:
1. Xem hướng dẫn chi tiết trong [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md)
2. Đăng ký tài khoản test miễn phí tại các nhà cung cấp
3. Cấu hình file `.env` với thông tin API
4. Truy cập `/payment-test` để test các gateway

**Lưu ý:** Tất cả 3 nhà cung cấp đều hỗ trợ đăng ký miễn phí và môi trường sandbox để test.