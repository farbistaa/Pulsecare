import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  AlertTriangle, 
  Heart, 
  Clock, 
  MapPin, 
  Phone, 
  Hospital,
  CheckCircle,
  X,
  Navigation,
  Siren
} from 'lucide-react';

interface EmergencyAlert {
  id: number;
  patientName: string;
  bloodGroup: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  unitsRequired: number;
  hospitalName: string;
  hospitalAddress: string;
  contactPhone: string;
  distance: number;
  matchScore: number;
  requestedAt: string;
  expiresAt: string;
  description: string;
  requesterLocation: {
    district: string;
    upazila: string;
    coordinates: [number, number];
  };
}

export default function EmergencyAlertsManager() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch emergency alerts
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/emergency-alerts'],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isAuthenticated && user?.isAvailable,
  });

  // Play sound for new alerts
  useEffect(() => {
    if (alerts.length > 0 && soundEnabled) {
      // Play alert sound (in production, add actual audio file)
      console.log('🚨 New emergency blood request alert!');
    }
  }, [alerts.length, soundEnabled]);

  // Respond to alert mutation
  const respondToAlertMutation = useMutation({
    mutationFn: async ({ alertId, response }: { alertId: number; response: 'accept' | 'decline' }) => {
      return await apiRequest(`/api/emergency-alerts/${alertId}/respond`, {
        method: 'POST',
        body: { response },
      });
    },
    onSuccess: (data, { response, alertId }) => {
      toast({
        title: response === 'accept' ? "Alert Accepted" : "Alert Declined",
        description: response === 'accept' 
          ? "Hospital will be notified of your response. Please proceed to the location."
          : "Thank you for your quick response.",
        variant: response === 'accept' ? 'default' : 'destructive',
      });
      
      // Refresh alerts
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-alerts'] });
    },
    onError: () => {
      toast({
        title: "Failed to respond",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Siren className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString();
  };

  const openInMaps = (address: string, coordinates?: [number, number]) => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (coordinates && isMobile) {
      // Use GPS coordinates for mobile maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}`);
    } else {
      // Use address for web maps
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`);
    }
  };

  if (!isAuthenticated || !user?.isAvailable) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Emergency Alerts Unavailable</h3>
          <p className="text-gray-600 text-sm">
            {!isAuthenticated 
              ? "Please log in to receive emergency blood request alerts."
              : "Set your availability status to 'Available' to receive emergency alerts."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1" />
                <div className="h-8 bg-gray-200 rounded flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <Siren className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Emergency Alerts</h2>
            <p className="text-sm text-gray-600">
              {alerts.length > 0 
                ? `${alerts.length} urgent blood request${alerts.length > 1 ? 's' : ''} near you`
                : 'No emergency alerts at this time'
              }
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </Button>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Emergency Alerts</h3>
            <p className="text-gray-600">
              You'll be notified here when there are urgent blood requests matching your blood group 
              and location. Thank you for being available to help!
            </p>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert: EmergencyAlert) => (
          <Card key={alert.id} className="border-l-4 border-l-red-500 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    {getUrgencyIcon(alert.urgency)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Emergency Blood Request
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getUrgencyColor(alert.urgency)} font-medium`}>
                        {alert.urgency.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {alert.bloodGroup}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.unitsRequired} unit{alert.unitsRequired > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(alert.requestedAt)}
                  </div>
                  <div className="text-xs mt-1">
                    Match: {alert.matchScore}%
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Patient Information</h4>
                <p className="text-sm text-gray-700">{alert.description}</p>
              </div>

              {/* Hospital Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{alert.hospitalName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">{alert.hospitalAddress}</p>
                      <button
                        onClick={() => openInMaps(alert.hospitalAddress, alert.requesterLocation.coordinates)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                      >
                        <Navigation className="w-3 h-3" />
                        Get Directions ({alert.distance.toFixed(1)} km away)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <a href={`tel:${alert.contactPhone}`} className="font-medium text-green-700 hover:text-green-800">
                      {alert.contactPhone}
                    </a>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Request expires: {new Date(alert.expiresAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => respondToAlertMutation.mutate({ alertId: alert.id, response: 'accept' })}
                  disabled={respondToAlertMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept & Help
                </Button>
                <Button
                  variant="outline"
                  onClick={() => respondToAlertMutation.mutate({ alertId: alert.id, response: 'decline' })}
                  disabled={respondToAlertMutation.isPending}
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Can't Help Now
                </Button>
              </div>

              {/* Compliance Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
                <strong>Privacy Notice:</strong> Your response is logged for emergency tracking and compliance. 
                If you accept, your contact details will be shared with the hospital for coordination.
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}