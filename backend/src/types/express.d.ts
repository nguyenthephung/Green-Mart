import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { 
      _id: string;
      userId?: string;
      role?: string;
    };
  }
}
