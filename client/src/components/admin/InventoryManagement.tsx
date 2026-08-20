import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Download,
  Plus,
  Search,
  Filter,
  BarChart3,
  Activity,
  Droplet,
  MapPin,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  List,
  Map,
  Mail,
  Phone,
  AlertCircle,
  Bell,
  Settings,
  MoreVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Grid,
  Table,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Treemap,
} from 'recharts';

interface Donor {
  id: number;
  donorId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: string;
  district: string;
  division: string;
  upazila: string;
  lastDonationDate: string;
  nextEligibleDate: string;
  status: 'active' | 'inactive' | 'pending' | 'verified' | 'unverified' | 'eligible' | 'booked' | 'in_progress' | 'unavailable';
  daysSinceLastDonation: number;
  isAvailable: boolean;
  profilePicture?: string;
}

interface DonorAvailabilityStats {
  totalDonors: number;
  eligibleDonors: number;
  bookedDonors: number;
  unavailableDonors: number;
  criticalBloodGroups: Array<{ bloodGroup: string; eligibleCount: number; threshold: number; criticalUpazilas: Array<{ upazila: string; count: number }> }>;
  matchSuccessRate: number;
  reactivationRate: number;
}

interface UpcomingReactivation {
  donorId: number;
  donorName: string;
  bloodGroup: string;
  nextEligibleDate: string;
  daysUntilEligible: number;
}

interface EmergencyRequest {
  id: number;
  patientName: string;
  bloodGroup: string;
  hospitalName: string;
  createdAt: string;
  hoursElapsed: number;
}

interface ConsolidatedDonorData {
  upazila: string;
  district: string;
  division: string;
  bloodGroup: string;
  availableDonors: number;
}

interface BloodGroupStats {
  bloodGroup: string;
  totalDonors: number;
  eligibleDonors: number;
  notEligibleDonors: number;
  activeDonors: number;
  inactiveDonors: number;
  availableDonors: number;
  unavailableDonors: number;
  percentage: number;
  trend: number;
}

// WCAG compliant color palette with better contrast
const COLORS = {
  primary: '#1e40af', // Darker blue for better contrast
  primaryHover: '#1e3a8a', // Even darker for hover states
  accent1: '#7e22ce', // Darker purple
  accent2: '#0e7490', // Darker cyan
  accent3: '#047857', // Darker green
  neutralDark: '#111827', // Almost black for text
  neutralLight: '#f9fafb', // Light gray for backgrounds
  cardBg: '#ffffff',
  cardBgDark: '#1f2937',
  text: '#111827', // Almost black for better contrast
  textDark: '#f9fafb',
  muted: '#4b5563', // Darker gray for better contrast
  mutedDark: '#d1d5db',
  success: '#059669', // Green
  successLight: '#d1fae5', // Light green for backgrounds
  warning: '#d97706', // Darker amber
  warningLight: '#fef3c7', // Light amber for backgrounds
  danger: '#b91c1c', // Darker red for critical alerts
  dangerLight: '#fee2e2', // Light red for backgrounds
  info: '#1d4ed8', // Darker blue
  infoLight: '#dbeafe', // Light blue for backgrounds
  // High contrast colors for charts
  chartColors: [
    '#1e40af', // Darker blue
    '#7e22ce', // Darker purple
    '#047857', // Darker green
    '#d97706', // Darker amber
    '#b91c1c', // Darker red
    '#0e7490', // Darker cyan
    '#be185d', // Darker pink
    '#3730a3', // Darker indigo
  ]
};

