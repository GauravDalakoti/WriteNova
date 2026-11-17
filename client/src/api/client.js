import axios from 'axios';

// Access token lives in memory only. The refresh token lives in an httpOnly cookie.
let accessToken = null;
export const setAccessToken = (t) => { accessToken = t; };

const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

let pending = null;
export function refreshSession() {
  pending ??= axios
    .post('/api/auth/refresh', {}, { withCredentials: true })
    .then((r) => { setAccessToken(r.data.accessToken); return r.data; })
    .finally(() => { pending = null; });
  return pending;
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && original && !original._retry && !original.url.startsWith('/auth/')) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(err);
  }
);

export default api;
