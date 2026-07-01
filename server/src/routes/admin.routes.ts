import { Router } from 'express';
import * as ctrl from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, setRolePermsSchema } from '../validators/admin.validator';

export const adminRouter = Router();
adminRouter.use(authenticate);

// Users
adminRouter.get('/users', authorize('users.manage'), ctrl.listUsers);
adminRouter.post('/users', authorize('users.manage'), validate(createUserSchema), ctrl.createUser);
adminRouter.patch('/users/:id', authorize('users.manage'), validate(updateUserSchema), ctrl.updateUser);
adminRouter.delete('/users/:id', authorize('users.manage'), ctrl.deleteUser);

// Roles & permissions
adminRouter.get('/roles', authorize('roles.manage'), ctrl.listRoles);
adminRouter.get('/permissions', authorize('roles.manage'), ctrl.listPermissions);
adminRouter.get('/roles/:id/permissions', authorize('roles.manage'), ctrl.getRolePermissions);
adminRouter.put('/roles/:id/permissions', authorize('roles.manage'), validate(setRolePermsSchema), ctrl.setRolePermissions);

// Logs & storage
adminRouter.get('/activity', authorize('audit.view'), ctrl.activityLogs);
adminRouter.get('/storage', authorize('settings.manage'), ctrl.storageUsage);
