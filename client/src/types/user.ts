// client/src/types/user.ts
export interface User {
  id: number;
  donorId: string; // Format: MEDON-YYYY-XXXX
  username: string;
  email: string;
  phone: string;
  fullName: string;
  bloodGroup: string;
  district: string;
  isVerified: boolean;
  isAvailable: boolean;
  isAdmin: boolean;
  donationCount: number;
  rating: number;
  createdAt: string;
  lastDonationDate?: string | null; // ISO date string
  status: 'Available' | 'Unavailable' | 'Eligible' | 'Not Eligible';
}