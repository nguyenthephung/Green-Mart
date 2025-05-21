import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import UserController from '@/controllers/UserController';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
