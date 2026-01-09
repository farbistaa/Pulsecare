import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save, ExternalLink, Facebook, Instagram, Twitter, Github, Linkedin, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const socialLinksSchema = z.object({
  facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

const socialPlatforms = [
  { key: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { key: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600" },
  { key: "twitter", label: "Twitter", icon: Twitter, color: "text-blue-400" },
  { key: "github", label: "GitHub", icon: Github, color: "text-gray-800" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { key: "portfolio", label: "Portfolio", icon: Globe, color: "text-green-600" },
];

export function SocialLinksSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      facebook: "",
      instagram: "",
      twitter: "",
      github: "",
      linkedin: "",
      portfolio: "",
    },
  });

  const { data: socialLinks, isLoading } = useQuery<SocialLinksFormData>({
    queryKey: ["/api/profile/social-links"],
    retry: false,
    onSuccess: (data) => {
      form.reset(data);
    },
  });

  const updateSocialLinksMutation = useMutation({
    mutationFn: async (data: SocialLinksFormData) => {
      return apiRequest("/api/profile/social-links", {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social links updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/social-links"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update social links",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SocialLinksFormData) => {
    updateSocialLinksMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
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
          Social Links
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
              Edit Links
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <FormField
                    key={platform.key}
                    control={form.control}
                    name={platform.key as keyof SocialLinksFormData}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${platform.color}`} />
                          {platform.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`https://${platform.key === "portfolio" ? "yourportfolio.com" : platform.key}.com/yourprofile`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateSocialLinksMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Links
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-3">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const value = socialLinks?.[platform.key as keyof SocialLinksFormData];
              
              return (
                <motion.div
                  key={platform.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${platform.color}`} />
                    <span className="font-medium">{platform.label}</span>
                  </div>
                  {value ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      Visit
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">Not set</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}