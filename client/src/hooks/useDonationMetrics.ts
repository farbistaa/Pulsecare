// client/src/hooks/useDonationMetrics.ts
import { useQuery } from '@tanstack/react-query';

interface DonationMetrics {
  totalDonations: number;
  monthlyDonations: Array<{ month: string; count: number }>;
  multiYearTrends: Array<{ year: string; count: number }>;
  requestStatus: Array<{ status: string; count: number }>;
}

export const useDonationMetrics = (timeRange: string) => {
  return useQuery<DonationMetrics>({
    queryKey: ['/api/admin/donation-metrics', timeRange],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 30000,
  });
};