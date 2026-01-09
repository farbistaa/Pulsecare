import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Shield,
  Activity,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';

interface DashboardStats {
  totalUsers: number;
  totalRequests: number;
  totalDonations: number;
  activeUsers: number;
  pendingRequests: number;
  completedDonations: number;
}

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard', {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "Admin access required to view analytics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Registered donors and seekers"
    },
    {
      title: "Active Donors",
      value: stats?.activeUsers || 0,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: "Available for donation"
    },
    {
      title: "Emergency Requests",
      value: stats?.totalRequests || 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      description: "Total requests submitted"
    },
    {
      title: "Completed Donations",
      value: stats?.completedDonations || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Successful blood donations"
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests || 0,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Awaiting donor response"
    },
    {
      title: "Success Rate",
      value: stats ? Math.round((stats.completedDonations / Math.max(stats.totalRequests, 1)) * 100) : 0,
      icon: Shield,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      description: "Request fulfillment rate",
      suffix: "%"
    }
  ];

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Comprehensive system metrics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {[1, 2, 3, 4, 5, 6].map(i => (
  <div key={i}>
    <Loader />
    <div className="h-24 bg-gray-200 rounded-lg"></div>
  </div>
))}
              
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive system metrics and insights
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border ${stat.borderColor} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value.toLocaleString()}{stat.suffix || ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800">Response Time</p>
                  <p className="text-sm text-green-600">Average donor response</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-800">2.4 hrs</p>
                  <p className="text-xs text-green-600">↓ 15% from last month</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-800">User Engagement</p>
                  <p className="text-sm text-blue-600">Monthly active users</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-800">89%</p>
                  <p className="text-xs text-blue-600">↑ 8% from last month</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <p className="font-medium text-purple-800">Verification Rate</p>
                  <p className="text-sm text-purple-600">Users with verified profiles</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-800">76%</p>
                  <p className="text-xs text-purple-600">↑ 12% from last month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { district: 'Dhaka', users: 245, percentage: 35 },
                { district: 'Chittagong', users: 128, percentage: 18 },
                { district: 'Sylhet', users: 89, percentage: 13 },
                { district: 'Khulna', users: 76, percentage: 11 },
                { district: 'Rajshahi', users: 65, percentage: 9 },
                { district: 'Others', users: 97, percentage: 14 }
              ].map((location, index) => (
                <div key={location.district} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                      backgroundColor: `hsl(${200 + index * 30}, 70%, 50%)`
                    }}></div>
                    <span className="font-medium">{location.district}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{location.users}</p>
                    <p className="text-xs text-gray-500">{location.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blood Group Distribution</CardTitle>
          <CardDescription>
            Distribution of registered donors by blood group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {[
              { group: 'O+', count: 156, color: 'bg-red-500' },
              { group: 'A+', count: 134, color: 'bg-blue-500' },
              { group: 'B+', count: 98, color: 'bg-green-500' },
              { group: 'AB+', count: 67, color: 'bg-purple-500' },
              { group: 'O-', count: 45, color: 'bg-orange-500' },
              { group: 'A-', count: 34, color: 'bg-teal-500' },
              { group: 'B-', count: 23, color: 'bg-pink-500' },
              { group: 'AB-', count: 12, color: 'bg-indigo-500' }
            ].map((blood) => (
              <motion.div
                key={blood.group}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-3 rounded-lg border bg-gray-50 hover:shadow-md transition-shadow"
              >
                <div className={`w-8 h-8 rounded-full ${blood.color} mx-auto mb-2`}></div>
                <p className="font-bold text-lg">{blood.group}</p>
                <p className="text-sm text-gray-600">{blood.count} donors</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}