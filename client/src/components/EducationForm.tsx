import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit, Save, Trash2, GraduationCap, Calendar, MapPin, Building, Book } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

// Education validation schema
const educationSchema = z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  institutionType: z.enum(["High School", "College", "University"], {
    required_error: "Institution type is required",
  }),
  course: z.string().optional(),
  description: z.string().max(1000, "Description must not exceed 1000 characters").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isGraduated: z.boolean().default(false),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationEntry {
  id: number;
  institutionName: string;
  institutionType: string;
  course?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isGraduated: boolean;
}

export function EducationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institutionName: "",
      institutionType: "University",
      course: "",
      description: "",
      startDate: "",
      endDate: "",
      isGraduated: false,
    },
  });

  const { watch, setValue, reset } = form;
  const isGraduated = watch("isGraduated");
  const description = watch("description") || "";

  // Fetch education history
  const { data: educationHistory = [], isLoading } = useQuery<EducationEntry[]>({
    queryKey: ["/api/profile/education"],
    retry: false,
  });

  // Add education mutation
  const addEducationMutation = useMutation({
    mutationFn: async (data: EducationFormData) => {
      return apiRequest("/api/profile/education", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Education added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/education"] });
      setIsAdding(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add education",
        variant: "destructive",
      });
    },
  });

  // Update education mutation
  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EducationFormData }) => {
      return apiRequest(`/api/profile/education/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Education updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/education"] });
      setEditingId(null);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update education",
        variant: "destructive",
      });
    },
  });

  // Delete education mutation
  const deleteEducationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/profile/education/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Education deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/education"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EducationFormData) => {
    if (editingId) {
      updateEducationMutation.mutate({ id: editingId, data });
    } else {
      addEducationMutation.mutate(data);
    }
  };

  const handleEdit = (education: EducationEntry) => {
    setEditingId(education.id);
    setIsAdding(true);
    form.reset({
      institutionName: education.institutionName,
      institutionType: education.institutionType as "High School" | "College" | "University",
      course: education.course || "",
      description: education.description || "",
      startDate: education.startDate,
      endDate: education.endDate || "",
      isGraduated: education.isGraduated,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this education entry?")) {
      deleteEducationMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education History
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

  const canAddMore = educationHistory.length < 3;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education History
            <Badge variant="outline">{educationHistory.length}/3</Badge>
          </div>
          {canAddMore && !isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
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
                    {editingId ? "Edit Education" : "Add New Education"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="institutionName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., University of Dhaka" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="institutionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select institution type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="High School">High School</SelectItem>
                                  <SelectItem value="College">College</SelectItem>
                                  <SelectItem value="University">University</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="course"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course/Degree</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Bachelor of Science in Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Description ({description.length}/1000)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your achievements, activities, or other relevant details..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date {isGraduated ? "" : "(if completed)"}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  disabled={!isGraduated}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="isGraduated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (!checked) {
                                    setValue("endDate", "");
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Graduated</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Check this if you have completed this education
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={addEducationMutation.isPending || updateEducationMutation.isPending}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {editingId ? "Update Education" : "Add Education"}
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

        {/* Education List */}
        {educationHistory.length > 0 ? (
          <div className="space-y-4">
            {educationHistory.map((education, index) => (
              <motion.div
                key={education.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border border-gray-200 hover:border-red-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{education.institutionName}</h3>
                            <p className="text-green-600 font-medium">{education.course}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{education.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">
                              {education.startDate} - {education.isGraduated && education.endDate ? education.endDate : "Present"}
                            </span>
                            {education.isGraduated && (
                              <Badge variant="secondary" className="ml-2">
                                Graduated
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Book className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700 text-sm">{education.institutionType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(education)}
                          disabled={isAdding}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(education.id)}
                          disabled={deleteEducationMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No education history yet</h3>
            <p className="text-gray-500 mb-4">Add your educational background to help others learn about you</p>
            {canAddMore && !isAdding && (
              <Button onClick={() => setIsAdding(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Education
              </Button>
            )}
          </motion.div>
        )}

        {!canAddMore && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Maximum of 3 education entries reached. You can edit or delete existing entries to add new ones.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}