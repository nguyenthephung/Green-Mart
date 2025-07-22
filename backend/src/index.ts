import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '@/config/database';
import routes from '@/routes';

dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json());

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

// API routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
