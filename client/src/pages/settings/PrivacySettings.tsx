import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState('everyone');
  const [contactInfo, setContactInfo] = useState(false);
  const [dataSharing, setDataSharing] = useState({
    bloodBanks: true,
    analytics: true,
    research: false,
  });

  const handleProfileVisibilityChange = (value: string) => {
    setProfileVisibility(value);
  };

  const handleContactInfoToggle = () => {
    setContactInfo(!contactInfo);
  };

  const handleDataSharingToggle = (type: string) => {
    setDataSharing(prev => ({ ...prev, [type]: !prev[type as keyof typeof dataSharing] }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Visibility Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="profile-visibility">Who can see your profile?</Label>
            <Select value={profileVisibility} onValueChange={handleProfileVisibilityChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="donors">Only Donors</SelectItem>
                <SelectItem value="blood-banks">Only Blood Banks</SelectItem>
                <SelectItem value="me">Only Me</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="contact-info">Show contact information</Label>
              <p className="text-sm text-gray-500">Allow others to see your email and phone number</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="contact-info"
                checked={contactInfo}
                onChange={handleContactInfoToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Sharing Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sharing Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="blood-banks">Share with Blood Banks</Label>
              <p className="text-sm text-gray-500">Allow blood banks to access your donation history</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="blood-banks"
                checked={dataSharing.bloodBanks}
                onChange={() => handleDataSharingToggle('bloodBanks')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics">Help Improve PulseCare</Label>
              <p className="text-sm text-gray-500">Share anonymous usage data to improve our services</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="analytics"
                checked={dataSharing.analytics}
                onChange={() => handleDataSharingToggle('analytics')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="research">Medical Research</Label>
              <p className="text-sm text-gray-500">Share anonymized data for medical research</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="research"
                checked={dataSharing.research}
                onChange={() => handleDataSharingToggle('research')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Download Your Data</h4>
              <p className="text-sm text-gray-500">Get a copy of all your data</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Download</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Download Your Data</DialogTitle>
                  <DialogDescription>
                    Choose what data you want to download
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Profile Information</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Donation History</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Activity Log</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Messages</span>
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Download Data</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data.
                  </DialogDescription>
                </DialogHeader>
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    Warning: Deleting your account will remove all your donation history, personal information, and activity logs. This action is irreversible.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
                    <Input id="confirm-delete" placeholder="DELETE" className="mt-1" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}