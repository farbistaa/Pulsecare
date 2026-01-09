import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatedonorId(userId: number): string {
  const year = new Date().getFullYear();
  const id = String(userId).padStart(4, '0');
  return `PULSECARE-${year}-${id}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function calculateDaysSinceLastDonation(lastDonation: string | null): number {
  if (!lastDonation) return 365; // If no last donation, assume eligible
  const lastDate = new Date(lastDonation);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isEligibleToDonate(lastDonation: string | null): boolean {
  const daysSince = calculateDaysSinceLastDonation(lastDonation);
  return daysSince >= 120; // 120 days minimum between donations
}

export function formatRating(rating: number): string {
  return (rating / 10).toFixed(1); // Convert from 50 to 5.0 format
}

export function bloodGroupCompatibility(requested: string, donor: string): boolean {
  const compatibility: Record<string, string[]> = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  };
  
  return compatibility[requested]?.includes(donor) || false;
}
