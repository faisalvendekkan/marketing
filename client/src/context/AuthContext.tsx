import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import api, { setAccessToken } from '@/lib/api';
import type { User } from '@/types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
}

export interface RegisterData {
  firstName: string; lastName?: string; email: string; password: string; companyName?: string;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      // Try to restore a session via the httpOnly refresh cookie.
      const res = await api.post('/auth/refresh');
      const token = res.data?.data?.accessToken;
      if (token) {
        setAccessToken(token);
        const me = await api.get('/auth/me');
        setUser(me.data.data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const applyAuth = (data: { user: User; accessToken: string }) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const login: AuthCtx['login'] = async (email, password, remember) => {
    const res = await api.post('/auth/login', { email, password, remember });
    applyAuth(res.data.data);
  };

  const googleLogin: AuthCtx['googleLogin'] = async (idToken) => {
    const res = await api.post('/auth/google', { idToken });
    applyAuth(res.data.data);
  };

  const register: AuthCtx['register'] = async (data) => {
    const res = await api.post('/auth/register', data);
    applyAuth(res.data.data);
  };

  const logout: AuthCtx['logout'] = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    setAccessToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await api.get('/auth/me');
    setUser(me.data.data.user);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, googleLogin, register, logout, refreshUser, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
