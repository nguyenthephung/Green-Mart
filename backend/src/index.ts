import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// API routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
