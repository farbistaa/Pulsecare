import { useParams } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DonorData } from "../types/donor"; 
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Heart, 
  Edit, 
  Share2, 
  Settings,
  User,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  Upload,
  Shield,
  ShieldCheck,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Globe,
  Save,
  X,
  Plus,
  Trash2,
  Droplet,
  Star,
  Users,
  TrendingUp,
  Award as AwardIcon,
  ChevronRight,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  FileText,
  Github,
  Link as LinkIcon,
  AlertCircle,
  Stethoscope,
  Syringe,
  FileText as FileMedicalIcon,
  Pill,
  AlertTriangle,
  FileText as FileNotes,
  Cigarette,
  Pill as DrugIcon,
  Beer,
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define the ProfilePageProps interface
interface ProfilePageProps {
  donorData?: DonorData;
  onUpdateProfile?: (data: any) => void;
  onToggleAvailability?: (available: boolean) => void;
  onProfileImageUpload?: (file: File) => void;
  onCoverImageUpload?: (file: File) => void;
  isOwnProfile?: boolean;
}

// Helper function for date comparison (handles timezone correctly)
const isNotFutureDate = (date: string) => {
  if (!date) return false;
  const selectedDate = new Date(date + "T00:00:00"); // local midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset time to midnight
  return selectedDate <= today;
};

// Education Schema - Fixed to match backend schema
export const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution Name is required"),
  startYear: z
    .string()
    .min(1, "This information is required")
    .refine(isNotFutureDate, {
      message: "Start year cannot be in the future",
    }),
  endYear: z.string().optional(),
  type: z.string().min(1, "Education level is required"),
  description: z.string().optional(),
}).refine(
  (data) => {
    if (!data.endYear) return true;
    const start = new Date(data.startYear + "T00:00:00");
    const end = new Date(data.endYear + "T00:00:00");
    return end >= start;
  },
  {
    message: "End year cannot be before start year",
    path: ["endYear"],
  }
);

