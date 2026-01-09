import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Save, Star, Flag, Upload, Video, Image, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Testimonial validation schema
const testimonialSchema = z.object({
  text: z.string().min(10, "Testimonial must be at least 10 characters").max(5000, "Testimonial must not exceed 5000 characters"),
  starRating: z.number().min(1, "Rating is required").max(5, "Maximum 5 stars"),
  mediaFiles: z.array(z.string()).optional(),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

interface Testimonial {
  id: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  content: string;
  mediaFiles: string[];
  isReported: boolean;
  createdAt: string;
  reviewer: {
    id: number;
    fullName: string;
    profilePicture?: string;
  };
}

export function TestimonialsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      text: "",
      starRating: 5,
      mediaFiles: [],
    },
  });

  const { watch } = form;
  const text = watch("text") || "";
  const starRating = watch("starRating");

  // Fetch testimonials (received)
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/profile/testimonials"],
    retry: false,
  });

  // Add testimonial mutation (for giving testimonials to others)
  const addTestimonialMutation = useMutation({
    mutationFn: async (data: TestimonialFormData & { revieweeId: number }) => {
      return apiRequest("/api/profile/testimonials", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Testimonial submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/testimonials"] });
      setIsAdding(false);
      form.reset();
      setUploadedFiles([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit testimonial",
        variant: "destructive",
      });
    },
  });

  // Report testimonial mutation
  const reportTestimonialMutation = useMutation({
    mutationFn: async (testimonialId: number) => {
      return apiRequest(`/api/profile/testimonials/${testimonialId}/report`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Testimonial reported. Our team will review it.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/testimonials"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to report testimonial",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
      const maxSize = 500 * 1024 * 1024; // 500MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only JPEG, PNG images and MP4 videos under 500MB are allowed",
        variant: "destructive",
      });
    }

    // Simulate file upload - in real app, upload to server
    const fakeUrls = validFiles.map(file => `/uploads/testimonials/${file.name}`);
    setUploadedFiles(prev => [...prev, ...fakeUrls]);
    form.setValue("mediaFiles", [...uploadedFiles, ...fakeUrls]);

    toast({
      title: "Files uploaded",
      description: `${validFiles.length} file(s) uploaded successfully`,
    });
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue("mediaFiles", newFiles);
  };

  const renderStars = (rating: number, interactive = false, size = "sm") => {
    const stars = [];
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${starSize} ${
            i <= rating 
              ? "text-yellow-400 fill-current" 
              : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={interactive ? () => form.setValue("starRating", i) : undefined}
        />
      );
    }
    return stars;
  };

  const onSubmit = (data: TestimonialFormData) => {
    // For demo purposes, we'll simulate adding to another user
    // In real app, this would be done from another user's profile
    const revieweeId = 1; // Demo reviewee ID
    addTestimonialMutation.mutate({ ...data, revieweeId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Testimonials
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
            <MessageSquare className="h-5 w-5" />
            Testimonials
            <Badge variant="outline">{testimonials.length}</Badge>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Write Testimonial
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Testimonial Form */}
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
                  <CardTitle className="text-lg">Write a Testimonial</CardTitle>
                  <p className="text-sm text-gray-600">Share your experience with other community members</p>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Your Testimonial ({text.length}/5000) *
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share your experience, how they helped you, or any positive feedback..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="starRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Star Rating *</FormLabel>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {renderStars(starRating, true, "lg")}
                              </div>
                              <span className="text-sm text-gray-600">({starRating}/5)</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mediaFiles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Media Files (Optional)</FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,video/mp4"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="testimonial-media"
                                  />
                                  <label
                                    htmlFor="testimonial-media"
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                                  >
                                    <Upload className="h-4 w-4" />
                                    Upload Media
                                  </label>
                                </div>
                                
                                {uploadedFiles.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {uploadedFiles.map((file, index) => (
                                      <div key={index} className="relative">
                                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                          {file.includes('.mp4') ? (
                                            <Video className="h-8 w-8 text-gray-400" />
                                          ) : (
                                            <Image className="h-8 w-8 text-gray-400" />
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeFile(index)}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              Max 500MB per file. Formats: JPEG, PNG, MP4
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={addTestimonialMutation.isPending}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Submit Testimonial
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsAdding(false);
                            form.reset();
                            setUploadedFiles([]);
                          }}
                        >
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

        {/* Testimonials List */}
        {testimonials.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Received Testimonials</h3>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`border ${testimonial.isReported ? 'border-orange-200 bg-orange-50' : 'border-gray-200'} hover:border-red-300 transition-colors`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={testimonial.reviewer?.profilePicture || ''} />
                          <AvatarFallback>
                            {testimonial.reviewer?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{testimonial.reviewer?.fullName || 'Unknown User'}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {renderStars(testimonial.rating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(testimonial.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed mb-3">
                            {testimonial.content}
                          </p>
                          
                          {testimonial.mediaFiles && testimonial.mediaFiles.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                              {testimonial.mediaFiles.map((file, fileIndex) => (
                                <div key={fileIndex} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  {file.includes('.mp4') ? (
                                    <video 
                                      src={file} 
                                      className="w-full h-full object-cover"
                                      controls
                                    />
                                  ) : (
                                    <img 
                                      src={file} 
                                      alt={`Testimonial media ${fileIndex + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {testimonial.isReported && (
                            <Badge variant="destructive" className="mb-2">
                              Reported - Under Review
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!testimonial.isReported && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                              <Flag className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Report Testimonial</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to report this testimonial? Our team will review it for inappropriate content.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => reportTestimonialMutation.mutate(testimonial.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Report
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials yet</h3>
            <p className="text-gray-500 mb-4">When others write testimonials about you, they'll appear here</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}