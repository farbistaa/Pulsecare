// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean; // Global loading state (checking session)
  isAdmin: boolean;
  checkAuth: () => Promise<void>; // Manual trigger
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  useEffect(() => {
    const auth = getFirebaseAuth();

    // 1. CHECK BACKEND SESSION (For Email/Password users)
    const checkBackendSession = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include', // Important: sends session cookie
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('bdms_user', JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem('bdms_user');
          }
        } else {
          setUser(null);
          localStorage.removeItem('bdms_user');
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
      } finally {
        // ONLY set loading to false AFTER backend check is complete
        setIsLoading(false);
      }
    };

    // 2. CHECK FIREBASE SESSION (For Phone/OTP users)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // If Firebase has a user, we need to ensure backend knows about them
        // This is mostly for persistence across reloads if using Firebase Auth
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth/firebase-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ idToken: token })
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('bdms_user', JSON.stringify(data.user));
          }
        } catch (error) {
          console.error("Firebase sync error:", error);
        }
      }
      // Note: We do NOT set isLoading(false) here because the Backend check handles the global loading state.
    });

    // 3. INITIALIZE
    checkBackendSession();

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bdms_user', JSON.stringify(userData));
  };

  const logout = async () => {
    setIsLoading(true); // Prevent UI interaction during logout
    try {
      const auth = getFirebaseAuth();
      
      // Sign out from Firebase
      try { 
        await firebaseSignOut(auth); 
      } catch (e) { 
        // Ignore errors if not logged in via Firebase
      }

      // Clear backend session
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
      localStorage.removeItem('bdms_user');
      
      // Hard reload to clear any stale state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };
  
  // Manual check function
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/check', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('bdms_user', JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem('bdms_user');
      }
    } catch (error) {
      console.error("Manual auth check failed", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.isAdmin === true;
  const isAuthenticated = !!user;
  
  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    isAdmin,
    checkAuth,
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