// Work Schema - Fixed to match backend schema
export const workSchema = z.object({
  position: z.string().min(1, "Position is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z
    .string()
    .min(1, "This information is required")
    .refine(isNotFutureDate, {
      message: "Start date cannot be in the future",
    }),
  endDate: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  current: z.boolean().default(false),
}).refine(
  (data) => {
    if (!data.endDate || data.current) return true;
    const start = new Date(data.startDate + "T00:00:00");
    const end = new Date(data.endDate + "T00:00:00");
    return end >= start;
  },
  {
    message: "End date cannot be before start date",
    path: ["endDate"],
  }
);

// Donation Schema - Fixed to match backend schema
export const donationSchema = z.object({
  date: z
    .string()
    .min(1, "This information is required")
    .refine(isNotFutureDate, {
      message: "Donation date cannot be in the future",
    }),
  hospital: z.string().min(1, "Hospital is required"),
  location: z.string().min(1, "Location is required"),
  donationType: z.string().min(1, "Donation type is required"),
});

const medicalHistorySchema = z.object({
  healthStatus: z.enum(["healthy", "minor-conditions", "major-conditions"]),
  bloodPressureSystolic: z.string().optional(),
  bloodPressureDiastolic: z.string().optional(),
  chronicConditions: z.string().optional(),
  vaccinationType: z.string().optional(),
  vaccinationDate: z.string().optional(),
  smoking: z.enum(["never", "former", "occasional", "regular"]).optional(),
  alcohol: z.enum(["never", "occasional", "regular"]).optional(),
  drugUse: z.enum(["never", "past", "current"]).optional(),
  conditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
});

// Type for medical history form
type MedicalHistoryFormValues = z.infer<typeof medicalHistorySchema>;

// Education levels for dropdown - Fixed to match backend schema
const educationLevels = [
  "High School",
  "GED",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Certificate",
  "Technical/Vocational Training",
  "Other"
];

// Institution types for dropdown - Fixed to match backend schema
const institutionTypes = [
  "Public",
  "Private",
  "Others"
];

// Function to format date for input fields
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Function to get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

function ProfilePage({ 
  donorData: propDonorData, 
  onUpdateProfile: propOnUpdateProfile,
  onToggleAvailability: propOnToggleAvailability,
  onProfileImageUpload: propOnProfileImageUpload,
  onCoverImageUpload: propOnCoverImageUpload,
  isOwnProfile: propIsOwnProfile
}: ProfilePageProps = {}) {
  const { user } = useAuth();
  const params = useParams<{ id?: string }>();
  const { toast: uiToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [isHoveringProfilePic, setIsHoveringProfilePic] = useState(false);
  const [isHoveringCoverPic, setIsHoveringCoverPic] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    education: true,
    work: true,
    donationHistory: true,
    medicalHistory: true,
    testimonials: true,
    social: true,
    bio: true,
  });
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [isAddingDonation, setIsAddingDonation] = useState(false);
  const [isEditingMedicalHistory, setIsEditingMedicalHistory] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [editingDonationId, setEditingDonationId] = useState<string | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [testimonialContent, setTestimonialContent] = useState("");
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);
  
  // State for managing data
  const [profileData, setProfileData] = useState<any>(null);
  const [educationData, setEducationData] = useState<any[]>([]);
  const [workData, setWorkData] = useState<any[]>([]);
  const [donationHistoryData, setDonationHistoryData] = useState<any[]>([]);
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const [medicalHistoryData, setMedicalHistoryData] = useState<any>(null);
  
  // Loading and error states
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEducationLoading, setIsEducationLoading] = useState(false);
  const [isWorkLoading, setIsWorkLoading] = useState(false);
  const [isDonationLoading, setIsDonationLoading] = useState(false);
  const [isTestimonialsLoading, setIsTestimonialsLoading] = useState(false);
  const [isMedicalHistoryLoading, setIsMedicalHistoryLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [editForm, setEditForm] = useState({
    fullName: "",
    bio: "",
    email: "",
    phone: "",
    bloodGroup: "",
    age: "",
    gender: "",
    weight: "",
    hemoglobin: "",
    district: "",
    upazila: "",
    isAvailable: true,
    twoFactorEnabled: false,
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    website: "",
    medicalConditions: "",
    allergies: "",
    medications: "",
    lastHealthCheckup: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    chronicConditions: "",
    vaccinationType: "",
    vaccinationDate: "",
    smoking: "",
    alcohol: "",
    drugUse: ""
  });
  
  // Initialize medical history form with proper types
  const [medicalHistoryForm, setMedicalHistoryForm] = useState<MedicalHistoryFormValues>({
    healthStatus: "healthy",
    allergies: "",
    medications: "",
    conditions: "",
    notes: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    chronicConditions: "",
    vaccinationType: "",
    vaccinationDate: "",
    smoking: undefined,
    alcohol: undefined,
    drugUse: undefined
  });
  
  const educationForm = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: "",
      institution: "",
      startYear: "",
      endYear: "",
      type: "",
      description: "",
    },
  });

  const workForm = useForm<z.infer<typeof workSchema>>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      position: "",
      company: "",
      startDate: "",
      endDate: "",
      location: "",
      description: "",
      current: false,
    },
  });

  const donationForm = useForm<z.infer<typeof donationSchema>>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      date: "",
      hospital: "",
      location: "",
      donationType: "Whole Blood",
    },
  });

  // Fix the medical history form with proper typing
  const medicalHistoryFormValidation = useForm<MedicalHistoryFormValues>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: medicalHistoryForm,
  });
  
  const profileId = params.id;
  const isOwnProfile = propIsOwnProfile !== undefined ? propIsOwnProfile : (!profileId || (user && parseInt(profileId) === user.id) || false);
  const numericProfileId = profileId ? parseInt(profileId) : (user ? user.id : null);
  
  // Fetch profile data from API
  const fetchProfileData = useCallback(async () => {
    if (!numericProfileId) return;
    
    setIsProfileLoading(true);
    setProfileError(null);
    
    try {
      const response = await fetch(`/api/users/${numericProfileId}/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      
      const data = await response.json();
      setProfileData(data.user);
      
      // Update form with fetched data
      const availability = data.user.isAvailable !== undefined ? data.user.isAvailable : true;
      setIsAvailable(availability);
      
      setEditForm({
        fullName: data.user.fullName || data.user.name || "",
        bio: data.user.bio || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        bloodGroup: data.user.bloodGroup || data.user.bloodType || "",
        age: data.user.age?.toString() || "",
        gender: data.user.gender || "",
        weight: data.user.weight?.toString() || "",
        hemoglobin: data.user.hemoglobin?.toString() || "",
        district: data.user.district || "",
        upazila: data.user.upazila || "",
        isAvailable: availability,
        twoFactorEnabled: data.user.twoFactorEnabled || false,
        facebook: data.user.socialLinks?.facebook || "",
        twitter: data.user.socialLinks?.twitter || "",
        linkedin: data.user.socialLinks?.linkedin || "",
        instagram: data.user.socialLinks?.instagram || "",
        website: data.user.socialLinks?.website || "",
        medicalConditions: "",
        allergies: "",
        medications: "",
        lastHealthCheckup: "",
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        chronicConditions: "",
        vaccinationType: "",
        vaccinationDate: "",
        smoking: "",
        alcohol: "",
        drugUse: ""
      });
      
      setCoverPhotoPreview(data.user.coverPhoto || null);
      setProfilePhotoPreview(data.user.profilePicture || null);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileError('Failed to load profile data');
    } finally {
      setIsProfileLoading(false);
    }
  }, [numericProfileId]);
  
  // Fetch education data
  const fetchEducationData = useCallback(async () => {
    if (!numericProfileId) return;
    
    setIsEducationLoading(true);
    
    try {
      const response = await fetch(`/api/users/${numericProfileId}/education-history`);
      if (!response.ok) {
        throw new Error('Failed to fetch education data');
      }
      
      const data = await response.json();
      // --- SORTING LOGIC START ---
      const sortedEducation = (data || []).sort((a: any, b: any) => {
        // Prefer End Date, fallback to Start Date
        const dateA = new Date(a.endDate || a.startYear);
        const dateB = new Date(b.endDate || b.startYear);
        return dateB.getTime() - dateA.getTime();
      });
      // --- SORTING LOGIC END ---
      setEducationData(data);
    } catch (error) {
      console.error('Error fetching education data:', error);
      toast.error('Failed to load education data');
    } finally {
      setIsEducationLoading(false);
    }
  }, [numericProfileId]);
  
  // Fetch work data
  const fetchWorkData = useCallback(async () => {
  if (!numericProfileId) return;
  
  setIsWorkLoading(true);
  
  try {
    const response = await fetch(`/api/users/${numericProfileId}/work-history`);
    if (!response.ok) {
      throw new Error('Failed to fetch work data');
    }
    
    const data = await response.json();
    
    // --- SORTING LOGIC START ---
    const sortedWork = (data || []).sort((a: any, b: any) => {
      // Priority 1: If one is current, it goes first
      if (a.isCurrentJob && !b.isCurrentJob) return -1;
      if (!a.isCurrentJob && b.isCurrentJob) return 1;
      
      // Priority 2: Sort by Start Date (Descending)
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
    // --- SORTING LOGIC END ---
    
    // ✅ FIX: Save the SORTED data, not the original data
    setWorkData(sortedWork);
    
  } catch (error) {
    console.error('Error fetching work data:', error);
    toast.error('Failed to load work data');
  } finally {
    setIsWorkLoading(false);
  }
}, [numericProfileId]);
  
  // Fetch donation history data
  const fetchDonationHistoryData = useCallback(async () => {
    if (!numericProfileId) return;
    
    setIsDonationLoading(true);
    
    try {
      const response = await fetch(`/api/users/${numericProfileId}/donation-history`);
      if (!response.ok) {
        throw new Error('Failed to fetch donation history');
      }
      
      const data = await response.json();
      // --- SORTING LOGIC START ---
      const sortedDonations = (data || []).sort((a: any, b: any) => {
        const dateA = new Date(a.donationDate);
        const dateB = new Date(b.donationDate);
        return dateB.getTime() - dateA.getTime();
      });
      // --- SORTING LOGIC END ---

      setDonationHistoryData(data);
    } catch (error) {
      console.error('Error fetching donation history:', error);
      toast.error('Failed to load donation history');
    } finally {
      setIsDonationLoading(false);
    }
  }, [numericProfileId]);
  
  // Fetch testimonials data
  const fetchTestimonialsData = useCallback(async () => {
    if (!numericProfileId) return;
    
    setIsTestimonialsLoading(true);
    
    try {
      const response = await fetch(`/api/users/${numericProfileId}/testimonials`);
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      
      const data = await response.json();
      setTestimonialsData(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setIsTestimonialsLoading(false);
    }
  }, [numericProfileId]);
  
  // Fetch medical history data
const fetchMedicalHistoryData = useCallback(async () => {
  if (!numericProfileId) return;

  setIsMedicalHistoryLoading(true);

  try {
    const response = await fetch(`/api/medical-history/${numericProfileId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch medical history');
    }

    const data = await response.json();
    console.log("Fetched medical data:", data);

    // ✅ Map backend snake_case fields → frontend camelCase
    const normalized = {
      healthStatus: data.health_status,
      systolic: data.systolic,
      diastolic: data.diastolic,
      chronicConditions: data.chronic_conditions,
      vaccinations: data.vaccinations,
      allergies: data.allergies,
      currentMedications: Array.isArray(data.current_medications)
        ? data.current_medications.flat()
        : data.current_medications || [],
      smokingStatus: data.smoking_status,
      alcoholConsumption: data.alcohol_consumption,
      drugUse: data.drug_use,
      importantNotes: data.important_notes,
      lastChecked: data.last_checked,
    };

    setMedicalHistoryData(normalized);

    // ✅ Build form state
    const newMedicalHistoryForm: MedicalHistoryFormValues = {
      healthStatus: (normalized.healthStatus?.toLowerCase() as "healthy" | "minor-conditions" | "major-conditions") || "healthy",
      allergies: Array.isArray(normalized.allergies) ? normalized.allergies.join(", ") : (normalized.allergies || ""),
      medications: Array.isArray(normalized.currentMedications) ? normalized.currentMedications.join(", ") : (normalized.currentMedications || ""),
      notes: normalized.importantNotes || "",
      bloodPressureSystolic: normalized.systolic ? String(normalized.systolic) : "",
      bloodPressureDiastolic: normalized.diastolic ? String(normalized.diastolic) : "",
      chronicConditions: Array.isArray(normalized.chronicConditions) ? normalized.chronicConditions.join(", ") : (normalized.chronicConditions || ""),
      vaccinationType: Array.isArray(normalized.vaccinations) ? normalized.vaccinations.join(", ") : (normalized.vaccinations || ""),
      vaccinationDate: normalized.lastChecked ? new Date(normalized.lastChecked).toISOString().split('T')[0] : "",
      smoking: normalized.smokingStatus as "never" | "former" | "occasional" | "regular" | undefined,
      alcohol: data.alcoholConsumption as "never" | "occasional" | "regular" | undefined,
      drugUse: normalized.drugUse as "never" | "past" | "current" | undefined,
    };

    setMedicalHistoryForm(newMedicalHistoryForm);
    medicalHistoryFormValidation.reset(newMedicalHistoryForm);
  } catch (error) {
    console.error('Error fetching medical history:', error);
    toast.error('Failed to load medical history');
  } finally {
    setIsMedicalHistoryLoading(false);
  }
}, [numericProfileId, medicalHistoryFormValidation]);

  
 // Initialize data
useEffect(() => {
  fetchProfileData();
  fetchEducationData();
  fetchWorkData();
  fetchDonationHistoryData();
  fetchTestimonialsData();
  fetchMedicalHistoryData(); // Remove the conditional - always fetch medical history
}, [fetchProfileData, fetchEducationData, fetchWorkData, fetchDonationHistoryData, fetchTestimonialsData, fetchMedicalHistoryData]);
  
  // Helper functions
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev: typeof expandedSections) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleShareProfile = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${profileData?.fullName || profileData?.name}'s Profile`,
        text: `Check out ${profileData?.fullName || profileData?.name}'s blood donor profile on PulseCare`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      uiToast({
        title: "Link copied!",
        description: "Profile link has been copied to clipboard.",
      });
    }
  }, [profileData, uiToast]);

  const handleContact = useCallback(() => {
    uiToast({
      title: "Contact Feature",
      description: "Messaging feature will be available soon.",
    });
  }, [uiToast]);

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfilePhotoPreview(imageUrl);
      
      if (propOnProfileImageUpload) {
        propOnProfileImageUpload(file);
      } else if (isOwnProfile && numericProfileId) {
        // Upload to backend
        const formData = new FormData();
        formData.append('profilePhoto', file);
        
        try {
          const response = await fetch(`/api/users/${numericProfileId}/profile-photo`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload profile photo');
          }
          
          toast.success('Profile photo updated successfully');
        } catch (error) {
          console.error('Error uploading profile photo:', error);
          toast.error('Failed to upload profile photo');
        }
      }
    }
  };

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPhotoPreview(URL.createObjectURL(file));
      
      if (propOnCoverImageUpload) {
        propOnCoverImageUpload(file);
      } else if (isOwnProfile && numericProfileId) {
        // Upload to backend
        const formData = new FormData();
        formData.append('coverPhoto', file);
        
        try {
          const response = await fetch(`/api/users/${numericProfileId}/cover-photo`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload cover photo');
          }
          
          toast.success('Cover photo updated successfully');
        } catch (error) {
          console.error('Error uploading cover photo:', error);
          toast.error('Failed to upload cover photo');
        }
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!isOwnProfile || !numericProfileId) return;
    
    try {
      const response = await fetch(`/api/users/${numericProfileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          bio: editForm.bio,
          email: editForm.email,
          phone: editForm.phone,
          age: parseInt(editForm.age),
          gender: editForm.gender,
          weight: parseFloat(editForm.weight),
          hemoglobin: parseFloat(editForm.hemoglobin),
          district: editForm.district,
          upazila: editForm.upazila,
          socialLinks: {
            facebook: editForm.facebook,
            twitter: editForm.twitter,
            linkedin: editForm.linkedin,
            instagram: editForm.instagram,
            website: editForm.website
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Update local state
      setProfileData((prev: any) => ({
        ...prev,
        fullName: editForm.fullName,
        bio: editForm.bio,
        email: editForm.email,
        phone: editForm.phone,
        age: parseInt(editForm.age),
        gender: editForm.gender,
        weight: parseFloat(editForm.weight),
        hemoglobin: parseFloat(editForm.hemoglobin),
        district: editForm.district,
        upazila: editForm.upazila,
        socialLinks: {
          ...prev.socialLinks,
          facebook: editForm.facebook,
          twitter: editForm.twitter,
          linkedin: editForm.linkedin,
          instagram: editForm.instagram,
          website: editForm.website
        }
      }));
      
      uiToast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // In ProfilePage.tsx, update the handleSaveMedicalHistory function
const handleSaveMedicalHistory = async () => {
  if (!isOwnProfile) return;
  
  try {
    // Get the user's donorId
    const user = await fetch(`/api/users/${numericProfileId}`).then(res => res.json());
    const donorId = user.user.donorId;
    
    const response = await fetch('/api/medical-history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donorId: donorId,
        healthStatus: medicalHistoryForm.healthStatus,
        systolic: parseInt(medicalHistoryForm.bloodPressureSystolic || "0"),
        diastolic: parseInt(medicalHistoryForm.bloodPressureDiastolic || "0"),
        chronicConditions: medicalHistoryForm.chronicConditions ? medicalHistoryForm.chronicConditions.split(',').map(item => item.trim()) : [],
        vaccinations: medicalHistoryForm.vaccinationType ? medicalHistoryForm.vaccinationType.split(',').map(item => item.trim()) : [],
        lastChecked: medicalHistoryForm.vaccinationDate ? new Date(medicalHistoryForm.vaccinationDate) : new Date(),
        smokingStatus: medicalHistoryForm.smoking || "never",
        alcoholConsumption: medicalHistoryForm.alcohol || "never",
        drugUse: medicalHistoryForm.drugUse || "never",
        allergies: medicalHistoryForm.allergies ? medicalHistoryForm.allergies.split(',').map(item => item.trim()) : [],
        currentMedications: medicalHistoryForm.medications ? medicalHistoryForm.medications.split(',').map(item => item.trim()) : [],
        importantNotes: medicalHistoryForm.notes
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update medical history');
    }
    
    // Update local state
    setMedicalHistoryData((prev: any) => ({
      ...prev,
      healthStatus: medicalHistoryForm.healthStatus,
      systolic: parseInt(medicalHistoryForm.bloodPressureSystolic || "0"),
      diastolic: parseInt(medicalHistoryForm.bloodPressureDiastolic || "0"),
      chronicConditions: medicalHistoryForm.chronicConditions ? medicalHistoryForm.chronicConditions.split(',').map(item => item.trim()) : [],
      vaccinations: medicalHistoryForm.vaccinationType ? medicalHistoryForm.vaccinationType.split(',').map(item => item.trim()) : [],
      lastChecked: medicalHistoryForm.vaccinationDate ? new Date(medicalHistoryForm.vaccinationDate) : new Date(),
      smokingStatus: medicalHistoryForm.smoking || "never",
      alcoholConsumption: medicalHistoryForm.alcohol || "never",
      drugUse: medicalHistoryForm.drugUse || "never",
      allergies: medicalHistoryForm.allergies ? medicalHistoryForm.allergies.split(',').map(item => item.trim()) : [],
      currentMedications: medicalHistoryForm.medications ? medicalHistoryForm.medications.split(',').map(item => item.trim()) : [],
      importantNotes: medicalHistoryForm.notes
    }));
    
    uiToast({
      title: "Medical history updated",
      description: "Your medical history has been successfully updated.",
    });
    setIsEditingMedicalHistory(false);
  } catch (error) {
    console.error('Error updating medical history:', error);
    toast.error('Failed to update medical history');
  }
};

  const handleToggleAvailability = async (checked: boolean) => {
    if (!isOwnProfile) return;
    
    setIsAvailable(checked);
    
    try {
      const response = await fetch('/api/user/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: checked }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update availability');
      }
      
      // Update local state
      setProfileData((prev: any) => ({
        ...prev,
        isAvailable: checked
      }));
      
      uiToast({
        title: "Availability updated",
        description: `You are now ${checked ? "available" : "not available"} for donation.`,
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
      // Revert state on error
      setIsAvailable(!checked);
    }
  };

  // In ProfilePage.tsx, update the handleTestimonialSubmit function
const handleTestimonialSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (isOwnProfile) {
    toast.error("You cannot add a testimonial to your own profile");
    return;
  }
  
  if (!testimonialContent.trim()) {
    toast.error("Please enter a testimonial");
    return;
  }
  
  if (!numericProfileId) return;
  
  setIsSubmittingTestimonial(true);
  
  try {
    // Get the current user's donorId
   const userResponse = await fetch(`/api/users/${user?.id}`);
    const userData = await userResponse.json();
    const userDonorId = userData.user.donorId;
    
    if (!userDonorId) {
      toast.error("User not found");
      setIsSubmittingTestimonial(false);
      return;
    }
    
    // Get the recipient's donorId
    const profileResponse = await fetch(`/api/users/${numericProfileId}`);
    const profileData = await profileResponse.json();
    const recipientDonorId = profileData.user.donorId;
    
    if (!recipientDonorId) {
      toast.error("Recipient not found");
      setIsSubmittingTestimonial(false);
      return;
    }
    
    const response = await fetch('/api/testimonials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    revieweeId: recipientDonorId, // Backend expects revieweeId
    content: testimonialContent,
    rating: testimonialRating
  }),
});
    
    if (!response.ok) {
      throw new Error('Failed to submit testimonial');
    }
    
    const newTestimonial = await response.json();
    
    setTestimonialsData((prev: any[]) => [...prev, newTestimonial]);
    
    uiToast({
      title: "Testimonial submitted",
      description: "Your testimonial has been successfully submitted.",
    });
    setIsAddingTestimonial(false);
    setTestimonialContent("");
    setTestimonialRating(5);
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    toast.error('Failed to submit testimonial');
  } finally {
    setIsSubmittingTestimonial(false);
  }
};
// In ProfilePage.tsx, update the handleAddEducation function
const handleAddEducation = async (values: z.infer<typeof educationSchema>) => {
  if (!isOwnProfile || !numericProfileId) return;
  
  try {
    // Transform data to match backend schema
const transformedData = {
  institutionName: values.institution, // Backend expects institutionName
  educationLevel: values.type, // Backend expects educationLevel
  major: values.degree, // Backend expects major
  institutionType: values.type, // Backend expects institutionType
  startDate: values.startYear, // Backend expects startDate
  endDate: values.endYear, // Backend expects endDate
  description: values.description,
  isGraduated: !!values.endYear
};

    const response = await fetch(`/api/profile/education`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(transformedData),
});
    
    if (!response.ok) {
      throw new Error('Failed to add education');
    }
    
    const newEducation = await response.json();
    setEducationData((prev: any[]) => [...prev, newEducation]);
    
    uiToast({
      title: "Education added",
      description: "Your education has been successfully added.",
    });
    setIsAddingEducation(false);
    educationForm.reset();
  } catch (error) {
    console.error('Error adding education:', error);
    toast.error('Failed to add education');
  }
};

 const handleEditEducation = (education: any) => {
  setEditingEducationId(education.id);
  educationForm.reset({
    degree: education.major || education.degree || "", // Backend returns major
    institution: education.institutionName || education.institution || "",
    startYear: education.startDate || education.startYear || "",
    endYear: education.endDate || education.endYear || "",
    type: education.educationLevel || education.type || "",
    description: education.description || "",
  });
};


  const handleUpdateEducation = async (values: z.infer<typeof educationSchema>) => {
    if (!isOwnProfile || !editingEducationId) return;
    
    try {
  const transformedData = {
  institutionName: values.institution, // Backend expects institutionName
  educationLevel: values.type, // Backend expects educationLevel
  major: values.degree, // Backend expects major
  institutionType: values.type, // Backend expects institutionType
  startDate: values.startYear, // Backend expects startDate
  endDate: values.endYear, // Backend expects endDate
  description: values.description,
  isGraduated: !!values.endYear
};

  const response = await fetch(`/api/profile/education/${editingEducationId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(transformedData),
});

      
      if (!response.ok) {
        throw new Error('Failed to update education');
      }
      
      setEducationData((prev: any[]) => prev.map(edu => 
        edu.id === editingEducationId 
          ? { ...edu, ...transformedData }
          : edu
      ));
      
      uiToast({
        title: "Education updated",
        description: "Your education has been successfully updated.",
      });
      setEditingEducationId(null);
    } catch (error) {
      console.error('Error updating education:', error);
      toast.error('Failed to update education');
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!isOwnProfile) return;
    
    if (window.confirm("Are you sure you want to delete this education entry?")) {
      try {
        const response = await fetch(`/api/profile/education/${id}`, {
  method: 'DELETE',
});
        
        
        if (!response.ok) {
          throw new Error('Failed to delete education');
        }
        
        setEducationData((prev: any[]) => prev.filter(edu => edu.id !== id));
        uiToast({
          title: "Education deleted",
          description: "Your education has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting education:', error);
        toast.error('Failed to delete education');
      }
    }
  };

  // Handlers for work items - FIXED TO MATCH BACKEND
  // Handler for adding work experience
  const handleAddWork = async (values: z.infer<typeof workSchema>) => {
    if (!isOwnProfile || !numericProfileId) return;
    
    try {
  const transformedData = {
  company: values.company,
  position: values.position,
  city: values.location, // Backend expects city, not location
  description: values.description,
  startDate: values.startDate,
  endDate: values.current ? undefined : values.endDate, 
  isCurrentJob: values.current // Backend expects isCurrentJob, not current
};

  console.log("Current work history count:", workData.length);
console.log("About to add new work entry");
  const response = await fetch(`/api/profile/work-history`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(transformedData),
});

      if (!response.ok) {
        throw new Error('Failed to add work experience');
      }
      
      const newWork = await response.json();
      setWorkData((prev: any[]) => [...prev, newWork]);
      
      uiToast({
        title: "Work experience added",
        description: "Your work experience has been successfully added.",
      });
      setIsAddingWork(false);
      workForm.reset();
    } catch (error) {
      console.error('Error adding work experience:', error);
      toast.error('Failed to add work experience');
    }
  };

  // Handler for editing work
  // In handleEditWork function
