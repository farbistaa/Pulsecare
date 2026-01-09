import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import pulsecareLogoUrl from "@assets/PulseCare Logo (1)_1756466608233.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Footer from './Footer';
import usePageBackground from '@/hooks/usePageBackground';

interface LayoutProps {
  children: React.ReactNode;
  onEmergencyClick?: () => void;
}

export default function Layout({ children, onEmergencyClick }: LayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  // Use our custom hook to set the page background
  usePageBackground();
  
  // Scroll to top when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  const navItems = [
    { href: '/', label: 'Home', mobileLabel: 'Home' },
    ...(isAuthenticated ? [
      ...(user?.isAdmin ? [] : [{ href: '/profile', label: 'My Profile', mobileLabel: 'Profile' }]),
      { href: '/search', label: 'Find Donors', mobileLabel: 'Donors' },
      ...(user?.isAdmin ? [{ href: '/admin-dashboard', label: 'Admin Dashboard', mobileLabel: 'Admin' }] : [])
    ] : [
      { href: '/search', label: 'Find Donors', mobileLabel: 'Donors' }
    ])
  ];
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };
  
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Handle navigation and scroll to top
  const handleNavigation = (href: string) => {
    if (location === href) {
      // If already on the same page, scroll to top
      window.scrollTo(0, 0);
    } else {
      // Navigate to the new page
      navigate(href);
    }
  };
  
  return (
    <>
      {/* Transparent navbar container - original vertical height, reduced horizontal width */}
      <nav className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-5 py-3 sm:py-4 lg:py-6">
          {/* Original height navbar with reduced width */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_16px_rgba(0,0,0,0.06)] px-2 sm:px-4 py-3 sm:py-4 flex items-center gap-1 sm:gap-2">
            {/* Left - Logo - original height, reduced width */}
            <div className="flex items-center flex-shrink-0 h-10 sm:h-12 overflow-visible">
              <Link href="/">
                <div 
                  aria-label="PulseCare Homepage" 
                  className="flex items-center h-full cursor-pointer"
                  onClick={() => handleNavigation('/')}
                >
                  <img
                    src={pulsecareLogoUrl}
                    alt="PulseCare Logo"
                    className="h-16 sm:h-20 lg:h-32 w-auto object-contain"
                    loading="eager"
                  />
                </div>
              </Link>
            </div>
            
            {/* Center - nav links - original height, reduced width */}
            <div className="flex flex-1 justify-center items-center min-w-0 mx-1 sm:mx-2">
              <div className="flex items-center gap-0.5 sm:gap-2 lg:gap-4 overflow-x-auto scrollbar-hide">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "text-gray-600 hover:text-gray-900 transition-colors duration-150 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap py-1 px-1.5 sm:px-2 rounded-md hover:bg-gray-50",
                        location === item.href && "text-gray-900 font-semibold bg-gray-50"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <span className="sm:hidden">{item.mobileLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Right - actions - original height, reduced width */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Theme toggle - original size */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              
              {/* Emergency button - original height, reduced width */}
              <Button
                onClick={onEmergencyClick}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-sm"
                size="sm"
                aria-label="Create emergency blood request"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline text-xs sm:text-sm">Emergency</span>
              </Button>
              
              {/* Auth / Avatar - original height */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-7 w-7 sm:h-9 sm:w-9 rounded-full p-0">
                      <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                        <AvatarImage src={user.profilePicture || undefined} alt={user.fullName} />
                        <AvatarFallback className="text-xs">{getUserInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 sm:w-64" align="end" forceMount>
                    <div className="flex items-center gap-2 p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.fullName}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/appointments">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span className="text-sm">Appointments</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/notifications">
                      <DropdownMenuItem>
                        <Bell className="mr-2 h-4 w-4" />
                        <span className="text-sm">Notifications</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span className="text-sm">Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="text-sm">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Link href="/login">
                    <div onClick={() => handleNavigation('/login')}>
                      <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 text-xs px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-lg whitespace-nowrap">
                        Login
                      </Button>
                    </div>
                  </Link>
                  <Link href="/register">
                    <div onClick={() => handleNavigation('/register')}>
                      <Button className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-lg shadow-sm whitespace-nowrap">
                        Sign up
                      </Button>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content area - no background to show page background */}
      <main className="flex-1 bg-transparent">
        {children}
      </main>
      
      <Footer />
    </>
  );
}