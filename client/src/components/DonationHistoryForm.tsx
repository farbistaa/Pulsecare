import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit, Save, Trash2, Heart, Calendar, MapPin, Building, Upload, Image } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Donation validation schema
const donationSchema = z.object({
  hospitalName: z.string().min(1, "Hospital name is required"),
  hospitalLocation: z.string().min(1, "Hospital location is required"),
  donationDate: z.string().min(1, "Donation date is required"),
  donationType: z.enum(["Blood", "Platelet", "Other"], {
    required_error: "Donation type is required",
  }),
  donationPicture: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationEntry {
  id: number;
  hospitalName: string;
  hospitalLocation: string;
  donationDate: string;
  donationType: string;
  donationPicture?: string;
}

// Mock hospital data for autocomplete
const HOSPITALS = [
  "Dhaka Medical College Hospital",
  "Bangabandhu Sheikh Mujib Medical University",
  "Square Hospitals Ltd",
  "Apollo Hospitals Dhaka",
  "United Hospital Limited",
  "Labaid Specialized Hospital",
  "Ibn Sina Hospital",
  "Evercare Hospital Dhaka",
  "Popular Hospital",
  "Green Life Medical College & Hospital",
  "Anwer Khan Modern Medical College Hospital",
  "Holy Family Red Crescent Medical College Hospital",
  "National Institute of Cardiovascular Diseases",
  "Chittagong Medical College Hospital",
  "Rajshahi Medical College Hospital",
  "Sylhet MAG Osmani Medical College Hospital",
  "Khulna Medical College Hospital",
  "Comilla Medical College Hospital",
  "Rangpur Medical College Hospital",
  "Mymensingh Medical College Hospital"
];

export function DonationHistoryForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [showHospitalSuggestions, setShowHospitalSuggestions] = useState(false);

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      hospitalName: "",
      hospitalLocation: "",
      donationDate: "",
      donationType: "Blood",
      donationPicture: "",
    },
  });

  const { watch, setValue, reset } = form;
  const selectedHospital = watch("hospitalName");

  // Filter hospitals based on search
  const filteredHospitals = HOSPITALS.filter(hospital =>
    hospital.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  // Fetch donation history
  const { data: donationHistory = [], isLoading } = useQuery<DonationEntry[]>({
    queryKey: ["/api/profile/donation-history"],
    retry: false,
  });

  // Add donation mutation
  const addDonationMutation = useMutation({
    mutationFn: async (data: DonationFormData) => {
      return apiRequest("/api/profile/donation-history", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Donation history added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/donation-history"] });
      setIsAdding(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add donation history",
        variant: "destructive",
      });
    },
  });

  // Update donation mutation
  const updateDonationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DonationFormData }) => {
      return apiRequest(`/api/profile/donation-history/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Donation history updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/donation-history"] });
      setEditingId(null);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update donation history",
        variant: "destructive",
      });
    },
  });

  // Delete donation mutation
  const deleteDonationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/profile/donation-history/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Donation history deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/donation-history"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete donation history",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonationFormData) => {
    if (editingId) {
      updateDonationMutation.mutate({ id: editingId, data });
    } else {
      addDonationMutation.mutate(data);
    }
  };

  const handleEdit = (donation: DonationEntry) => {
    setEditingId(donation.id);
    setIsAdding(true);
    form.reset({
      hospitalName: donation.hospitalName,
      hospitalLocation: donation.hospitalLocation,
      donationDate: donation.donationDate,
      donationType: donation.donationType as "Blood" | "Platelet" | "Other",
      donationPicture: donation.donationPicture || "",
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    reset();
    setHospitalSearch("");
    setShowHospitalSuggestions(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this donation record?")) {
      deleteDonationMutation.mutate(id);
    }
  };

  const handleHospitalSelect = (hospital: string) => {
    setValue("hospitalName", hospital);
    setHospitalSearch(hospital);
    setShowHospitalSuggestions(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload - in real app, upload to server
      const fakeUrl = `/uploads/donations/${file.name}`;
      setValue("donationPicture", fakeUrl);
      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully`,
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Donation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Donation History
            <Badge variant="outline">{donationHistory.length}</Badge>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Donation
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-dashed border-2 border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingId ? "Edit Donation" : "Add New Donation"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="hospitalName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hospital Name *</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    placeholder="Search hospitals..."
                                    value={hospitalSearch}
                                    onChange={(e) => {
                                      setHospitalSearch(e.target.value);
                                      field.onChange(e.target.value);
                                      setShowHospitalSuggestions(true);
                                    }}
                                    onFocus={() => setShowHospitalSuggestions(true)}
                                  />
                                </FormControl>
                                {showHospitalSuggestions && filteredHospitals.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredHospitals.slice(0, 10).map((hospital) => (
                                      <button
                                        key={hospital}
                                        type="button"
                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleHospitalSelect(hospital)}
                                      >
                                        {hospital}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hospitalLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hospital Location *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Dhaka, Bangladesh" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="donationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Donation *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="donationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Donation Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select donation type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Blood">Blood</SelectItem>
                                  <SelectItem value="Platelet">Platelet</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="donationPicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload Photo (Optional)</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <Input
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="donation-photo"
                                />
                                <label
                                  htmlFor="donation-photo"
                                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                                >
                                  <Upload className="h-4 w-4" />
                                  Choose Photo
                                </label>
                                {field.value && (
                                  <div className="flex items-center gap-2 text-sm text-green-600">
                                    <Image className="h-4 w-4" />
                                    Photo uploaded
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              Max 10MB. Formats: JPEG, PNG
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={addDonationMutation.isPending || updateDonationMutation.isPending}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {editingId ? "Update Donation" : "Add Donation"}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Donation Chain Display (LinkedIn-style) */}
        {donationHistory.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Donation Journey</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-200"></div>
              
              {donationHistory.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative flex items-start gap-6 pb-8"
                >
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                      <Heart className="h-8 w-8 text-red-600 fill-current" />
                    </div>
                    {/* Donation count badge */}
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {donationHistory.length - index}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Card className="border border-gray-200 hover:border-red-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <Heart className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{donation.hospitalName}</h3>
                                <p className="text-red-600 font-medium">Component: {donation.donationType}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{donation.hospitalLocation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">
                                  {new Date(donation.donationDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <Badge 
                              variant="secondary"
                              className="bg-red-100 text-red-800 mb-3"
                            >
                              {donation.donationType} Donation
                            </Badge>

                            {donation.donationPicture && (
                              <div className="mb-3">
                                <img
                                  src={donation.donationPicture}
                                  alt="Donation photo"
                                  className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(donation)}
                              disabled={isAdding}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(donation.id)}
                              disabled={deleteDonationMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
              
              {/* Journey start */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: donationHistory.length * 0.1 }}
                className="relative flex items-center gap-6"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">Your donation journey started here!</h3>
                  <p className="text-gray-600">Every drop counts in saving lives</p>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donation history yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your life-saving donations</p>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Donation
              </Button>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}