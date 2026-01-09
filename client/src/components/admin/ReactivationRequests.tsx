import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export default function ReactivationRequests() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
      </div>

      {/* Coming Soon */}
      <Card className="text-center py-16">
        <CardContent>
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <CardTitle className="mb-2">Reactivation Management</CardTitle>
          <CardDescription className="mb-4">
            Review and process account reactivation requests with approval workflows and status tracking.
          </CardDescription>
          <div className="text-sm text-gray-500">
            Implementation in progress...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}