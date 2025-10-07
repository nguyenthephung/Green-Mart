# 🛒 GreenMart - Fresh & Organic E-commerce Platform

<div align="center">
  <img src="./frontend/public/logo.jpg" alt="GreenMart Logo" width="120" height="120" style="border-radius: 15px;" />
  
  [![Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_GreenMart-green?style=for-the-badge)](https://greenmart-web-4385e.web.app/)
</div>

<!-- Lighthouse report preview -->
<div align="center" style="margin-top:16px;">
  <a href="./frontend/public/sreenshot/lighthouse.png" target="_blank">
    <img src="./frontend/public/sreenshot/lighthouse.png" alt="Lighthouse Report - GreenMart" width="860" style="border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.12)" />
  </a>
  <p style="font-size:0.95rem; color:#555; margin-top:8px;">Lighthouse audit</p>
</div>

## 👨‍💻 Author
**Nguyễn Thể Phụng** - [nguyenthephung61@gmail.com](mailto:nguyenthephung61@gmail.com)

## 🌟 Live Demo
**🔗 [https://greenmart-web-4385e.web.app](https://greenmart-web-4385e.web.app)**

## 📖 About
GreenMart is a modern fullstack e-commerce platform for fresh and organic products, built with React + TypeScript (Frontend) and Node.js + MongoDB (Backend).

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+), MongoDB, npm

### Installation & Run
```bash
# Clone and install
git clone https://github.com/nguyenthephung/Green-Mart.git
cd Green-Mart
npm install

# Setup environment files
# Backend: Create backend/.env with MONGODB_URI, JWT_SECRET, CLOUDINARY config
# Frontend: Create frontend/.env with VITE_API_URL=http://localhost:5000/api

# Run both frontend & backend
npm run dev
```

**Access:** Frontend: http://localhost:5173 | Backend: http://localhost:5000

## 🛠️ Tech Stack
**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand  
**Backend:** Node.js, Express, MongoDB, JWT, Cloudinary  
**Tools:** ESLint, Prettier, Docker

## ✨ Features

### 🛍️ **E-commerce Core**
- Product catalog with categories
- Advanced search and filtering
- Shopping cart and wishlist
- Secure checkout process
- Multiple payment methods
- Order tracking system

### 🎨 **User Experience**
- **Mobile-first responsive design** - Fully optimized for mobile devices
- **Dark/Light theme toggle** - Available in both desktop and mobile interfaces
- **Mobile dropdown navigation** - Hamburger menu with theme toggle integration
- **Responsive notification system** - Mobile-optimized notification modal
- **Scroll-to-top functionality** - Automatic page scroll restoration
- Real-time notifications
- Loading states and animations
- Error handling and validation
- Optimized performance

### 🔐 **IC/ID Authentication System**
- **Identity Card (IC/ID) integration** - Support for national ID verification
- **Multi-level user authentication** - Guest, Registered, and Admin roles
- JWT-based secure authentication
- Password hashing with bcrypt
- Protected routes and authorization
- Input validation and sanitization
- CORS protection

### 📱 **Mobile-Responsive Features**
- **Adaptive address management** - Mobile-optimized address forms and layouts
- **Responsive grid layouts** - Dynamic column adjustments for different screen sizes
- **Touch-friendly interfaces** - Optimized button sizes and touch targets
- **Mobile cart and checkout** - Streamlined mobile shopping experience
- **Notification badge positioning** - Properly aligned count badges on mobile icons

### 🔒 **Security & Authentication**
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and authorization
- Input validation and sanitization
- CORS protection

### 📊 **Admin Dashboard**
- Real-time analytics
- Sales and revenue tracking
- User activity monitoring
- Inventory management
- Content management system

---

## 👥 User Roles 

### 🔓 **Guest User**
- Browse products and categories
- View product details
- Search and filter products
- View flash sales and promotions
- Access public pages (About, Policy, etc.)

### 👤 **Registered User** 
- All guest features plus:
- User authentication (login/register)
- Shopping cart management
- Checkout and order placement
- Order tracking and history
- Wishlist management
- User profile management
- Address and payment method management
- Voucher and discount usage

### 👑 **Admin User**
- All user features plus:
- Product management (CRUD operations)
- Category management
- User management
- Order management and tracking
- Banner and promotion management
- Voucher/discount creation
- Flash sale management
- Analytics dashboard
- System notifications

## 📸 Screenshots

### Homepage (Desktop)
<div align="center" style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
  <figure style="margin:0;">
    <img src="./frontend/public/sreenshot/home_desktop.png" alt="GreenMart - Homepage (Desktop)" width="520" style="border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);" />
    <figcaption style="text-align:center;font-size:0.95rem;margin-top:6px;color:#444;">Homepage — Desktop view</figcaption>
  </figure>
  <figure style="margin:0;">
    <img src="./frontend/public/sreenshot/product_desktop.png" alt="GreenMart - Product Page (Desktop)" width="520" style="border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);" />
    <figcaption style="text-align:center;font-size:0.95rem;margin-top:6px;color:#444;">Product detail — Desktop view</figcaption>
  </figure>
</div>

### Cart (Desktop)
<div align="center" style="margin-top:14px;">
  <figure style="display:inline-block;margin:0;">
    <img src="./frontend/public/sreenshot/cart_desktop.png" alt="GreenMart - Cart (Desktop)" width="720" style="border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);" />
    <figcaption style="text-align:center;font-size:0.95rem;margin-top:6px;color:#444;">Shopping cart — Desktop view</figcaption>
  </figure>
</div>

### Mobile Views
<div align="center" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:12px;">
  <figure style="margin:0;">
    <img src="./frontend/public/sreenshot/home_moblie.jpg" alt="GreenMart - Homepage (Mobile)" width="300" style="border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06);" />
    <figcaption style="text-align:center;font-size:0.9rem;margin-top:6px;color:#444;">Homepage — Mobile</figcaption>
  </figure>
  <figure style="margin:0;">
    <img src="./frontend/public/sreenshot/product_moblie.jpg" alt="GreenMart - Product (Mobile)" width="300" style="border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06);" />
    <figcaption style="text-align:center;font-size:0.9rem;margin-top:6px;color:#444;">Product — Mobile</figcaption>
  </figure>
  <figure style="margin:0;">
    <img src="./frontend/public/sreenshot/cart_moblie.jpg" alt="GreenMart - Cart (Mobile)" width="300" style="border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06);" />
    <figcaption style="text-align:center;font-size:0.9rem;margin-top:6px;color:#444;">Cart — Mobile</figcaption>
  </figure>
</div>

### Admin Dashboard
<div align="center" style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:12px;">
  <figure style="margin:0;">
    <img src="./frontend/public/sreenshot/admin_dashboard.png" alt="GreenMart - Admin Dashboard" width="520" style="border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);" />
    <figcaption style="text-align:center;font-size:0.95rem;margin-top:6px;color:#444;">Admin dashboard — analytics overview</figcaption>
  </figure>
  <figure style="margin:0;">
    <img src="./frontend/public/sreenshot/admin_revenue.png" alt="GreenMart - Admin Revenue" width="520" style="border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08);" />
    <figcaption style="text-align:center;font-size:0.95rem;margin-top:6px;color:#444;">Revenue & sales — Admin view</figcaption>
  </figure>
</div>

<p style="color:#666;margin-top:12px;">All screenshots are stored in <code>frontend/public/sreenshot/</code>. Click an image to open the full-size version.</p>

## 🤝 Contributing
1. Fork → Create feature branch → Commit → Push → Pull Request

## 📄 License
MIT License - feel free to use for learning and projects!

---

<div align="center">
  <img src="./frontend/public/logo.jpg" alt="GreenMart Logo" width="80" height="80" style="border-radius: 10px;" />
  
  **Made with ❤️ by Nguyễn Thể Phụng**
  
  ⭐ **Don't forget to give this project a star if you found it helpful!** ⭐
</div>