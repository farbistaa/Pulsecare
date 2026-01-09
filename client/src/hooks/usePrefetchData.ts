// client/src/hooks/usePrefetchData.ts
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchBasicStats = useCallback((timeRange: string) => {
    queryClient.prefetchQuery({
      queryKey: ['/api/admin/basic-stats', timeRange],
      queryFn: () => fetch('/api/admin/basic-stats').then(res => res.json()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  const prefetchDonorMetrics = useCallback((timeRange: string) => {
    queryClient.prefetchQuery({
      queryKey: ['/api/admin/donor-metrics', timeRange],
      queryFn: () => fetch('/api/admin/donor-metrics').then(res => res.json()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  const prefetchDonationMetrics = useCallback((timeRange: string) => {
    queryClient.prefetchQuery({
      queryKey: ['/api/admin/donation-metrics', timeRange],
      queryFn: () => fetch('/api/admin/donation-metrics').then(res => res.json()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  const prefetchEmergencyMetrics = useCallback((timeRange: string) => {
    queryClient.prefetchQuery({
      queryKey: ['/api/admin/emergency-metrics', timeRange],
      queryFn: () => fetch('/api/admin/emergency-metrics').then(res => res.json()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  const prefetchAllData = useCallback((timeRange: string) => {
    prefetchBasicStats(timeRange);
    prefetchDonorMetrics(timeRange);
    prefetchDonationMetrics(timeRange);
    prefetchEmergencyMetrics(timeRange);
  }, [prefetchBasicStats, prefetchDonorMetrics, prefetchDonationMetrics, prefetchEmergencyMetrics]);

  return {
    prefetchBasicStats,
    prefetchDonorMetrics,
    prefetchDonationMetrics,
    prefetchEmergencyMetrics,
    prefetchAllData
  };
};