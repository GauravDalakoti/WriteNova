import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { headlines, generate, grammar, seo } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.use(rateLimit({ windowMs: 60 * 1000, limit: 20, message: { message: 'Slow down a little. Try again in a minute.' } }));
router.post('/headlines', headlines);
router.post('/generate', generate);
router.post('/grammar', grammar);
router.post('/seo', seo);
export default router;
