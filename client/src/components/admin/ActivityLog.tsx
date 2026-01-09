import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Users,
  Heart,
  Droplet,
  MapPin,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  LineChart,
  Line,
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
} from 'recharts';

interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: string;
  category: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  severity: 'low' | 'medium' | 'high';
}

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  errorActivities: number;
  warningActivities: number;
  topUsers: Array<{ name: string; count: number }>;
  activityByCategory: Array<{ category: string; count: number }>;
  activityTrends: Array<{ date: string; count: number }>;
}

const COLORS = {
  primary: '#1F6FEB',
  accent1: '#FF6B6B',
  accent2: '#FFD166',
  accent3: '#4BC0C8',
  neutralDark: '#0F1724',
  neutralLight: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBgDark: '#0b0b0b',
  text: '#0F1724',
  textDark: '#FFFFFF',
  muted: '#64748B',
  mutedDark: '#94A3B8',
};

const CHART_COLORS = [
  COLORS.primary, 
  COLORS.accent1, 
  COLORS.accent2, 
  COLORS.accent3, 
  COLORS.muted, 
  COLORS.mutedDark, 
  '#8B5CF6', 
  '#EC4899'
];

const activityCategories = [
  'User Management',
  'Donor Management',
  'Emergency Request',
  'Inventory',
  'System',
  'Authentication',
  'Settings',
  'Reports'
];

const ActivityLog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);

  // Fetch activity logs
  const { data: activities, isLoading, error } = useQuery<ActivityLog[]>({
    queryKey: ['/api/admin/activity-logs'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch activity stats
  const { data: stats } = useQuery<ActivityStats>({
    queryKey: ['/api/admin/activity-stats'],
    staleTime: 5 * 60 * 1000,
  });

  // Delete activity log mutation
  const deleteActivityMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/activity-logs/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activity-stats'] });
      toast({
        title: "Success",
        description: "Activity log deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete activity log.",
        variant: "destructive",
      });
    },
  });

  // Filter activities
  const filteredActivities = activities?.filter(activity => {
    const matchesSearch = activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || activity.category === selectedCategory;
    const matchesStatus = !selectedStatus || activity.status === selectedStatus;
    const matchesSeverity = !selectedSeverity || activity.severity === selectedSeverity;
    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  }) || [];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const handleDeleteActivity = (id: number) => {
    if (confirm('Are you sure you want to delete this activity log?')) {
      deleteActivityMutation.mutate(id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'User Management':
        return <Users className="h-4 w-4" />;
      case 'Donor Management':
        return <Heart className="h-4 w-4" />;
      case 'Emergency Request':
        return <Droplet className="h-4 w-4" />;
      case 'Inventory':
        return <MapPin className="h-4 w-4" />;
      case 'System':
        return <Settings className="h-4 w-4" />;
      case 'Authentication':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-green-600 border-green-600">Low</Badge>;
    }
  };

  const exportActivityLogs = () => {
    toast({
      title: "Export Started",
      description: "Exporting activity logs as CSV...",
    });
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,User Name,User Email,Action,Category,Details,IP Address,Timestamp,Status,Severity\n";
    
    filteredActivities.forEach(activity => {
      csvContent += `${activity.id},${activity.userName},${activity.userEmail},"${activity.action}","${activity.category}","${activity.details}",${activity.ipAddress},${activity.timestamp},${activity.status},${activity.severity}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Activity logs exported successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={exportActivityLogs}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant={dateRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('24h')}
            >
              24 Hours
            </Button>
            <Button
              variant={dateRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={dateRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('30d')}
            >
              30 Days
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.muted }}>
                  Total Activities
                </p>
                <p className="text-2xl font-bold">
                  {stats?.totalActivities.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs" style={{ color: COLORS.muted }}>
                    Last 30 days
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.muted }}>
                  Today's Activities
                </p>
                <p className="text-2xl font-bold">
                  {stats?.todayActivities.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs" style={{ color: COLORS.muted }}>
                    Current day
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.muted }}>
                  Error Activities
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {stats?.errorActivities.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-red-500">
                    Requires attention
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.muted }}>
                  Warning Activities
                </p>
                <p className="text-2xl font-bold text-yellow-500">
                  {stats?.warningActivities.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-yellow-500">
                    Monitor closely
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Trends */}
        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="w-5 h-5" style={{ color: COLORS.primary }} />
              <span>Activity Trends</span>
            </CardTitle>
            <CardDescription>System activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.activityTrends || []}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity by Category */}
        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="w-5 h-5" style={{ color: COLORS.accent3 }} />
              <span>Activity by Category</span>
            </CardTitle>
            <CardDescription>Distribution of activities by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.activityByCategory || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.accent3} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log Table */}
      <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Detailed record of all system activities</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4" style={{ color: COLORS.muted }} />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {activityCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.primary }}></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: COLORS.muted }}>
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.muted }}>
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.muted }}>
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.muted }}>
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.muted }}>
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.muted }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.muted }}>
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.muted }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: COLORS.muted }}>
                  {currentItems.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" style={{ color: COLORS.muted }} />
                          <div>
                            <p className="text-sm">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs" style={{ color: COLORS.muted }}>
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.userName}</p>
                            <p className="text-xs" style={{ color: COLORS.muted }}>
                              {activity.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-xs truncate max-w-xs" style={{ color: COLORS.muted }}>
                            {activity.details}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getCategoryIcon(activity.category)}
                          <span className="ml-2 text-sm">{activity.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(activity.status)}
                          <span className="ml-2 capitalize text-sm">{activity.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(activity.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setSelectedActivity(activity)}
                            className="hover:text-blue-600"
                            style={{ color: COLORS.primary }}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="hover:text-red-600"
                            style={{ color: COLORS.accent1 }}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm" style={{ color: COLORS.muted }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredActivities.length)} of {filteredActivities.length} activities
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <Card style={{ backgroundColor: COLORS.cardBg }} className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedActivity(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">General Information</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>ID:</span>
                    <span className="text-sm">{selectedActivity.id}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>Timestamp:</span>
                    <span className="text-sm">
                      {new Date(selectedActivity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>IP Address:</span>
                    <span className="text-sm">{selectedActivity.ipAddress}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>Status:</span>
                    <div className="flex items-center">
                      {getStatusIcon(selectedActivity.status)}
                      <span className="ml-2 capitalize">{selectedActivity.status}</span>
                    </div>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>Severity:</span>
                    {getSeverityBadge(selectedActivity.severity)}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">User Information</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>User ID:</span>
                    <span className="text-sm">{selectedActivity.userId}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>Name:</span>
                    <span className="text-sm">{selectedActivity.userName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>Email:</span>
                    <span className="text-sm">{selectedActivity.userEmail}</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-medium mb-2">Activity Details</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>Category:</span>
                    <div className="flex items-center">
                      {getCategoryIcon(selectedActivity.category)}
                      <span className="ml-2">{selectedActivity.category}</span>
                    </div>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm" style={{ color: COLORS.muted }}>Action:</span>
                    <span className="text-sm font-medium">{selectedActivity.action}</span>
                  </div>
                  <div>
                    <span className="text-sm" style={{ color: COLORS.muted }}>Details:</span>
                    <p className="text-sm mt-1 p-3 rounded bg-gray-50 dark:bg-gray-800">
                      {selectedActivity.details}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityLog;