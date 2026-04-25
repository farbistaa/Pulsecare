import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
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

interface LayoutProps {
  children: React.ReactNode;
  onEmergencyClick?: () => void;
}

export default function Layout({ children, onEmergencyClick }: LayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  const navRef = useRef<HTMLElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isNavbarLocked, setIsNavbarLocked] = useState(true);

  // ============================================================
  // SCROLL RESTORATION FIX
  // ============================================================
  // Run once to disable browser default scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // ============================================================
  // SCROLL TO TOP ON ROUTE CHANGE
  // ============================================================
  // useLayoutEffect runs synchronously after DOM mutations but before painting.
  // This prevents the "flash" of the page at the bottom before jumping to top.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }, [location]);

  // ============================================================
  // ROUTE GUARD
  // ============================================================
  useEffect(() => {
    const protectedRoutes = ['/appointments', '/notifications', '/settings', '/profile', '/admin/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route));

    if (isProtectedRoute && !isAuthenticated) {
      navigate('/login');
    }
  }, [location, isAuthenticated, navigate]);

  // ============================================================
  // GLOBAL SCROLLBAR FIX & NAVBAR BEHAVIOR
  // ============================================================
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    document.body.style.overflowY = isMobile ? 'scroll' : 'scroll';
    document.body.style.scrollbarGutter = 'stable';

    return () => {
      document.body.style.overflowY = '';
      document.body.style.scrollbarGutter = '';
    };
  }, []);

  useEffect(() => {
    setIsNavbarLocked(true);
    if (navRef.current) {
      navRef.current.style.transform = 'translateY(0)';
    }
    
    // We don't need window.scrollTo here anymore because useLayoutEffect handles it

    if (logoContainerRef.current) {
      const width = logoContainerRef.current.offsetWidth;
      logoContainerRef.current.style.width = `${width}px`;
      logoContainerRef.current.style.minWidth = `${width}px`;
    }

    const stabilityTimer = setTimeout(() => {
      setIsNavbarLocked(false);
    }, 600);

    return () => clearTimeout(stabilityTimer);
  }, [location]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const controlNavbar = () => {
      if (isNavbarLocked) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const navElement = navRef.current;
          
          if (navElement) {
            const isScrollingDown = currentScrollY > lastScrollY;
            if (currentScrollY < 10) {
               navElement.style.transform = 'translateY(0)';
            } else if (isScrollingDown && currentScrollY > 100) {
               navElement.style.transform = 'translateY(-100%)';
            } else if (!isScrollingDown) {
               navElement.style.transform = 'translateY(0)';
            }
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
      }
      ticking = true;
    };
    
    window.addEventListener('scroll', controlNavbar, { passive: true });
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [isNavbarLocked]);
  
  const navItems = [
    { href: '/', label: 'Home', mobileLabel: 'Home' },
    ...(isAuthenticated ? [
      ...(user?.isAdmin ? [] : [{ href: '/profile', label: 'My Profile', mobileLabel: 'Profile' }]),
      { href: '/search', label: 'Find Donors', mobileLabel: 'Donors' },
      ...(user?.isAdmin ? [{ href: '/admin/dashboard', label: 'Admin Dashboard', mobileLabel: 'Admin' }] : [])
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
  
  const handleNavigation = (href: string) => {
    // If navigating to the same page, manually scroll to top since 
    // the route change won't trigger useLayoutEffect.
    if (location === href) {
      window.scrollTo(0, 0);
    } else {
      navigate(href);
    }
  };

  const handleDropdownSelect = (href: string) => {
    handleNavigation(href);
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  };
  
  return (
    <>
      <nav 
        ref={navRef}
        className="sticky top-0 z-50 bg-transparent pt-4 transition-transform duration-300 ease-in-out will-change-transform"
        style={{ transform: 'translateY(0)' }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div 
            className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-2 sm:px-4 py-3 sm:py-4"
            style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '1rem' }}
          >
            
            {/* LEFT - LOGO */}
            <div 
              ref={logoContainerRef}
              className="flex items-center justify-start"
              style={{ width: '150px', height: '40px' }}
            >
              <Link href="/">
                <div 
                  aria-label="PulseCare Homepage" 
                  className="flex items-center h-full cursor-pointer"
                  onClick={() => handleNavigation('/')}
                >
                  <img
                    src={pulsecareLogoUrl}
                    alt="PulseCare Logo"
                    className="h-full w-auto object-contain"
                    loading="eager"
                  />
                </div>
              </Link>
            </div>
            
            {/* CENTER - NAV LINKS */}
            <div className="flex justify-center items-center min-w-0">
              <div className="flex items-center gap-0.5 sm:gap-2 lg:gap-4 overflow-x-auto scrollbar-hide">
                {navItems.map((item) => (
                  // Removed manual onClick handler from here to prevent conflicts
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "text-gray-600 hover:text-gray-900 transition-colors duration-150 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap py-1 px-1.5 sm:px-2 rounded-md hover:bg-white/50",
                        location === item.href && "text-gray-900 font-semibold bg-white/60 shadow-sm"
                      )}
                    >
                      <span className="sm:hidden">{item.mobileLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* RIGHT - ACTIONS */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              
              <Button
                onClick={onEmergencyClick}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-sm flex-shrink-0"
                size="sm"
                aria-label="Create emergency blood request"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline text-xs sm:text-sm">Emergency</span>
              </Button>
              
              {isAuthenticated && user ? (
                <>
                  {user.isAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="relative h-7 w-7 sm:h-9 sm:w-9 rounded-full p-0 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                            <AvatarImage src={user.profilePicture || undefined} alt={user.fullName} />
                            <AvatarFallback className="text-xs">{getUserInitials(user.fullName)}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-56 sm:w-64 bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl" 
                        align="end"
                      >
                        <div className="flex items-center gap-2 p-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.fullName}</span>
                            <span className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</span>
                          </div>
                        </div>
                        
                        <DropdownMenuSeparator className="bg-gray-200/50" />
                        
                        <DropdownMenuItem 
                          className="hover:bg-white/60 focus:bg-white/60 cursor-pointer text-sm"
                          onSelect={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          ref={triggerRef}
                          variant="ghost" 
                          className="relative h-7 w-7 sm:h-9 sm:w-9 rounded-full p-0 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                            <AvatarImage src={user.profilePicture || undefined} alt={user.fullName} />
                            <AvatarFallback className="text-xs">{getUserInitials(user.fullName)}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-56 sm:w-64 bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl" 
                        align="end"
                      >
                        <div className="flex items-center gap-2 p-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.fullName}</span>
                            <span className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</span>
                          </div>
                        </div>
                        
                        <DropdownMenuSeparator className="bg-gray-200/50" />
                        
                        <DropdownMenuItem 
                          className="hover:bg-white/60 focus:bg-white/60 cursor-pointer text-sm"
                          onSelect={() => handleDropdownSelect('/appointments')}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Appointments</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="hover:bg-white/60 focus:bg-white/60 cursor-pointer text-sm"
                          onSelect={() => handleDropdownSelect('/notifications')}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          <span>Notifications</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="hover:bg-white/60 focus:bg-white/60 cursor-pointer text-sm"
                          onSelect={() => handleDropdownSelect('/settings')}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-gray-200/50" />
                        
                        <DropdownMenuItem 
                          className="hover:bg-white/60 focus:bg-white/60 cursor-pointer text-sm"
                          onSelect={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
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
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </>
  );
}   
