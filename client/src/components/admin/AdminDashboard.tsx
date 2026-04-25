// client/src/components/admin/AdminDashboard.tsx
import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { memo } from 'react';
import { HashLoader } from 'react-spinners';
// ========================================================================
// CHANGE 1 OF 4: Import useLocation from wouter (NOT react-router-dom)
// ========================================================================
import { useLocation } from 'wouter';
import {
  Users,
  Heart,
  AlertTriangle,
  Shield,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Droplet,
  Package,
  Zap,
  MapPin,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Search,
  MoreHorizontal,
  MessageSquare,
  Menu,
  X,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  RefreshCw,
  Download,
  Star,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  Brush,
  ErrorBar,
  Treemap,
  FunnelChart,
  Funnel,
  Tooltip as RechartsTooltip
} from 'recharts';

// Import extracted components
import DonorManagement from './DonorManagement';
import InventoryManagement from './InventoryManagement';
import ActivityLog from './ActivityLog';
import AdminSettings from './AdminSettings';
import AnalyticsModule from './AnalyticsModule';
import Appointments from './Appointments';
import EmergencyRequestManagement from './EmergencyRequestManagement';
import ReactivationRequests from './ReactivationRequests';
import VerificationRequests from './VerificationRequests';
import Logout from './Logout';
// ========================================================================
// CHANGE 2 OF 4: Import PATH_TO_TAB from Sidebar so we can map URL → tab
// ========================================================================
import Sidebar, { PATH_TO_TAB } from './Sidebar'; 

// Define interfaces
interface EmergencyRequest {
  id: number;
  patientName: string;
  patientAge: number;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  hospitalAddress: string;
  doctorName: string;
  contactNumber: string;
  requiredBy: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  isCritical: boolean;
  additionalInfo?: string;
  createdAt: string;
}

interface DashboardMetrics {
  donor: {
    totalDonors: number;
    activeDonors: number;
    donorsByBloodGroup: Array<{ name: string; count: number; percentage: number }>;
    donorsByGender: Array<{ gender: string; count: number }>;
    donorsByAge: Array<{ ageGroup: string; count: number }>;
    eligibleVsNot: Array<{ name: string; value: number; fill: string }>;
    recentRegistrations: Array<{ week: string; newRegistrations: number; activeDonations: number }>;
  };
  donation: {
    totalDonations: number;
    monthlyDonations: Array<{ month: string; count: number }>;
    multiYearTrends: Array<{ year: string; count: number }>;
    requestStatus: Array<{ status: string; count: number }>;
  };
  emergency: {
    totalRequests: number;
    pendingRequests: number;
    criticalAlerts: number;
    emergencyVsGeneral: Array<{ month: string; emergency: number; general: number }>;
    requestsByDistrict: Array<{ district: string; count: number }>;
    timeSensitive: Array<{ time: string; count: number }>;
  };
  inventory: {
    criticalLevels: Array<{ bloodGroup: string; units: number; criticalThreshold: number }>;
    utilizationRate: number;
  };
  geographic: {
    populationPyramid: Array<{ ageGroup: string; male: number; female: number }>;
    requestsByRadius: Array<{ radius: string; count: number }>;
    donorLocation: Array<{ district: string; donors: number; requests: number }>;
    geographicLocation: Array<{ district: string; donors: number }>;
  };
  engagement: {
    responseTime: Array<{ range: string; time: number; variability: number; min: number; max: number }>;
    ratingTrends: Array<{ category: string; q1: number; q2: number; q3: number; q4: number }>;
    fraudReports: Array<{ date: string; count: number }>;
  };
}

interface BasicStatsResponse {
  totalDonors: number;
  availableDonors: number;
  totalDonations: number;
  bloodRequests: number;
  pendingRequests: number;
  criticalAlerts: number;
  duplicateAlerts: number;
  readyToDonate: number;
  stats: DashboardStats;
}

interface DashboardStats {
  totalDonors: number;
  availableDonors: number;
  totalDonations: number;
  emergencyRequests: number;
  pendingVerifications: number;
  criticalAlerts: number;
  duplicateAlerts: number;
  readyToDonate: number;
}

// CSS variables for theming with WCAG compliant color codes
const COLORS = {
  primary: '#1F6FEB',
  accent1: '#FF6B6B',
  accent2: '#F97316',
  accent3: '#4BC0C8',
  accent4: '#8B5CF6',
  accent5: '#EC4899',
  accent6: '#10B981',
  accent7: '#F59E0B',
  neutralDark: '#0F1724',
  neutralLight: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBgDark: '#0b0b0b',
  text: '#0F1724',
  textDark: '#FFFFFF',
  muted: '#64748B',
  mutedDark: '#94A3B8',
  male: '#3b82f6',
  female: '#ec4899',
};

// Add global styles for smooth transitions and scrollbar
const globalStyles = `
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
  
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: var(--muted);
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--primary);
  }
`;

// Inject global styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}

const generateColors = (count: number) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360 / count) % 360;
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
};

const DISTRICT_COLORS = generateColors(64);

const CHART_COLORS = [
  COLORS.primary, 
  COLORS.accent1, 
  COLORS.accent2, 
  COLORS.accent3, 
  COLORS.accent4, 
  COLORS.accent5, 
  COLORS.accent6, 
  COLORS.accent7
];

// Sidebar width constants - must match Sidebar.tsx
const MOBILE_COLLAPSED_WIDTH = 56;
const MOBILE_EXPANDED_WIDTH = 220;
const DESKTOP_COLLAPSED_WIDTH = 64;
const DESKTOP_EXPANDED_WIDTH = 256;

