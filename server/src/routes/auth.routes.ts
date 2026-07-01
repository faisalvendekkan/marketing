import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  verifyEmailSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), ctrl.register);
authRouter.post('/login', authLimiter, validate(loginSchema), ctrl.login);
authRouter.post('/google', authLimiter, ctrl.googleLogin);
authRouter.post('/refresh', ctrl.refresh);
authRouter.post('/logout', ctrl.logout);
authRouter.post('/forgot-password', authLimiter, validate(forgotSchema), ctrl.forgotPassword);
authRouter.post('/reset-password', authLimiter, validate(resetSchema), ctrl.resetPassword);
authRouter.post('/verify-email', validate(verifyEmailSchema), ctrl.verifyEmail);

// Authenticated profile management
authRouter.get('/me', authenticate, ctrl.me);
authRouter.patch('/me', authenticate, validate(updateProfileSchema), ctrl.updateProfile);
authRouter.post('/change-password', authenticate, validate(changePasswordSchema), ctrl.changePassword);
