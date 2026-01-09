import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
import { Button } from '@/components/ui/button';
import { KeyRound, Mail, Phone, ArrowLeft } from 'lucide-react';

interface PasswordResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const requestResetSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RequestResetData = z.infer<typeof requestResetSchema>;
type VerifyOtpData = z.infer<typeof verifyOtpSchema>;

type ResetStep = 'request' | 'verify' | 'success';

export default function PasswordResetModal({ open, onOpenChange }: PasswordResetModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ResetStep>('request');
  const [resetToken, setResetToken] = useState<string>('');

  const requestForm = useForm<RequestResetData>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const verifyForm = useForm<VerifyOtpData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: RequestResetData) => {
      const response = await apiRequest('POST', '/api/auth/request-password-reset', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResetToken(data.token);
      setCurrentStep('verify');
      toast({
        title: "OTP Sent",
        description: "A 6-digit OTP has been sent to your email and phone. It will expire in 15 minutes.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      const response = await apiRequest('POST', '/api/auth/verify-password-reset', {
        ...data,
        token: resetToken,
      });
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep('success');
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully. You can now login with your new password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setCurrentStep('request');
    setResetToken('');
    requestForm.reset();
    verifyForm.reset();
    onOpenChange(false);
  };

  const onRequestSubmit = (data: RequestResetData) => {
    requestResetMutation.mutate(data);
  };

  const onVerifySubmit = (data: VerifyOtpData) => {
    verifyOtpMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center">
            <KeyRound className="w-6 h-6 mr-2" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'request' && "Enter your email or phone number to receive an OTP"}
            {currentStep === 'verify' && "Enter the OTP sent to your email/phone and set a new password"}
            {currentStep === 'success' && "Your password has been reset successfully"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'request' && (
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-6">
              <FormField
                control={requestForm.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter your email or phone number" 
                          {...field} 
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <Phone className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={requestResetMutation.isPending}
                >
                  {requestResetMutation.isPending ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === 'verify' && (
          <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-6">
              <FormField
                control={verifyForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>6-Digit OTP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 6-digit OTP" 
                        maxLength={6}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={verifyForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Enter new password (min 8 characters)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={verifyForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Confirm your new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('request')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === 'success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Password Reset Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your password has been updated successfully. You can now login with your new password.
            </p>
            <Button onClick={handleClose} className="w-full">
              Back to Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}