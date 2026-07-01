import 'express';

declare global {
  namespace Express {
    interface UserContext {
      id: number;
      companyId: number | null;
      role: string;
      email: string;
    }
    interface Request {
      user?: UserContext;
    }
  }
}

export {};
