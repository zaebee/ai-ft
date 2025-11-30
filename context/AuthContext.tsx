import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import { UserPublic, Token, RoleEnum } from '../types';

interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  isLoading: boolean;
  login: (tokenData: Token) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(ApiService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await ApiService.get<UserPublic>('/users/me');
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (tokenData: Token) => {
    ApiService.setToken(tokenData.access_token);
    setToken(tokenData.access_token);
    // User data will be fetched by the effect
  };

  const logout = () => {
    ApiService.setToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      logout,
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
