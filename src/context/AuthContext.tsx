import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth as authApi, wallet as walletApi, token as tokenStore, type AuthUser } from '../lib/api';

type UIRole = 'USER' | 'ADMIN';
function mapRole(backendRole: AuthUser['role']): UIRole {
  const role = String(backendRole).toLowerCase();
  return ['admin', 'tenant_admin', 'super_admin'].includes(role) ? 'ADMIN' : 'USER';
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UIRole;
  walletBalance: number;
  backendRole: AuthUser['role'];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUser(raw: AuthUser): User {
  const roleStr = String(raw.role).toLowerCase();
  const isSescoAdmin = roleStr === 'super_admin' || raw.email === 'sescowemp@gmail.com';
  return {
    id: raw.email,
    name: raw.name,
    email: raw.email,
    phone: raw.phone || '',
    role: isSescoAdmin ? 'ADMIN' : mapRole(raw.role),
    walletBalance: raw.walletBalance ?? 0,
    backendRole: isSescoAdmin ? 'super_admin' : raw.role,
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchMe(): Promise<AuthUser | null> {
  const t = tokenStore.get();
  if (!t) return null;
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: { 'Authorization': `Bearer ${t}` },
    });
    const data = await res.json();
    if (!data.success || !data.user) return null;

    const user = data.user as AuthUser;
    if (user.walletBalance != null) return user;

    try {
      const walletData = await walletApi.get();
      return { ...user, walletBalance: walletData.balance };
    } catch {
      return user;
    }
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: verify stored token against backend /api/me
  useEffect(() => {
    (async () => {
      const me = await fetchMe();
      if (me) {
        setUser(buildUser(me));
      } else {
        // Token is invalid or expired — clear it
        tokenStore.clear();
        localStorage.removeItem('dh_user');
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    tokenStore.set(res.token);
    const u = buildUser(res.user);
    setUser(u);
    return u; // Return user for immediate redirection
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await authApi.register(name, email, password, phone);
    tokenStore.set(res.token);
    const u = buildUser(res.user);
    setUser(u);
    return u; // Return user for immediate redirection
  };

  const logout = () => {
    tokenStore.clear();
    localStorage.removeItem('dh_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await fetchMe();
    if (me) setUser(buildUser(me));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
