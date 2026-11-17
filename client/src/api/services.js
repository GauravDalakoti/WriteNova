import api from './client.js';

export const authApi = {
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  changePassword: (body) => api.put('/auth/password', body).then((r) => r.data),
};

export const blogApi = {
  list: () => api.get('/blogs').then((r) => r.data.blogs),
  get: (id) => api.get(`/blogs/${id}`).then((r) => r.data.blog),
  create: (body) => api.post('/blogs', body).then((r) => r.data.blog),
  update: (id, body) => api.put(`/blogs/${id}`, body).then((r) => r.data.blog),
  remove: (id) => api.delete(`/blogs/${id}`).then((r) => r.data),
};

export const aiApi = {
  headlines: (body) => api.post('/ai/headlines', body).then((r) => r.data.headlines),
  generate: (body) => api.post('/ai/generate', body).then((r) => r.data),
  grammar: (blocks) => api.post('/ai/grammar', { blocks }).then((r) => r.data),
  seo: (body) => api.post('/ai/seo', body).then((r) => r.data),
};
