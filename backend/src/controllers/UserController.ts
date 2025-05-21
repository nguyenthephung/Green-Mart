import { Request, Response } from 'express';

const getUser = (req: Request, res: Response) => {
  res.json({ message: 'User fetched successfully', user: { id: 1, name: 'John Doe' } });
};

const createUser = (req: Request, res: Response) => {
  const { name } = req.body;
  res.status(201).json({ message: 'User created', user: { id: Date.now(), name } });
};

export default {
  getUser,
  createUser,
};
