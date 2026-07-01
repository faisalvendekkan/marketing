import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate, authorize('dashboard.view'));
dashboardRouter.get('/', ctrl.overview);
dashboardRouter.get('/stats', ctrl.stats);
