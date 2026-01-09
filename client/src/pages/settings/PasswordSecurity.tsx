import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TwoFactorAuth from '@/components/TwoFactorAuth';

export default function PasswordSecurity() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactor, setTwoFactor] = useState({
    app: true,
    sms: false,
  });

  const [loginHistory, setLoginHistory] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'New York, NY', time: 'Today at 2:30 PM', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'New York, NY', time: 'Yesterday at 8:15 PM', current: false },
    { id: 3, device: 'Firefox on Mac', location: 'Boston, MA', time: '3 days ago', current: false },
  ]);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTwoFactorToggle = (type: string) => {
    setTwoFactor(prev => ({ ...prev, [type]: !prev[type as keyof typeof twoFactor] }));
  };

  const removeSession = (id: number) => {
    setLoginHistory(prev => prev.filter(session => session.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Password Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">Last changed 3 months ago</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Update Password</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Section - Integrated from Security Page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 rounded-lg p-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600">
            Manage your account security and enable additional protection measures
          </p>
        </div>
        <TwoFactorAuth />
      </motion.div>

      {/* Login History Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Login History</h3>
        <div className="space-y-3">
          {loginHistory.map((session) => (
            <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">{session.device}</p>
                <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
              </div>
              <div className="flex items-center gap-2">
                {session.current && (
                  <span className="text-xs text-green-600 font-medium">Current session</span>
                )}
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSession(session.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Checkup */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Security Checkup</h3>
        <p className="text-sm text-blue-700 mb-4">Review your security settings to keep your account safe</p>
        <Button className="bg-blue-600 hover:bg-blue-700">Run Security Checkup</Button>
      </div>
    </div>
  );
}