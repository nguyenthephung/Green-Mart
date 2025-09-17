# 🛒 GreenMart - Fullstack E-commerce Platform

<div align="center">
  <img src="./frontend/public/logo.jpg" alt="GreenMart Logo" width="120" height="120" style="border-radius: 15px;" />
  
  **Fresh & Organic E-commerce Platform**
  
  [![Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_GreenMart-green?style=for-the-badge)](https://greenmart-web-4385e.web.app/login)
</div>

---

## 🌟 Live Demo

**🔗 Try GreenMart now:** [https://greenmart-web-4385e.web.app/login](https://greenmart-web-4385e.web.app/login)

Experience the full features of our e-commerce platform including:
- Browse products as a guest user
- Register/Login to access cart and checkout
- Admin dashboard for product management

---

GreenMart is a modern fullstack e-commerce platform designed to provide a seamless shopping experience for fresh and organic products. The project is divided into two main parts:

- **Frontend**: Built with React, Vite, and TypeScript for a fast and interactive user interface.
- **Backend**: Powered by Node.js, Express, and MongoDB for robust API handling and data management.

---

## 🔧 Installation

1. Clone the repository and navigate to the root directory.
2. Install shared dependencies:

   ```bash
   npm install
   ```

3. Navigate to the `frontend` directory and install dependencies:

   ```bash
   cd frontend
   npm install
   ```

4. Navigate to the `backend` directory and install dependencies:

   ```bash
   cd backend
   npm install
   ```

---

## ▶️ Running the Project

### 🚀 Quick Start (Development)

#### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

#### Environment Setup
1. **Backend Environment**: Create `.env` file in `backend/` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/greenmart
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5000
   ```

2. **Frontend Environment**: Create `.env` file in `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Run **Backend** Only

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Development Mode** (with auto-reload):
   ```bash
   npm run dev
   ```

4. **Production Mode** (build + start):
   ```bash
   npm run build
   npm start
   ```

Backend will run on: `http://localhost:5000`

### Run **Frontend** Only

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

Frontend will run on: `http://localhost:5173`

### Run Both **Frontend and Backend** (Concurrently)

**Option 1**: From the root directory using npm scripts:
```bash
# Install dependencies for both frontend and backend
npm run install:all

# Run both frontend and backend simultaneously
npm run dev
```

**Option 2**: Run manually in separate terminals:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend  
npm run dev
```

**🌐 Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs (if available)

---

## 🛠️ Technologies Used

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **TypeScript** - Type-safe server-side development
- **JSON Web Token (JWT)** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage and management
- **Multer** - File upload middleware
- **Node-Cron** - Task scheduling
- **CORS** - Cross-Origin Resource Sharing

### Development Tools
- **ts-node-dev** - TypeScript development server
- **tsc-alias** - Path alias resolution
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🌐 Deployment

### Live Production
The application is currently deployed and accessible at:
**🔗 [https://greenmart-web-4385e.web.app/login](https://greenmart-web-4385e.web.app/login)**

### Deployment Options
- **Frontend**: Firebase Hosting, Vercel, Netlify
- **Backend**: Railway, Render, Heroku, or VPS
- **Database**: MongoDB Atlas (cloud) or self-hosted MongoDB
- **Storage**: Cloudinary for images and file uploads

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run individual services
docker build -t greenmart-backend ./backend
docker build -t greenmart-frontend ./frontend
```

---

## 👥 User Roles & Features

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

---

## 📱 Key Features

### 🛍️ **E-commerce Core**
- Product catalog with categories
- Advanced search and filtering
- Shopping cart and wishlist
- Secure checkout process
- Multiple payment methods
- Order tracking system

### 🎨 **User Experience**
- Responsive design (mobile-first)
- Dark/Light theme toggle
- Real-time notifications
- Loading states and animations
- Error handling and validation
- Optimized performance

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

## 📁 Project Structure

```
GreenMart/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── layouts/         # Layout components
│   │   ├── stores/          # Zustand state management
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   ├── router/          # Routing configuration
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Express middlewares
│   │   ├── config/          # Configuration files
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── dist/                # Compiled JavaScript (after build)
│   └── package.json
└── README.md
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Backend build errors:**
```bash
# If you get bcryptjs type errors:
cd backend
npm install --save-dev @types/bcryptjs

# Or use custom type declaration (already included)
```

**2. Frontend connection issues:**
```bash
# Make sure backend is running on port 5000
# Check VITE_API_URL in frontend/.env
```

**3. Database connection:**
```bash
# Ensure MongoDB is running locally or update connection string
# Check MONGODB_URI in backend/.env
```

**4. Module resolution errors:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

### Development Tips
- Use `npm run dev` in separate terminals for hot-reload
- Backend runs on port 5000, Frontend on port 5173
- Check browser console for frontend errors
- Check terminal output for backend errors

---

## 🚀 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**GreenMart Team**

- **Demo**: [https://greenmart-web-4385e.web.app/login](https://greenmart-web-4385e.web.app/login)
- **Repository**: [Green-Mart](https://github.com/nguyenthephung/Green-Mart)

---

<div align="center">
  <img src="./frontend/public/logo.jpg" alt="GreenMart Logo" width="80" height="80" style="border-radius: 10px;" />
  
  **Made with ❤️ for fresh and organic shopping experience**
  
  ⭐ **Don't forget to give this project a star if you found it helpful!** ⭐
</div>