// Memoized Stat Card Component
const StatCard = React.memo(({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color, 
  description, 
  onClick 
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
      className="cursor-pointer h-full"
    >
      <Card className="h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted truncate">
                  {title}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-text">
                  {value}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              {changeType !== 'neutral' && (
                <div className={`flex items-center space-x-1 text-xs sm:text-sm font-medium ${
                  changeType === 'increase' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {changeType === 'increase' ? (
                    <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span>{change}</span>
                </div>
              )}
              <p className="text-[10px] sm:text-xs text-muted mt-1 line-clamp-2 max-w-[100px] sm:max-w-[150px]">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Chart Skeleton Component
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
);

// Lazy Chart Component with Intersection Observer
const LazyChart = ({ children, id }: { children: React.ReactNode; id: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => {
            observer.unobserve(entry.target);
          }, 100);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} id={id} className="w-full h-full">
      {isVisible ? children : <ChartSkeleton />}
    </div>
  );
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ========================================================================
  // CHANGE 3 OF 4: Get location and navigate from wouter's useLocation
  // Wouter returns [currentPath, navigateFunction] — NOT separate hooks
  // ========================================================================
  const [location, navigate] = useLocation();

  // ========================================================================
  // CHANGE 4 OF 4: Initialize activeTab from the current URL path
  // so a direct page load or browser refresh shows the correct tab
  // ========================================================================
  const [activeTab, setActiveTab] = useState<string>(() => {
    return PATH_TO_TAB[location] || 'dashboard';
  });

  // Keep activeTab in sync when the URL changes (browser back/forward, etc.)
  useEffect(() => {
    const tabFromPath = PATH_TO_TAB[location];
    if (tabFromPath) {
      setActiveTab(tabFromPath);
    }
  }, [location]);

    // Keep activeTab in sync when the URL changes (browser back/forward, etc.)
  useEffect(() => {
    const tabFromPath = PATH_TO_TAB[location];
    if (tabFromPath) {
      setActiveTab(tabFromPath);
    }
  }, [location]);

  // Scroll to top whenever activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab]);

  const [timeRange, setTimeRange] = useState('7d');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pollingInterval] = useState(300000);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'csv'>('png');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);

  // Check for dark mode preference and detect mobile
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    const applyTheme = (dark: boolean) => {
      if (dark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.setProperty('--bg', '#000000');
        document.documentElement.style.setProperty('--card-bg', '#0b0b0b');
        document.documentElement.style.setProperty('--text', '#FFFFFF');
        document.documentElement.style.setProperty('--muted', '#94A3B8');
        document.documentElement.style.setProperty('--accent', '#4BC0C8');
        document.body.style.backgroundColor = '#000000';
        document.body.classList.add('bg-black');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.setProperty('--bg', '#FFFFFF');
        document.documentElement.style.setProperty('--card-bg', '#FFFFFF');
        document.documentElement.style.setProperty('--text', '#0F1724');
        document.documentElement.style.setProperty('--muted', '#64748B');
        document.documentElement.style.setProperty('--accent', '#1F6FEB');
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.classList.remove('bg-black');
      }
    };

    applyTheme(darkModePreference);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Toggle dark mode with transition
  const toggleDarkMode = useCallback(() => {
    setIsTransitioning(true);
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    setTimeout(() => {
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.setProperty('--bg', '#000000');
        document.documentElement.style.setProperty('--card-bg', '#0b0b0b');
        document.documentElement.style.setProperty('--text', '#FFFFFF');
        document.documentElement.style.setProperty('--muted', '#94A3B8');
        document.documentElement.style.setProperty('--accent', '#4BC0C8');
        document.body.style.backgroundColor = '#000000';
        document.body.classList.add('bg-black');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.setProperty('--bg', '#FFFFFF');
        document.documentElement.style.setProperty('--card-bg', '#FFFFFF');
        document.documentElement.style.setProperty('--text', '#0F1724');
        document.documentElement.style.setProperty('--muted', '#64748B');
        document.documentElement.style.setProperty('--accent', '#1F6FEB');
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.classList.remove('bg-black');
      }
      setIsTransitioning(false);
    }, 50);
  }, [isDarkMode]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Set up polling with fixed 5-minute interval
  useEffect(() => {
    const startPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      
      pollingRef.current = setInterval(() => {
        setLastUpdated(new Date());
        queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-data'] });
      }, pollingInterval);
    };

    startPolling();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [pollingInterval, queryClient]);

  // Batch API request for dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery<{
    metrics: DashboardMetrics;
    basicStats: BasicStatsResponse;
  }>({
    queryKey: ['/api/admin/dashboard-data', timeRange],
    refetchInterval: pollingInterval,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 30000,
  });

  // Handle error for dashboard query
  useEffect(() => {
    if (dashboardError) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Using cached data if available.",
        variant: "destructive",
      });
    }
  }, [dashboardError, toast]);
  
  const metrics = dashboardData?.metrics;
  const basicStats = dashboardData?.basicStats;
  const displayStats = basicStats?.stats || metrics;
  
  const totalDonors = useMemo(() => {
    if (basicStats && basicStats.totalDonors !== undefined) return basicStats.totalDonors;
    if (basicStats?.stats && basicStats.stats.totalDonors !== undefined) return basicStats.stats.totalDonors;
    if (metrics?.donor?.totalDonors !== undefined) return metrics.donor.totalDonors;
    return 0;
  }, [basicStats, metrics]);

  const availableDonors = useMemo(() => {
    if (basicStats && basicStats.availableDonors !== undefined) return basicStats.availableDonors;
    if (basicStats?.stats && basicStats.stats.availableDonors !== undefined) return basicStats.stats.availableDonors;
    if (metrics?.donor?.activeDonors !== undefined) return metrics.donor.activeDonors;
    return 0;
  }, [basicStats, metrics]);

  const totalDonations = useMemo(() => {
    if (basicStats && basicStats.totalDonations !== undefined) return basicStats.totalDonations;
    if (basicStats?.stats && basicStats.stats.totalDonations !== undefined) return basicStats.stats.totalDonations;
    if (metrics?.donation?.totalDonations !== undefined) return metrics.donation.totalDonations;
    return 0;
  }, [basicStats, metrics]);

  const bloodRequests = useMemo(() => {
    if (basicStats && basicStats.bloodRequests !== undefined) return basicStats.bloodRequests;
    if (basicStats?.stats && basicStats.stats.emergencyRequests !== undefined) return basicStats.stats.emergencyRequests;
    if (metrics?.emergency?.totalRequests !== undefined) return metrics.emergency.totalRequests;
    return 0;
  }, [basicStats, metrics]);

  const pendingRequests = useMemo(() => {
    if (basicStats && basicStats.pendingRequests !== undefined) return basicStats.pendingRequests;
    if (basicStats?.stats && basicStats.stats.pendingVerifications !== undefined) return basicStats.stats.pendingVerifications;
    if (metrics?.emergency?.pendingRequests !== undefined) return metrics.emergency.pendingRequests;
    return 0;
  }, [basicStats, metrics]);

  const criticalAlerts = useMemo(() => {
    if (basicStats && basicStats.criticalAlerts !== undefined) return basicStats.criticalAlerts;
    if (basicStats?.stats && basicStats.stats.criticalAlerts !== undefined) return basicStats.stats.criticalAlerts;
    if (metrics?.emergency?.criticalAlerts !== undefined) return metrics.emergency.criticalAlerts;
    return 0;
  }, [basicStats, metrics]);

  const duplicateAlerts = useMemo(() => {
    if (basicStats && basicStats.duplicateAlerts !== undefined) return basicStats.duplicateAlerts;
    if (basicStats?.stats && basicStats.stats.duplicateAlerts !== undefined) return basicStats.stats.duplicateAlerts;
    return 0;
  }, [basicStats, metrics]);

  const readyToDonate = useMemo(() => {
    if (basicStats && basicStats.readyToDonate !== undefined) return basicStats.readyToDonate;
    if (basicStats?.stats && basicStats.stats.readyToDonate !== undefined) return basicStats.stats.readyToDonate;
    return 0;
  }, [basicStats, metrics]);

  const sidebarWidth = useMemo(() => {
    if (isMobile) {
      return isSidebarOpen ? MOBILE_EXPANDED_WIDTH : MOBILE_COLLAPSED_WIDTH;
    }
    return isSidebarOpen ? DESKTOP_EXPANDED_WIDTH : DESKTOP_COLLAPSED_WIDTH;
  }, [isMobile, isSidebarOpen]);

  const bloodGroupData = useMemo(() => 
    metrics?.donor?.donorsByBloodGroup || [
      { name: 'A+', count: 312, percentage: 22 },
      { name: 'O+', count: 298, percentage: 21 },
      { name: 'B+', count: 267, percentage: 19 },
      { name: 'AB+', count: 189, percentage: 13 },
      { name: 'A-', count: 156, percentage: 11 },
      { name: 'O-', count: 134, percentage: 9 },
      { name: 'B-', count: 112, percentage: 8 },
      { name: 'AB-', count: 92, percentage: 7 }
    ], [metrics?.donor?.donorsByBloodGroup]);

  const genderData = useMemo(() => 
    metrics?.donor?.donorsByGender || [
      { gender: 'Male', count: 845 },
      { gender: 'Female', count: 712 },
      { gender: 'Other', count: 43 }
    ], [metrics?.donor?.donorsByGender]);

  const ageData = useMemo(() => 
    metrics?.donor?.donorsByAge || [
      { ageGroup: '18-25', count: 312 },
      { ageGroup: '26-35', count: 456 },
      { ageGroup: '36-45', count: 398 },
      { ageGroup: '46-55', count: 287 },
      { ageGroup: '56-65', count: 134 },
      { ageGroup: '65+', count: 13 }
    ], [metrics?.donor?.donorsByAge]);

  const monthlyDonationsData = useMemo(() => 
    metrics?.donation?.monthlyDonations || [
      { month: 'Jan', count: 67 },
      { month: 'Feb', count: 72 },
      { month: 'Mar', count: 85 },
      { month: 'Apr', count: 91 },
      { month: 'May', count: 88 },
      { month: 'Jun', count: 94 },
      { month: 'Jul', count: 102 },
      { month: 'Aug', count: 98 },
      { month: 'Sep', count: 105 },
      { month: 'Oct', count: 110 },
      { month: 'Nov', count: 95 },
      { month: 'Dec', count: 120 }
    ], [metrics?.donation?.monthlyDonations]);

  const multiYearDonationsData = useMemo(() => 
    metrics?.donation?.multiYearTrends || [
      { year: '2020', count: 456 },
      { year: '2021', count: 523 },
      { year: '2022', count: 612 },
      { year: '2023', count: 698 }
    ], [metrics?.donation?.multiYearTrends]);

  const requestStatusData = useMemo(() => 
    metrics?.donation?.requestStatus || [
      { status: 'Completed', count: 456 },
      { status: 'Pending', count: 123 },
      { status: 'Cancelled', count: 45 }
    ], [metrics?.donation?.requestStatus]);

  const emergencyVsGeneralData = useMemo(() => {
    const data = metrics?.emergency?.emergencyVsGeneral || [
      { month: 'Jan', emergency: 23, general: 44 },
      { month: 'Feb', emergency: 18, general: 54 },
      { month: 'Mar', emergency: 31, general: 54 },
      { month: 'Apr', emergency: 21, general: 70 },
      { month: 'May', emergency: 28, general: 60 },
      { month: 'Jun', emergency: 19, general: 75 }
    ];
    
    return data.map(item => ({
      ...item,
      emergency: Number(item.emergency),
      general: Number(item.general),
      total: Number(item.emergency) + Number(item.general)
    }));
  }, [metrics?.emergency?.emergencyVsGeneral]);

  const requestsByDivisionData = useMemo(() => {
    const requestsByDistrict = metrics?.emergency?.requestsByDistrict || [];
    
    const districtToDivisionMap: Record<string, string> = {
      'Barishal': 'Barishal', 'Barguna': 'Barishal', 'Bhola': 'Barishal',
      'Jhalokathi': 'Barishal', 'Patuakhali': 'Barishal', 'Pirojpur': 'Barishal',
      'Bandarban': 'Chattogram', 'Brahmanbaria': 'Chattogram', 'Chandpur': 'Chattogram',
      'Chattogram': 'Chattogram', 'Comilla': 'Chattogram', 'Cox\'s Bazar': 'Chattogram',
      'Feni': 'Chattogram', 'Khagrachhari': 'Chattogram', 'Lakshmipur': 'Chattogram',
      'Noakhali': 'Chattogram', 'Rangamati': 'Chattogram',
      'Dhaka': 'Dhaka', 'Faridpur': 'Dhaka', 'Gazipur': 'Dhaka',
      'Gopalganj': 'Dhaka', 'Kishoreganj': 'Dhaka', 'Madaripur': 'Dhaka',
      'Manikganj': 'Dhaka', 'Munshiganj': 'Dhaka', 'Narayanganj': 'Dhaka',
      'Narsingdi': 'Dhaka', 'Rajbari': 'Dhaka', 'Shariatpur': 'Dhaka', 'Tangail': 'Dhaka',
      'Bagerhat': 'Khulna', 'Chuadanga': 'Khulna', 'Jashore': 'Khulna',
      'Jhenaidah': 'Khulna', 'Khulna': 'Khulna', 'Kushtia': 'Khulna',
      'Magura': 'Khulna', 'Meherpur': 'Khulna', 'Narail': 'Khulna', 'Satkhira': 'Khulna',
      'Jamalpur': 'Mymensingh', 'Mymensingh': 'Mymensingh', 'Netrokona': 'Mymensingh', 'Sherpur': 'Mymensingh',
      'Bogura': 'Rajshahi', 'Joypurhat': 'Rajshahi', 'Naogaon': 'Rajshahi',
      'Natore': 'Rajshahi', 'Chapainawabganj': 'Rajshahi', 'Pabna': 'Rajshahi',
      'Rajshahi': 'Rajshahi', 'Sirajganj': 'Rajshahi',
      'Dinajpur': 'Rangpur', 'Gaibandha': 'Rangpur', 'Kurigram': 'Rangpur',
      'Lalmonirhat': 'Rangpur', 'Nilphamari': 'Rangpur', 'Panchagarh': 'Rangpur',
      'Rangpur': 'Rangpur', 'Thakurgaon': 'Rangpur',
      'Habiganj': 'Sylhet', 'Moulvibazar': 'Sylhet', 'Sunamganj': 'Sylhet', 'Sylhet': 'Sylhet'
    };
    
    const allDivisions = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
    const divisionData = new Map<string, number>();
    
    allDivisions.forEach(division => divisionData.set(division, 0));
    
    requestsByDistrict.forEach(request => {
      if (request && request.district) {
        const division = districtToDivisionMap[request.district];
        if (division) {
          divisionData.set(division, (divisionData.get(division) || 0) + (request.count || 0));
        }
      }
    });
    
    return Array.from(divisionData.entries()).map(([division, count]) => ({ division, count }));
  }, [metrics?.emergency?.requestsByDistrict]);

  const timeSensitiveData = useMemo(() => 
    metrics?.emergency?.timeSensitive || [
      { time: '00-04', count: 12 }, { time: '04-08', count: 8 },
      { time: '08-12', count: 32 }, { time: '12-16', count: 45 },
      { time: '16-20', count: 38 }, { time: '20-24', count: 22 }
    ], [metrics?.emergency?.timeSensitive]);

  const populationPyramidData = useMemo(() => {
    if (metrics?.geographic?.populationPyramid && metrics.geographic.populationPyramid.length > 0) {
      return metrics.geographic.populationPyramid;
    }
    return [
      { ageGroup: '18-25', male: 156, female: 145 },
      { ageGroup: '26-35', male: 228, female: 198 },
      { ageGroup: '36-45', male: 199, female: 176 },
      { ageGroup: '46-55', male: 143, female: 122 },
      { ageGroup: '56+', male: 67, female: 58 }
    ];
  }, [metrics?.geographic?.populationPyramid]);

  const requestsByRadiusData = useMemo(() => 
    metrics?.geographic?.requestsByRadius || [
      { radius: '< 5km', count: 45 }, { radius: '5-20km', count: 89 },
      { radius: '20-50km', count: 134 }, { radius: '> 50km', count: 67 }
    ], [metrics?.geographic?.requestsByRadius]);

  const donorLocationData = useMemo(() => {
    const donorLocation = metrics?.geographic?.donorLocation || [];
    
    const districtToDivisionMap: Record<string, string> = {
      'Barishal': 'Barishal', 'Barguna': 'Barishal', 'Bhola': 'Barishal',
      'Jhalokathi': 'Barishal', 'Patuakhali': 'Barishal', 'Pirojpur': 'Barishal',
      'Bandarban': 'Chattogram', 'Brahmanbaria': 'Chattogram', 'Chandpur': 'Chattogram',
      'Chattogram': 'Chattogram', 'Comilla': 'Chattogram', 'Cox\'s Bazar': 'Chattogram',
      'Feni': 'Chattogram', 'Khagrachhari': 'Chattogram', 'Lakshmipur': 'Chattogram',
      'Noakhali': 'Chattogram', 'Rangamati': 'Chattogram',
      'Dhaka': 'Dhaka', 'Faridpur': 'Dhaka', 'Gazipur': 'Dhaka',
      'Gopalganj': 'Dhaka', 'Kishoreganj': 'Dhaka', 'Madaripur': 'Dhaka',
      'Manikganj': 'Dhaka', 'Munshiganj': 'Dhaka', 'Narayanganj': 'Dhaka',
      'Narsingdi': 'Dhaka', 'Rajbari': 'Dhaka', 'Shariatpur': 'Dhaka', 'Tangail': 'Dhaka',
      'Bagerhat': 'Khulna', 'Chuadanga': 'Khulna', 'Jashore': 'Khulna',
      'Jhenaidah': 'Khulna', 'Khulna': 'Khulna', 'Kushtia': 'Khulna',
      'Magura': 'Khulna', 'Meherpur': 'Khulna', 'Narail': 'Khulna', 'Satkhira': 'Khulna',
      'Jamalpur': 'Mymensingh', 'Mymensingh': 'Mymensingh', 'Netrokona': 'Mymensingh', 'Sherpur': 'Mymensingh',
      'Bogura': 'Rajshahi', 'Joypurhat': 'Rajshahi', 'Naogaon': 'Rajshahi',
      'Natore': 'Rajshahi', 'Chapainawabganj': 'Rajshahi', 'Pabna': 'Rajshahi',
      'Rajshahi': 'Rajshahi', 'Sirajganj': 'Rajshahi',
      'Dinajpur': 'Rangpur', 'Gaibandha': 'Rangpur', 'Kurigram': 'Rangpur',
      'Lalmonirhat': 'Rangpur', 'Nilphamari': 'Rangpur', 'Panchagarh': 'Rangpur',
      'Rangpur': 'Rangpur', 'Thakurgaon': 'Rangpur',
      'Habiganj': 'Sylhet', 'Moulvibazar': 'Sylhet', 'Sunamganj': 'Sylhet', 'Sylhet': 'Sylhet'
    };
    
    const allDivisions = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
    const divisionData = new Map<string, { donors: number; requests: number }>();
    
    allDivisions.forEach(division => divisionData.set(division, { donors: 0, requests: 0 }));
    
    donorLocation.forEach(loc => {
      if (loc && loc.district) {
        const division = districtToDivisionMap[loc.district];
        if (division) {
          const current = divisionData.get(division) || { donors: 0, requests: 0 };
          divisionData.set(division, {
            donors: current.donors + (loc.donors || 0),
            requests: current.requests + (loc.requests || 0)
          });
        }
      }
    });
    
    return Array.from(divisionData.entries()).map(([division, data]) => ({
      division, donors: data.donors, requests: data.requests
    }));
  }, [metrics?.geographic?.donorLocation]);

  const responseTimeData = useMemo(() => 
    metrics?.engagement?.responseTime || [
      { range: '0-15min', time: 12, variability: 3, min: 9, max: 15 },
      { range: '15-30min', time: 22, variability: 5, min: 17, max: 27 },
      { range: '30-60min', time: 45, variability: 8, min: 37, max: 53 },
      { range: '60+min', time: 78, variability: 12, min: 66, max: 90 }
    ], [metrics?.engagement?.responseTime]);

  const ratingTrendsData = useMemo(() => 
    metrics?.engagement?.ratingTrends || [
      { category: 'Response Time', q1: 4.2, q2: 4.5, q3: 4.1, q4: 4.7 },
      { category: 'Professionalism', q1: 4.5, q2: 4.3, q3: 4.6, q4: 4.8 },
      { category: 'Communication', q1: 4.1, q2: 4.4, q3: 4.2, q4: 4.5 },
      { category: 'Overall', q1: 4.3, q2: 4.4, q3: 4.3, q4: 4.6 }
    ], [metrics?.engagement?.ratingTrends]);

  const fraudReportsData = useMemo(() => 
    metrics?.engagement?.fraudReports || [
      { date: 'Jan', count: 3 }, { date: 'Feb', count: 5 },
      { date: 'Mar', count: 2 }, { date: 'Apr', count: 7 },
      { date: 'May', count: 4 }, { date: 'Jun', count: 1 }
    ], [metrics?.engagement?.fraudReports]);

  const newEligibleData = useMemo(() => {
    if (metrics?.donor?.eligibleVsNot && metrics.donor.eligibleVsNot.length > 0) {
      return metrics.donor.eligibleVsNot;
    }
    return [
      { name: 'Active', value: 0, fill: '#4CAF50' },
      { name: 'Inactive', value: 0, fill: '#F44336' },
      { name: 'Available', value: 0, fill: '#2196F3' },
      { name: 'Not Available', value: 0, fill: '#9E9E9E' }
    ];
  }, [metrics?.donor?.eligibleVsNot]);

  const emergencyResponseData = useMemo(() => [
    { time: '0-15 min', count: 45, color: '#10B981' },
    { time: '15-30 min', count: 32, color: '#F59E0B' },
    { time: '30-60 min', count: 18, color: '#EF4444' },
    { time: '60+ min', count: 5, color: '#6B7280' }
  ], []);

  const donorActivityData = useMemo(() => 
    metrics?.donor?.recentRegistrations || [
      { week: 'Week 1', newRegistrations: 23, activeDonations: 45 },
      { week: 'Week 2', newRegistrations: 31, activeDonations: 52 },
      { week: 'Week 3', newRegistrations: 28, activeDonations: 48 },
      { week: 'Week 4', newRegistrations: 35, activeDonations: 61 }
    ], [metrics?.donor?.recentRegistrations]);

  const criticalBloodLevels = useMemo(() => [
    { bloodGroup: 'O-', count: 12, status: 'critical' },
    { bloodGroup: 'AB-', count: 24, status: 'low' },
    { bloodGroup: 'B-', count: 48, status: 'low' },
    { bloodGroup: 'A-', count: 67, status: 'healthy' },
    { bloodGroup: 'O+', count: 89, status: 'healthy' },
    { bloodGroup: 'B+', count: 112, status: 'healthy' },
    { bloodGroup: 'A+', count: 134, status: 'healthy' },
    { bloodGroup: 'AB+', count: 156, status: 'healthy' }
  ], []);

  const divisionComparisonData = useMemo(() => {
    const requestsByDistrict = metrics?.emergency?.requestsByDistrict || [];
    const donorsByDistrict = metrics?.geographic?.donorLocation || [];
    
    const districtToDivisionMap: Record<string, string> = {
      'Barishal': 'Barishal', 'Barguna': 'Barishal', 'Bhola': 'Barishal',
      'Jhalokathi': 'Barishal', 'Patuakhali': 'Barishal', 'Pirojpur': 'Barishal',
      'Bandarban': 'Chattogram', 'Brahmanbaria': 'Chattogram', 'Chandpur': 'Chattogram',
      'Chattogram': 'Chattogram', 'Comilla': 'Chattogram', 'Cox\'s Bazar': 'Chattogram',
      'Feni': 'Chattogram', 'Khagrachhari': 'Chattogram', 'Lakshmipur': 'Chattogram',
      'Noakhali': 'Chattogram', 'Rangamati': 'Chattogram',
      'Dhaka': 'Dhaka', 'Faridpur': 'Dhaka', 'Gazipur': 'Dhaka',
      'Gopalganj': 'Dhaka', 'Kishoreganj': 'Dhaka', 'Madaripur': 'Dhaka',
      'Manikganj': 'Dhaka', 'Munshiganj': 'Dhaka', 'Narayanganj': 'Dhaka',
      'Narsingdi': 'Dhaka', 'Rajbari': 'Dhaka', 'Shariatpur': 'Dhaka', 'Tangail': 'Dhaka',
      'Bagerhat': 'Khulna', 'Chuadanga': 'Khulna', 'Jashore': 'Khulna',
      'Jhenaidah': 'Khulna', 'Khulna': 'Khulna', 'Kushtia': 'Khulna',
      'Magura': 'Khulna', 'Meherpur': 'Khulna', 'Narail': 'Khulna', 'Satkhira': 'Khulna',
      'Jamalpur': 'Mymensingh', 'Mymensingh': 'Mymensingh', 'Netrokona': 'Mymensingh', 'Sherpur': 'Mymensingh',
      'Bogura': 'Rajshahi', 'Joypurhat': 'Rajshahi', 'Naogaon': 'Rajshahi',
      'Natore': 'Rajshahi', 'Chapainawabganj': 'Rajshahi', 'Pabna': 'Rajshahi',
      'Rajshahi': 'Rajshahi', 'Sirajganj': 'Rajshahi',
      'Dinajpur': 'Rangpur', 'Gaibandha': 'Rangpur', 'Kurigram': 'Rangpur',
      'Lalmonirhat': 'Rangpur', 'Nilphamari': 'Rangpur', 'Panchagarh': 'Rangpur',
      'Rangpur': 'Rangpur', 'Thakurgaon': 'Rangpur',
      'Habiganj': 'Sylhet', 'Moulvibazar': 'Sylhet', 'Sunamganj': 'Sylhet', 'Sylhet': 'Sylhet'
    };
    
    const allDivisions = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
    const divisionData = new Map<string, { requests: number; donors: number }>();
    
    allDivisions.forEach(division => divisionData.set(division, { requests: 0, donors: 0 }));
    
    requestsByDistrict.forEach(request => {
      if (request && request.district) {
        const division = districtToDivisionMap[request.district];
        if (division) {
          const currentData = divisionData.get(division) || { requests: 0, donors: 0 };
          const count = parseInt(String(request.count).replace(/^0+/, ''), 10) || 0;
          divisionData.set(division, { requests: currentData.requests + count, donors: currentData.donors });
        }
      }
    });
    
    donorsByDistrict.forEach(donor => {
      if (donor && donor.district) {
        const division = districtToDivisionMap[donor.district];
        if (division) {
          const currentData = divisionData.get(division) || { requests: 0, donors: 0 };
          divisionData.set(division, { requests: currentData.requests, donors: currentData.donors + (donor.donors || 0) });
        }
      }
    });
    
    return Array.from(divisionData.entries()).map(([division, data]) => ({
      division, requests: data.requests, donors: data.donors
    }));
  }, [metrics?.emergency?.requestsByDistrict, metrics?.geographic?.donorLocation]);

  const districtWiseDonorData = useMemo(() => {
    if (metrics?.geographic?.donorLocation && metrics.geographic.donorLocation.length > 0) {
      return [...metrics.geographic.donorLocation]
        .sort((a, b) => a.district.localeCompare(b.district))
        .map(item => ({ district: item.district, donors: item.donors }));
    }
    
    const districts = [
      'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria',
      'Chandpur', 'Chattogram', 'Chuadanga', 'Cumilla', 'Cox\'s Bazar', 'Dhaka', 'Dinajpur',
      'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur',
      'Jashore', 'Jhalokathi', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj',
      'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj',
      'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj',
      'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh',
      'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira',
      'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
    ];
    
    return districts.map((district) => ({
      district,
      donors: Math.floor(Math.random() * 500) + 50
    }));
  }, [metrics?.geographic?.donorLocation]);

  const donationFunnelData = useMemo(() => [
    { name: 'Registered Donors', value: 1600, fill: COLORS.primary },
    { name: 'Eligible Donors', value: 1234, fill: COLORS.accent3 },
    { name: 'Available Donors', value: 800, fill: COLORS.accent2 },
    { name: 'Scheduled Donations', value: 450, fill: COLORS.accent1 },
    { name: 'Completed Donations', value: 412, fill: COLORS.accent4 }
  ], []);

  const bloodTypeTreemapData = useMemo(() => {
    if (metrics?.donor?.donorsByBloodGroup && metrics.donor.donorsByBloodGroup.length > 0) {
      const colors: Record<string, string> = {
        'A+': COLORS.accent1, 'A-': COLORS.accent4, 'B+': COLORS.accent2,
        'B-': COLORS.accent6, 'AB+': COLORS.accent3, 'AB-': COLORS.accent7,
        'O+': COLORS.primary, 'O-': COLORS.accent5
      };
      return metrics.donor.donorsByBloodGroup.map((item: { name: string; count: number }) => ({
        name: item.name, size: item.count, color: colors[item.name] || COLORS.muted
      }));
    }
    return [
      { name: 'O+', size: 298, color: COLORS.primary },
      { name: 'A+', size: 312, color: COLORS.accent1 },
      { name: 'B+', size: 267, color: COLORS.accent2 },
      { name: 'AB+', size: 189, color: COLORS.accent3 },
      { name: 'A-', size: 156, color: COLORS.accent4 },
      { name: 'O-', size: 134, color: COLORS.accent5 },
      { name: 'B-', size: 112, color: COLORS.accent6 },
      { name: 'AB-', size: 92, color: COLORS.accent7 }
    ];
  }, [metrics?.donor?.donorsByBloodGroup]);

  const responseTimeFlowData = useMemo(() => [
    { name: 'Immediate', value: 45, color: COLORS.accent6 },
    { name: 'Fast', value: 32, color: COLORS.accent2 },
    { name: 'Moderate', value: 18, color: COLORS.accent1 },
    { name: 'Slow', value: 5, color: COLORS.accent4 }
  ], []);

  // Fixed quickStats — onClick now navigates to the URL (not just sets state)
  const quickStats = useMemo(() => [
    {
      title: 'Total Donors',
      value: totalDonors.toLocaleString(),
      change: totalDonors > 0 ? '+12%' : '0%',
      changeType: totalDonors > 0 ? 'increase' as const : 'neutral' as const,
      icon: Users,
      color: 'bg-blue-500',
      description: `${availableDonors.toLocaleString()} active donors`,
      onClick: () => navigate('/admin/donor-management')
    },
    {
      title: 'Total Blood Donations',
      value: totalDonations.toLocaleString(),
      change: totalDonations > 0 ? '+8%' : '0%',
      changeType: totalDonations > 0 ? 'increase' as const : 'neutral' as const,
      icon: Droplet,
      color: 'bg-red-500',
      description: 'Completed donations',
      onClick: () => navigate('/admin/analytics')
    },
    {
      title: 'Critical Blood Levels',
      value: criticalBloodLevels.filter(bg => bg.status === 'critical').length.toString(),
      change: criticalBloodLevels.filter(bg => bg.status === 'critical').length > 0 ? '-2' : '0',
      changeType: criticalBloodLevels.filter(bg => bg.status === 'critical').length > 0 ? 'decrease' as const : 'neutral' as const,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      description: 'Blood groups in critical need',
      onClick: () => navigate('/admin/inventory')
    },
    {
      title: 'Donors Ready to Donate',
      value: readyToDonate.toLocaleString(),
      change: readyToDonate > 0 ? '+5%' : '0%',
      changeType: readyToDonate > 0 ? 'increase' as const : 'neutral' as const,
      icon: Heart,
      color: 'bg-green-500',
      description: 'Available or eligible donors',
      onClick: () => navigate('/admin/donor-management')
    },
    {
      title: 'Pending Emergency Requests',
      value: pendingRequests.toLocaleString(),
      change: pendingRequests > 0 ? '+23%' : '0%',
      changeType: pendingRequests > 0 ? 'increase' as const : 'neutral' as const,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Awaiting fulfillment',
      onClick: () => navigate('/admin/emergency-blood-request')
    },
    {
      title: 'Duplicate Data Alert',
      value: duplicateAlerts.toLocaleString(),
      change: duplicateAlerts > 0 ? '+3' : '0',
      changeType: duplicateAlerts > 0 ? 'increase' as const : 'neutral' as const,
      icon: AlertTriangle,
      color: 'bg-purple-500',
      description: 'Potential duplicate records',
      onClick: () => navigate('/admin/donor-management')
    }
  ], [totalDonors, availableDonors, totalDonations, criticalBloodLevels, readyToDonate, pendingRequests, duplicateAlerts, navigate]);

  const isLoading = dashboardLoading;

  const exportChart = useCallback(async (chartId: string, format: 'png' | 'pdf' | 'csv') => {
    toast({
      title: "Export Started",
      description: `Exporting chart as ${format.toUpperCase()}...`,
    });
    
    try {
      const chartElement = document.getElementById(`chart-container-${chartId}`);
      if (!chartElement) throw new Error('Chart element not found');
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      if (format === 'png') {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${chartId}.png`;
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${chartId}.pdf`);
      } else if (format === 'csv') {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        if (chartId === 'blood-group-chart') {
          csvContent += "Blood Group,Count,Percentage\n";
          bloodGroupData.forEach((item: { name: string; count: number; percentage: number }) => {
            csvContent += `${item.name},${item.count},${item.percentage}\n`;
          });
        } else if (chartId === 'gender-chart') {
          csvContent += "Gender,Count\n";
          genderData.forEach((item: { gender: string; count: number }) => {
            csvContent += `${item.gender},${item.count}\n`;
          });
        } else if (chartId === 'population-chart' || chartId === 'age-chart') {
          csvContent += "Age Group,Count\n";
          ageData.forEach((item: { ageGroup: string; count: number }) => {
            csvContent += `${item.ageGroup},${item.count}\n`;
          });
        } else if (chartId === 'district-wise-chart') {
          csvContent += "District,Donors\n";
          districtWiseDonorData.forEach((item: { district: string; donors: number }) => {
            csvContent += `${item.district},${item.donors}\n`;
          });
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${chartId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: "Export Complete",
        description: `Chart exported successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export chart as ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    }
  }, [bloodGroupData, genderData, ageData, districtWiseDonorData, isDarkMode, toast]);

  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 sm:p-3 rounded-md shadow-md text-xs sm:text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, [isDarkMode]);

  const getTabTitle = useCallback(() => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'donor-management': 'Donor Management',
      'inventory': 'Inventory',
      'emergency-blood-request': 'Emergency Requests',
      'analytics': 'Analytics',
      'appointments': 'Appointments',
      'reactivation-request': 'Reactivation Requests',
      'verification-request': 'Verification Requests',
      'activity-log': 'Activity Log',
      'settings': 'Settings',
    };
    return titles[activeTab] || 'Dashboard';
  }, [activeTab]);

  const getTabDescription = useCallback(() => {
    const descriptions: Record<string, string> = {
      'dashboard': 'Real-time overview of your blood donation management system',
      'donor-management': 'Manage donor profiles and eligibility',
      'inventory': 'Donor Availability Management',
      'emergency-blood-request': 'Handle emergency blood requests',
      'analytics': 'Comprehensive analytics and reports',
      'reactivation-request': 'Process donor reactivation requests',
      'verification-request': 'Review new donor verifications',
      'activity-log': 'View system activity and audit logs',
      'settings': 'Configure system settings and preferences',
      'logout': 'Securely logout of the system',
    };
    return descriptions[activeTab] || '';
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <HashLoader color="#ff0000" size={80} />
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex w-full ${isTransitioning ? 'pointer-events-none' : ''}`} 
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      <div 
        className="flex-1 flex flex-col overflow-hidden min-w-0"
        style={{ 
          marginLeft: `${sidebarWidth}px`,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 pt-4 md:pt-20 md:pb-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Mobile Header */}
            <div className="md:hidden space-y-3 pt-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {getTabTitle()}
                </h1>
                <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  {getTabDescription()}
                </p>
              </div>
              
              {activeTab === 'dashboard' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={toggleDarkMode} disabled={isTransitioning} className="text-xs px-3 py-1.5 h-8">
                    {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                  </Button>
                  <div className="flex items-center gap-1 ml-auto">
                    <Button variant={timeRange === '7d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('7d')} className="text-xs px-2 sm:px-3 py-1.5 h-8">7D</Button>
                    <Button variant={timeRange === '30d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('30d')} className="text-xs px-2 sm:px-3 py-1.5 h-8">30D</Button>
                    <Button variant={timeRange === '90d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('90d')} className="text-xs px-2 sm:px-3 py-1.5 h-8">90D</Button>
                  </div>
                </div>
              )}
              
              {activeTab !== 'dashboard' && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={toggleDarkMode} disabled={isTransitioning} className="text-xs px-3 py-1.5 h-8">
                    {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex flex-col md:flex-row md:items-center md:justify-between mb-6 lg:mb-8">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'donor-management' && 'Donor Management'}
                  {activeTab === 'inventory' && 'Inventory'}
                  {activeTab === 'emergency-blood-request' && 'Emergency Requests'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'reactivation-request' && 'Reactivation Requests'}
                  {activeTab === 'verification-request' && 'Verification Requests'}
                  {activeTab === 'activity-log' && 'Activity Log'}
                  {activeTab === 'settings' && 'Settings'}
                  {activeTab === 'logout' && 'Logout'}
                </h1>
                <p className="mt-2 text-sm lg:text-base" style={{ color: 'var(--muted)' }}>
                  {getTabDescription()}
                </p>
              </div>
              
              <div className="flex items-center space-x-3 lg:space-x-4">
                <Button variant="outline" size="sm" onClick={toggleDarkMode} disabled={isTransitioning}>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
                
                {activeTab === 'dashboard' && (
                  <div className="flex items-center space-x-2">
                    <Button variant={timeRange === '7d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('7d')}>7 Days</Button>
                    <Button variant={timeRange === '30d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('30d')}>30 Days</Button>
                    <Button variant={timeRange === '90d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('90d')}>90 Days</Button>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-6 lg:space-y-6"
              >
                {activeTab === 'dashboard' && (
                  <div className="space-y-4 sm:space-y-6 lg:space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {quickStats.map((stat) => (
                        <StatCard
                          key={stat.title}
                          title={stat.title}
                          value={stat.value}
                          change={stat.change}
                          changeType={stat.changeType}
                          icon={stat.icon}
                          color={stat.color}
                          description={stat.description}
                          onClick={stat.onClick}
                        />
                      ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Blood Group Distribution */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-blood-group-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <Droplet className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#FF6B6B' }} />
                                <span className="truncate">Blood Group Distribution</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Distribution of donors by blood type</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('blood-group-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="blood-group-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie data={bloodGroupData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="count" label={({ name, count, percentage }) => `${name}: ${count} (${percentage}%)`} labelLine={true}>
                                    {bloodGroupData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Gender Distribution Chart */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-gender-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#8B5CF6' }} />
                                <span className="truncate">Gender Distribution</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Distribution of donors by gender</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('gender-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="gender-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="count" label={({ gender, count }) => `${gender}: ${count}`}>
                                    {genderData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.male : index === 2 ? COLORS.female : '#FF6B6B'} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* District Wise Donor Distribution Chart */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-district-wise-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#F59E0B' }} />
                                <span className="truncate">District-wise Donor Distribution</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Number of donors by district (64 districts)</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('district-wise-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="district-wise-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={districtWiseDonorData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} interval={1} tick={{ fontSize: 7 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Bar dataKey="donors" radius={[4, 4, 0, 0]}>
                                    {districtWiseDonorData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={DISTRICT_COLORS[index % DISTRICT_COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Requests vs Donors by Division */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-divison-comparison-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#F97316' }} />
                                <span className="truncate">Requests vs Donors by Division</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Comparison of requests and donors</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('division-comparison-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="division-comparison-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                {divisionComparisonData.length > 0 ? (
                                  <BarChart data={divisionComparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="division" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="requests" fill="#497D74" name="Requests" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="donors" fill="#00879E" name="Donors" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <p className="text-muted">No division data available</p>
                                  </div>
                                )}
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Registered Users Growth */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-users-growth-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#1F6FEB' }} />
                                <span className="truncate">Registered Users Growth</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Trends by month/quarter</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('users-growth-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="users-growth-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={donorActivityData}>
                                  <defs>
                                    <linearGradient id="colorNewRegistrations" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#1F6FEB" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#1F6FEB" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorActiveDonations" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#4BC0C8" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#4BC0C8" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                  <Area type="monotone" dataKey="newRegistrations" stroke="#1F6FEB" fillOpacity={1} fill="url(#colorNewRegistrations)" />
                                  <Area type="monotone" dataKey="activeDonations" stroke="#4BC0C8" fillOpacity={1} fill="url(#colorActiveDonations)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Donor Status Comparison */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-eligible-status-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#F97316' }} />
                                <span className="truncate">Donor Status Comparison</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Available, Active and Inactive donors</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('eligible-status-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="eligible-status-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie data={newEligibleData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} paddingAngle={1} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                    {newEligibleData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Monthly Donations */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-monthly-donations-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <Droplet className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#FF6B6B' }} />
                                <span className="truncate">Monthly Donations</span>
                              </CardTitle>
                              <CardDescription className="text-xs">12 months of data</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('monthly-donations-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="monthly-donations-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={monthlyDonationsData}>
                                  <defs>
                                    <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#1F6FEB" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#1F6FEB" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area type="monotone" dataKey="count" stroke="#1F6FEB" fillOpacity={1} fill="url(#colorMonthly)" strokeWidth={2} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Donation Conversion Funnel */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-donation-trends-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#4BC0C8' }} />
                                <span className="truncate">Donation Conversion Funnel</span>
                              </CardTitle>
                              <CardDescription className="text-xs">From registration to completion</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('donation-trends-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="donation-trends-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <FunnelChart>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Funnel dataKey="value" data={donationFunnelData} isAnimationActive>
                                    {donationFunnelData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Funnel>
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </FunnelChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Request Status Comparison */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-request-status-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#F97316' }} />
                                <span className="truncate">Request Status Comparison</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Status trends over time</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('request-status-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="request-status-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={requestStatusData}>
                                  <defs>
                                    <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#1F6FEB" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#1F6FEB" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area type="monotone" dataKey="count" stroke="#1F6FEB" fillOpacity={1} fill="url(#colorStatus)" strokeWidth={2} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Emergency vs. General */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-emergency-vs-general-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#FF6B6B' }} />
                                <span className="truncate">Emergency vs. General Requests</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Absolute counts and trend</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('emergency-vs-general-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="emergency-vs-general-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <ComposedChart data={emergencyVsGeneralData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                  <Bar dataKey="emergency" fill="#FF6B6B" name="Emergency" />
                                  <Bar dataKey="general" fill="#1F6FEB" name="General" />
                                  <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6' }} name="Total Trend" />
                                </ComposedChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Requests by Division */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-requests-by-division-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#4BC0C8' }} />
                                <span className="truncate">Requests by Division</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Number of requests by division</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('requests-by-division-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="requests-by-division-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={requestsByDivisionData} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis type="number" ticks={[0, 10, 20, 40]} tick={{ fontSize: 10 }} />
                                  <YAxis dataKey="division" type="category" width={80} tick={{ fontSize: 9 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Bar dataKey="count" fill="#4635B1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Blood Type Treemap */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-time-sensitive-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#00879E' }} />
                                <span className="truncate">Blood Type Distribution</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Treemap visualization</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('time-sensitive-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="time-sensitive-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <Treemap data={bloodTypeTreemapData} dataKey="size" aspectRatio={4/3} stroke="#fff" fill="#00879E">
                                  <Tooltip content={<CustomTooltip />} />
                                  {bloodTypeTreemapData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Treemap>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Population by Age & Gender */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-population-pyramid-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#4BC0C8' }} />
                                <span className="truncate">Population by Age & Gender</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Demographic visualization</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('population-pyramid-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="population-pyramid-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={populationPyramidData} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis type="number" tick={{ fontSize: 10 }} />
                                  <YAxis dataKey="ageGroup" type="category" tick={{ fontSize: 10 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                  <Bar dataKey="male" fill="#000B58" name="Male" radius={[0, 4, 4, 0]} />
                                  <Bar dataKey="female" fill="#6F00FF" name="Female" radius={[0, 4, 4, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Requests by Radius */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-requests-by-radius-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#1F6FEB' }} />
                                <span className="truncate">Requests by Radius</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Distance-based view</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('requests-by-radius-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="requests-by-radius-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={requestsByRadiusData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="radius" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Bar dataKey="count" fill="#1F6FEB" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Donor Location Radar */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-donor-location-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#4BC0C8' }} />
                                <span className="truncate">Donor Location Distribution</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Donors and requests by division</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('donor-location-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="donor-location-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={donorLocationData}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="division" tick={{ fontSize: 10 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 400]} tick={{ fontSize: 8 }} />
                                  <Radar name="Donors" dataKey="donors" stroke="#1F6FEB" fill="#1F6FEB" fillOpacity={0.6} />
                                  <Radar name="Requests" dataKey="requests" stroke="#4BC0C8" fill="#4BC0C8" fillOpacity={0.6} />
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Response Time Pie */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-response-time-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#F97316' }} />
                                <span className="truncate">Donor Response Time</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Response time categories</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('response-time-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="response-time-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie data={responseTimeFlowData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                                    {responseTimeFlowData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Rating Trends Radar */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-rating-trends-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <Star className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#F97316' }} />
                                <span className="truncate">Rating/Feedback Trends</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Quarterly comparison</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('rating-trends-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="rating-trends-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={ratingTrendsData}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 8 }} />
                                  <Radar name="Q1" dataKey="q1" stroke="#1F6FEB" fill="#1F6FEB" fillOpacity={0.6} />
                                  <Radar name="Q2" dataKey="q2" stroke="#4BC0C8" fill="#4BC0C8" fillOpacity={0.6} />
                                  <Radar name="Q3" dataKey="q3" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                                  <Radar name="Q4" dataKey="q4" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.6} />
                                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Fraud Reports */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-fraud-reports-chart">
                          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                            <div className="min-w-0">
                              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#FF6B6B' }} />
                                <span className="truncate">Fraud Reports</span>
                              </CardTitle>
                              <CardDescription className="text-xs">Verification status</CardDescription>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-20 sm:w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportChart('fraud-reports-chart', exportFormat)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="fraud-reports-chart">
                              <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={fraudReportsData}>
                                  <defs>
                                    <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area type="monotone" dataKey="count" stroke="#FF6B6B" fillOpacity={1} fill="url(#colorFraud)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                    </div>
                    
                    {/* Critical Alerts & System Health */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      <Card className={`lg:col-span-2 shadow-md`} style={{ backgroundColor: 'var(--card-bg)' }}>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#F97316' }} />
                            <span>Critical Alerts</span>
                          </CardTitle>
                          <CardDescription className="text-xs">Items requiring immediate attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 sm:space-y-4">
                            {metrics?.inventory?.criticalLevels?.length === 0 ? (
                              <div className="text-center py-6 sm:py-8">
                                <Shield className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" style={{ color: '#4BC0C8' }} />
                                <p className="text-xs sm:text-sm" style={{ color: 'var(--muted)' }}>All inventory levels are normal</p>
                              </div>
                            ) : (
                              metrics?.inventory?.criticalLevels?.map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{ 
                                  backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                                  borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'
                                }}>
                                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#F97316' }} />
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm sm:text-base">Low Stock: {item.bloodGroup}</p>
                                      <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--muted)' }}>
                                        Only {item.units} units remaining (Critical: {item.criticalThreshold})
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="destructive" className="shrink-0 text-xs">Critical</Badge>
                                </div>
                              ))
                            )}
                            
                            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border" style={{ 
                              backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'
                            }}>
                              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: '#F97316' }} />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base">Pending Verifications</p>
                                  <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--muted)' }}>15 donor verification requests awaiting review</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="shrink-0 text-xs">Review Needed</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-md" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#1F6FEB' }} />
                            <span>System Health</span>
                          </CardTitle>
                          <CardDescription className="text-xs">Real-time system metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 sm:space-y-6">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--muted)' }}>Utilization Rate</span>
                                <span className="text-xs sm:text-sm font-semibold">{metrics?.inventory?.utilizationRate || 0}%</span>
                              </div>
                              <Progress value={metrics?.inventory?.utilizationRate || 0} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--muted)' }}>Response Rate</span>
                                <span className="text-xs sm:text-sm font-semibold">94%</span>
                              </div>
                              <Progress value={94} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--muted)' }}>System Uptime</span>
                                <span className="text-xs sm:text-sm font-semibold">99.8%</span>
                              </div>
                              <Progress value={99.8} className="h-2" />
                            </div>
                            <div className="pt-3 sm:pt-4 border-t" style={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}>
                              <div className="flex items-center space-x-2" style={{ color: '#FF6B6B' }}>
                                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm font-medium">All systems operational</span>
                              </div>
                              <p className="text-[10px] sm:text-xs mt-1" style={{ color: 'var(--muted)' }}>
                                Last updated: {lastUpdated.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {activeTab === 'donor-management' && <DonorManagement />}
                {activeTab === 'inventory' && <InventoryManagement />}
                {activeTab === 'emergency-blood-request' && <EmergencyRequestManagement />}
                {activeTab === 'analytics' && <AnalyticsModule />}
                {activeTab === 'appointments' && <Appointments isDarkMode={isDarkMode} />}
                {activeTab === 'reactivation-request' && <ReactivationRequests />}
                {activeTab === 'verification-request' && <VerificationRequests />}
                {activeTab === 'activity-log' && <ActivityLog />}
                {activeTab === 'settings' && <AdminSettings />}
                {activeTab === 'logout' && <Logout />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}