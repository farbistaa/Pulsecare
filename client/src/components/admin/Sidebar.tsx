// client/src/components/admin/Sidebar.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Menu, X } from 'lucide-react';
import Logout from '@/components/admin/Logout';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  Settings,
  LogOut,
  RefreshCw,
  Package,
  UserCheck,
  CalendarDays
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MOBILE_COLLAPSED_WIDTH = 56;
const MOBILE_EXPANDED_WIDTH = 220;
const DESKTOP_COLLAPSED_WIDTH = 64;
const DESKTOP_EXPANDED_WIDTH = 256;

export const TAB_TO_PATH: Record<string, string> = {
  'dashboard': '/admin/dashboard',
  'donor-management': '/admin/donor-management',
  'inventory': '/admin/inventory',
  'emergency-blood-request': '/admin/emergency-blood-request',
  'analytics': '/admin/analytics',
  'appointments': '/admin/appointments',
  'reactivation-request': '/admin/reactivation-request',
  'verification-request': '/admin/verification-request',
  'activity-log': '/admin/activity-log',
  'settings': '/admin/settings',
};

export const PATH_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([key, value]) => [value, key])
);

const SIDEBAR_COLORS = {
  dark: {
    background: '#111111',
    border: '#222222',
    inactiveIcon: '#94A3B8',
    inactiveText: '#CBD5E1',
    activeIcon: '#FFFFFF',
    activeText: '#FFFFFF',
    activeBg: 'rgba(255, 255, 255, 0.1)',
    hoverBg: 'rgba(255, 255, 255, 0.08)',
    logoutIcon: '#FCA5A5',
    logoutHoverBg: 'rgba(252, 165, 165, 0.12)',
    collapseButton: '#94A3B8',
    profileName: '#E2E8F0',
    profileSubtitle: '#64748B',
    profileBorder: '#333333',
  },
  light: {
    background: '#FFFFFF',
    border: '#e5e7eb',
    inactiveIcon: '#475569',
    inactiveText: '#475569',
    activeIcon: '#000B58',
    activeText: '#000B58',
    activeBg: 'rgba(0, 0, 0, 0.06)',
    hoverBg: 'rgba(0, 0, 0, 0.04)',
    logoutIcon: '#DC2626',
    logoutHoverBg: 'rgba(220, 38, 38, 0.06)',
    collapseButton: '#64748B',
    profileName: '#1a1a2e',
    profileSubtitle: '#94A3B8',
    profileBorder: '#e2e8f0',
  }
};

const Sidebar = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  isSidebarOpen,
  setIsSidebarOpen
}: SidebarProps) => {
  const { user, login } = useAuth();
  const [location, navigate] = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const [localProfilePic, setLocalProfilePic] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = isDarkMode ? SIDEBAR_COLORS.dark : SIDEBAR_COLORS.light;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'donor-management', label: 'Donor Management', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'emergency-blood-request', label: 'Emergency Request', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'reactivation-request', label: 'Reactivation Request', icon: RefreshCw },
    { id: 'verification-request', label: 'Verification Request', icon: UserCheck },
    { id: 'activity-log', label: 'Activity Log', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  const displayName = user?.fullName || user?.username || 'System Admin';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const dbPic = user?.profilePicture?.trim();
  const displayPicture = dbPic && dbPic.length > 5 ? dbPic : localProfilePic;

  useEffect(() => {
    const savedPic = localStorage.getItem('adminProfilePic');
    if (savedPic) {
      setLocalProfilePic(savedPic);
    }
  }, []);

  useEffect(() => {
    const tabFromPath = PATH_TO_TAB[location];
    if (tabFromPath && tabFromPath !== activeTab) {
      setActiveTab(tabFromPath);
    }
  }, [location, activeTab, setActiveTab]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

          localStorage.setItem('adminProfilePic', compressedDataUrl);
          setLocalProfilePic(compressedDataUrl);
          setImgError(false);

          const response = await fetch('/api/settings/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ profilePicture: compressedDataUrl }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              login(data.user);
            }
          }
        } catch (error) {
          console.error("Error processing/uploading image:", error);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // ========================================================================
  // FIXED: Scroll ALL scrollable containers to top, not just window
  // The admin dashboard uses <main overflow-y-auto> as the scroll container,
  // so window.scrollTo() alone doesn't work.
  // ========================================================================
  const handleNavClick = useCallback((id: string) => {
    const targetPath = TAB_TO_PATH[id];
    
    if (targetPath && location !== targetPath) {
      navigate(targetPath);
    }
    
    setActiveTab(id);
    
    if (isMobile) {
      setIsSidebarOpen(false);
    }
    
    // Scroll every possible scroll container to top instantly
    const scrollOptions: ScrollToOptions = { top: 0, behavior: 'instant' };
    
    // 1. Window (for pages where window is the scroll container)
    window.scrollTo(scrollOptions);
    
    // 2. Document element
    document.documentElement.scrollTo(scrollOptions);
    
    // 3. The actual scroll container in AdminDashboard: <main class="... overflow-y-auto">
    // Also catches any other nested scroll containers
    const scrollableElements = document.querySelectorAll(
      'main[class*="overflow"], main[class*="scroll"], [class*="overflow-y-auto"], [class*="overflow-auto"]'
    );
    
    scrollableElements.forEach((el) => {
      (el as HTMLElement).scrollTo(scrollOptions);
    });
    
    // 4. Fallback: check all elements and scroll any that have scrollTop > 0
    document.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.scrollTop > 0) {
        htmlEl.scrollTo(scrollOptions);
      }
    });
  }, [navigate, setActiveTab, setIsSidebarOpen, isMobile, location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen && isMobile) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, setIsSidebarOpen, isMobile]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    const handleResize = () => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      setIsSidebarOpen(false); 
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarOpen]);

  const [navbarHeight, setNavbarHeight] = useState(100);

  useEffect(() => {
    const updateNavbarHeight = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setNavbarHeight(104);
      } else if (w < 1024) {
        setNavbarHeight(120);
      } else {
        setNavbarHeight(176);
      }
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    return () => window.removeEventListener('resize', updateNavbarHeight);
  }, []);

  const currentWidth = isMobile
    ? (isSidebarOpen ? MOBILE_EXPANDED_WIDTH : MOBILE_COLLAPSED_WIDTH)
    : (isSidebarOpen ? DESKTOP_EXPANDED_WIDTH : DESKTOP_COLLAPSED_WIDTH);

  const currentTabFromPath = PATH_TO_TAB[location] || activeTab || 'dashboard';

  return (
    <>
      <AnimatePresence>
        {showLogoutModal && (
          <Logout onClose={() => setShowLogoutModal(false)} isDarkMode={isDarkMode} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60"
            style={{ zIndex: 9998 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        ref={sidebarRef}
        className={`fixed left-0 bottom-0 flex flex-col shadow-2xl ${
          isMobile ? 'rounded-none' : 'rounded-e-lg 3xl:rounded-e-none'
        }`}
        style={{
          top: `${navbarHeight}px`,
          zIndex: 9999,
          backgroundColor: colors.background,
          color: colors.activeText,
          overflow: 'hidden',
          borderRight: `1px solid ${colors.border}`,
        }}
        initial={false}
        animate={{
          width: currentWidth,
        }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 30
        }}
      >
        <style>{`
          [data-sidebar-root] * {
            outline: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          [data-sidebar-root] *:focus,
          [data-sidebar-root] *:focus-visible,
          [data-sidebar-root] *:active {
            outline: none !important;
            box-shadow: none !important;
            border-color: transparent !important;
          }
          [data-sidebar-root]::-webkit-scrollbar {
            display: none !important;
          }
          [data-sidebar-root] {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
        `}</style>

        <div
          className="flex flex-col h-full"
          style={{
            minWidth: currentWidth
          }}
          data-sidebar-root
        >
          <div
            className="flex items-center shrink-0"
            style={{
              borderBottom: `1px solid ${colors.border}`,
              minHeight: '40px',
              padding: '4px 6px'
            }}
          >
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center rounded-lg"
              style={{
                padding: isSidebarOpen 
                  ? (isMobile ? '7px 6px' : '8px 10px') 
                  : '7px 0',
                justifyContent: isSidebarOpen ? 'flex-end' : 'center',
                color: colors.collapseButton,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.hoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <div className="flex items-center justify-center shrink-0" style={{ width: '20px', height: '20px' }}>
                {isSidebarOpen ? <X className="h-[16px] w-[16px]" /> : <Menu className="h-[16px] w-[16px]" />}
              </div>
            </button>
          </div>

          <nav 
            className="flex-1 py-1 overflow-hidden" 
            role="navigation" 
            aria-label="Main navigation"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <ul className="flex flex-col gap-0.5 px-1.5" style={{ listStyle: 'none', margin: 0, padding: '4px 6px' }}>
              {navItems.map((item) => {
                const isActive = currentTabFromPath === item.id;
                const isLogout = item.id === 'logout';
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => isLogout ? setShowLogoutModal(true) : handleNavClick(item.id)}
                      className="w-full flex items-center rounded-lg"
                      style={{
                        padding: isSidebarOpen 
                          ? (isMobile ? '7px 6px' : '8px 10px') 
                          : '7px 0',
                        justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                        color: isLogout 
                          ? colors.logoutIcon 
                          : isActive 
                            ? colors.activeText 
                            : colors.inactiveText,
                        backgroundColor: isActive 
                          ? colors.activeBg 
                          : 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive && !isLogout) {
                          e.currentTarget.style.backgroundColor = colors.hoverBg;
                        } else if (isLogout) {
                          e.currentTarget.style.backgroundColor = colors.logoutHoverBg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isActive ? colors.activeBg : 'transparent';
                      }}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center justify-center shrink-0" style={{ width: '20px', height: '20px' }}>
                        <item.icon
                          className="h-[16px] w-[16px]"
                          style={{ 
                            color: isLogout 
                              ? colors.logoutIcon 
                              : isActive 
                                ? colors.activeIcon 
                                : colors.inactiveIcon 
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      {isSidebarOpen && (
                        <span className="ml-2 font-medium whitespace-nowrap" style={{ fontSize: '12px' }}>
                          {isMobile ? (item.label.length > 14 ? item.label.substring(0, 12) + '...' : item.label) : item.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className="shrink-0 p-1.5"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload profile picture"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center w-full group relative rounded-lg`}
              style={{ 
                padding: isSidebarOpen
                  ? (isMobile ? '6px 6px' : '8px 10px')
                  : '6px 0',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                gap: isSidebarOpen ? '10px' : '0',
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                outline: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.hoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Click to upload profile picture"
              aria-label="Change profile picture"
            >
              <div
                className="relative shrink-0 rounded-full bg-[#000B58] flex items-center justify-center text-white font-bold shadow-md border-2 overflow-hidden"
                style={{
                  width: isMobile ? '28px' : '32px',
                  height: isMobile ? '28px' : '32px',
                  fontSize: isMobile ? '10px' : '11px',
                  borderColor: colors.profileBorder
                }}
              >
                {displayPicture && !imgError ? (
                  <img 
                    src={displayPicture} 
                    alt={`${displayName}'s profile`} 
                    className="h-full w-full object-cover" 
                    onError={() => setImgError(true)} 
                  />
                ) : (
                  <span aria-hidden="true">{initials}</span>
                )}
                <div 
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  aria-hidden="true"
                >
                  <Camera className="h-3 w-3 text-white" />
                </div>
              </div>

              {isSidebarOpen && (
                <div className="flex flex-col overflow-hidden text-left min-w-0">
                  <span 
                    className="font-semibold truncate" 
                    style={{ 
                      color: colors.profileName, 
                      fontSize: isMobile ? '11px' : '12px' 
                    }}
                  >
                    {isMobile ? (displayName.length > 10 ? displayName.substring(0, 8) + '...' : displayName) : displayName}
                  </span>
                  {!isMobile && (
                    <span 
                      className="truncate" 
                      style={{ color: colors.profileSubtitle, fontSize: '10px' }}
                    >
                      System Admin
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;