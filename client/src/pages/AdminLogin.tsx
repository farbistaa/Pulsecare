// AdminLogin.tsx - Updated version
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, User } from 'lucide-react';

const adminLoginSchema = z.object({
  identifier: z.string().min(1, "Please enter your username or email"),
  password: z.string().min(1, "Please enter your password"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth(); // This should work with your AuthContext
  
  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });
  
  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Important for session cookies
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Check if user has admin privileges
      if (!data.user.isAdmin) {
        toast({
          title: "Access Denied",
          description: "Admin privileges required to access this area.",
          variant: "destructive",
        });
        return;
      }
      
      // Call the login function from AuthContext
      login(data.user);
      
      toast({
        title: "Admin Login Successful",
        description: `Welcome back, ${data.user.fullName || data.user.username}!`,
      });
      
      // Navigate to admin dashboard
      setLocation('/admin-dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Admin Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: AdminLoginForm) => {
    loginMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PulseCare Admin</h1>
          <p className="text-gray-600">Administrative Access Portal</p>
        </div>
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Access the administrative dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Username or Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="identifier"
                    placeholder="Enter username or email"
                    className="pl-10"
                    {...form.register('identifier')}
                  />
                </div>
                {form.formState.errors.identifier && (
                  <p className="text-sm text-red-600">{form.formState.errors.identifier.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    className="pl-10"
                    {...form.register('password')}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need donor access?{' '}
            <button
              onClick={() => setLocation('/login')}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Donor Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}