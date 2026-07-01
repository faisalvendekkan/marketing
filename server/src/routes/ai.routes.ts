import { Router } from 'express';
import * as ctrl from '../controllers/ai.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateSchema } from '../validators/ai.validator';

export const aiRouter = Router();
aiRouter.use(authenticate);
aiRouter.get('/status', ctrl.status);
aiRouter.get('/history', authorize('ai.content'), ctrl.history);
aiRouter.post('/generate', authorize('ai.content'), validate(generateSchema), ctrl.generate);
