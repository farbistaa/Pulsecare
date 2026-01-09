import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-8">
      {/* Header */}
      

      {/* Coming Soon */}
      <Card className="text-center py-16">
        <CardContent>
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <CardTitle className="mb-2">System Settings Module</CardTitle>
          <CardDescription className="mb-4">
            Comprehensive settings for notifications, templates, user roles, and security configurations.
          </CardDescription>
          <div className="text-sm text-gray-500">
            Implementation in progress...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}