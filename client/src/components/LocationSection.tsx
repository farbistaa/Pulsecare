import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const locationSchema = z.object({
  currentCity: z.string().min(1, "Current city is required"),
  hometown: z.string().min(1, "Hometown is required"),
});

type LocationFormData = z.infer<typeof locationSchema>;

// Bangladesh cities for validation
const BD_CITIES = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh",
  "Comilla", "Narayanganj", "Gazipur", "Tongi", "Bogra", "Jessore", "Dinajpur", "Pabna"
];

export function LocationSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: { currentCity: "", hometown: "" },
  });

  const { data: location, isLoading } = useQuery<LocationFormData>({
    queryKey: ["/api/profile/location"],
    retry: false,
    onSuccess: (data) => form.reset(data),
  });

  const updateLocationMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      return apiRequest("/api/profile/location", {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Location updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/location"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update location", variant: "destructive" });
    },
  });

  const onSubmit = (data: LocationFormData) => {
    // Validate against Bangladesh cities
    if (!BD_CITIES.some(city => city.toLowerCase() === data.currentCity.toLowerCase())) {
      toast({ title: "Invalid City", description: "Please enter a valid Bangladesh city", variant: "destructive" });
      return;
    }
    if (!BD_CITIES.some(city => city.toLowerCase() === data.hometown.toLowerCase())) {
      toast({ title: "Invalid Hometown", description: "Please enter a valid Bangladesh city", variant: "destructive" });
      return;
    }
    updateLocationMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
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
            <MapPin className="h-5 w-5" />
            Location
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">Edit</Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dhaka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hometown"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hometown</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chittagong" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={updateLocationMutation.isPending} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />Save Location
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Current City:</span> {location?.currentCity || "Not set"}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Hometown:</span> {location?.hometown || "Not set"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}