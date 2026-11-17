import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Not signed in');
  let payload;
  try { payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); }
  catch { throw new HttpError(401, 'Session expired'); }
  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'Account not found');
  req.user = user;
  next();
});
