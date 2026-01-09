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
import Loader from '@/components/ui/Loader';

// Import extracted components
import DonorManagement from './DonorManagement';
import InventoryManagement from './InventoryManagement';
import ActivityLog from './ActivityLog';
import AdminSettings from './AdminSettings';
import AnalyticsModule from './AnalyticsModule';
import EmergencyRequestManagement from './EmergencyRequestManagement';
import ReactivationRequests from './ReactivationRequests';
import VerificationRequests from './VerificationRequests';
import Logout from './Logout';
import Sidebar from './Sidebar'; // Import the new Sidebar component

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
        <CardContent className="p-6 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">
                  {title}
                </p>
                <p className="text-2xl font-bold text-text">
                  {value}
                </p>
              </div>
            </div>
            <div className="text-right">
              {changeType !== 'neutral' && (
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  changeType === 'increase' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {changeType === 'increase' ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{change}</span>
                </div>
              )}
              <p className="text-xs text-muted mt-1">
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
          // Add a small delay to ensure smooth animation
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('7d');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pollingInterval] = useState(300000);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'csv'>('png');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
    
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--bg', '#000000');
      document.documentElement.style.setProperty('--card-bg', '#0b0b0b');
      document.documentElement.style.setProperty('--text', '#FFFFFF');
      document.documentElement.style.setProperty('--muted', '#94A3B8');
      document.documentElement.style.setProperty('--accent', '#4BC0C8');
      document.body.classList.add('bg-black');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--bg', '#FFFFFF');
      document.documentElement.style.setProperty('--card-bg', '#FFFFFF');
      document.documentElement.style.setProperty('--text', '#0F1724');
      document.documentElement.style.setProperty('--muted', '#64748B');
      document.documentElement.style.setProperty('--accent', '#1F6FEB');
      document.body.classList.remove('bg-black');
    }
  }, []);

  // Toggle dark mode with transition
  const toggleDarkMode = useCallback(() => {
    setIsTransitioning(true);
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Apply theme changes after a brief delay to allow transition
    setTimeout(() => {
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.setProperty('--bg', '#000000');
        document.documentElement.style.setProperty('--card-bg', '#0b0b0b');
        document.documentElement.style.setProperty('--text', '#FFFFFF');
        document.documentElement.style.setProperty('--muted', '#94A3B8');
        document.documentElement.style.setProperty('--accent', '#4BC0C8');
        document.body.classList.add('bg-black');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.setProperty('--bg', '#FFFFFF');
        document.documentElement.style.setProperty('--card-bg', '#FFFFFF');
        document.documentElement.style.setProperty('--text', '#0F1724');
        document.documentElement.style.setProperty('--muted', '#64748B');
        document.documentElement.style.setProperty('--accent', '#1F6FEB');
        document.body.classList.remove('bg-black');
      }
      setIsTransitioning(false);
    }, 50);
  }, [isDarkMode]);

  // Toggle sidebar
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  
  // Extract metrics and basicStats from the batched response
  const metrics = dashboardData?.metrics;
  const basicStats = dashboardData?.basicStats;
  
  // Create stats for display, prioritizing basicStats.stats if available
  const displayStats = basicStats?.stats || metrics;
  
  // Get all values safely
  const totalDonors = useMemo(() => {
    if (basicStats && basicStats.totalDonors !== undefined) {
      return basicStats.totalDonors;
    }
    
    if (basicStats?.stats && basicStats.stats.totalDonors !== undefined) {
      return basicStats.stats.totalDonors;
    }
    
    if (metrics?.donor?.totalDonors !== undefined) {
      return metrics.donor.totalDonors;
    }
    
    return 0;
  }, [basicStats, metrics]);

  const availableDonors = useMemo(() => {
    if (basicStats && basicStats.availableDonors !== undefined) {
      return basicStats.availableDonors;
    }
    
    if (basicStats?.stats && basicStats.stats.availableDonors !== undefined) {
      return basicStats.stats.availableDonors;
    }
    
    if (metrics?.donor?.activeDonors !== undefined) {
      return metrics.donor.activeDonors;
    }
    
    return 0;
  }, [basicStats, metrics]);

  const totalDonations = useMemo(() => {
    if (basicStats && basicStats.totalDonations !== undefined) {
      return basicStats.totalDonations;
    }
    
    if (basicStats?.stats && basicStats.stats.totalDonations !== undefined) {
      return basicStats.stats.totalDonations;
    }
    
    if (metrics?.donation?.totalDonations !== undefined) {
      return metrics.donation.totalDonations;
    }
    
    return 0;
  }, [basicStats, metrics]);

  const bloodRequests = useMemo(() => {
    if (basicStats && basicStats.bloodRequests !== undefined) {
      return basicStats.bloodRequests;
    }
    
    if (basicStats?.stats && basicStats.stats.emergencyRequests !== undefined) {
      return basicStats.stats.emergencyRequests;
    }
    
    if (metrics?.emergency?.totalRequests !== undefined) {
      return metrics.emergency.totalRequests;
    }
    
    return 0;
  }, [basicStats, metrics]);

  const pendingRequests = useMemo(() => {
    if (basicStats && basicStats.pendingRequests !== undefined) {
      return basicStats.pendingRequests;
    }
    
    if (basicStats?.stats && basicStats.stats.pendingVerifications !== undefined) {
      return basicStats.stats.pendingVerifications;
    }
    
    if (metrics?.emergency?.pendingRequests !== undefined) {
      return metrics.emergency.pendingRequests;
    }
    
    return 0;
  }, [basicStats, metrics]);

  const criticalAlerts = useMemo(() => {
    if (basicStats && basicStats.criticalAlerts !== undefined) {
      return basicStats.criticalAlerts;
    }
    
    if (basicStats?.stats && basicStats.stats.criticalAlerts !== undefined) {
      return basicStats.stats.criticalAlerts;
    }
    
    if (metrics?.emergency?.criticalAlerts !== undefined) {
      return metrics.emergency.criticalAlerts;
    }
    
    return 0;
  }, [basicStats, metrics]);

  const duplicateAlerts = useMemo(() => {
    if (basicStats && basicStats.duplicateAlerts !== undefined) {
      return basicStats.duplicateAlerts;
    }
    
    if (basicStats?.stats && basicStats.stats.duplicateAlerts !== undefined) {
      return basicStats.stats.duplicateAlerts;
    }
    
    return 0;
  }, [basicStats, metrics]);

  const readyToDonate = useMemo(() => {
    if (basicStats && basicStats.readyToDonate !== undefined) {
      return basicStats.readyToDonate;
    }
    
    if (basicStats?.stats && basicStats.stats.readyToDonate !== undefined) {
      return basicStats.stats.readyToDonate;
    }
    
    return 0;
  }, [basicStats, metrics]);

  // Memoized chart data to prevent unnecessary recalculations
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

  // AdminDashboard.tsx - near the top of the component
