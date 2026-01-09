// client/src/hooks/useEmergencyMetrics.ts
import { useQuery } from '@tanstack/react-query';

interface EmergencyMetrics {
  totalRequests: number;
  pendingRequests: number;
  criticalAlerts: number;
  emergencyVsGeneral: Array<{ month: string; emergency: number; general: number }>;
  requestsByDistrict: Array<{ district: string; count: number }>;
  timeSensitive: Array<{ time: string; count: number }>;
  requestsByRadius: Array<{ radius: string; count: number }>;
  utilizationRate: number;
  criticalLevels: Array<{ bloodGroup: string; units: number; criticalThreshold: number }>;
}

export const useEmergencyMetrics = (timeRange: string) => {
  return useQuery<EmergencyMetrics>({
    queryKey: ['/api/admin/emergency-metrics', timeRange],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 30000,
  });
};