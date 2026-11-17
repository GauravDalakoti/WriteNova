import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signAccess = (id) =>
  jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
export const signRefresh = (id) =>
  jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
export const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

export const refreshCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