const emergencyVsGeneralData = useMemo(() => {
  const data = metrics?.emergency?.emergencyVsGeneral || [
    { month: 'Jan', emergency: 23, general: 44 },
    { month: 'Feb', emergency: 18, general: 54 },
    { month: 'Mar', emergency: 31, general: 54 },
    { month: 'Apr', emergency: 21, general: 70 },
    { month: 'May', emergency: 28, general: 60 },
    { month: 'Jun', emergency: 19, general: 75 }
  ];
  
  // FIXED: Add total for trend line and ensure numbers
  return data.map(item => ({
    ...item,
    emergency: Number(item.emergency),
    general: Number(item.general),
    total: Number(item.emergency) + Number(item.general)
  }));
}, [metrics?.emergency?.emergencyVsGeneral]);

  // Updated to use divisions instead of districts
  const requestsByDivisionData = useMemo(() => {
    // Get the requests by district data
    const requestsByDistrict = metrics?.emergency?.requestsByDistrict || [];
    
    // Map district names to divisions
    const districtToDivisionMap: Record<string, string> = {
      'Barishal': 'Barishal',
      'Barguna': 'Barishal',
      'Bhola': 'Barishal',
      'Jhalokathi': 'Barishal',
      'Patuakhali': 'Barishal',
      'Pirojpur': 'Barishal',
      'Bandarban': 'Chattogram',
      'Brahmanbaria': 'Chattogram',
      'Chandpur': 'Chattogram',
      'Chattogram': 'Chattogram',
      'Comilla': 'Chattogram',
      'Cox\'s Bazar': 'Chattogram',
      'Feni': 'Chattogram',
      'Khagrachhari': 'Chattogram',
      'Lakshmipur': 'Chattogram',
      'Noakhali': 'Chattogram',
      'Rangamati': 'Chattogram',
      'Dhaka': 'Dhaka',
      'Faridpur': 'Dhaka',
      'Gazipur': 'Dhaka',
      'Gopalganj': 'Dhaka',
      'Kishoreganj': 'Dhaka',
      'Madaripur': 'Dhaka',
      'Manikganj': 'Dhaka',
      'Munshiganj': 'Dhaka',
      'Narayanganj': 'Dhaka',
      'Narsingdi': 'Dhaka',
      'Rajbari': 'Dhaka',
      'Shariatpur': 'Dhaka',
      'Tangail': 'Dhaka',
      'Bagerhat': 'Khulna',
      'Chuadanga': 'Khulna',
      'Jashore': 'Khulna',
      'Jhenaidah': 'Khulna',
      'Khulna': 'Khulna',
      'Kushtia': 'Khulna',
      'Magura': 'Khulna',
      'Meherpur': 'Khulna',
      'Narail': 'Khulna',
      'Satkhira': 'Khulna',
      'Jamalpur': 'Mymensingh',
      'Mymensingh': 'Mymensingh',
      'Netrokona': 'Mymensingh',
      'Sherpur': 'Mymensingh',
      'Bogura': 'Rajshahi',
      'Joypurhat': 'Rajshahi',
      'Naogaon': 'Rajshahi',
      'Natore': 'Rajshahi',
      'Chapainawabganj': 'Rajshahi',
      'Pabna': 'Rajshahi',
      'Rajshahi': 'Rajshahi',
      'Sirajganj': 'Rajshahi',
      'Dinajpur': 'Rangpur',
      'Gaibandha': 'Rangpur',
      'Kurigram': 'Rangpur',
      'Lalmonirhat': 'Rangpur',
      'Nilphamari': 'Rangpur',
      'Panchagarh': 'Rangpur',
      'Rangpur': 'Rangpur',
      'Thakurgaon': 'Rangpur',
      'Habiganj': 'Sylhet',
      'Moulvibazar': 'Sylhet',
      'Sunamganj': 'Sylhet',
      'Sylhet': 'Sylhet'
    };
    
    // Initialize all divisions with zero values
    const allDivisions = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
    const divisionData = new Map<string, number>();
    
    allDivisions.forEach(division => {
      divisionData.set(division, 0);
    });
    
    // Process requests by district and aggregate by division
    requestsByDistrict.forEach(request => {
      if (request && request.district) {
        const division = districtToDivisionMap[request.district];
        if (division) {
          const currentCount = divisionData.get(division) || 0;
          divisionData.set(division, currentCount + (request.count || 0));
        }
      }
    });
    
    // Convert map to array with division property
    const result = Array.from(divisionData.entries()).map(([division, count]) => ({
      division,
      count
    }));
    
    return result;
  }, [metrics?.emergency?.requestsByDistrict]);

  const timeSensitiveData = useMemo(() => 
    metrics?.emergency?.timeSensitive || [
      { time: '00-04', count: 12 },
      { time: '04-08', count: 8 },
      { time: '08-12', count: 32 },
      { time: '12-16', count: 45 },
      { time: '16-20', count: 38 },
      { time: '20-24', count: 22 }
    ], [metrics?.emergency?.timeSensitive]);

 const populationPyramidData = useMemo(() => {
  // If real data is available, use it
  if (metrics?.geographic?.populationPyramid && metrics.geographic.populationPyramid.length > 0) {
    return metrics.geographic.populationPyramid;
  }
  
  // Fallback data with more realistic distribution
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
      { radius: '< 5km', count: 45 },
      { radius: '5-20km', count: 89 },
      { radius: '20-50km', count: 134 },
      { radius: '> 50km', count: 67 }
    ], [metrics?.geographic?.requestsByRadius]);

  // Updated to include all 8 divisions
  const donorLocationData = useMemo(() => {
    // Get the donor location data
    const donorLocation = metrics?.geographic?.donorLocation || [];
    
    // Map district names to divisions
    const districtToDivisionMap: Record<string, string> = {
      'Barishal': 'Barishal',
      'Barguna': 'Barishal',
      'Bhola': 'Barishal',
      'Jhalokathi': 'Barishal',
      'Patuakhali': 'Barishal',
      'Pirojpur': 'Barishal',
      'Bandarban': 'Chattogram',
      'Brahmanbaria': 'Chattogram',
      'Chandpur': 'Chattogram',
      'Chattogram': 'Chattogram',
      'Comilla': 'Chattogram',
      'Cox\'s Bazar': 'Chattogram',
      'Feni': 'Chattogram',
      'Khagrachhari': 'Chattogram',
      'Lakshmipur': 'Chattogram',
      'Noakhali': 'Chattogram',
      'Rangamati': 'Chattogram',
      'Dhaka': 'Dhaka',
      'Faridpur': 'Dhaka',
      'Gazipur': 'Dhaka',
      'Gopalganj': 'Dhaka',
      'Kishoreganj': 'Dhaka',
      'Madaripur': 'Dhaka',
      'Manikganj': 'Dhaka',
      'Munshiganj': 'Dhaka',
      'Narayanganj': 'Dhaka',
      'Narsingdi': 'Dhaka',
      'Rajbari': 'Dhaka',
      'Shariatpur': 'Dhaka',
      'Tangail': 'Dhaka',
      'Bagerhat': 'Khulna',
      'Chuadanga': 'Khulna',
      'Jashore': 'Khulna',
      'Jhenaidah': 'Khulna',
      'Khulna': 'Khulna',
      'Kushtia': 'Khulna',
      'Magura': 'Khulna',
      'Meherpur': 'Khulna',
      'Narail': 'Khulna',
      'Satkhira': 'Khulna',
      'Jamalpur': 'Mymensingh',
      'Mymensingh': 'Mymensingh',
      'Netrokona': 'Mymensingh',
      'Sherpur': 'Mymensingh',
      'Bogura': 'Rajshahi',
      'Joypurhat': 'Rajshahi',
      'Naogaon': 'Rajshahi',
      'Natore': 'Rajshahi',
      'Chapainawabganj': 'Rajshahi',
      'Pabna': 'Rajshahi',
      'Rajshahi': 'Rajshahi',
      'Sirajganj': 'Rajshahi',
      'Dinajpur': 'Rangpur',
      'Gaibandha': 'Rangpur',
      'Kurigram': 'Rangpur',
      'Lalmonirhat': 'Rangpur',
      'Nilphamari': 'Rangpur',
      'Panchagarh': 'Rangpur',
      'Rangpur': 'Rangpur',
      'Thakurgaon': 'Rangpur',
      'Habiganj': 'Sylhet',
      'Moulvibazar': 'Sylhet',
      'Sunamganj': 'Sylhet',
      'Sylhet': 'Sylhet'
    };
    
    // Initialize all divisions with zero values
    const allDivisions = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
    const divisionData = new Map<string, { donors: number; requests: number }>();
    
    allDivisions.forEach(division => {
      divisionData.set(division, { donors: 0, requests: 0 });
    });
    
    // Process donor location data and aggregate by division
    donorLocation.forEach(location => {
      if (location && location.district) {
        const division = districtToDivisionMap[location.district];
        if (division) {
          const currentData = divisionData.get(division) || { donors: 0, requests: 0 };
          divisionData.set(division, {
            donors: currentData.donors + (location.donors || 0),
            requests: currentData.requests + (location.requests || 0)
          });
        }
      }
    });
    
    // Convert map to array with division property
    const result = Array.from(divisionData.entries()).map(([division, data]) => ({
      division,
      donors: data.donors,
      requests: data.requests
    }));
    
    return result;
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
      { date: 'Jan', count: 3 },
      { date: 'Feb', count: 5 },
      { date: 'Mar', count: 2 },
      { date: 'Apr', count: 7 },
      { date: 'May', count: 4 },
      { date: 'Jun', count: 1 }
    ], [metrics?.engagement?.fraudReports]);

  // Updated to include four categories - FIXED VERSION
