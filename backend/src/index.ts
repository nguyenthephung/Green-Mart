import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '@/config/database';
import routes from '@/routes';
import { startFlashSaleStatusUpdater } from '@/services/flashSaleScheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (_req, res) => {
  res.send('GreenMart API is running...');
});

// Health check route
app.get('/api/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    success: true,
    message: 'GreenMart API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      status: dbStatusMap[dbStatus as keyof typeof dbStatusMap],
      connected: dbStatus === 1,
      host: mongoose.connection.host || 'Not connected'
    }
  });
});

// Start the server in an async IIFE
(async () => {
  await connectDB();

  // API routes
  app.use('/api', routes);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    // Start flash sale status updater
    startFlashSaleStatusUpdater();
  });
})();
// API routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Start flash sale status updater
  startFlashSaleStatusUpdater();
});
