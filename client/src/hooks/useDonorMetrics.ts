// client/src/hooks/useDonorMetrics.ts
import { useQuery } from '@tanstack/react-query';

interface DonorMetrics {
  totalDonors: number;
  activeDonors: number;
  donorsByBloodGroup: Array<{ name: string; count: number; percentage: number }>;
  donorsByGender: Array<{ gender: string; count: number }>;
  donorsByAge: Array<{ ageGroup: string; count: number }>;
  eligibleVsNot: Array<{ eligible: string; count: number; fill: string }>;
  recentRegistrations: Array<{ week: string; newRegistrations: number; activeDonations: number }>;
  populationPyramid: Array<{ ageGroup: string; male: number; female: number }>;
  donorLocation: Array<{ district: string; donors: number; requests: number }>;
  responseTime: Array<{ range: string; time: number; variability: number; min: number; max: number }>;
  ratingTrends: Array<{ category: string; q1: number; q2: number; q3: number; q4: number }>;
  fraudReports: Array<{ date: string; count: number }>;
}

export const useDonorMetrics = (timeRange: string) => {
  return useQuery<DonorMetrics>({
    queryKey: ['/api/admin/donor-metrics', timeRange],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 30000,
  });
};