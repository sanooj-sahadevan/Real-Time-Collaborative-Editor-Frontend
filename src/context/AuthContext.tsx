import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import { api } from '../lib/axios';
import type { User } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Called once on mount to determine if the user is already logged in.
  // Uses a plain try/catch — the Axios interceptor intentionally skips
  // /auth/me from the refresh cycle to prevent infinite loops.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user as User);
      } catch {
        // Not authenticated — this is a normal state, not an error.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local state and redirect, even if the API call fails
      setUser(null);
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};