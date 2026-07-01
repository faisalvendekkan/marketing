import { Router } from 'express';
import * as ctrl from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

export const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.get('/', ctrl.list);
notificationRouter.get('/unread-count', ctrl.unreadCount);
notificationRouter.post('/:id/read', ctrl.markRead);
notificationRouter.post('/read-all', ctrl.markAllRead);
notificationRouter.delete('/:id', ctrl.remove);
