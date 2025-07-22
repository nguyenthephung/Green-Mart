## Video Debug Instructions

### Để test video modal:

1. **Mở Browser Developer Tools (F12)**
2. **Chuyển sang tab Console**
3. **Click "Xem Video Giới Thiệu"**
4. **Kiểm tra logs:**
   - "Video loading started" - Video bắt đầu load
   - "Video data loaded" - Video đã load thành công
   - "Video can play" - Video có thể phát
   - Hoặc error logs nếu có lỗi

### Nếu video không load:

1. **Kiểm tra file tồn tại:**
   - Mở `http://localhost:5173/natural_banner.mp4` trực tiếp
   - Xem có tải được video không

2. **Nếu 404 Error:**
   - Đảm bảo file `natural_banner.mp4` ở trong thư mục `public/`
   - Restart dev server

3. **Nếu format error:**
   - Video cần format MP4 với codec H.264
   - Bitrate không quá cao

### Alternative solutions:
- Sử dụng video online (YouTube, Vimeo)
- Tạo video demo đơn giản
- Placeholder với image slideshow
