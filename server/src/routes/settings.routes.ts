import { Router } from 'express';
import * as ctrl from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';

export const settingsRouter = Router();
settingsRouter.use(authenticate);
settingsRouter.get('/company', ctrl.getCompany);
settingsRouter.put('/company', authorize('settings.manage'), ctrl.updateCompany);
settingsRouter.get('/brand-kit', ctrl.getBrandKit);
settingsRouter.put('/brand-kit', authorize('settings.manage'), ctrl.upsertBrandKit);
settingsRouter.get('/', ctrl.getSettings);
settingsRouter.put('/', authorize('settings.manage'), ctrl.updateSettings);
