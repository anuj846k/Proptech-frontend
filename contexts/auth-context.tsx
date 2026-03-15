'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiFetch, type ApiResponse } from '@/lib/api';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'MANAGER' | 'TENANT' | 'TECHNICIAN';
  createdAt: string | null;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'TENANT' | 'TECHNICIAN';
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: RegisterInput) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchMe = useCallback(async () => {
    const res = await apiFetch<ApiResponse<{ user: User }>>(
      '/api/v1/users/auth/me',
    );
    if (res.data?.user) {
      setState({
        user: res.data.user,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchMe();
    });
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<ApiResponse<{ accessToken?: string; refreshToken?: string }>>(
        '/api/v1/users/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      );
      if (res.error) {
        return { error: res.error.error || res.error.message || 'Login failed' };
      }
      await fetchMe();
      return {};
    },
    [fetchMe],
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      const body: Record<string, string> = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };
      if (data.phone && data.phone.replace(/\D/g, '').length === 10) {
        body.phone = data.phone.replace(/\D/g, '');
      }
      const res = await apiFetch<ApiResponse<{ accessToken?: string; refreshToken?: string }>>(
        '/api/v1/users/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      );
      if (res.error) {
        return { error: res.error.error || res.error.message || 'Registration failed' };
      }
      await fetchMe();
      return {};
    },
    [fetchMe],
  );

  const logout = useCallback(async () => {
    await apiFetch('/api/v1/users/auth/logout', { method: 'POST' });
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
