import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit, Save, Trash2, Briefcase, Calendar, MapPin, Building, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import Loader from 'ui/Loader';

// Work history validation schema
const workHistorySchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  city: z.string().min(1, "City/Town is required"),
  description: z.string().min(1, "Description is required").max(1000, "Description must not exceed 1000 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrentJob: z.boolean().default(false),
});

type WorkHistoryFormData = z.infer<typeof workHistorySchema>;

interface WorkHistoryEntry {
  id: number;
  company: string;
  position: string;
  city: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrentJob: boolean;
}

export function WorkHistoryForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<WorkHistoryFormData>({
    resolver: zodResolver(workHistorySchema),
    defaultValues: {
      company: "",
      position: "",
      city: "",
      description: "",
      startDate: "",
      endDate: "",
      isCurrentJob: false,
    },
  });

  const { watch, setValue, reset } = form;
  const isCurrentJob = watch("isCurrentJob");

  // Fetch work history
  const { data: workHistory = [], isLoading } = useQuery<WorkHistoryEntry[]>({
    queryKey: ["/api/profile/work-history"],
    retry: false,
  });

  // Add work history mutation
  const addWorkMutation = useMutation({
    mutationFn: async (data: WorkHistoryFormData) => {
      return apiRequest("/api/profile/work-history", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Work history added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/work-history"] });
      setIsAdding(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add work history",
        variant: "destructive",
      });
    },
  });

  // Update work history mutation
  const updateWorkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: WorkHistoryFormData }) => {
      return apiRequest(`/api/profile/work-history/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Work history updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/work-history"] });
      setEditingId(null);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update work history",
        variant: "destructive",
      });
    },
  });

  // Delete work history mutation
  const deleteWorkMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/profile/work-history/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Work history deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/work-history"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete work history",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (entry: WorkHistoryEntry) => {
    setEditingId(entry.id);
    form.reset({
      company: entry.company,
      position: entry.position,
      city: entry.city,
      description: entry.description,
      startDate: entry.startDate,
      endDate: entry.endDate || "",
      isCurrentJob: entry.isCurrentJob,
    });
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this work history entry?")) {
      deleteWorkMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    if (workHistory.length >= 3) {
      toast({
        title: "Limit Reached",
        description: "You can only add up to 3 work history entries",
        variant: "destructive",
      });
      return;
    }
    setIsAdding(true);
    setEditingId(null);
    reset();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    reset();
  };

  const onSubmit = (data: WorkHistoryFormData) => {
    if (editingId) {
      updateWorkMutation.mutate({ id: editingId, data });
    } else {
      addWorkMutation.mutate(data);
    }
  };

  // Handle current job checkbox
  const handleCurrentJobChange = (checked: boolean) => {
    setValue("isCurrentJob", checked);
    if (checked) {
      setValue("endDate", "");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Work History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Loader />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
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
            <Briefcase className="w-5 h-5" />
            Work History
            <Badge variant="secondary">{workHistory.length}/3</Badge>
          </div>
          {!isAdding && !editingId && workHistory.length < 3 && (
            <Button
              onClick={handleAddNew}
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Workspace
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing work history entries */}
        <AnimatePresence>
          {workHistory.map((entry: WorkHistoryEntry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border border-gray-200 rounded-lg hover:border-red-300 transition-colors bg-white"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{entry.company}</h3>
                        <p className="text-blue-600 font-medium">{entry.position}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{entry.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {formatDate(entry.startDate)} - {entry.isCurrentJob ? "Present" : formatDate(entry.endDate || "")}
                        </span>
                        {entry.isCurrentJob && (
                          <Badge variant="secondary" className="ml-2">
                            Current Position
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {entry.description && (
                      <p className="text-gray-700 text-sm leading-relaxed">{entry.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      disabled={editingId === entry.id}
                      className="hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteWorkMutation.isPending}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add/Edit form */}
        <AnimatePresence>
          {(isAdding || editingId) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company *</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position *</FormLabel>
                          <FormControl>
                            <Input placeholder="Job title/position" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Town *</FormLabel>
                        <FormControl>
                          <Input placeholder="City or town" {...field} />
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
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your role and responsibilities..."
                            rows={4}
                            maxLength={1000}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormMessage />
                          <span className="text-xs text-gray-500">
                            {field.value?.length || 0}/1000 characters
                          </span>
                        </div>
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
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              disabled={isCurrentJob}
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
                    name="isCurrentJob"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={handleCurrentJobChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Currently Working</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={addWorkMutation.isPending || updateWorkMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingId ? "Update" : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {workHistory.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No work history added</h3>
            <p className="mb-4">Share your professional experience with the community</p>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Workspace
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}