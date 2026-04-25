// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  excludeAdmins?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  excludeAdmins = false,
  redirectTo = adminOnly ? "/" : "/login"
}) => {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setLocation(redirectTo);
      return;
    }

    if (adminOnly && !isAdmin) {
      setLocation("/");
      return;
    }

    if (excludeAdmins && isAdmin) {
      setLocation("/admin/dashboard");
      return;
    }
    
    // Additional check: if user is admin and on profile route, redirect to admin dashboard
    if (isAdmin && location[0] === '/profile') {
      setLocation('/admin/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, isAdmin, adminOnly, excludeAdmins, location, setLocation, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || (adminOnly && !isAdmin) || (excludeAdmins && isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;