# Network Error Testing Guide

## Cách Test Các Lỗi Mạng Trong Localhost

### 1. Server Down/Crash Error
```bash
# Tắt backend server để test lỗi "server không phản hồi"
# Trong terminal backend, nhấn Ctrl+C để stop server
# Sau đó reload trang web
```

### 2. Connection Refused Error  
```bash
# Backend chưa khởi động
# Đảm bảo không có gì chạy ở port 3001
# Truy cập http://localhost:3000 để thấy lỗi connection refused
```

### 3. Timeout Error
```javascript
// Trong backend, thêm delay để simulate slow response:
app.get('/api/products', async (req, res) => {
  // Thêm delay 10 giây để test timeout
  await new Promise(resolve => setTimeout(resolve, 10000));
  res.json(products);
});
```

### 4. CORS Error
```javascript
// Trong backend, comment out CORS middleware:
// app.use(cors()); // Comment this line
// Reload frontend để thấy CORS error
```

### 5. JSON Parse Error
```javascript
// Trong backend, trả về HTML thay vì JSON:
app.get('/api/products', (req, res) => {
  res.send('<html><body>Not JSON</body></html>');
});
```

## Backend Health Check Endpoint

Thêm vào backend server (backend/src/index.ts):

```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    port: process.env.PORT || 3001
  });
});
```

## Common Localhost Issues & Solutions

### 1. Port Already In Use
```bash
# Tìm process sử dụng port 3001
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <process_id> /F
```

### 2. DNS Resolution Issues
```bash
# Test localhost resolution
ping localhost
ping 127.0.0.1
ping ::1
```

### 3. Firewall Blocking
```bash
# Windows Defender có thể block local connections
# Tạm thời tắt firewall để test
```

### 4. Browser Cache Issues
```bash
# Clear browser cache hoặc mở Incognito mode
# Disable service workers trong DevTools
# Application tab -> Service Workers -> Unregister
```

## Network Tab Debugging

Mở DevTools -> Network tab để xem:
- **Status Code**: 200 (OK), 404 (Not Found), 500 (Server Error)
- **Response Time**: Để phát hiện slow queries
- **Response Body**: Kiểm tra format JSON
- **Headers**: CORS settings

## Error Console Messages

Frontend sẽ log chi tiết lỗi:
```
🔴 Network Error in HomePage
Type: server_down
Message: Backend server không phản hồi
Suggestion: Kiểm tra xem backend đã được khởi động chưa
Technical Details: Health check failed at http://localhost:3001/api/health
```
