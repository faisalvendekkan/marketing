import { Router } from 'express';
import * as ctrl from '../controllers/media.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

export const mediaRouter = Router();
mediaRouter.use(authenticate);
mediaRouter.get('/', ctrl.listMedia);
mediaRouter.post('/', upload.single('file'), ctrl.uploadMedia);
mediaRouter.delete('/:id', ctrl.deleteMedia);
