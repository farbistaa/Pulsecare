import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GeneralSettings() {
  const [accountInfo, setAccountInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en-US',
    timezone: 'America/New_York',
  });

  const handleAccountChange = (field: string, value: string) => {
    setAccountInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (type: string) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type as keyof typeof notifications] }));
  };

  const handlePreferenceChange = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Account Settings Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="name"
                value={accountInfo.name}
                onChange={(e) => handleAccountChange('name', e.target.value)}
                className="mt-1"
              />
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                value={accountInfo.email}
                onChange={(e) => handleAccountChange('email', e.target.value)}
                className="mt-1"
              />
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center gap-2">
              <Input
                id="phone"
                value={accountInfo.phone}
                onChange={(e) => handleAccountChange('phone', e.target.value)}
                className="mt-1"
              />
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="email-notifications"
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive updates via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="sms-notifications"
                checked={notifications.sms}
                onChange={() => handleNotificationChange('sms')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive push notifications on mobile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="push-notifications"
                checked={notifications.push}
                onChange={() => handleNotificationChange('push')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Language Settings Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Language & Region</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                <SelectItem value="fr-FR">French (France)</SelectItem>
                <SelectItem value="de-DE">German (Germany)</SelectItem>
                <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="timezone">Time Zone</Label>
            <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">(GMT-05:00) Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">(GMT-06:00) Central Time</SelectItem>
                <SelectItem value="America/Denver">(GMT-07:00) Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">(GMT-08:00) Pacific Time</SelectItem>
                <SelectItem value="Europe/London">(GMT+00:00) London</SelectItem>
                <SelectItem value="Europe/Paris">(GMT+01:00) Paris</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  );
}