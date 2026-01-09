// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always run authentication check on mount
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    
    try {
      // Check localstorage first
      const storedUser = localStorage.getItem('bdms_user');
      if (!storedUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Parse stored user data to immediately set the user state
      // This prevents flicker during server verification
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Verify with server
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.user) {
          // Update with fresh server data
          setUser(userData.user);
          localStorage.setItem('bdms_user', JSON.stringify(userData.user));
        } else {
          // Server says no valid session
          setUser(null);
          localStorage.removeItem('bdms_user');
        }
      } else {
        // Server check failed
        setUser(null);
        localStorage.removeItem('bdms_user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('bdms_user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bdms_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Clear state immediately
      setUser(null);
      
      // Clear localstorage
      localStorage.removeItem('bdms_user');
      
      // Clear server session
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn('Server logout failed, but client state cleared');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure client state is cleared even if server call fails
      setUser(null);
      localStorage.removeItem('bdms_user');
    }
  };

  // Use the isAdmin field from your User schema
  const isAdmin = user?.isAdmin === true;
  const isAuthenticated = !!user;
  
  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    isAdmin,
  };
  
  return (
    <AuthContext.Provider value={value}>
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