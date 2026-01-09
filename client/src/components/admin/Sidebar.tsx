// client/src/components/admin/Sidebar.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Users,
  Heart,
  AlertTriangle,
  Shield,
  TrendingUp,
  Activity,
  FileText,
  Settings,
  LogOut,
  RefreshCw,
  Menu,
  X,
  BarChart3,
  Package,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  isSidebarOpen,
  setIsSidebarOpen
}: SidebarProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'donor-management', label: 'Donor Management', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'emergency-blood-request', label: 'Emergency Request', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'reactivation-request', label: 'Reactivation Request', icon: RefreshCw },
    { id: 'verification-request', label: 'Verification Request', icon: UserCheck },
    { id: 'activity-log', label: 'Activity Log', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle navigation item click
  const handleNavClick = useCallback((id: string) => {
    if (id === 'logout') {
      setActiveTab('logout');
      return;
    }
    
    setActiveTab(id);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
    // Scroll to top of page when navigation item is clicked
    window.scrollTo(0, 0);
  }, [setActiveTab, setIsSidebarOpen, isMobile]);

  // Toggle sidebar collapse state
  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  // Handle mouse enter - expand sidebar if collapsed
  const handleMouseEnter = useCallback(() => {
    if (isSidebarCollapsed && !isMobile) {
      setIsSidebarCollapsed(false);
    }
  }, [isSidebarCollapsed, isMobile]);

  // Handle mouse leave - collapse sidebar with delay
  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      // Set new timeout to collapse after a short delay
      hoverTimeoutRef.current = setTimeout(() => {
        setIsSidebarCollapsed(true);
      }, 300);
    }
  }, [isMobile]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen) {
        if (isMobile) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, setIsSidebarOpen, isMobile]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Update body class and padding when sidebar state changes
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('sidebar-open');
      document.body.classList.remove('sidebar-closed');
      
      // Apply padding to body to prevent content overlap
      if (!isMobile) {
        document.body.style.paddingLeft = isSidebarCollapsed ? '4rem' : '16rem';
      } else {
        document.body.style.paddingLeft = '0';
      }
    } else {
      document.body.classList.remove('sidebar-open');
      document.body.classList.add('sidebar-closed');
      document.body.style.paddingLeft = '0';
    }
    
    return () => {
      document.body.style.paddingLeft = '0';
    };
  }, [isSidebarOpen, isSidebarCollapsed, isMobile]);

  return (
    <>
      {/* Sidebar overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <motion.div
        ref={sidebarRef}
        className={`z-50 shadow-lg flex flex-col rounded-e-lg 3xl:rounded-e-none ${
          isMobile
            ? `fixed top-40 left-0 bottom-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `fixed top-40 left-0 bottom-0 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`
        } transition-all duration-300 ease-in-out`}
        initial={false}
        animate={{
          width: isSidebarCollapsed ? (isMobile ? 0 : 64) : (isMobile ? 256 : 256),
          x: isMobile && !isSidebarOpen ? -256 : 0
        }}
        style={{
          backgroundColor: isDarkMode ? '#0b0b0b' : '#F0F0F0',
          willChange: 'transform, width',
          overflow: 'hidden'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end p-2 border-b" style={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className="hidden md:flex"
            >
              {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>

          <nav 
            className="flex-1 py-2 flex flex-col justify-between overflow-y-auto overflow-x-hidden custom-scrollbar"
          >
            <ul className="space-y-0.5 px-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    aria-label={item.label}
                    style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      <item.icon
                        className="h-5 w-5"
                        style={{
                          color: activeTab === item.id ? '#000B58' : (isDarkMode ? '#94A3B8' : '#64748B')
                        }}
                      />
                    </div>
                    {!isSidebarCollapsed && <span className="ml-3 text-sm">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;