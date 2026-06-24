import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser } from '../api/users';
import type { AuthResponse, AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  balance: number | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setSession: (auth: AuthResponse) => void;
  logout: () => void;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [balance, setBalance] = useState<number | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const me = await getCurrentUser();
      setBalance(me.balance);
    } catch {
      // ignore — a 401 is handled by the axios interceptor
    }
  }, []);

  // Load balance on login and on initial mount when already authenticated.
  useEffect(() => {
    if (user) {
      void refreshBalance();
    } else {
      setBalance(null);
    }
  }, [user, refreshBalance]);

  function setSession(auth: AuthResponse) {
    const nextUser: AuthUser = { email: auth.email, fullName: auth.fullName, role: auth.role };
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setBalance(null); // avoid briefly showing the previous user's balance
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    balance,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'ADMIN',
    setSession,
    logout,
    refreshBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
