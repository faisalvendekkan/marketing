import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate, authorize('analytics.view'));
analyticsRouter.get('/', ctrl.overview);
analyticsRouter.get('/top-content', ctrl.topContent);
