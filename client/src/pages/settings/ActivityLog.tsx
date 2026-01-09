import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ActivityLog() {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');

  const activities = [
    { id: 1, type: 'security', action: 'Password Changed', description: 'Your account password was updated', time: '2023-11-15 14:30', device: 'Chrome on Windows', location: 'New York, NY' },
    { id: 2, type: 'profile', action: 'Profile Updated', description: 'Your profile information was modified', time: '2023-11-14 09:15', device: 'Safari on iPhone', location: 'New York, NY' },
    { id: 3, type: 'security', action: 'Login from New Device', description: 'Logged in from Chrome on Windows', time: '2023-11-13 16:45', device: 'Chrome on Windows', location: 'Boston, MA' },
    { id: 4, type: 'donation', action: 'Donation Scheduled', description: 'Blood donation appointment scheduled', time: '2023-11-12 11:20', device: 'Firefox on Mac', location: 'New York, NY' },
    { id: 5, type: 'privacy', action: 'Privacy Settings Updated', description: 'Your privacy preferences were changed', time: '2023-11-10 13:10', device: 'Chrome on Windows', location: 'New York, NY' },
    { id: 6, type: 'security', action: 'Two-Factor Enabled', description: 'Two-factor authentication was enabled', time: '2023-11-08 10:30', device: 'Safari on iPhone', location: 'New York, NY' },
    { id: 7, type: 'donation', action: 'Donation Completed', description: 'Blood donation successfully completed', time: '2023-11-05 15:45', device: 'Chrome on Windows', location: 'New York, NY' },
    { id: 8, type: 'profile', action: 'Email Changed', description: 'Your email address was updated', time: '2023-11-01 12:20', device: 'Firefox on Mac', location: 'Boston, MA' },
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return '🔒';
      case 'profile': return '👤';
      case 'donation': return '🩸';
      case 'privacy': return '🔐';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'text-blue-600 bg-blue-100';
      case 'profile': return 'text-green-600 bg-green-100';
      case 'donation': return 'text-red-600 bg-red-100';
      case 'privacy': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Filters */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Activity</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Activity Type</label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="mt-1 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="donation">Donations</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="mt-1 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                      <span className="mr-1">{getTypeIcon(activity.type)}</span>
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{activity.action}</TableCell>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.time}</TableCell>
                  <TableCell>{activity.device}</TableCell>
                  <TableCell>{activity.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Activity Log</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Download your complete activity history in various formats</p>
          <div className="flex gap-2">
            <Button variant="outline">Export as CSV</Button>
            <Button variant="outline">Export as PDF</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Export All Data</Button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Security Notice</h3>
        <p className="text-sm text-blue-700 mb-4">
          We log all account activity to help protect your account. If you see any suspicious activity, 
          please contact our support team immediately.
        </p>
        <Button variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100">
          Report Suspicious Activity
        </Button>
      </div>
    </div>
  );
}