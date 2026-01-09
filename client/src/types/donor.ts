// client/src/types/donor.ts
export interface DonorData {
  id: string;
  name: string;
  bloodType: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string | null;
  coverImage: string | null;
  lastDonation: string;
  totalDonations: number;
  nextEligibleDate: string;
  available: boolean;
  bio: string;
  personalInfo: {
    age: number;
    gender: string;
    weight: string;
    height: string;
  };
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    year: string;
  }>;
  work: Array<{
    id: string;
    position: string;
    company: string;
    duration: string;
  }>;
  donationHistory: Array<{
    id: string;
    date: string;
    location: string;
    bloodType: string;
    volume: string;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    content: string;
    avatar: string;
    rating: number;
  }>;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    github?: string;
    portfolio?: string;
  };
}
