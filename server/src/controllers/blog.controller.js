import Blog from '../models/Blog.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { analyzeSEO, countWords } from '../services/seo.service.js';

const FIELDS = ['title', 'topic', 'primaryKeyword', 'secondaryKeywords', 'tone', 'metaDescription', 'blocks'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
const derived = (b) => ({ wordCount: countWords(b.blocks), seoScore: analyzeSEO(b).score });

export const listBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ user: req.user._id })
    .select('title topic primaryKeyword wordCount seoScore updatedAt createdAt')
    .sort({ updatedAt: -1 });
  res.json({ blogs });
});

export const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, user: req.user._id });
  if (!blog) throw new HttpError(404, 'Blog not found');
  res.json({ blog });
});

export const createBlog = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  const blog = await Blog.create({ ...data, ...derived(data), user: req.user._id });
  res.status(201).json({ blog });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, user: req.user._id });
  if (!blog) throw new HttpError(404, 'Blog not found');
  blog.set(pick(req.body));
  blog.set(derived(blog.toObject()));
  await blog.save();
  res.json({ blog });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!blog) throw new HttpError(404, 'Blog not found');
  res.json({ message: 'Deleted' });
});
