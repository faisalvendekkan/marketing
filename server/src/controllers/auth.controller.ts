import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

const REFRESH_COOKIE = 'abilix_rt';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

const meta = (req: Request) => ({
  ip: req.ip,
  ua: req.headers['user-agent'],
});

export const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  setRefreshCookie(res, tokens.refreshToken);
  created(res, { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }, 'Account created');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password, meta(req));
  setRefreshCookie(res, tokens.refreshToken);
  ok(res, { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }, 'Logged in');
});

export const googleLogin = asyncHandler(async (req, res) => {
  const idToken = req.body.idToken || req.body.credential;
  if (!idToken) throw ApiError.badRequest('Missing Google credential');
  const { user, tokens } = await authService.googleLogin(idToken, meta(req));
  setRefreshCookie(res, tokens.refreshToken);
  ok(res, { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }, 'Logged in with Google');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('Missing refresh token');
  const tokens = await authService.refresh(token, meta(req));
  setRefreshCookie(res, tokens.refreshToken);
  ok(res, { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.[REFRESH_COOKIE];
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  ok(res, null, 'Logged out');
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user!.id);
  ok(res, { user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user!.id, req.body);
  ok(res, { user }, 'Profile updated');
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  ok(res, null, 'Password changed');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ok(res, null, 'If that email exists, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  ok(res, null, 'Password has been reset');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  ok(res, null, 'Email verified');
});
