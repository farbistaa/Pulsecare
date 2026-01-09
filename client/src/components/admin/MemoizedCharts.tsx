// client/src/components/admin/MemoizedCharts.tsx
import React, { memo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Droplet, Users, AlertTriangle, UserCheck, TrendingUp, Clock, MapPin, Activity, Star, Shield } from 'lucide-react';

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

interface ChartProps {
  data: any[];
  exportChart: (id: string, format: 'png' | 'pdf' | 'csv') => void;
  exportFormat: 'png' | 'pdf' | 'csv';
  isDarkMode: boolean;
}

// Blood Group Distribution Chart
export const BloodGroupChart = memo(({ data, exportChart, exportFormat, isDarkMode }: ChartProps) => (
  <Card style={{ backgroundColor: isDarkMode ? COLORS.cardBgDark : COLORS.cardBg }} className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <Droplet className="w-5 h-5" style={{ color: COLORS.accent1 }} />
          <span>Blood Group Distribution</span>
        </CardTitle>
        <CardDescription>Distribution of donors by blood type</CardDescription>
      </div>
      <div className="flex space-x-2">
        <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => exportFormat = value}>
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
    <CardContent>
      <div id="blood-group-chart" className="w-full h-full">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
              label={({ name, count, percentage }) => `${name}: ${count} (${percentage}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

// Users Growth Chart
export const UsersGrowthChart = memo(({ data, exportChart, exportFormat, isDarkMode }: ChartProps) => (
  <Card style={{ backgroundColor: isDarkMode ? COLORS.cardBgDark : COLORS.cardBg }} className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" style={{ color: COLORS.primary }} />
          <span>Registered Users Growth Over Time</span>
        </CardTitle>
        <CardDescription>Line chart with gradient showing trends by month/quarter</CardDescription>
      </div>
      <div className="flex space-x-2">
        <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => exportFormat = value}>
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
    <CardContent>
      <div id="users-growth-chart" className="w-full h-full">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorNewRegistrations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorActiveDonations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.accent3} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.accent3} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="newRegistrations" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorNewRegistrations)" />
            <Area type="monotone" dataKey="activeDonations" stroke={COLORS.accent3} fillOpacity={1} fill="url(#colorActiveDonations)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

// Eligible vs. Not Eligible Donors Chart
export const EligibleChart = memo(({ data, exportChart, exportFormat, isDarkMode }: ChartProps) => (
  <Card style={{ backgroundColor: isDarkMode ? COLORS.cardBgDark : COLORS.cardBg }} className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5" style={{ color: COLORS.accent2 }} />
          <span>Eligible vs. Not Eligible Donors</span>
        </CardTitle>
        <CardDescription>Polar area chart for visually striking categorical proportions</CardDescription>
      </div>
      <div className="flex space-x-2">
        <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => exportFormat = value}>
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
          onClick={() => exportChart('eligible-chart', exportFormat)}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div id="eligible-chart" className="w-full h-full">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="eligible" />
            <PolarRadiusAxis angle={30} domain={[0, 1500]} />
            <Radar name="Eligible" dataKey="count" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

// Monthly Donations Chart
export const MonthlyDonationsChart = memo(({ data, exportChart, exportFormat, isDarkMode }: ChartProps) => (
  <Card style={{ backgroundColor: isDarkMode ? COLORS.cardBgDark : COLORS.cardBg }} className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <Droplet className="w-5 h-5" style={{ color: COLORS.accent1 }} />
          <span>Monthly Donations</span>
        </CardTitle>
        <CardDescription>Line chart with ECG style showing 12 months of data</CardDescription>
      </div>
      <div className="flex space-x-2">
        <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => exportFormat = value}>
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
    <CardContent>
      <div id="monthly-donations-chart" className="w-full h-full">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke={COLORS.primary} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

// Request Status Chart
export const RequestStatusChart = memo(({ data, exportChart, exportFormat, isDarkMode }: ChartProps) => (
  <Card style={{ backgroundColor: isDarkMode ? COLORS.cardBgDark : COLORS.cardBg }} className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" style={{ color: COLORS.accent2 }} />
          <span>Request Status Comparison</span>
        </CardTitle>
        <CardDescription>Line chart showing status trends over time</CardDescription>
      </div>
      <div className="flex space-x-2">
        <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => exportFormat = value}>
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
    <CardContent>
      <div id="request-status-chart" className="w-full h-full">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

// Emergency vs General Requests Chart
export const EmergencyVsGeneralChart = memo(({ data, exportChart, exportFormat, isDarkMode }: ChartProps) => (
  <Card style={{ backgroundColor: isDarkMode ? COLORS.cardBgDark : COLORS.cardBg }} className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" style={{ color: COLORS.accent1 }} />
          <span>Emergency vs. General Requests</span>
        </CardTitle>
        <CardDescription>Combine absolute counts and trend line</CardDescription>
      </div>
      <div className="flex space-x-2">
        <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => exportFormat = value}>
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
    <CardContent>
      <div id="emergency-vs-general-chart" className="w-full h-full">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="emergency" fill={COLORS.accent1} name="Emergency Requests" />
            <Bar dataKey="general" fill={COLORS.primary} name="General Requests" />
            <Line type="monotone" dataKey="emergency" stroke={COLORS.accent1} strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

// Time-Sensitive Activity Chart
export const TimeSensitiveChart = memo(({ data, exportChart, exportFormat, isDarkMode }: ChartProps) => (
  <Card style={{ backgroundColor: isDarkMode ? COLORS.cardBgDark : COLORS.cardBg }} className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" style={{ color: COLORS.accent2 }} />
          <span>Time-Sensitive Activity</span>
        </CardTitle>
        <CardDescription>Time scale for monitoring peak demand periods</CardDescription>
      </div>
      <div className="flex space-x-2">
        <Select value={exportFormat} onValueChange={(value: 'png' | 'pdf' | 'csv') => exportFormat = value}>
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
    <CardContent>
      <div id="time-sensitive-chart" className="w-full h-full">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

// System Health Chart
export const SystemHealthChart = memo(({ data, isDarkMode }: { data: any, isDarkMode: boolean }) => (
  <Card className="shadow-md" style={{ backgroundColor: isDarkMode ? COLORS.cardBgDark : COLORS.cardBg }}>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Activity className="w-5 h-5" style={{ color: COLORS.primary }} />
        <span>System Health</span>
      </CardTitle>
      <CardDescription>Real-time system metrics</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: isDarkMode ? COLORS.mutedDark : COLORS.muted }}>
              Utilization Rate
            </span>
            <span className="text-sm font-semibold">
              {data.utilizationRate || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${data.utilizationRate || 0}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: isDarkMode ? COLORS.mutedDark : COLORS.muted }}>
              Response Rate
            </span>
            <span className="text-sm font-semibold">94%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: '94%' }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: isDarkMode ? COLORS.mutedDark : COLORS.muted }}>
              System Uptime
            </span>
            <span className="text-sm font-semibold">99.8%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: '99.8%' }}
            ></div>
          </div>
        </div>
        <div className="pt-4 border-t" style={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}>
          <div className="flex items-center space-x-2" style={{ color: COLORS.accent3 }}>
            <Shield className="w-4" />
            <span className="text-sm font-medium">All systems operational</span>
          </div>
          <p className="text-xs mt-1" style={{ color: isDarkMode ? COLORS.mutedDark : COLORS.muted }}>
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
));