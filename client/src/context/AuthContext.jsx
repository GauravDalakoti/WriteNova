import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/services.js';
import { refreshSession, setAccessToken } from '../api/client.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  // Restore the session from the refresh cookie on first load.
  useEffect(() => {
    refreshSession().then((d) => setUser(d.user)).catch(() => {}).finally(() => setBooting(false));
    const expired = () => { setAccessToken(null); setUser(null); };
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  }, []);

  const start = (data) => { setAccessToken(data.accessToken); setUser(data.user); };
  const login = useCallback(async (body) => start(await authApi.login(body)), []);
  const register = useCallback(async (body) => start(await authApi.register(body)), []);
  const changePassword = useCallback(async (body) => start(await authApi.changePassword(body)), []);
  const logout = useCallback(async () => {
    try { await authApi.logout(); } finally { setAccessToken(null); setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, booting, login, register, logout, changePassword }), [user, booting, login, register, logout, changePassword]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
