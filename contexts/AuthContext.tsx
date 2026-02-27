"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  token: string;
  id: string;
  email: string;
  name: string;
  subscription?: string;
  is_active?: boolean;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserPlan: (newPlan: string) => void;
  isLoading: boolean;
  token?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    // Token valid jika tidak kosong
    const isValidToken = !!savedToken;
    if (savedUser && isValidToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setToken(undefined);
      }
    } else {
      // Jika token tidak valid, hapus dan paksa login ulang
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(undefined);
    }
    setIsLoading(false);
  }, []);

  // FUNCTION UPDATE USER PLAN - PASTIKAN ADA
  const updateUserPlan = (newPlan: string) => {
    console.log('🔄 Updating user plan to:', newPlan);
    if (user) {
      const updatedUser = {
        ...user,
        subscription: newPlan,
        plan: newPlan
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ User plan updated successfully');
    } else {
      // fallback: create a minimal user with plan only
      const fallbackUser = {
        id: '',
        email: '',
        name: '',
        subscription: newPlan,
        is_active: true,
        plan: newPlan,
        token: token || ''
      };
      setUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      console.warn('⚠️ No user, fallback set plan only');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Allow cookies for JWT auth
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error('Login response (not JSON):', text);
        throw new Error('Response is not valid JSON. See console for details.');
      }
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        subscription: data.user.plan || data.user.subscription || 'free',
        is_active: data.user.is_active,
        plan: data.user.plan || data.user.subscription || 'free',
        token: data.token || ''
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      setToken(data.token);
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include', // Allow cookies for JWT auth
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error('Register response (not JSON):', text);
        throw new Error('Response is not valid JSON. See console for details.');
      }
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }
      // Auto login setelah register berhasil
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(undefined);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateUserPlan,
      isLoading,
      token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}