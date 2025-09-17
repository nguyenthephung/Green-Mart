# 🛒 GreenMart - Fullstack E-commerce Platform

GreenMart is a modern fullstack e-commerce platform designed to provide a seamless shopping experience. The project is divided into two main parts:

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

### Run **Frontend** Only

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

### Run **Backend** Only

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

### Run Both **Frontend and Backend**

1. From the root directory, run:

   ```bash
   npm run dev
   ```

---

## 🛠️ Technologies Used

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Axios (HTTP client)

### Backend

- Node.js
- Express
- MongoDB (database)
- Mongoose (ODM)
- Cloudinary (image storage)
- JSON Web Token (authentication)
- Multer (file uploads)
- Node-Cron (task scheduling)

---

## 🌐 Deployment

GreenMart can be deployed using Docker, Azure, or Firebase Hosting. For detailed deployment instructions, refer to the documentation.

---

## 👥 User Roles

This web application supports three user roles:

1. **Admin**: Manages the platform, including products, orders, and users.
2. **Logged-in User**: Can browse products, add items to the cart, and place orders.
3. **Guest User**: Can browse products but needs to log in to make purchases.
