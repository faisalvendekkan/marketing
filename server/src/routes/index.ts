import { Router } from 'express';
import { authRouter } from './auth.routes';
import { dashboardRouter } from './dashboard.routes';
import { aiRouter } from './ai.routes';
import { notificationRouter } from './notification.routes';
import { adminRouter } from './admin.routes';
import { settingsRouter } from './settings.routes';
import { mediaRouter } from './media.routes';
import { analyticsRouter } from './analytics.routes';
import {
  campaignRouter,
  leadRouter,
  postRouter,
  taskRouter,
  contentRouter,
  seoProjectRouter,
  emailCampaignRouter,
  whatsappCampaignRouter,
  blogRouter,
  automationRouter,
  gbpRouter,
  reportRouter,
} from './resources';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/analytics', analyticsRouter);

apiRouter.use('/campaigns', campaignRouter);
apiRouter.use('/leads', leadRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/content', contentRouter);
apiRouter.use('/seo-projects', seoProjectRouter);
apiRouter.use('/email-campaigns', emailCampaignRouter);
apiRouter.use('/whatsapp-campaigns', whatsappCampaignRouter);
apiRouter.use('/blog', blogRouter);
apiRouter.use('/automations', automationRouter);
apiRouter.use('/google-business', gbpRouter);
apiRouter.use('/reports', reportRouter);
