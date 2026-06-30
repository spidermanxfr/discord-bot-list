'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface IUser {
  discordId: string;
  username: string;
  globalName?: string;
  avatar?: string;
  banner?: string;
  email?: string;
  role: 'user' | 'moderator' | 'admin';
  premiumType: number;
  guilds: Array<{
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
  }>;
}

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
  mockLogin: (role: 'user' | 'moderator' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (jwtToken: string) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      logoutLocal();
    } finally {
      setLoading(false);
    }
  };

  const login = (jwtToken: string) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setLoading(true);
    fetchProfile(jwtToken);
  };

  const logoutLocal = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      logoutLocal();
      toast.success('Logged out successfully.');
    }
  };

  const mockLogin = async (role: 'user' | 'moderator' | 'admin') => {
    setLoading(true);
    try {
      const response = await api.post(`/auth/mock?role=${role}`);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        toast.success(`Success! Mock logged in as ${response.data.user.username} (${response.data.user.role})`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mock login failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
