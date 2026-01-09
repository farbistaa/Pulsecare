// client/src/hooks/useBasicStats.ts
import { useQuery } from '@tanstack/react-query';

interface BasicStatsResponse {
  totalDonors: number;
  availableDonors: number;
  totalDonations: number;
  bloodRequests: number;
  pendingRequests: number;
  criticalAlerts: number;
  duplicateAlerts: number;
  readyToDonate: number;
  stats: DashboardStats;
}

interface DashboardStats {
  totalDonors: number;
  availableDonors: number;
  totalDonations: number;
  emergencyRequests: number;
  pendingVerifications: number;
  criticalAlerts: number;
  duplicateAlerts: number;
  readyToDonate: number;
}

export const useBasicStats = (timeRange: string) => {
  return useQuery<BasicStatsResponse>({
    queryKey: ['/api/admin/basic-stats', timeRange],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 30000,
  });
};