import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    tenant?: {
      userId: string;
      role: 'user' | 'admin' | 'superadmin';
      societyId: string | null;
    };
  }
}

