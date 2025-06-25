import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  provePoints: number;
  createdAt: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  updateUserPoints: (newPoints: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      // Simulate login - replace with actual API call
      const mockUser: User = {
        id: 1,
        username: 'demo',
        email: email,
        provePoints: 1000,
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      setToken('mock-jwt-token');
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      // Simulate registration - replace with actual API call
      const mockUser: User = {
        id: 1,
        username: username,
        email: email,
        provePoints: 100,
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      setToken('mock-jwt-token');
      
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateUserPoints = (newPoints: number) => {
    if (user) {
      setUser({ ...user, provePoints: newPoints });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    updateUserPoints,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
