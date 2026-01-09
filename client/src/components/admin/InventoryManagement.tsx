// InventoryManagement.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
  primary: '#2563EB', // Blue with good contrast
  accent1: '#7C3AED', // Purple instead of red
  accent2: '#0891B2', // Cyan
  accent3: '#059669', // Green
  neutralDark: '#1F2937', // Dark gray for text
  neutralLight: '#F9FAFB', // Light gray for backgrounds
  cardBg: '#FFFFFF',
  cardBgDark: '#1F2937',
  text: '#111827', // Dark text for better contrast
  textDark: '#F9FAFB',
  muted: '#6B7280', // Muted gray
  mutedDark: '#9CA3AF',
  success: '#059669', // Green
  warning: '#D97706', // Amber instead of yellow
  danger: '#DC2626', // Red for critical alerts only
  info: '#2563EB', // Blue
  // High contrast colors for charts
  chartColors: [
    '#2563EB', // Blue
    '#7C3AED', // Purple
    '#059669', // Green
    '#D97706', // Amber
    '#DC2626', // Red
    '#0891B2', // Cyan
    '#BE185D', // Pink
    '#4338CA', // Indigo
  ]
};

// Blood group colors with gradients
const BLOOD_GROUP_COLORS = {
  'A+': { start: '#2563EB', end: '#1D4ED8', light: '#DBEAFE', text: '#1E40AF' },
  'A-': { start: '#7C3AED', end: '#6D28D9', light: '#EDE9FE', text: '#6D28D9' },
  'B+': { start: '#059669', end: '#047857', light: '#D1FAE5', text: '#047857' },
  'B-': { start: '#0891B2', end: '#0E7490', light: '#CFFAFE', text: '#0E7490' },
  'AB+': { start: '#D97706', end: '#B45309', light: '#FEF3C7', text: '#B45309' },
  'AB-': { start: '#BE185D', end: '#9F1239', light: '#FCE7F3', text: '#9F1239' },
  'O+': { start: '#4338CA', end: '#3730A3', light: '#E0E7FF', text: '#3730A3' },
  'O-': { start: '#DC2626', end: '#B91C1C', light: '#FEE2E2', text: '#B91C1C' },
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
  const [criticalAlertTab, setCriticalAlertTab] = useState(bloodGroups[0]);

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

  // Updated getStatusBadge function to handle all statuses with WCAG compliant colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case 'verified':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Verified</Badge>;
      case 'unverified':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Unverified</Badge>;
      case 'eligible':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Eligible</Badge>;
      case 'booked':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Booked</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
      case 'unavailable':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Unavailable</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
              className={timeRange === '7d' ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
              className={timeRange === '30d' ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
              className={timeRange === '90d' ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}
            >
              90 Days
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Eligible Donors
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.eligibleDonors.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+5% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Critical Blood Groups
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats?.criticalBloodGroups.length || '0'}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {stats?.criticalBloodGroups.reduce((sum, group) => sum + group.criticalUpazilas.length, 0) || 0} upazila{stats?.criticalBloodGroups.reduce((sum, group) => sum + group.criticalUpazilas.length, 0) !== 1 ? 's' : ''} affected
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Match Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.matchSuccessRate || '0'}%
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+3% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Donor Reactivation Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.reactivationRate || '0'}%
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+1.5% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donor Availability Trends - Stacked Line Chart */}
        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Donor Availability Trends</span>
            </CardTitle>
            <CardDescription className="text-gray-600">Donor availability status over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={stackedLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                <Legend />
                <Area type="monotone" dataKey="unavailable" stackId="1" stroke="#DC2626" fill="#DC2626" fillOpacity={0.6} name="Unavailable" />
                <Area type="monotone" dataKey="booked" stackId="1" stroke="#0891b2" fill="#0891b2" fillOpacity={0.6} name="Booked" />
                <Area type="monotone" dataKey="eligible" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} name="Eligible" />
                <Line type="monotone" dataKey="total" stroke="#1F2937" strokeWidth={2} dot={false} name="Total" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Blood Group Distribution - Radial Gradient Chart */}
        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Droplet className="w-5 h-5 text-blue-600" />
              <span>Blood Group Distribution</span>
            </CardTitle>
            <CardDescription className="text-gray-600">Percentage distribution of blood groups</CardDescription>
          </CardHeader>
          <CardContent>
            {bloodGroupStatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={radialData}>
                    <PolarAngleAxis type="number" domain={[0, Math.max(...radialData.map(d => d.value)) * 1.2]} angleAxisId={0} tick={false} />
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
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blood Groups Overview - Moved below charts and includes all blood groups with gradients */}
      <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Droplet className="w-5 h-5 text-blue-600" />
            <span>Blood Groups Overview</span>
          </CardTitle>
          <CardDescription className="text-gray-600">Distribution and availability by blood type</CardDescription>
        </CardHeader>
        <CardContent>
          {bloodGroupStatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bloodDistributionData.map((group) => {
                const color = BLOOD_GROUP_COLORS[group.name as keyof typeof BLOOD_GROUP_COLORS];
                return (
                  <div 
                    key={group.name} 
                    className="p-4 rounded-lg border border-gray-200 overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, ${color.light} 0%, white 100%)`,
                    }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10" 
                         style={{
                           background: `radial-gradient(circle, ${color.start} 0%, transparent 70%)`,
                           transform: 'translate(30%, -30%)'
                         }}>
                    </div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                          backgroundColor: color.start,
                          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
                        }}>
                          <Droplet className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg" style={{ color: color.text }}>{group.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 bg-white/80 backdrop-blur-sm">
                        {group.percentage}%
                      </Badge>
                    </div>
                    <div className="space-y-2 relative z-10">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Eligible:</span>
                        <span className="font-medium text-gray-900">{group.eligible}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Not Eligible:</span>
                        <span className="font-medium text-gray-900">{group.notEligible}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active:</span>
                        <span className="font-medium text-gray-900">{group.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Inactive:</span>
                        <span className="font-medium text-gray-900">{group.inactive}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Available:</span>
                        <span className="font-medium text-green-600">{group.available}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Unavailable:</span>
                        <span className="font-medium text-red-600">{group.unavailable}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Total:</span>
                        <span className="font-bold text-gray-900">{group.value}</span>
                      </div>
                      {isBloodGroupCritical(group.name) && (
                        <div className="mt-2 flex items-center text-amber-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Critical Shortage</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merged Donor Availability Component */}
      <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-gray-900">Donor Availability</CardTitle>
              <CardDescription className="text-gray-600">
                {activeTab === 'location' 
                  ? 'Consolidated view of donor availability by location and blood group' 
                  : 'Current donor availability status'
                }
              </CardDescription>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button
                variant={activeTab === 'location' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('location')}
                className={`flex items-center space-x-2 ${activeTab === 'location' ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                <Map className="h-4 w-4" />
                <span>By Location</span>
              </Button>
              <Button
                variant={activeTab === 'donors' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('donors')}
                className={`flex items-center space-x-2 ${activeTab === 'donors' ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
                <span>Individual Donors</span>
              </Button>
            </div>
          </div>

          {/* Filters - Always visible */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={activeTab === 'location' ? "Search by location..." : "Search by name, email, phone, or Donor ID..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64 border-gray-300"
              />
            </div>
            <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
              <SelectTrigger className="w-40 border-gray-300">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {bloodGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-40 border-gray-300">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {locationData?.districts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger className="w-40 border-gray-300">
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
                <SelectTrigger className="w-40 border-gray-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={clearFilters} className="text-gray-700 border-gray-300 hover:bg-gray-50">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upazila
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Division
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available Donors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredConsolidatedData.slice(0, 10).map((item, index) => (
                      <tr key={`${item.upazila}-${item.bloodGroup}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-900">{item.upazila}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {item.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {item.division}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.bloodGroup.includes('+') ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            <Droplet className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-gray-900">{item.bloodGroup}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={item.availableDonors < 5 ? "destructive" : "outline"} className={item.availableDonors < 5 ? "bg-red-100 text-red-800 border-red-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Donation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Eligible
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              <div className="text-sm font-medium text-gray-900">{donor.fullName || donor.username}</div>
                              <div className="text-sm text-gray-500">Donor ID: {donor.donorId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-500" />
                              <span className="text-gray-900">{donor.email}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1 text-gray-500" />
                              <span className="text-gray-900">{donor.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            donor.bloodGroup.includes('+') ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            <Droplet className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-gray-900">{donor.bloodGroup}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {donor.district}, {donor.division}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {donor.lastDonationDate || 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {donor.nextEligibleDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(donor.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {donor.status === 'eligible' && (
                            <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                              Book Donor
                            </Button>
                          )}
                          {donor.status === 'booked' && (
                            <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
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

      {/* Critical Alerts with Improved Tabbed Interface */}
      <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Critical Alerts</span>
          </CardTitle>
          <CardDescription className="text-gray-600">Blood groups requiring immediate attention by upazila</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={criticalAlertTab} onValueChange={setCriticalAlertTab} className="w-full">
            <div className="flex flex-wrap gap-2 mb-4">
              {bloodGroups.map((group) => {
                const isCritical = isBloodGroupCritical(group);
                const criticalUpazilas = getCriticalUpazilasForBloodGroup(group);
                const color = BLOOD_GROUP_COLORS[group as keyof typeof BLOOD_GROUP_COLORS];
                
                return (
                  <Button
                    key={group}
                    variant={criticalAlertTab === group ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCriticalAlertTab(group)}
                    className={`relative ${criticalAlertTab === group ? 'text-white' : 'text-gray-700 border-gray-300 hover:bg-gray-50'} ${isCritical ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : ''}`}
                    style={criticalAlertTab === group ? { backgroundColor: color.start } : {}}
                  >
                    {group}
                    {isCritical && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 animate-pulse"></span>
                    )}
                    {isCritical && (
                      <Badge variant="outline" className="ml-2 text-xs px-1 py-0 h-5 bg-amber-100 text-amber-800 border-amber-200">
                        {criticalUpazilas.length}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
            
            {bloodGroups.map((group) => {
              const criticalUpazilas = getCriticalUpazilasForBloodGroup(group);
              const isCritical = criticalUpazilas.length > 0;
              const groupStats = bloodGroupStats?.find(s => s.bloodGroup === group);
              const color = BLOOD_GROUP_COLORS[group as keyof typeof BLOOD_GROUP_COLORS];
              
              return (
                <TabsContent key={group} value={group} className="mt-4">
                  {isCritical ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border #F5F5F0 overflow-hidden relative" 
                           style={{
                             background: `linear-gradient(135deg, #F5F5F0 0%, white 100%)`,
                           }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" 
                             style={{
                               background: `radial-gradient(circle, ${color.start} 0%, transparent 70%)`,
                               transform: 'translate(30%, -30%)'
                             }}>
                        </div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: color.start,
                              boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
                            }}>
                              <Droplet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-lg" style={{ color: color.text }}>
                                Critical Shortage: {group}
                              </p>
                              <p className="text-sm text-gray-600">
                                {criticalUpazilas.length} critical upazila{criticalUpazilas.length > 1 ? 's' : ''} affected
                              </p>
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-sm px-3 py-1 bg-amber-100 text-amber-800 border-amber-200">
                            {criticalUpazilas.length} Critical
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative z-10">
                          <div className="p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200">
                            <p className="text-sm font-medium text-gray-600">Total Donors</p>
                            <p className="text-xl font-bold text-gray-900">{groupStats?.totalDonors || 0}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200">
                            <p className="text-sm font-medium text-gray-600">Eligible Donors</p>
                            <p className="text-xl font-bold text-green-600">{groupStats?.eligibleDonors || 0}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200">
                            <p className="text-sm font-medium text-gray-600">Availability Rate</p>
                            <p className="text-xl font-bold text-gray-900">
                              {groupStats?.totalDonors ? Math.round((groupStats.eligibleDonors / groupStats.totalDonors) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 relative z-10">
                          <p className="text-sm font-medium mb-2 text-gray-700">Critical Upazilas (&lt;5 donors):</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {criticalUpazilas.map((upazila) => (
                              <div key={upazila.upazila} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/80 backdrop-blur-sm border border-amber-200">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-amber-600" />
                                  <span className="text-sm font-medium text-gray-900">{upazila.upazila}</span>
                                </div>
                                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/80 backdrop-blur-sm">
                                  {upazila.count} donors
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                          <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                            <Search className="w-4 h-4 mr-2" />
                            Find Donors
                          </Button>
                          <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                            <MapPin className="w-4 h-4 mr-2" />
                            View Map
                          </Button>
                          <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Alert
                          </Button>
                          <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Donors
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">No Critical Shortage</p>
                      <p className="text-sm text-gray-600">
                        Blood group {group} has sufficient donors in all upazilas
                      </p>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-sm font-medium text-gray-600">Total Donors</p>
                          <p className="text-xl font-bold text-gray-900">{groupStats?.totalDonors || 0}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-sm font-medium text-gray-600">Eligible Donors</p>
                          <p className="text-xl font-bold text-green-600">{groupStats?.eligibleDonors || 0}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-sm font-medium text-gray-600">Availability Rate</p>
                          <p className="text-xl font-bold text-gray-900">
                            {groupStats?.totalDonors ? Math.round((groupStats.eligibleDonors / groupStats.totalDonors) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;