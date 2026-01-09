import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { User } from '../types/user';
import {
  LayoutDashboard,
  Users,
  Package,
  AlertTriangle,
  BarChart3,
  UserCheck,
  RefreshCw,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';

// Admin Module Components
import AdminDashboard from '@/components/admin/AdminDashboard';
import DonorManagement from '@/components/admin/DonorManagement';
import InventoryManagement from '@/components/admin/InventoryManagement';
import EmergencyRequestManagement from '@/components/admin/EmergencyRequestManagement';
import AnalyticsModule from '@/components/admin/AnalyticsModule';
import VerificationRequests from '@/components/admin/VerificationRequests';
import ReactivationRequests from '@/components/admin/ReactivationRequests';
import AdminSettings from '@/components/admin/AdminSettings';

const adminMenuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    description: 'Overview and analytics'
  },
  {
    id: 'donors',
    label: 'Donor Management',
    icon: Users,
    path: '/admin/donors',
    description: 'Manage donor profiles'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    path: '/admin/inventory',
    description: 'Blood stock management'
  },
  {
    id: 'emergency',
    label: 'Emergency Requests',
    icon: AlertTriangle,
    path: '/admin/emergency',
    description: 'Urgent blood requests'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/admin/analytics',
    description: 'Reports and insights'
  },
  {
    id: 'verifications',
    label: 'Verifications',
    icon: UserCheck,
    path: '/admin/verifications',
    description: 'Verify user documents'
  },
  {
    id: 'reactivations',
    label: 'Reactivations',
    icon: RefreshCw,
    path: '/admin/reactivations',
    description: 'Account reactivation requests'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/admin/settings',
    description: 'System configuration'
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  user: any;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPath, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">PulseCare</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <Link key={item.id} href={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className={`text-xs ${isActive ? 'text-red-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profilePhotoPath} />
                <AvatarFallback className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs">
                  {user?.fullName?.split(' ').map((n: string) => n[0]).join('') || 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.fullName || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                
                {/* Search */}
                <div className="hidden md:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="search"
                    placeholder="Search donors, requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white p-0">
                    3
                  </Badge>
                </Button>
                {/* Quick Stats */}
                <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="text-center">
                    <p className="text-xs">Active Donors</p>
                    <p className="font-semibold text-green-600">1,564</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs">Pending Requests</p>
                    <p className="font-semibold text-orange-600">23</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [location] = useLocation();
  
  // Check authentication and admin status with proper typing
  const { data: authData, isLoading, error } = useQuery<{
    user: User | null;
    error?: string;
  }>({
    queryKey: ['/api/auth/check'],
    retry: false
  });
  
  const logoutMutation = useMutation({
    mutationFn: () => fetch('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      window.location.href = '/';
    }
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Extract user from authData
  const user = authData?.user;
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated and is admin
  if (error || !user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You need administrator privileges to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render appropriate admin module based on current path
  const renderAdminModule = () => {
    switch (location) {
      case '/admin':
        return <AdminDashboard />;
      case '/admin/donors':
        return <DonorManagement />;
      case '/admin/inventory':
        return <InventoryManagement />;
      case '/admin/emergency':
        return <EmergencyRequestManagement />;
      case '/admin/analytics':
        return <AnalyticsModule />;
      case '/admin/verifications':
        return <VerificationRequests />;
      case '/admin/reactivations':
        return <ReactivationRequests />;
      case '/admin/settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };
  
  return (
    <AdminLayout 
      currentPath={location} 
      user={user} 
      onLogout={handleLogout}
    >
      {renderAdminModule()}
    </AdminLayout>
  );
}