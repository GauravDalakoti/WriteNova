import { Router } from 'express';
import { listBlogs, getBlog, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.route('/').get(listBlogs).post(createBlog);
router.route('/:id').get(getBlog).put(updateBlog).delete(deleteBlog);
export default router;
