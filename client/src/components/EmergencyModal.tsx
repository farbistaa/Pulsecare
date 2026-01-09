import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import GoogleAddressInput from './GoogleAddressInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Upload, X, Lock, MapPin, Phone, User, Calendar, FileText, Users, Stethoscope } from 'lucide-react';

interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const emergencyTypes = [
  'Surgery',
  'Accident',
  'Childbirth',
  'Cancer Treatment',
  'Organ Transplant',
  'Other Medical Emergency'
];

const guardianRelations = [
  'Father',
  'Mother',
  'Spouse',
  'Sibling',
  'Child',
  'Relative',
  'Friend',
  'Guardian'
];

// Enhanced form validation schema
const enhancedEmergencyRequestSchema = z.object({
  patientName: z.string()
    .min(1, "Patient name is required")
    .min(2, "Patient name must be at least 2 characters")
    .max(50, "Patient name must not exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Patient name should only contain letters and spaces"),
  patientAge: z.number()
    .min(1, "Patient age is required")
    .max(120, "Invalid age")
    .int("Age must be a whole number"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  unitsRequired: z.number()
    .min(1, "Units required must be at least 1")
    .max(10, "Maximum 10 units allowed")
    .int("Units must be a whole number"),
  hospitalName: z.string()
    .min(1, "Hospital name is required")
    .min(2, "Hospital name must be at least 2 characters")
    .max(100, "Hospital name must not exceed 100 characters"),
  doctorName: z.string()
    .min(1, "Doctor name is required")
    .min(2, "Doctor name must be at least 5 characters")
    .max(50, "Doctor name must not exceed 50 characters")
    .regex(/^[A-Za-z\s.]+$/, "Doctor name should only contain letters, spaces, and dots"),
  hospitalAddress: z.string()
    .min(1, "Hospital address is required")
    .min(10, "Hospital address must be at least 10 characters")
    .max(200, "Hospital address must not exceed 200 characters"),
  requiredBy: z.string()
    .min(1, "Required by date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Required date cannot be in the past"),
  contactNumber: z.string()
    .min(1, "Contact number is required")
    .regex(/^(\+88)?01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  guardianName: z.string()
    .min(1, "Guardian name is required")
    .min(2, "Guardian name must be at least 2 characters")
    .max(50, "Guardian name must not exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Guardian name should only contain letters and spaces"),
  guardianRelation: z.string().min(1, "Guardian relation is required"),
  guardianPhone: z.string()
    .min(1, "Guardian phone number is required")
    .regex(/^(\+88)?01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  emergencyType: z.string().min(1, "Emergency type is required"),
  medicalCondition: z.string()
    .min(1, "Medical condition details are required")
    .max(500, "Medical condition details must not exceed 500 characters"),
  additionalInfo: z.string()
    .max(500, "Additional information must not exceed 500 characters")
    .optional(),
  isCritical: z.boolean().default(false),
  documents: z.array(z.any()).optional(),
});

export default function EmergencyModalNew({ open, onOpenChange }: EmergencyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  const form = useForm<z.infer<typeof enhancedEmergencyRequestSchema>>({
    resolver: zodResolver(enhancedEmergencyRequestSchema),
    defaultValues: {
      patientName: '',
      patientAge: undefined,
      bloodGroup: '',
      unitsRequired: 1,
      hospitalName: '',
      doctorName: '',
      hospitalAddress: '',
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contactNumber: user?.phone || '',
      guardianName: '',
      guardianRelation: 'Father',
      guardianPhone: '',
      emergencyType: 'Surgery',
      medicalCondition: '',
      additionalInfo: '',
      isCritical: true,
      documents: [],
    },
  });

  // Document upload handler
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only JPEG, PNG, and PDF files under 5MB are allowed",
        variant: "destructive",
      });
    }

    setUploadedDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const createEmergencyRequestMutation = useMutation({
    mutationFn: async (data: z.infer<typeof enhancedEmergencyRequestSchema>) => {
       console.log("EMERGENCY: Data being sent to API:", JSON.stringify(data, null, 2));
      if (!isAuthenticated) {
        throw new Error("You must be logged in to submit an emergency blood request");
      }
      // Construct FormData to include files
      const formData = new FormData();
      formData.append('patientName', data.patientName);
      formData.append('patientAge', String(data.patientAge));
      formData.append('bloodGroup', data.bloodGroup);
      formData.append('unitsRequired', String(data.unitsRequired));
      formData.append('hospitalName', data.hospitalName);
      formData.append('doctorName', data.doctorName);
      formData.append('hospitalAddress', data.hospitalAddress);
      formData.append('requiredBy', data.requiredBy);
      formData.append('contactNumber', data.contactNumber);
      formData.append('guardianName', data.guardianName);
      formData.append('guardianRelation', data.guardianRelation);
      formData.append('guardianPhone', data.guardianPhone);
      formData.append('emergencyType', data.emergencyType);
      formData.append('medicalCondition', data.medicalCondition);
      formData.append('additionalInfo', data.additionalInfo || '');
      formData.append('isCritical', String(data.isCritical));
      formData.append('requesterId', String(user?.id || ''));

      uploadedDocuments.forEach((file) => {
        formData.append('documents', file);
      });

      return apiRequest('/api/emergency-requests', { 
        method: 'POST', 
        body: formData 
      });
    },
    onSuccess: () => {
      toast({
        title: "Emergency Request Submitted",
        description: "Your emergency blood request has been submitted successfully. Eligible donors will be notified immediately.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-requests'] });
      form.reset();
      setUploadedDocuments([]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit emergency request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof enhancedEmergencyRequestSchema>) => {
    console.log("EMERGENCY: Form submitted with data:", JSON.stringify(data, null, 2));
    if (!isAuthenticated) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to submit an emergency blood request.",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }
    createEmergencyRequestMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 flex items-center">
              <Lock className="w-6 h-6 mr-2" />
              Access Denied
            </DialogTitle>
            <DialogDescription className="text-center py-6">
              <div className="mb-4">
                <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              </div>
              <p className="text-lg mb-4">You must be logged in to submit an emergency blood request.</p>
              <p className="text-gray-600 mb-6">Please register or login to access this feature and help save lives.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => onOpenChange(false)} variant="outline">
                  Close
                </Button>
                <Button onClick={() => { onOpenChange(false); window.location.href = '/login'; }}>
                  Login Now
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Emergency Blood Request
          </DialogTitle>
          <DialogDescription>
            Complete all sections to submit your urgent blood request. This will notify eligible donors immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Patient Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Patient age"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group Needed *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitsRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units Required *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Number of units"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select emergency type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emergencyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Hospital Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Hospital Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hospitalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hospital name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter doctor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hospitalAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Hospital Address *</FormLabel>
                      <FormControl>
                        <GoogleAddressInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter hospital address"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required By *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalCondition"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Medical Condition Details *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe the patient's medical condition requiring blood transfusion"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Guardian Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Guardian Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guardianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter guardian name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardianRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation to Patient *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guardianRelations.map((relation) => (
                            <SelectItem key={relation} value={relation}>
                              {relation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Phone *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter guardian phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter primary contact number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information & Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Additional Information & Documents</h3>
              </div>

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information that might help donors understand the urgency"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Document Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Medical Documents (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Upload medical reports, prescriptions, or doctor's recommendations (JPEG, PNG, PDF - Max 5MB each)
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleDocumentUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Choose Files
                    </label>
                  </div>
                </div>

                {/* Uploaded Documents Display */}
                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Documents:</p>
                    {uploadedDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="isCritical"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-red-600 font-semibold">
                        This is a critical emergency (within 24 hours)
                      </FormLabel>
                      <p className="text-sm text-gray-600">
                        Check this if blood is needed within 24 hours. This will send urgent notifications to all eligible donors.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <div>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={createEmergencyRequestMutation.isPending}
                >
                  {createEmergencyRequestMutation.isPending ? "Submitting..." : "Submit Emergency Request"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}