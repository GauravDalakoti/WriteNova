import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, me, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, message: { message: 'Too many attempts. Try again later.' } });

router.post('/register', limiter, register);
router.post('/login', limiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);
router.put('/password', protect, changePassword);
export default router;