const handleEditWork = (work: any) => {
  setEditingWorkId(work.id);
  workForm.reset({
    position: work.position || "",
    company: work.company || "",
    startDate: work.startDate || "",
    endDate: work.endDate || "",
    location: work.city || work.location || "", // Backend returns city
    description: work.description || "",
    current: work.isCurrentJob || work.current || false, // Backend returns isCurrentJob
  });
};

  const handleUpdateWork = async (values: z.infer<typeof workSchema>) => {
    if (!isOwnProfile || !editingWorkId) return;
    
    try {
  const transformedData = {
  company: values.company,
  position: values.position,
  city: values.location, // Backend expects city, not location
  description: values.description,
  startDate: values.startDate,
  endDate: values.endDate,
  isCurrentJob: values.current // Backend expects isCurrentJob, not current
};
      
  const response = await fetch(`/api/profile/work-history/${editingWorkId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(transformedData),
});
      
      if (!response.ok) {
        throw new Error('Failed to update work experience');
      }
      
      setWorkData((prev: any[]) => prev.map(work => 
        work.id === editingWorkId 
          ? { ...work, ...transformedData }
          : work
      ));
      
      uiToast({
        title: "Work experience updated",
        description: "Your work experience has been successfully updated.",
      });
      setEditingWorkId(null);
    } catch (error) {
      console.error('Error updating work experience:', error);
      toast.error('Failed to update work experience');
    }
  };

  const handleDeleteWork = async (id: string) => {
    if (!isOwnProfile) return;
    
    if (window.confirm("Are you sure you want to delete this work experience?")) {
      try {
        const response = await fetch(`/api/profile/work-history/${id}`, {
  method: 'DELETE',
});
        
        if (!response.ok) {
          throw new Error('Failed to delete work experience');
        }
        
        setWorkData((prev: any[]) => prev.filter(work => work.id !== id));
        
        uiToast({
          title: "Work experience deleted",
          description: "Your work experience has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting work experience:', error);
        toast.error('Failed to delete work experience');
      }
    }
  };

  // Handlers for donation items - FIXED TO MATCH BACKEND
  // Handler for adding donation
  const handleAddDonation = async (values: z.infer<typeof donationSchema>) => {
    if (!isOwnProfile || !numericProfileId) return;
    
    try {
const transformedData = {
  hospitalName: values.hospital, // Backend expects hospitalName
  hospitalLocation: values.location, // Backend expects hospitalLocation
  donationDate: values.date, // Backend expects donationDate
  donationType: values.donationType,
  donationVolume: 450, // Backend expects donationVolume
  donationUnit: "ml" // Backend expects donationUnit
};

  const response = await fetch(`/api/profile/donation-history`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(transformedData),
});
      if (!response.ok) {
        throw new Error('Failed to add donation');
      }
      
      const newDonation = await response.json();
      setDonationHistoryData((prev: any[]) => [...prev, newDonation]);
      
      uiToast({
        title: "Donation added",
        description: "Your donation has been successfully added.",
      });
      setIsAddingDonation(false);
      donationForm.reset();
    } catch (error) {
      console.error('Error adding donation:', error);
      toast.error('Failed to add donation');
    }
  };

  // Handler for editing donation
 const handleEditDonation = (donation: any) => {
  setEditingDonationId(donation.id);
  donationForm.reset({
    date: donation.donationDate || donation.date || "",
    hospital: donation.hospitalName || donation.hospital || "",
    location: donation.hospitalLocation || donation.location || "",
    donationType: donation.donationType || "",
  });
};
  const handleUpdateDonation = async (values: z.infer<typeof donationSchema>) => {
    if (!isOwnProfile || !editingDonationId) return;
    
    try {
 const transformedData = {
  hospitalName: values.hospital, // Backend expects hospitalName
  hospitalLocation: values.location, // Backend expects hospitalLocation
  donationDate: values.date, // Backend expects donationDate
  donationType: values.donationType,
  donationVolume: 450, // Backend expects donationVolume
  donationUnit: "ml" // Backend expects donationUnit
};
      
      const response = await fetch(`/api/profile/donation-history/${editingDonationId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(transformedData),
});
      if (!response.ok) {
        throw new Error('Failed to update donation');
      }
      
      setDonationHistoryData((prev: any[]) => prev.map(donation => 
        donation.id === editingDonationId 
          ? { ...donation, ...transformedData }
          : donation
      ));
      
      uiToast({
        title: "Donation updated",
        description: "Your donation has been successfully updated.",
      });
      setEditingDonationId(null);
    } catch (error) {
      console.error('Error updating donation:', error);
      toast.error('Failed to update donation');
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!isOwnProfile) return;
    
    if (window.confirm("Are you sure you want to delete this donation record?")) {
      try {
        const response = await fetch(`/api/profile/donation-history/${id}`, {
  method: 'DELETE',
});
        
        if (!response.ok) {
          throw new Error('Failed to delete donation');
        }
        
        setDonationHistoryData((prev: any[]) => prev.filter(donation => donation.id !== id));
        
        uiToast({
          title: "Donation deleted",
          description: "Your donation record has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting donation:', error);
        toast.error('Failed to delete donation');
      }
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profileData) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-red-800">Profile not found</h3>
          <p className="text-red-600 mt-2">The profile you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  const displayName = profileData.user?.fullName || profileData.user?.name || profileData.fullName || profileData.name || "";
  const displayBloodGroup = profileData.bloodGroup || profileData.bloodType || "";
  const displayDonationCount = profileData.donationCount || profileData.totalDonations || 0;
  const displayLastDonation = profileData.lastDonation || "";
  const displayEducation = propDonorData ? propDonorData.education : educationData;
  const displayWork = propDonorData ? propDonorData.work : workData;
  const displayDonationHistory = propDonorData ? propDonorData.donationHistory : donationHistoryData;
  const displayTestimonials = propDonorData ? propDonorData.testimonials : testimonialsData;
  const displaySocialLinks = profileData.socialLinks || {};
  const displayPersonalInfo = profileData.personalInfo || {
    age: profileData.age || 0,
    gender: profileData.gender || "",
    weight: profileData.weight || "",
    hemoglobin: profileData.hemoglobin || "",
    height: ""
  };
  const displayMedicalHistory = medicalHistoryData || {};

  // Function to get donation type badge color
  const getDonationTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Whole Blood":
        return "bg-red-100 text-red-800 border-red-200";
      case "Plasma":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Platelet":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section with Cover Photo */}
      <div className="max-w-7xl mx-auto">
        <div className="relative h-64 md:h-80 overflow-hidden rounded-b-3xl shadow-2xl">
          {coverPhotoPreview ? (
            <img 
              src={coverPhotoPreview} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#EAF1FF] via-[#D6E9FF] to-[#C2E9FB]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          
          <div className="absolute top-6 right-6 flex gap-2 z-30">
            {isOwnProfile && (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="p-3 rounded-full bg-white/80 backdrop-blur-md hover:bg-white/90 transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <Camera className="w-5 h-5 text-gray-800" />
              </button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShareProfile}
              className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 border border-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {isOwnProfile && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(true);
                }}
                className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 border border-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverPhotoChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:w-1/3">
            <div className="sticky top-6 space-y-6">
              <Card className="shadow-xl border-0 overflow-visible bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  {/* Profile Picture */}
                  <div className="flex justify-center -mt-20 mb-6 relative z-20">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                      <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-2xl overflow-visible bg-white">
                        {profilePhotoPreview ? (
                          <div className="w-full h-full rounded-full overflow-hidden">
                            <img 
                              src={profilePhotoPreview} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                              style={{ objectPosition: 'center top' }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                            <span className="text-4xl text-white font-bold">
                              {getUserInitials(displayName)}
                            </span>
                          </div>
                        )}
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <div className="p-3 rounded-full bg-white/90 transform hover:scale-110 transition-all duration-300">
                            <Camera className="w-6 h-6 text-gray-800" />
                          </div>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {displayName}
                    </h1>
                    {isOwnProfile && (
                      <p className="text-gray-500 text-sm mt-1 font-medium">
                        Donor ID: {profileData.donorId || `BDMS-2025-${String(profileData.id || 0).padStart(4, '0')}`}
                      </p>
                    )}
                    <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
                      <Droplet className="w-4 h-4 text-red-500" />
                      Blood Donor
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                        {displayBloodGroup}
                      </Badge>
                      {profileData.isVerified ? (
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Verified
                        </Badge>
                      ) : isOwnProfile ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsVerificationModalOpen(true)}
                          className="text-xs h-8 border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Get Verified
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <div className={`flex items-center justify-between p-4 rounded-lg mb-6 border transition-all duration-300 ${
                    isAvailable 
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                      : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                  }`}>
                    <div>
                      <p className="font-medium text-gray-900">Availability Status</p>
                      <p className={`text-sm font-medium ${isAvailable ? "text-green-600" : "text-red-600"}`}>
                        {isAvailable ? "Available for donation" : "Not available for donation"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAvailable ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={handleToggleAvailability}
                        disabled={!isOwnProfile}
                        className="scale-110"
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Bio Section */}
                  <div className="mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="flex-1">
                        {profileData.bio ? (
                          <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                        ) : (
                          <p className="text-gray-500 italic">
                            {isOwnProfile ? 'Add a bio to tell others about yourself...' : 'No bio available.'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all duration-300">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{profileData.email}</p>
                      </div>
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all duration-300">
                        <div className="p-3 bg-green-100 rounded-xl">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{profileData.phone}</p>
                        </div>
                    </div>
                    )}
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all duration-300">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {profileData.district}, {profileData.upazila}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-4 text-center text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                      <div className="text-3xl font-bold">
                        {displayDonationCount}
                      </div>
                      <div className="text-xs">Total Donations</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-center text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                      <div className="text-xl font-bold">
                        {displayLastDonation 
                          ? new Date(displayLastDonation).toLocaleDateString()
                          : "Never"}
                      </div>
                      <div className="text-xs">Last Donation</div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {displaySocialLinks && (
                    <>
                      <Separator className="my-6" />
                      <div className="flex justify-center space-x-4">
                        {displaySocialLinks.facebook && (
                          <a href={displaySocialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-all duration-300 transform hover:scale-110">
                            <Facebook className="w-5 h-5 text-blue-600" />
                          </a>
                        )}
                        {displaySocialLinks.twitter && (
                          <a href={displaySocialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-sky-100 hover:text-sky-500 transition-all duration-300 transform hover:scale-110">
                            <Twitter className="w-5 h-5 text-sky-500" />
                          </a>
                        )}
                        {displaySocialLinks.linkedin && (
                          <a href={displaySocialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 transform hover:scale-110">
                            <Linkedin className="w-5 h-5 text-blue-700" />
                          </a>
                        )}
                        {displaySocialLinks.instagram && (
                          <a href={displaySocialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-pink-100 hover:text-pink-600 transition-all duration-300 transform hover:scale-110">
                            <Instagram className="w-5 h-5 text-pink-600" />
                          </a>
                        )}
                        {displaySocialLinks.github && (
                          <a href={displaySocialLinks.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-slate-700 transition-all duration-300 transform hover:scale-110 group">
                            <Github className="w-5 h-5 text-black group-hover:text-white transition-colors duration-300" />
                          </a>
                        )}
                        {displaySocialLinks.website && (
                          <a href={displaySocialLinks.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-xl hover:bg-green-100 hover:text-green-600 transition-all duration-300 transform hover:scale-110">
                            <Globe className="w-5 h-5 text-green-600" />
                          </a>
                        )}
                      </div>
                    </>
                  )}

                  {!isOwnProfile && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-3">
                        <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105" onClick={handleContact}>
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Contact Now
                        </Button>
                        <Button variant="outline" className="w-full border-2 border-red-500 text-red-500 hover:bg-red-50 font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
                          <Heart className="w-5 h-5 mr-2" />
                          Request Donation
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - All Sections */}
          <div className="lg:w-2/3 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="w-6 h-6 text-blue-500" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection("personal")}
                    className="hover:bg-blue-50"
                  >
                    {expandedSections.personal ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </Button>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.personal && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <p className="text-sm text-gray-500 mb-1">Age</p>
                            <p className="text-lg font-medium text-gray-900">
                              {displayPersonalInfo.age || 
                              (profileData.dateOfBirth 
                                ? new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear()
                                : "Not specified")}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <p className="text-sm text-gray-500 mb-1">Weight</p>
                            <p className="text-lg font-medium text-gray-900">
                              {displayPersonalInfo.weight ? `${displayPersonalInfo.weight} kg` : "Not specified"}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <p className="text-sm text-gray-500 mb-1 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Next Eligible
                            </p>
                            <p className="text-lg font-medium text-gray-900">
                              {displayLastDonation 
                                ? new Date(new Date(displayLastDonation).setDate(new Date(displayLastDonation).getDate() + 120)).toLocaleDateString()
                                : "Available now"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <p className="text-sm text-gray-500 mb-1">Gender</p>
                            <p className="text-lg font-medium text-gray-900">{displayPersonalInfo.gender || "Not specified"}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                            <p className="text-lg font-medium text-gray-900">{displayBloodGroup || "Not specified"}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <p className="text-sm text-gray-500 mb-1">Hemoglobin</p>
                            <p className="text-lg font-medium text-gray-900">
                              {displayPersonalInfo.hemoglobin ? `${displayPersonalInfo.hemoglobin} g/dL` : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Medical History */}
            <Card className="shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileMedicalIcon className="w-6 h-6 text-green-500" />
                    Medical History
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingMedicalHistory(true)}
                        className="hover:bg-green-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("medicalHistory")}
                      className="hover:bg-green-50"
                    >
                      {expandedSections.medicalHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.medicalHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      {isMedicalHistoryLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                      ) : isEditingMedicalHistory ? (
                        <Form {...medicalHistoryFormValidation}>
                          <form onSubmit={medicalHistoryFormValidation.handleSubmit(handleSaveMedicalHistory)} className="space-y-4">
                            <FormField
                              control={medicalHistoryFormValidation.control}
                              name="healthStatus"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Health Status</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select health status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="healthy">Healthy</SelectItem>
                                      <SelectItem value="minor-conditions">Minor Conditions</SelectItem>
                                      <SelectItem value="major-conditions">Major Conditions</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={medicalHistoryFormValidation.control}
                                name="bloodPressureSystolic"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Blood Pressure (Systolic)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="120" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={medicalHistoryFormValidation.control}
                                name="bloodPressureDiastolic"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Blood Pressure (Diastolic)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="80" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={medicalHistoryFormValidation.control}
                              name="chronicConditions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Chronic Conditions</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="List any chronic conditions" className="min-h-[80px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={medicalHistoryFormValidation.control}
                                name="vaccinationType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Vaccination Type</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., COVID-19, Hepatitis B" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={medicalHistoryFormValidation.control}
                                name="vaccinationDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Vaccination Date</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="date"
                                        max={getTodayString()}
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={medicalHistoryFormValidation.control}
                                name="smoking"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <Cigarette className="w-4 h-4" />
                                      Smoking
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="never">Never</SelectItem>
                                        <SelectItem value="former">Former</SelectItem>
                                        <SelectItem value="occasional">Occasional</SelectItem>
                                        <SelectItem value="regular">Regular</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={medicalHistoryFormValidation.control}
                                name="alcohol"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <Beer className="w-4 h-4" />
                                      Alcohol
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="never">Never</SelectItem>
                                        <SelectItem value="occasional">Occasional</SelectItem>
                                        <SelectItem value="regular">Regular</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={medicalHistoryFormValidation.control}
                                name="drugUse"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <DrugIcon className="w-4 h-4" />
                                      Drug Use
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="never">Never</SelectItem>
                                        <SelectItem value="past">Past</SelectItem>
                                        <SelectItem value="current">Current</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={medicalHistoryFormValidation.control}
                              name="conditions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medical Conditions</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="List any medical conditions" className="min-h-[80px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={medicalHistoryFormValidation.control}
                              name="allergies"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Allergies</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="List any allergies" className="min-h-[80px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={medicalHistoryFormValidation.control}
                              name="medications"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Medications</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="List current medications" className="min-h-[80px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={medicalHistoryFormValidation.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Important Notes</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Add any important medical notes" className="min-h-[100px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={() => setIsEditingMedicalHistory(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">
                                Save Changes
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div className="space-y-4">
                          {/* Health Status */}
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 flex items-center">
                                <Activity className="w-5 h-5 text-blue-500 mr-2" />
                                Current Health Status
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                displayMedicalHistory.healthStatus === 'healthy' 
                                  ? "bg-green-100 text-green-800" 
                                  : displayMedicalHistory.healthStatus === 'minor-conditions'
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {displayMedicalHistory.healthStatus === 'healthy' 
                                  ? "Healthy" 
                                  : displayMedicalHistory.healthStatus === 'minor-conditions'
                                  ? "Minor Conditions"
                                  : "Major Conditions"}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {displayMedicalHistory.healthStatus === 'healthy' 
                                ? "No major health conditions that would prevent blood donation."
                                : displayMedicalHistory.healthStatus === 'minor-conditions'
                                ? "Some minor health conditions that may not affect blood donation."
                                : "Major health conditions that require medical evaluation before donation."}
                            </p>
                          </div>
                          
                          {/* Blood Pressure */}
                          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Heart className="w-5 h-5 text-red-500 mr-2" />
                              Blood Pressure
                            </h5>
                            <p className="text-gray-700">
                              {displayMedicalHistory.systolic && displayMedicalHistory.diastolic 
                                ? `${displayMedicalHistory.systolic}/${displayMedicalHistory.diastolic} mmHg`
                                : "Not specified"}
                            </p>
                          </div>
                          
                          {/* Chronic Conditions */}
                          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                              Chronic Conditions
                            </h5>
                            <div className="space-y-2">
                              {displayMedicalHistory.chronicConditions && displayMedicalHistory.chronicConditions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {displayMedicalHistory.chronicConditions.map((condition: string, index: number) => (
                                    <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                      {condition.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-600 text-sm">None specified</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Vaccination */}
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Syringe className="w-5 h-5 text-blue-500 mr-2" />
                              Vaccination
                            </h5>
                            <div className="space-y-1">
                              {displayMedicalHistory.vaccinations && displayMedicalHistory.vaccinations.length > 0 ? (
                                <>
                                  <p className="text-gray-700 text-sm">
                                    <span className="font-medium">Type:</span> {displayMedicalHistory.vaccinations.join(", ")}
                                  </p>
                                  {displayMedicalHistory.lastChecked && (
                                    <p className="text-gray-700 text-sm">
                                      <span className="font-medium">Date:</span> {new Date(displayMedicalHistory.lastChecked).toLocaleDateString()}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-gray-600 text-sm">No vaccination information</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Lifestyle Factors */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-300">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Cigarette className="w-5 h-5 text-purple-500 mr-2" />
                                Smoking
                              </h5>
                              <p className="text-gray-700 capitalize text-sm">
                                {displayMedicalHistory.smokingStatus || "Not specified"}
                              </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all duration-300">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Beer className="w-5 h-5 text-blue-500 mr-2" />
                                Alcohol
                              </h5>
                              <p className="text-gray-700 capitalize text-sm">
                                {displayMedicalHistory.alcoholConsumption || "Not specified"}
                              </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                                <DrugIcon className="w-5 h-5 text-green-500 mr-2" />
                                Drug Use
                              </h5>
                              <p className="text-gray-700 capitalize text-sm">
                                {displayMedicalHistory.drugUse || "Not specified"}
                              </p>
                            </div>
                          </div>
                          
                          {/* Allergies and Medications */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl hover:shadow-md transition-all duration-300">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                                Allergies
                              </h5>
                              <div className="space-y-2">
                                {displayMedicalHistory.allergies && displayMedicalHistory.allergies.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {displayMedicalHistory.allergies.map((allergy: string, index: number) => (
                                      <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                        {allergy.trim()}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-600 text-sm">None specified</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all duration-300">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Pill className="w-5 h-5 text-blue-500 mr-2" />
                                Current Medications
                              </h5>
                              <div className="space-y-2">
                                {displayMedicalHistory.currentMedications && displayMedicalHistory.currentMedications.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {displayMedicalHistory.currentMedications.map((medication: string, index: number) => (
                                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                        {medication.trim()}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-600 text-sm">None specified</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Important Notes */}
                          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl hover:shadow-md transition-all duration-300">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <FileNotes className="w-5 h-5 text-yellow-500 mr-2" />
                              Important Notes
                            </h5>
                            {displayMedicalHistory.importantNotes ? (
                              <ul className="text-gray-700 text-sm space-y-1">
                                {displayMedicalHistory.importantNotes.split('\n').map((note: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-yellow-500 mr-2">•</span>
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-600 text-sm">No important notes available</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Work Experience (renamed from Work History) */}
            <Card className="shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="w-6 h-6 text-blue-500" />
                    Work Experience
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isOwnProfile && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsAddingWork(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Work
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("work")}
                      className="hover:bg-blue-50"
                    >
                      {expandedSections.work ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.work && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      {isWorkLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : displayWork && displayWork.length > 0 ? (
                        <div className="space-y-6">
                          {displayWork.map((work: any, index: number) => (
                            <div key={index} className="relative pl-8 pb-6 border-l-4 border-blue-500 last:border-0">
                              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-md"></div>
                              <div className={`p-4 rounded-xl hover:shadow-md transition-all duration-300 ${
                                work.isCurrentJob || work.current ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200" : "bg-gray-50"
                              }`}>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-lg">{work.position}</h4>
                                    <p className="text-blue-600 font-medium">{work.company}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {work.isCurrentJob || work.current && (
                                      <Badge className="bg-blue-100 text-blue-800 border-0">
                                        Current
                                      </Badge>
                                    )}
                                    {isOwnProfile && (
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditWork(work)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteWork(work.id)}
                                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{work.city || work.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>{work.startDate} - {work.isCurrentJob || work.current ? "Present" : work.endDate}</span>
                                </div>
                                {work.description && (
                                  <p className="text-gray-700 text-sm mt-2">{work.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No work experience available</p>
                          <p className="text-gray-400 text-sm mt-2">Add your work experience to build your professional profile</p>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Education */}
            <Card className="shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <GraduationCap className="w-6 h-6 text-green-500" />
                    Education
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isOwnProfile && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsAddingEducation(true)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Education
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("education")}
                      className="hover:bg-green-50"
                    >
                      {expandedSections.education ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.education && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      {isEducationLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                      ) : displayEducation && displayEducation.length > 0 ? (
                        <div className="space-y-6">
                          {displayEducation.map((edu: any, index: number) => (
                            <div key={index} className="relative pl-8 pb-6 border-l-4 border-green-500 last:border-0">
                              <div className="absolute -left-2 top-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
                              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-lg">{edu.major || edu.degree}</h4>
                                    <p className="text-green-600 font-medium">{edu.institutionName || edu.institution}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {edu.isGraduated && (
                                      <Badge className="bg-green-100 text-green-800 border-0">
                                        Graduated
                                      </Badge>
                                    )}
                                    {isOwnProfile && (
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditEducation(edu)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteEducation(edu.id)}
                                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{edu.startDate || edu.startYear} - {edu.endDate || edu.endYear || "Present"}</span>
                                </div>
                                {edu.educationLevel || edu.type && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Award className="w-4 h-4" />
                                    <span className="font-medium">Education Level:</span> <span>{edu.educationLevel || edu.type}</span>
                                  </div>
                                )}
                                {edu.description && (
                                  <p className="text-gray-700 text-sm mt-2">{edu.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No education information available</p>
                          <p className="text-gray-400 text-sm mt-2">Add your education details to showcase your academic background</p>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Blood Donation History */}
            <Card className="shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="w-6 h-6 text-red-500" />
                    Blood Donation History
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isOwnProfile && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsAddingDonation(true)}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Donation
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("donationHistory")}
                      className="hover:bg-red-50"
                    >
                      {expandedSections.donationHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.donationHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      {isDonationLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        </div>
                      ) : displayDonationHistory && displayDonationHistory.length > 0 ? (
                        <div className="relative">
                          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></div>
                          <div className="space-y-6">
                            {displayDonationHistory.map((donation: any, index: number) => (
                              <div key={index} className="relative pl-16">
                                <div className={`absolute left-4 top-6 w-5 h-5 rounded-full border-4 border-white shadow-md ${
                                  donation.donationType === 'Whole Blood' 
                                    ? "bg-red-500" 
                                    : donation.donationType === 'Platelet'
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                }`}></div>
                                <div className={`p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ${
                                  donation.donationType === 'Whole Blood' 
                                    ? "bg-red-50" 
                                    : donation.donationType === 'Platelet'
                                    ? "bg-yellow-50"
                                    : "bg-blue-50"
                                }`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 text-lg">{donation.hospitalName || donation.hospital}</h4>
                                      <p className="text-red-600 font-medium">{donation.hospitalLocation || donation.location}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={`px-3 py-1 rounded-full ${getDonationTypeBadgeColor(donation.donationType || donation.donationType)}`}>
                                        {donation.donationType || donation.donationType}
                                      </Badge>
                                      {isOwnProfile && (
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditDonation(donation)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteDonation(donation.id)}
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(donation.donationDate || donation.date).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No donation history available</p>
                          <p className="text-gray-400 text-sm mt-2">Your donation history will appear here once you start donating</p>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Testimonials */}
            <Card className="shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquare className="w-6 h-6 text-purple-500" />
                    Testimonials
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection("testimonials")}
                    className="hover:bg-purple-50"
                  >
                    {expandedSections.testimonials ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </Button>
                </div>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.testimonials && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      {isTestimonialsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                      ) : displayTestimonials && displayTestimonials.length > 0 ? (
                        <div className="space-y-4">
                          {displayTestimonials.map((testimonial: any, index: number) => (
                            <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-300">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-full shadow-md">
                                  <Star className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-700 italic text-lg">"{testimonial.content}"</p>
                                  <p className="text-sm font-medium text-gray-900 mt-2">- {testimonial.author || testimonial.name}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No testimonials available</p>
                          <p className="text-gray-400 text-sm mt-2">Testimonials from recipients will appear here</p>
                        </div>
                      )}
                      
                      {!isOwnProfile && (
                        <div className="mt-6 text-center">
                          <Button 
                            onClick={() => setIsAddingTestimonial(true)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            Add Testimonial
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={editForm.gender} onValueChange={(value) => setEditForm({ ...editForm, gender: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={editForm.weight}
                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="upazila">Upazila</Label>
                <Input
                  id="upazila"
                  value={editForm.upazila}
                  onChange={(e) => setEditForm({ ...editForm, upazila: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={editForm.facebook}
                  onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={editForm.twitter}
                  onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={editForm.instagram}
                  onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Education Modal */}
      <Dialog open={isAddingEducation} onOpenChange={setIsAddingEducation}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Education</DialogTitle>
            <DialogDescription>
              Add your educational background to your profile.
            </DialogDescription>
          </DialogHeader>
          <Form {...educationForm}>
            <form onSubmit={educationForm.handleSubmit(handleAddEducation)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={educationForm.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={educationForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {educationLevels.map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={educationForm.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., University of Example" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={educationForm.control}
                  name="startYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          max={getTodayString()}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={educationForm.control}
                  name="endYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={educationForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional details about your education" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingEducation(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Education
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Education Modal */}
      <Dialog open={!!editingEducationId} onOpenChange={() => setEditingEducationId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Education</DialogTitle>
            <DialogDescription>
              Update your educational background.
            </DialogDescription>
          </DialogHeader>
          <Form {...educationForm}>
            <form onSubmit={educationForm.handleSubmit(handleUpdateEducation)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={educationForm.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={educationForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {educationLevels.map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={educationForm.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., University of Example" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={educationForm.control}
                  name="startYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          max={getTodayString()}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={educationForm.control}
                  name="endYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={educationForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional details about your education" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingEducationId(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update Education
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Work Modal */}
      <Dialog open={isAddingWork} onOpenChange={setIsAddingWork}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Work Experience</DialogTitle>
            <DialogDescription>
              Add your work experience to your profile.
            </DialogDescription>
          </DialogHeader>
          <Form {...workForm}>
            <form onSubmit={workForm.handleSubmit(handleAddWork)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={workForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tech Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          max={getTodayString()}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={workForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
            <FormLabel>End Date</FormLabel>
            <FormControl>
              <Input 
                type="date"
                {...field} 
                disabled={workForm.watch("current")} // <--- ADD THIS LINE
                className={workForm.watch("current") ? "opacity-50 cursor-not-allowed bg-muted" : ""} // <--- ADD THIS FOR STYLING
              />
            </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={workForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={workForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your responsibilities and achievements" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={workForm.control}
                name="current"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Current Position</FormLabel>
                      <FormDescription>
                        Check if this is your current job
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingWork(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Work Experience
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Work Modal */}
      <Dialog open={!!editingWorkId} onOpenChange={() => setEditingWorkId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Work Experience</DialogTitle>
            <DialogDescription>
              Update your work experience.
            </DialogDescription>
          </DialogHeader>
          <Form {...workForm}>
            <form onSubmit={workForm.handleSubmit(handleUpdateWork)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={workForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tech Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={workForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          max={getTodayString()}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={workForm.control}
                  name="endDate"
                  render={({ field }) => (
                   <FormItem>
            <FormLabel>End Date</FormLabel>
            <FormControl>
              <Input 
                type="date"
                {...field} 
                disabled={workForm.watch("current")} // <--- ADD THIS LINE
                className={workForm.watch("current") ? "opacity-50 cursor-not-allowed bg-muted" : ""} // <--- ADD THIS FOR STYLING
              />
            </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={workForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={workForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your responsibilities and achievements" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={workForm.control}
                name="current"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Current Position</FormLabel>
                      <FormDescription>
                        Check if this is your current job
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingWorkId(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update Work Experience
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Donation Modal */}
      <Dialog open={isAddingDonation} onOpenChange={setIsAddingDonation}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Donation</DialogTitle>
            <DialogDescription>
              Add a new blood donation to your history.
            </DialogDescription>
          </DialogHeader>
          <Form {...donationForm}>
            <form onSubmit={donationForm.handleSubmit(handleAddDonation)} className="space-y-4">
              <FormField
                control={donationForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        max={getTodayString()}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="hospital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., City Hospital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="donationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donation Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select donation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                        <SelectItem value="Platelet">Platelet</SelectItem>
                        <SelectItem value="Plasma">Plasma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingDonation(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Donation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Donation Modal */}
      <Dialog open={!!editingDonationId} onOpenChange={() => setEditingDonationId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Donation</DialogTitle>
            <DialogDescription>
              Update your donation record.
            </DialogDescription>
          </DialogHeader>
          <Form {...donationForm}>
            <form onSubmit={donationForm.handleSubmit(handleUpdateDonation)} className="space-y-4">
              <FormField
                control={donationForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        max={getTodayString()}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="hospital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., City Hospital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="donationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donation Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select donation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                        <SelectItem value="Platelet">Platelet</SelectItem>
                        <SelectItem value="Plasma">Plasma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingDonationId(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update Donation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Testimonial Dialog */}
      <Dialog open={isAddingTestimonial} onOpenChange={setIsAddingTestimonial}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Testimonial</DialogTitle>
            <DialogDescription>
              Share your experience with {displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex items-center space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      star <= testimonialRating ? "text-yellow-500 fill-current" : "text-gray-300"
                    }`}
                    onClick={() => setTestimonialRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="testimonial">Your Testimonial</Label>
              <Textarea
                id="testimonial"
                placeholder="Share your experience with this donor..."
                value={testimonialContent}
                onChange={(e) => setTestimonialContent(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTestimonial(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTestimonialSubmit}
              disabled={isSubmittingTestimonial}
            >
              {isSubmittingTestimonial ? "Submitting..." : "Submit Testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePage;