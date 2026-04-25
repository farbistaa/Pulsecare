// src/components/RouteGuard.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) return;
    
    const currentPath = location[0];
    
    console.log('RouteGuard - Current path:', currentPath);
    console.log('RouteGuard - Is admin:', isAdmin);
    
    // If admin is on profile page, redirect to admin dashboard
    if (isAdmin && (currentPath === '/profile' || currentPath.startsWith('/profile/'))) {
      console.log('RouteGuard: Redirecting admin to admin dashboard');
      setLocation('/admin/dashboard');
      return;
    }
    
    // If regular user is on admin page, redirect to profile
    if (!isAdmin && currentPath.includes('admin') && currentPath !== '/admin-login') {
      console.log('RouteGuard: Redirecting regular user to profile');
      setLocation('/profile');
      return;
    }
  }, [user, isLoading, isAdmin, location, setLocation]);

  return <>{children}</>;
};

export default RouteGuard;