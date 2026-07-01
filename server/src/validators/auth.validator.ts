import { z } from 'zod';

const password = z.string().min(8, 'Password must be at least 8 characters').max(128);

export const registerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  email: z.string().email().max(150),
  password,
  companyName: z.string().min(1).max(150).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password,
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().max(80).optional(),
  phone: z.string().max(40).optional(),
  avatarUrl: z.string().url().max(255).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
