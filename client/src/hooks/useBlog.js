import { useContext } from 'react';
import { BlogContext } from '../context/BlogContext.jsx';

export const useBlog = () => useContext(BlogContext);
