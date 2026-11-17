import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { signAccess, signRefresh, hashToken, refreshCookie } from '../utils/tokens.js';

async function startSession(user, res) {
  const refresh = signRefresh(user._id);
  user.refreshTokenHash = hashToken(refresh);
  await user.save();
  res.cookie('refreshToken', refresh, refreshCookie);
  return { accessToken: signAccess(user._id), user: user.toSafe() };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required.');
  const user = await User.create({ name, email, password });
  res.status(201).json(await startSession(user, res));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Enter your email and password.');
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password +refreshTokenHash');
  if (!user || !(await user.matchPassword(password))) throw new HttpError(401, 'Email or password is incorrect.');
  res.json(await startSession(user, res));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new HttpError(401, 'No session');
  let payload;
  try { payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET); }
  catch { throw new HttpError(401, 'Session expired'); }
  const user = await User.findById(payload.id).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(token)) throw new HttpError(401, 'Session expired');
  res.json(await startSession(user, res));
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) await User.updateOne({ refreshTokenHash: hashToken(token) }, { $unset: { refreshTokenHash: 1 } });
  res.clearCookie('refreshToken', { ...refreshCookie, maxAge: undefined });
  res.json({ message: 'Signed out' });
});

export const me = (req, res) => res.json({ user: req.user.toSafe() });

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password +refreshTokenHash');
  if (!(await user.matchPassword(currentPassword || ''))) throw new HttpError(400, 'Current password is incorrect.');
  user.password = newPassword;
  res.json({ ...(await startSession(user, res)), message: 'Password updated' });
});