const newEligibleData = useMemo(() => {
  if (metrics?.donor?.eligibleVsNot && metrics.donor.eligibleVsNot.length > 0) {
    return metrics.donor.eligibleVsNot;
  }
  
  // Fallback data with the correct structure
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

  // New data for division comparison chart - FIXED VERSION
const divisionComparisonData = useMemo(() => {
  // Get requests by division from metrics
  const requestsByDivision = metrics?.emergency?.requestsByDistrict || [];
  
  // Get donors by district from geographic data
  const donorsByDistrict = metrics?.geographic?.donorLocation || [];
  
  // Map districts to divisions
  const districtToDivisionMap: Record<string, string> = {
    'Barishal': 'Barishal',
    'Barguna': 'Barishal',
    'Bhola': 'Barishal',
    'Jhalokathi': 'Barishal',
    'Patuakhali': 'Barishal',
    'Pirojpur': 'Barishal',
    'Bandarban': 'Chattogram',
    'Brahmanbaria': 'Chattogram',
    'Chandpur': 'Chattogram',
    'Chattogram': 'Chattogram',
    'Comilla': 'Chattogram',
    'Cox\'s Bazar': 'Chattogram',
    'Feni': 'Chattogram',
    'Khagrachhari': 'Chattogram',
    'Lakshmipur': 'Chattogram',
    'Noakhali': 'Chattogram',
    'Rangamati': 'Chattogram',
    'Dhaka': 'Dhaka',
    'Faridpur': 'Dhaka',
    'Gazipur': 'Dhaka',
    'Gopalganj': 'Dhaka',
    'Kishoreganj': 'Dhaka',
    'Madaripur': 'Dhaka',
    'Manikganj': 'Dhaka',
    'Munshiganj': 'Dhaka',
    'Narayanganj': 'Dhaka',
    'Narsingdi': 'Dhaka',
    'Rajbari': 'Dhaka',
    'Shariatpur': 'Dhaka',
    'Tangail': 'Dhaka',
    'Bagerhat': 'Khulna',
    'Chuadanga': 'Khulna',
    'Jashore': 'Khulna',
    'Jhenaidah': 'Khulna',
    'Khulna': 'Khulna',
    'Kushtia': 'Khulna',
    'Magura': 'Khulna',
    'Meherpur': 'Khulna',
    'Narail': 'Khulna',
    'Satkhira': 'Khulna',
    'Jamalpur': 'Mymensingh',
    'Mymensingh': 'Mymensingh',
    'Netrokona': 'Mymensingh',
    'Sherpur': 'Mymensingh',
    'Bogura': 'Rajshahi',
    'Joypurhat': 'Rajshahi',
    'Naogaon': 'Rajshahi',
    'Natore': 'Rajshahi',
    'Chapainawabganj': 'Rajshahi',
    'Pabna': 'Rajshahi',
    'Rajshahi': 'Rajshahi',
    'Sirajganj': 'Rajshahi',
    'Dinajpur': 'Rangpur',
    'Gaibandha': 'Rangpur',
    'Kurigram': 'Rangpur',
    'Lalmonirhat': 'Rangpur',
    'Nilphamari': 'Rangpur',
    'Panchagarh': 'Rangpur',
    'Rangpur': 'Rangpur',
    'Thakurgaon': 'Rangpur',
    'Habiganj': 'Sylhet',
    'Moulvibazar': 'Sylhet',
    'Sunamganj': 'Sylhet',
    'Sylhet': 'Sylhet'
  };
  
  // Initialize all divisions with zero values
  const allDivisions = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
  const divisionData = new Map<string, { requests: number; donors: number }>();
  
  allDivisions.forEach(division => {
    divisionData.set(division, { requests: 0, donors: 0 });
  });
  
  // Process requests by division
  requestsByDivision.forEach(request => {
    if (request && request.district) {
      const division = districtToDivisionMap[request.district];
      if (division) {
        const currentData = divisionData.get(division) || { requests: 0, donors: 0 };
        // Parse the string count properly (remove leading zeros)
        const count = parseInt(String(request.count).replace(/^0+/, ''), 10) || 0;
        divisionData.set(division, {
          requests: currentData.requests + count,
          donors: currentData.donors
        });
      }
    }
  });
  
  // Aggregate donors by division
  donorsByDistrict.forEach(donor => {
    if (donor && donor.district) {
      const division = districtToDivisionMap[donor.district];
      if (division) {
        const currentData = divisionData.get(division) || { requests: 0, donors: 0 };
        divisionData.set(division, {
          requests: currentData.requests,
          donors: currentData.donors + (donor.donors || 0)
        });
      }
    }
  });
  
  // Convert map to array
  const result = Array.from(divisionData.entries()).map(([division, data]) => ({
    division,
    requests: data.requests,
    donors: data.donors
  }));
  
  return result;
}, [metrics?.emergency?.requestsByDistrict, metrics?.geographic?.donorLocation]);
// Generate 64 districts data
const districtWiseDonorData = useMemo(() => {
  if (metrics?.geographic?.donorLocation && metrics.geographic.donorLocation.length > 0) {
    // Sort the donorLocation data alphabetically by district name
    return [...metrics.geographic.donorLocation]
      .sort((a, b) => a.district.localeCompare(b.district))
      .map(item => ({
        district: item.district,
        donors: item.donors
      }));
  }
  
    
    // Otherwise, generate mock data for 64 districts
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
    
    return districts.map((district, index) => ({
    district,
    donors: Math.floor(Math.random() * 500) + 50 // Random number between 50-550
  }));
}, [metrics?.geographic?.donorLocation]); // Keep original dependency

  // Data for Funnel Chart - Donation Conversion
  const donationFunnelData = useMemo(() => [
    { name: 'Registered Donors', value: 1600, fill: COLORS.primary },
    { name: 'Eligible Donors', value: 1234, fill: COLORS.accent3 },
    { name: 'Available Donors', value: 800, fill: COLORS.accent2 },
    { name: 'Scheduled Donations', value: 450, fill: COLORS.accent1 },
    { name: 'Completed Donations', value: 412, fill: COLORS.accent4 }
  ], []);

  // Data for Treemap - Donor Distribution by Blood Type
  const bloodTypeTreemapData = useMemo(() => {
  // Check if real data is available
  if (metrics?.donor?.donorsByBloodGroup && metrics.donor.donorsByBloodGroup.length > 0) {
    const colors: Record<string, string> = {
      'A+': COLORS.accent1,
      'A-': COLORS.accent4,
      'B+': COLORS.accent2,
      'B-': COLORS.accent6,
      'AB+': COLORS.accent3,
      'AB-': COLORS.accent7,
      'O+': COLORS.primary,
      'O-': COLORS.accent5
    };
    
    return metrics.donor.donorsByBloodGroup.map((item: { name: string; count: number }) => ({
      name: item.name,
      size: item.count,
      color: colors[item.name] || COLORS.muted
    }));
  }
  
  // Fallback to hardcoded data
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

  // Data for Sankey-like visualization - Response Time Flow
  const responseTimeFlowData = useMemo(() => [
    { name: 'Immediate', value: 45, color: COLORS.accent6 },
    { name: 'Fast', value: 32, color: COLORS.accent2 },
    { name: 'Moderate', value: 18, color: COLORS.accent1 },
    { name: 'Slow', value: 5, color: COLORS.accent4 }
  ], []);

  // Fixed quickStats with proper trend indicators
  const quickStats = useMemo(() => [
    {
      title: 'Total Donors',
      value: totalDonors.toLocaleString(),
      change: totalDonors > 0 ? '+12%' : '0%',
      changeType: totalDonors > 0 ? 'increase' as const : 'neutral' as const,
      icon: Users,
      color: 'bg-blue-500',
      description: `${availableDonors.toLocaleString()} active donors`,
      onClick: () => {
        setActiveTab('donor-management');
      }
    },
    {
      title: 'Total Blood Donations',
      value: totalDonations.toLocaleString(),
      change: totalDonations > 0 ? '+8%' : '0%',
      changeType: totalDonations > 0 ? 'increase' as const : 'neutral' as const,
      icon: Droplet,
      color: 'bg-red-500',
      description: 'Completed donations',
      onClick: () => {
        setActiveTab('analytics');
      }
    },
    {
      title: 'Critical Blood Levels',
      value: criticalBloodLevels.filter(bg => bg.status === 'critical').length.toString(),
      change: criticalBloodLevels.filter(bg => bg.status === 'critical').length > 0 ? '-2' : '0',
      changeType: criticalBloodLevels.filter(bg => bg.status === 'critical').length > 0 ? 'decrease' as const : 'neutral' as const,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      description: 'Blood groups in critical need',
      onClick: () => {
        setActiveTab('inventory');
      }
    },
    {
      title: 'Donors Ready to Donate',
      value: readyToDonate.toLocaleString(),
      change: readyToDonate > 0 ? '+5%' : '0%',
      changeType: readyToDonate > 0 ? 'increase' as const : 'neutral' as const,
      icon: Heart,
      color: 'bg-green-500',
      description: 'Available or eligible donors',
      onClick: () => {
        setActiveTab('donor-management');
      }
    },
    {
      title: 'Pending Emergency Requests',
      value: pendingRequests.toLocaleString(),
      change: pendingRequests > 0 ? '+23%' : '0%',
      changeType: pendingRequests > 0 ? 'increase' as const : 'neutral' as const,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Awaiting fulfillment',
      onClick: () => {
        setActiveTab('emergency-blood-request');
      }
    },
    {
      title: 'Duplicate Data Alert',
      value: duplicateAlerts.toLocaleString(),
      change: duplicateAlerts > 0 ? '+3' : '0',
      changeType: duplicateAlerts > 0 ? 'increase' as const : 'neutral' as const,
      icon: AlertTriangle,
      color: 'bg-purple-500',
      description: 'Potential duplicate records',
      onClick: () => {
        setActiveTab('donor-management');
      }
    }
  ], [totalDonors, availableDonors, totalDonations, criticalBloodLevels, readyToDonate, pendingRequests, duplicateAlerts]);

  // Check if any data is loading
  const isLoading = dashboardLoading;

  // Function to export chart as image
  const exportChart = useCallback(async (chartId: string, format: 'png' | 'pdf' | 'csv') => {
    toast({
      title: "Export Started",
      description: `Exporting chart as ${format.toUpperCase()}...`,
    });
    
    try {
      const chartElement = document.getElementById(`chart-container-${chartId}`);
      if (!chartElement) {
        throw new Error('Chart element not found');
      }
      
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

  // Custom tooltip component for charts
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-md shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isTransitioning ? 'pointer-events-none' : ''}`} style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar Component */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="md:hidden shadow-sm p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--card-bg)' }}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div></div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div className="mb-6 md:mb-0">
                <h1 className="text-3xl font-bold" style={{ marginTop: '24px' }}>
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
                <p className="mt-2" style={{ color: 'var(--muted)' }}>
                  {activeTab === 'dashboard' && 'Real-time overview of your blood donation management system'}
                  {activeTab === 'donor-management' && 'Manage donor profiles and eligibility'}
                  {activeTab === 'inventory' && 'Donor Availability Management'}
                  {activeTab === 'emergency-blood-request' && 'Handle emergency blood requests'}
                  {activeTab === 'analytics' && 'Comprehensive analytics and reports'}
                  {activeTab === 'reactivation-request' && 'Process donor reactivation requests'}
                  {activeTab === 'verification-request' && 'Review new donor verifications'}
                  {activeTab === 'activity-log' && 'View system activity and audit logs'}
                  {activeTab === 'settings' && 'Configure system settings and preferences'}
                  {activeTab === 'logout' && 'Securely logout of the system'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDarkMode}
                  disabled={isTransitioning}
                >
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
                
                {activeTab === 'dashboard' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={timeRange === '7d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('7d')}
                    >
                      7 Days
                    </Button>
                    <Button
                      variant={timeRange === '30d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('30d')}
                    >
                      30 Days
                    </Button>
                    <Button
                      variant={timeRange === '90d' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('90d')}
                    >
                      90 Days
                    </Button>
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
                className="space-y-6"
              >
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quickStats.map((stat, index) => (
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Blood Group Distribution */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-blood-group-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Droplet className="w-5 h-5" style={{ color: '#FF6B6B' }} />
                                <span>Blood Group Distribution</span>
                              </CardTitle>
                              <CardDescription>Distribution of donors by blood type</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('blood-group-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="blood-group-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie
                                    data={bloodGroupData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    label={({ name, count, percentage }) => `${name}: ${count} (${percentage}%)`}
                                  >
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
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Users className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                                <span>Gender Distribution</span>
                              </CardTitle>
                              <CardDescription>Distribution of donors by gender</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('gender-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="gender-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    label={({ gender, count }) => `${gender}: ${count}`}
                                  >
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
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5" style={{ color: '#F59E0B' }} />
                                <span>District-wise Donor Distribution</span>
                              </CardTitle>
                              <CardDescription>Number of donors by district (64 districts)</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('district-wise-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="district-wise-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={districtWiseDonorData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis 
                                    dataKey="district" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    height={90} 
                                    interval={1} 
                                    tick={{ fontSize: 8 }}
                                  />
                                  <YAxis />
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
                      
                      {/* Requests by Division Vs. Donors By Division Comparison chart - FIXED */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-division-comparison-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5" style={{ color: '#F97316' }} />
                                <span>Requests vs Donors by Division</span>
                              </CardTitle>
                              <CardDescription>Comparison of requests and donors by division</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('division-comparison-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="division-comparison-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                {divisionComparisonData.length > 0 ? (
                                  <BarChart data={divisionComparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="division" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
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
                      
                      {/* Registered Users Growth Over Time */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-users-growth-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Users className="w-5 h-5" style={{ color: '#1F6FEB' }} />
                                <span>Registered Users Growth Over Time</span>
                              </CardTitle>
                              <CardDescription>Line chart with gradient showing trends by month/quarter</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('users-growth-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="users-growth-chart">
                              <ResponsiveContainer width="100%" height={300}>
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
                                  <XAxis dataKey="week" />
                                  <YAxis />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  <Area type="monotone" dataKey="newRegistrations" stroke="#1F6FEB" fillOpacity={1} fill="url(#colorNewRegistrations)" />
                                  <Area type="monotone" dataKey="activeDonations" stroke="#4BC0C8" fillOpacity={1} fill="url(#colorActiveDonations)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Donor Status Comparison Polar Area Chart */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-eligible-status-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <UserCheck className="w-5 h-5" style={{ color: '#F97316' }} />
                                <span>Donor Status Comparison</span>
                              </CardTitle>
                              <CardDescription> Available, Not Available, Active and Inactive donors</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('eligible-status-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="eligible-status-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie
                                    data={newEligibleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={90}
                                    paddingAngle={1}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                  >
                                    {newEligibleData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Monthly Donations with gradient fill */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-monthly-donations-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Droplet className="w-5 h-5" style={{ color: '#FF6B6B' }} />
                                <span>Monthly Donations</span>
                              </CardTitle>
                              <CardDescription>Line chart with gradient showing 12 months of data</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('monthly-donations-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="monthly-donations-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyDonationsData}>
                                  <defs>
                                    <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#1F6FEB" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#1F6FEB" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="month" />
                                  <YAxis />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#1F6FEB" 
                                    fillOpacity={1} 
                                    fill="url(#colorMonthly)" 
                                    strokeWidth={2}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Donation Trends Over Time - Replaced with Funnel Chart */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-donation-trends-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" style={{ color: '#4BC0C8' }} />
                                <span>Donation Conversion Funnel</span>
                              </CardTitle>
                              <CardDescription>From registration to completed donations</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('donation-trends-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="donation-trends-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <FunnelChart>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Funnel
                                    dataKey="value"
                                    data={donationFunnelData}
                                    isAnimationActive
                                  >
                                    {donationFunnelData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Funnel>
                                  <Legend />
                                </FunnelChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Request Status Comparison Chart with gradient */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-request-status-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5" style={{ color: '#F97316' }} />
                                <span>Request Status Comparison</span>
                              </CardTitle>
                              <CardDescription>Area chart showing status trends over time</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('request-status-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="request-status-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={requestStatusData}>
                                  <defs>
                                    <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#1F6FEB" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#1F6FEB" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="status" />
                                  <YAxis />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#1F6FEB" 
                                    fillOpacity={1} 
                                    fill="url(#colorStatus)" 
                                    strokeWidth={2}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Emergency vs. General Requests Over Time */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-emergency-vs-general-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5" style={{ color: '#FF6B6B' }} />
                                <span>Emergency vs. General Requests</span>
                              </CardTitle>
                              <CardDescription>Combine absolute counts and trend line</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('emergency-vs-general-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="emergency-vs-general-chart">
                              <ResponsiveContainer width="100%" height={300}>
                               
<ComposedChart data={emergencyVsGeneralData}>
  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip content={<CustomTooltip />} />
  <Legend />
  <Bar dataKey="emergency" fill="#FF6B6B" name="Emergency Requests" />
  <Bar dataKey="general" fill="#1F6FEB" name="General Requests" />
  {/* FIXED: Add trend line */}
  <Line 
    type="monotone" 
    dataKey="total" 
    stroke="#8B5CF6" 
    strokeWidth={3} 
    dot={{ fill: '#8B5CF6' }}
    name="Total Trend"
  />
</ComposedChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Requests by Division */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-requests-by-division-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5" style={{ color: '#4BC0C8' }} />
                                <span>Requests by Division</span>
                              </CardTitle>
                              <CardDescription>Number of requests by division</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('requests-by-division-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="requests-by-division-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={requestsByDivisionData} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis type="number" ticks={[0, 10, 20, 40]} />
                                  <YAxis dataKey="division" type="category" width={100} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Bar dataKey="count" fill="#4635B1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Time-Sensitive Activity - Replaced with Treemap Chart */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-time-sensitive-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" style={{ color: '#00879E' }} />
                                <span>Blood Type Distribution</span>
                              </CardTitle>
                              <CardDescription>Treemap visualization of blood type distribution</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('time-sensitive-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="time-sensitive-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <Treemap
                                  data={bloodTypeTreemapData}
                                  dataKey="size"
                                  aspectRatio={4/3}
                                  stroke="#fff"
                                  fill="#00879E"
                                >
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
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5" style={{ color: '#4BC0C8' }} />
                                <span>Population by Age & Gender</span>
                              </CardTitle>
                              <CardDescription>Classic demographic visualization</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('population-pyramid-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="population-pyramid-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={populationPyramidData} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis type="number" />
                                  <YAxis dataKey="ageGroup" type="category" />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
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
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5" style={{ color: '#1F6FEB' }} />
                                <span>Requests by Radius</span>
                              </CardTitle>
                              <CardDescription>Distance-based view</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('requests-by-radius-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="requests-by-radius-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={requestsByRadiusData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="radius" />
                                  <YAxis />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Bar dataKey="count" fill="#1F6FEB" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Donor Location Distribution chart */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-donor-location-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5" style={{ color: '#4BC0C8' }} />
                                <span>Donor Location Distribution</span>
                              </CardTitle>
                              <CardDescription>Comparing multiple divisions by donors and requests</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('donor-location-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="donor-location-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={donorLocationData}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="division" tick={{ fontSize: 12 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 400]} />
                                  <Radar name="Donors" dataKey="donors" stroke="#1F6FEB" fill="#1F6FEB" fillOpacity={0.6} />
                                  <Radar name="Requests" dataKey="requests" stroke="#4BC0C8" fill="#4BC0C8" fillOpacity={0.6} />
                                  <Legend />
                                </RadarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Average Donor Response Time - Replaced with Radial Bar Chart */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-response-time-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" style={{ color: '#F97316' }} />
                                <span>Donor Response Time Distribution</span>
                              </CardTitle>
                              <CardDescription>Radial visualization of response time categories</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('response-time-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="response-time-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie
                                    data={responseTimeFlowData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                  >
                                    {responseTimeFlowData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Rating/Feedback Trends */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-rating-trends-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Star className="w-5 h-5" style={{ color: '#F97316' }} />
                                <span>Rating/Feedback Trends</span>
                              </CardTitle>
                              <CardDescription>Comparing donor rating categories</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('rating-trends-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="rating-trends-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={ratingTrendsData}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="category" />
                                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                  <Radar name="Q1" dataKey="q1" stroke="#1F6FEB" fill="#1F6FEB" fillOpacity={0.6} />
                                  <Radar name="Q2" dataKey="q2" stroke="#4BC0C8" fill="#4BC0C8" fillOpacity={0.6} />
                                  <Radar name="Q3" dataKey="q3" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                                  <Radar name="Q4" dataKey="q4" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.6} />
                                  <Legend />
                                </RadarChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                      
                      {/* Fraud Reports / Verification Status */}
                      <Card style={{ backgroundColor: 'var(--card-bg)' }} className="shadow-md">
                        <div id="chart-container-fraud-reports-chart">
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Shield className="w-5 h-5" style={{ color: '#FF6B6B' }} />
                                <span>Fraud Reports / Verification Status</span>
                              </CardTitle>
                              <CardDescription>Real-time, auto-updating triggers</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => setExportFormat(value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="png">PNG</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => exportChart('fraud-reports-chart', exportFormat)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <LazyChart id="fraud-reports-chart">
                              <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={fraudReportsData}>
                                  <defs>
                                    <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#FF6B6B"
                                    fillOpacity={1}
                                    fill="url(#colorFraud)"
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </LazyChart>
                          </CardContent>
                        </div>
                      </Card>
                    </div>
                    
                    {/* Recent Activity & Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Critical Alerts */}
                      <Card className={`lg:col-span-2 shadow-md`} style={{ backgroundColor: 'var(--card-bg)' }}>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5" style={{ color: '#F97316' }} />
                            <span>Critical Alerts</span>
                          </CardTitle>
                          <CardDescription>Items requiring immediate attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {metrics?.inventory?.criticalLevels?.length === 0 ? (
                              <div className="text-center py-8">
                                <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: '#4BC0C8' }} />
                                <p className="text-sm" style={{ color: 'var(--muted)' }}>All inventory levels are normal</p>
                              </div>
                            ) : (
                              metrics?.inventory?.criticalLevels?.map((item: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-lg border" style={{ 
                                  backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                                  borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'
                                }}>
                                  <div className="flex items-center space-x-3">
                                    <AlertTriangle className="w-5 h-5" style={{ color: '#F97316' }} />
                                    <div>
                                      <p className="font-medium">
                                        Low Stock: {item.bloodGroup}
                                      </p>
                                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                        Only {item.units} units remaining (Critical: {item.criticalThreshold})
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="destructive">Critical</Badge>
                                </div>
                              ))
                            )}
                            
                            {/* Mock additional alerts */}
                            <div className="flex items-center justify-between p-4 rounded-lg border" style={{ 
                              backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'
                            }}>
                              <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5" style={{ color: '#F97316' }} />
                                <div>
                                  <p className="font-medium">
                                    Pending Verifications
                                  </p>
                                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                    15 donor verification requests awaiting review
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary">Review Needed</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* System Health */}
                      <Card className="shadow-md" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Activity className="w-5 h-5" style={{ color: '#1F6FEB' }} />
                            <span>System Health</span>
                          </CardTitle>
                          <CardDescription>Real-time system metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                                  Utilization Rate
                                </span>
                                <span className="text-sm font-semibold">
                                  {metrics?.inventory?.utilizationRate || 0}%
                                </span>
                              </div>
                              <Progress value={metrics?.inventory?.utilizationRate || 0} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                                  Response Rate
                                </span>
                                <span className="text-sm font-semibold">94%</span>
                              </div>
                              <Progress value={94} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                                  System Uptime
                                </span>
                                <span className="text-sm font-semibold">99.8%</span>
                              </div>
                              <Progress value={99.8} className="h-2" />
                            </div>
                            <div className="pt-4 border-t" style={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}>
                              <div className="flex items-center space-x-2" style={{ color: '#FF6B6B' }}>
                                <Zap className="w-4" />
                                <span className="text-sm font-medium">All systems operational</span>
                              </div>
                              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                                Last updated: {lastUpdated.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {/* Render extracted components based on activeTab */}
                {activeTab === 'donor-management' && <DonorManagement />}
                {activeTab === 'inventory' && <InventoryManagement />}
                {activeTab === 'emergency-blood-request' && <EmergencyRequestManagement />}
                {activeTab === 'analytics' && <AnalyticsModule />}
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