// Blood group colors with gradients and better contrast
const BLOOD_GROUP_COLORS = {
  'A+': { 
    start: '#1e40af', 
    end: '#1e3a8a', 
    light: '#dbeafe', 
    text: '#1e3a8a',
    contrastText: '#ffffff' // For badges and other small elements
  },
  'A-': { 
    start: '#7e22ce', 
    end: '#6b21a8', 
    light: '#f3e8ff', 
    text: '#6b21a8',
    contrastText: '#ffffff'
  },
  'B+': { 
    start: '#047857', 
    end: '#047857', 
    light: '#d1fae5', 
    text: '#047857',
    contrastText: '#ffffff'
  },
  'B-': { 
    start: '#0e7490', 
    end: '#155e75', 
    light: '#cffafe', 
    text: '#155e75',
    contrastText: '#ffffff'
  },
  'AB+': { 
    start: '#d97706', 
    end: '#b45309', 
    light: '#fef3c7', 
    text: '#b45309',
    contrastText: '#ffffff'
  },
  'AB-': { 
    start: '#be185d', 
    end: '#9d174d', 
    light: '#fce7f3', 
    text: '#9d174d',
    contrastText: '#ffffff'
  },
  'O+': { 
    start: '#3730a3', 
    end: '#312e81', 
    light: '#e0e7ff', 
    text: '#312e81',
    contrastText: '#ffffff'
  },
  'O-': { 
    start: '#b91c1c', 
    end: '#991b1b', 
    light: '#fee2e2', 
    text: '#991b1b',
    contrastText: '#ffffff'
  },
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'eligible', label: 'Eligible' },
  { value: 'booked', label: 'Booked' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'unavailable', label: 'Unavailable' },
];

const InventoryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'location' | 'donors'>('donors');
  const [expandedCriticalGroups, setExpandedCriticalGroups] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Fetch donor availability stats
  const { data: stats, isLoading: statsLoading } = useQuery<DonorAvailabilityStats>({
    queryKey: ['/api/admin/donor-availability/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch blood group statistics
  const { data: bloodGroupStats, isLoading: bloodGroupStatsLoading } = useQuery<BloodGroupStats[]>({
    queryKey: ['/api/admin/blood-group-stats'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch consolidated donor data
  const { data: consolidatedData, isLoading: consolidatedLoading } = useQuery<ConsolidatedDonorData[]>({
    queryKey: ['/api/admin/donor-availability/consolidated'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch unique districts and divisions for filters
  const { data: locationData } = useQuery<{
    districts: string[];
    divisions: string[];
    upazilas: { [district: string]: string[] };
  }>({
    queryKey: ['/api/admin/location-data'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch donor availability
  const { data: donorData, isLoading: donorsLoading, refetch: refetchDonors } = useQuery<{
    donors: Donor[];
    total: number;
    eligibleCount: number;
    bookedCount: number;
    unavailableCount: number;
  }>({
    queryKey: ['/api/admin/donor-availability', {
      bloodGroup: selectedBloodGroup === 'all' ? '' : selectedBloodGroup,
      district: selectedDistrict === 'all' ? '' : selectedDistrict,
      status: statusFilter === 'all' ? '' : statusFilter,
      limit: 50,
      offset: 0
    }],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch donor availability trends
  const { data: trendsData } = useQuery<Array<{
    date: string;
    eligible: number;
    booked: number;
    unavailable: number;
  }>>({
    queryKey: ['/api/admin/donor-availability-trends', { days: 30 }],
    staleTime: 5 * 60 * 1000,
  });

  // Book donor for request mutation
  const bookDonorMutation = useMutation({
    mutationFn: ({ requestId, donorId }: { requestId: number; donorId: number }) =>
      apiRequest('/api/admin/book-donor', {
        method: 'POST',
        body: { requestId, donorId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/donor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-requests-pending'] });
      toast({
        title: "Success",
        description: "Donor booked successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to book donor.",
        variant: "destructive",
      });
    },
  });

  // Complete donation mutation
  const completeDonationMutation = useMutation({
    mutationFn: ({ requestId, donorId }: { requestId: number; donorId: number }) =>
      apiRequest('/api/admin/complete-donation', {
        method: 'POST',
        body: { requestId, donorId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/donor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-requests-pending'] });
      toast({
        title: "Success",
        description: "Donation completed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete donation.",
        variant: "destructive",
      });
    },
  });

  // Filter consolidated donor data
  const filteredConsolidatedData = consolidatedData?.filter(item => {
    const matchesSearch = item.upazila.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.division.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodGroup = selectedBloodGroup === 'all' || item.bloodGroup === selectedBloodGroup;
    const matchesDistrict = selectedDistrict === 'all' || item.district === selectedDistrict;
    const matchesDivision = selectedDivision === 'all' || item.division === selectedDivision;
    return matchesSearch && matchesBloodGroup && matchesDistrict && matchesDivision;
  }) || [];

  // Filter donor availability - updated to include all search fields
  const filteredDonors = donorData?.donors.filter(donor => {
    const matchesSearch = searchTerm === '' || 
                         donor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.phone.includes(searchTerm) ||
                         donor.donorId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodGroup = selectedBloodGroup === 'all' || donor.bloodGroup === selectedBloodGroup;
    const matchesDistrict = selectedDistrict === 'all' || donor.district === selectedDistrict;
    const matchesStatus = statusFilter === 'all' || donor.status === statusFilter;
    return matchesSearch && matchesBloodGroup && matchesDistrict && matchesStatus;
  }) || [];

  // Updated getStatusBadge function with WCAG compliant colors
  const getStatusBadge = (status: string) => {
    const badgeStyles = {
      className: "px-3 py-1 rounded-full text-xs font-semibold",
    };
    
    switch (status) {
      case 'active':
        return (
          <Badge {...badgeStyles} className="bg-success-light text-success border-success">
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge {...badgeStyles} className="bg-gray-100 text-gray-800 border-gray-200">
            Inactive
          </Badge>
        );
      case 'pending':
        return (
          <Badge {...badgeStyles} className="bg-warning-light text-warning border-warning">
            Pending
          </Badge>
        );
      case 'verified':
        return (
          <Badge {...badgeStyles} className="bg-info-light text-info border-info">
            Verified
          </Badge>
        );
      case 'unverified':
        return (
          <Badge {...badgeStyles} className="bg-purple-100 text-purple-800 border-purple-200">
            Unverified
          </Badge>
        );
      case 'eligible':
        return (
          <Badge {...badgeStyles} className="bg-success-light text-success border-success">
            Eligible
          </Badge>
        );
      case 'booked':
        return (
          <Badge {...badgeStyles} className="bg-info-light text-info border-info">
            Booked
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge {...badgeStyles} className="bg-warning-light text-warning border-warning">
            In Progress
          </Badge>
        );
      case 'unavailable':
        return (
          <Badge {...badgeStyles} className="bg-danger-light text-danger border-danger">
            Unavailable
          </Badge>
        );
      default:
        return (
          <Badge {...badgeStyles} className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const handleBookDonor = (requestId: number, donorId: number) => {
    bookDonorMutation.mutate({ requestId, donorId });
  };

  const handleCompleteDonation = (requestId: number, donorId: number) => {
    completeDonationMutation.mutate({ requestId, donorId });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBloodGroup('all');
    setSelectedDistrict('all');
    setSelectedDivision('all');
    setStatusFilter('all');
  };

  const toggleExpandedCriticalGroup = (bloodGroup: string) => {
    setExpandedCriticalGroups(prev => ({
      ...prev,
      [bloodGroup]: !prev[bloodGroup]
    }));
  };

  // Get upazilas based on selected district
  const getUpazilasForDistrict = () => {
    if (!selectedDistrict || !locationData?.upazilas) return [];
    return locationData.upazilas[selectedDistrict] || [];
  };

  // Refetch donors when filters change
  useEffect(() => {
    refetchDonors();
  }, [selectedBloodGroup, selectedDistrict, statusFilter, refetchDonors]);

  // Calculate blood distribution data from actual user data
  const bloodDistributionData = bloodGroups.map(group => {
    const stats = bloodGroupStats?.find(s => s.bloodGroup === group);
    return {
      name: group,
      value: stats?.totalDonors || 0,
      eligible: stats?.eligibleDonors || 0,
      notEligible: stats?.notEligibleDonors || 0,
      active: stats?.activeDonors || 0,
      inactive: stats?.inactiveDonors || 0,
      available: stats?.availableDonors || 0,
      unavailable: stats?.unavailableDonors || 0,
      percentage: stats?.percentage || 0,
    };
  });

  // Get critical upazilas for selected blood group
  const getCriticalUpazilasForBloodGroup = (bloodGroup: string) => {
    const criticalGroup = stats?.criticalBloodGroups.find(g => g.bloodGroup === bloodGroup);
    return criticalGroup?.criticalUpazilas || [];
  };

  // Check if blood group is critical
  const isBloodGroupCritical = (bloodGroup: string) => {
    const criticalGroup = stats?.criticalBloodGroups.find(g => g.bloodGroup === bloodGroup);
    return criticalGroup && criticalGroup.criticalUpazilas.length > 0;
  };

  // Prepare data for stacked line chart
  const stackedLineData = trendsData?.map(item => ({
    date: item.date,
    eligible: item.eligible,
    booked: item.booked,
    unavailable: item.unavailable,
    total: item.eligible + item.booked + item.unavailable
  })) || [];

  // Prepare data for radial gradient chart
  const radialData = bloodGroups.map((group, index) => {
    const stats = bloodGroupStats?.find(s => s.bloodGroup === group);
    return {
      name: group,
      value: stats?.totalDonors || 0,
      fill: BLOOD_GROUP_COLORS[group as keyof typeof BLOOD_GROUP_COLORS].start,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with improved accessibility */}
      <header className="bg-white shadow-sm rounded-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutralDark">Blood & Donor Inventory</h1>
            <p className="text-muted mt-1">Monitor and manage blood inventory across all locations</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline" 
              className="text-neutralDark border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Export inventory report"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={timeRange === '7d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('7d')}
                className={`rounded-md ${timeRange === '7d' ? 'bg-primary text-white shadow' : 'text-neutralDark hover:bg-gray-200'}`}
                aria-label="Show data for last 7 days"
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('30d')}
                className={`rounded-md ${timeRange === '30d' ? 'bg-primary text-white shadow' : 'text-neutralDark hover:bg-gray-200'}`}
                aria-label="Show data for last 30 days"
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === '90d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('90d')}
                className={`rounded-md ${timeRange === '90d' ? 'bg-primary text-white shadow' : 'text-neutralDark hover:bg-gray-200'}`}
                aria-label="Show data for last 90 days"
              >
                90 Days
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview with improved design and accessibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Total Eligible Donors
                </p>
                <p className="text-3xl font-bold text-neutralDark mt-1">
                  {stats?.eligibleDonors.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-success mr-1" aria-hidden="true" />
                  <span className="text-sm text-success font-medium">
                    +5% from last month
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-success-light flex items-center justify-center" aria-hidden="true">
                <UserCheck className="w-7 h-7 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Critical Blood Groups
                </p>
                <p className="text-3xl font-bold text-warning mt-1">
                  {stats?.criticalBloodGroups.length || '0'}
                </p>
                <p className="text-sm text-warning mt-2 font-medium">
                  {stats?.criticalBloodGroups.reduce((sum, group) => sum + group.criticalUpazilas.length, 0) || 0} upazila{stats?.criticalBloodGroups.reduce((sum, group) => sum + group.criticalUpazilas.length, 0) !== 1 ? 's' : ''} affected
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-warning-light flex items-center justify-center" aria-hidden="true">
                <AlertTriangle className="w-7 h-7 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Match Success Rate
                </p>
                <p className="text-3xl font-bold text-neutralDark mt-1">
                  {stats?.matchSuccessRate || '0'}%
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-success mr-1" aria-hidden="true" />
                  <span className="text-sm text-success font-medium">
                    +3% from last month
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-info-light flex items-center justify-center" aria-hidden="true">
                <TrendingUp className="w-7 h-7 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Donor Reactivation Rate
                </p>
                <p className="text-3xl font-bold text-neutralDark mt-1">
                  {stats?.reactivationRate || '0'}%
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-success mr-1" aria-hidden="true" />
                  <span className="text-sm text-success font-medium">
                    +1.5% from last month
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center" aria-hidden="true">
                <RefreshCw className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section with improved accessibility and design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donor Availability Trends - Stacked Line Chart */}
        <Card className="shadow-md border border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-neutralDark">
              <TrendingUp className="w-5 h-5 text-primary mr-2" />
              <span>Donor Availability Trends</span>
            </CardTitle>
            <CardDescription className="text-muted">
              Donor availability status over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stackedLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="unavailable" 
                    stackId="1" 
                    stroke="#b91c1c" 
                    fill="#b91c1c" 
                    fillOpacity={0.6} 
                    name="Unavailable" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="booked" 
                    stackId="1" 
                    stroke="#0e7490" 
                    fill="#0e7490" 
                    fillOpacity={0.6} 
                    name="Booked" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="eligible" 
                    stackId="1" 
                    stroke="#1e40af" 
                    fill="#1e40af" 
                    fillOpacity={0.6} 
                    name="Eligible" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#1f2937" 
                    strokeWidth={2} 
                    dot={false} 
                    name="Total" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Blood Group Distribution - Radial Gradient Chart */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-neutralDark">
              <Droplet className="w-5 h-5 text-primary mr-2" />
              <span>Blood Group Distribution</span>
            </CardTitle>
            <CardDescription className="text-muted">
              Percentage distribution of blood groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bloodGroupStatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={radialData}>
                    <PolarAngleAxis 
                      type="number" 
                      domain={[0, Math.max(...radialData.map(d => d.value)) * 1.2]} 
                      angleAxisId={0} 
                      tick={false} 
                    />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      fill="#8884d8"
                      angleAxisId={0}
                    >
                      {radialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </RadialBar>
                    <Legend 
                      iconSize={10} 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donor Availability - MOVED AFTER CHARTS AS REQUESTED */}
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-neutralDark">Donor Availability</CardTitle>
              <CardDescription className="text-muted">
                {activeTab === 'location' 
                  ? 'Consolidated view of donor availability by location and blood group' 
                  : 'Current donor availability status'
                }
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button
                variant={activeTab === 'location' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('location')}
                className={`flex items-center space-x-2 ${
                  activeTab === 'location' 
                    ? 'bg-primary text-white' 
                    : 'text-neutralDark border-gray-300 hover:bg-gray-50'
                }`}
                aria-label="View by location"
              >
                <Map className="h-4 w-4" />
                <span>By Location</span>
              </Button>
              <Button
                variant={activeTab === 'donors' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('donors')}
                className={`flex items-center space-x-2 ${
                  activeTab === 'donors' 
                    ? 'bg-primary text-white' 
                    : 'text-neutralDark border-gray-300 hover:bg-gray-50'
                }`}
                aria-label="View individual donors"
              >
                <List className="h-4 w-4" />
                <span>Individual Donors</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden="true" />
              <Input
                placeholder={activeTab === 'location' ? "Search by location..." : "Search by name, email, phone, or Donor ID..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-gray-300"
                aria-label="Search"
              />
            </div>
            <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {bloodGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Added district and division filters as requested */}
            <Select value={selectedDistrict} onValueChange={(value) => {
              setSelectedDistrict(value);
              if (value !== 'all') {
                setSelectedDivision(locationData?.divisions.find(d => 
                  locationData?.districts.includes(value) && true
                ) || 'all');
              }
            }}>
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {locationData?.districts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDivision} onValueChange={(value) => {
              setSelectedDivision(value);
              if (value !== 'all') {
                setSelectedDistrict('all');
              }
            }}>
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {locationData?.divisions.map(division => (
                  <SelectItem key={division} value={division}>{division}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeTab === 'donors' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-gray-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              className="text-neutralDark border-gray-300 hover:bg-gray-50"
              aria-label="Clear filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'location' ? (
            // Location View
            consolidatedLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Upazila
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        District
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Division
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Blood Group
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Available Donors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredConsolidatedData.slice(0, 10).map((item, index) => (
                      <tr key={`${item.upazila}-${item.bloodGroup}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted" aria-hidden="true" />
                            <span className="text-neutralDark">{item.upazila}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted">
                          {item.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted">
                          {item.division}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.bloodGroup.includes('+') ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`} aria-hidden="true">
                            <Droplet className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-neutralDark">{item.bloodGroup}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={item.availableDonors < 5 ? "destructive" : "outline"} 
                            className={
                              item.availableDonors < 5 
                                ? "bg-danger-light text-danger border-danger" 
                                : "bg-gray-100 text-neutralDark border-gray-200"
                            }
                          >
                            {item.availableDonors}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            // Individual Donors View
            donorsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Donor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Blood Group
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Last Donation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Next Eligible
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDonors.slice(0, 10).map((donor) => (
                      <tr key={donor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={donor.profilePicture} alt={donor.fullName} />
                              <AvatarFallback>
                                {donor.fullName ? donor.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : donor.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-neutralDark">{donor.fullName || donor.username}</div>
                              <div className="text-sm text-muted">Donor ID: {donor.donorId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-muted" aria-hidden="true" />
                              <span className="text-neutralDark">{donor.email}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1 text-muted" aria-hidden="true" />
                              <span className="text-neutralDark">{donor.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            donor.bloodGroup.includes('+') ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`} aria-hidden="true">
                            <Droplet className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-neutralDark">{donor.bloodGroup}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted">
                          {donor.district}, {donor.division}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {donor.lastDonationDate || 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          {donor.nextEligibleDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(donor.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {donor.status === 'eligible' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-neutralDark border-gray-300 hover:bg-gray-50"
                              onClick={() => handleBookDonor(0, donor.id)}
                            >
                              Book Donor
                            </Button>
                          )}
                          {donor.status === 'booked' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-neutralDark border-gray-300 hover:bg-gray-50"
                              onClick={() => handleCompleteDonation(0, donor.id)}
                            >
                              Complete Donation
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Blood Groups Overview - COMPLETELY REDESIGNED */}
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center text-neutralDark">
                <Droplet className="w-5 h-5 text-primary mr-2" />
                <span>Blood Groups Overview</span>
              </CardTitle>
              <CardDescription className="text-muted">
                Distribution and availability by blood type
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'text-neutralDark border-gray-300 hover:bg-gray-50'
                }`}
                aria-label="View as grid"
              >
                <Grid className="h-4 w-4" />
                <span>Grid</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-2 ${
                  viewMode === 'table' 
                    ? 'bg-primary text-white' 
                    : 'text-neutralDark border-gray-300 hover:bg-gray-50'
                }`}
                aria-label="View as table"
              >
                <Table className="h-4 w-4" />
                <span>Table</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bloodGroupStatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bloodDistributionData.map((group) => {
                const color = BLOOD_GROUP_COLORS[group.name as keyof typeof BLOOD_GROUP_COLORS];
                const isCritical = isBloodGroupCritical(group.name);
                
                return (
                  <motion.div 
                    key={group.name}
                    whileHover={{ y: -4 }}
                    className={`p-5 rounded-xl border overflow-hidden relative transition-shadow ${
                      isCritical 
                        ? 'border-warning shadow-md' 
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${color.light} 0%, white 100%)`,
                    }}
                  >
                    {isCritical && (
                      <div className="absolute top-0 right-0 p-2">
                        <div className="flex items-center text-warning">
                          <AlertTriangle className="h-4 w-4 mr-1" aria-hidden="true" />
                          <span className="text-xs font-bold">Critical</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ 
                          backgroundColor: color.start,
                        }}>
                          <Droplet className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <span className="text-2xl font-bold" style={{ color: color.text }}>
                            {group.name}
                          </span>
                          <div className="text-sm text-muted font-medium mt-1">
                            {group.percentage}% of total
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted">Eligible</span>
                        <span className="text-lg font-bold text-success">{group.eligible}</span>
                      </div>
                      <Progress 
                        value={(group.eligible / group.value) * 100} 
                        className="h-2"
                        aria-label={`Percentage of eligible ${group.name} donors`}
                      />
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-white bg-opacity-60 rounded-lg p-2">
                          <div className="text-xs text-muted">Available</div>
                          <div className="text-lg font-bold text-success">{group.available}</div>
                        </div>
                        <div className="bg-white bg-opacity-60 rounded-lg p-2">
                          <div className="text-xs text-muted">Unavailable</div>
                          <div className="text-lg font-bold text-danger">{group.unavailable}</div>
                        </div>
                        <div className="bg-white bg-opacity-60 rounded-lg p-2">
                          <div className="text-xs text-muted">Active</div>
                          <div className="text-lg font-bold text-info">{group.active}</div>
                        </div>
                        <div className="bg-white bg-opacity-60 rounded-lg p-2">
                          <div className="text-xs text-muted">Inactive</div>
                          <div className="text-lg font-bold text-muted">{group.inactive}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-3">
                        <span className="text-sm font-bold text-muted">Total</span>
                        <span className="text-2xl font-bold" style={{ color: color.text }}>
                          {group.value}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Blood Group
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Eligible
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Available
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Unavailable
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Inactive
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bloodDistributionData.map((group) => {
                    const color = BLOOD_GROUP_COLORS[group.name as keyof typeof BLOOD_GROUP_COLORS];
                    const isCritical = isBloodGroupCritical(group.name);
                    
                    return (
                      <tr key={group.name} className={isCritical ? "bg-warning-light/10" : "hover:bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3`} style={{ backgroundColor: color.start }}>
                              <Droplet className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-bold" style={{ color: color.text }}>{group.name}</div>
                              {isCritical && (
                                <div className="text-xs text-warning flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Critical
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{group.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success">{group.eligible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success">{group.available}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-danger">{group.unavailable}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-info">{group.active}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted">{group.inactive}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Alerts - COMPLETELY REDESIGNED */}
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center text-neutralDark">
                <AlertTriangle className="w-5 h-5 text-warning mr-2" />
                <span>Critical Alerts</span>
              </CardTitle>
              <CardDescription className="text-muted">
                Blood groups requiring immediate attention by upazila
              </CardDescription>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 md:mt-0 text-warning border-warning hover:bg-warning-light"
              onClick={() => setActiveTab('location')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              View All Critical Locations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bloodGroups.filter(bg => isBloodGroupCritical(bg)).length > 0 ? (
            <div className="space-y-4">
              {bloodGroups.filter(bg => isBloodGroupCritical(bg)).map((group) => {
                const criticalUpazilas = getCriticalUpazilasForBloodGroup(group);
                const color = BLOOD_GROUP_COLORS[group as keyof typeof BLOOD_GROUP_COLORS];
                const isExpanded = expandedCriticalGroups[group] || false;
                const groupStats = bloodGroupStats?.find(s => s.bloodGroup === group);
                
                return (
                  <div 
                    key={group} 
                    className="border border-warning rounded-lg overflow-hidden"
                  >
                    <div 
                      className="bg-warning-light/10 p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleExpandedCriticalGroup(group)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                          backgroundColor: color.start,
                        }}>
                          <Droplet className="h-5 w-5 text-white" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="text-xl font-bold" style={{ color: color.text }}>
                              {group}
                            </span>
                            <Badge className="ml-2 bg-warning text-white border-warning">
                              {criticalUpazilas.length} Critical
                            </Badge>
                          </div>
                          <p className="text-sm text-muted">
                            {criticalUpazilas.length} critical upazila{criticalUpazilas.length > 1 ? 's' : ''} affected
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="grid grid-cols-3 gap-2 mr-4">
                          <div className="bg-white rounded p-2 text-center">
                            <div className="text-xs text-muted">Total</div>
                            <div className="text-sm font-bold text-neutralDark">{groupStats?.totalDonors || 0}</div>
                          </div>
                          <div className="bg-white rounded p-2 text-center">
                            <div className="text-xs text-muted">Eligible</div>
                            <div className="text-sm font-bold text-success">{groupStats?.eligibleDonors || 0}</div>
                          </div>
                          <div className="bg-white rounded p-2 text-center">
                            <div className="text-xs text-muted">Rate</div>
                            <div className="text-sm font-bold text-neutralDark">
                              {groupStats?.totalDonors ? Math.round((groupStats.eligibleDonors / groupStats.totalDonors) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" aria-label={isExpanded ? "Collapse" : "Expand"}>
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white p-4"
                        >
                          <h4 className="text-sm font-medium mb-3 text-neutralDark">Critical Upazilas:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {criticalUpazilas.map((upazila, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded p-2">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 text-warning mr-2" aria-hidden="true" />
                                  <span className="text-sm font-medium">{upazila.upazila}</span>
                                </div>
                                <Badge variant="outline" className="text-warning border-warning">
                                  {upazila.count} donors
                                </Badge>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-neutralDark border-gray-300 hover:bg-gray-50"
                              onClick={() => {
                                setSelectedBloodGroup(group);
                                setActiveTab('location');
                              }}
                            >
                              <Search className="w-4 h-4 mr-1" aria-hidden="true" />
                              Find Donors
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-warning border-warning hover:bg-warning-light"
                              onClick={() => {
                                setSelectedBloodGroup(group);
                                setActiveTab('location');
                              }}
                            >
                              <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                              View Map
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" aria-hidden="true" />
              </div>
              <p className="text-lg font-medium text-neutralDark">No Critical Shortages</p>
              <p className="text-sm text-muted mt-1">
                All blood groups have sufficient donors in all upazilas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;