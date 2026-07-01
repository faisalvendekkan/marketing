import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  email: z.string().email().max(150),
  password: z.string().min(8).max(128),
  roleId: z.number().int().positive(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().max(80).optional(),
  roleId: z.number().int().positive().optional(),
  status: z.enum(['active', 'invited', 'suspended']).optional(),
});

export const setRolePermsSchema = z.object({
  permissionIds: z.array(z.number().int().positive()),
});
