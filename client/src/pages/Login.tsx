// client/src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginRequest } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, Eye, EyeOff, Shield, Mail, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordResetModal from '@/components/PasswordResetModal';
import Loader from '@/components/ui/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [rememberMe, setRememberMe] = useState(false);
  const [showOptimisticUI, setShowOptimisticUI] = useState(false);
  
  // Load storagempts from localstorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem('loginFailedAttempts');
    const savedBlockTime = localStorage.getItem('loginBlockTime');
    
    if (savedAttempts) {
      const attempts = parseInt(savedAttempts);
      setFailedAttempts(attempts);
      if (attempts >= 3) {
        setShowCaptcha(true);
      }
    }
    if (savedBlockTime) {
      const blockTime = parseInt(savedBlockTime);
      const timeRemaining = blockTime - Date.now();
      if (timeRemaining > 0) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil(timeRemaining / 1000));
        
        const timer = setInterval(() => {
          const remaining = blockTime - Date.now();
          if (remaining <= 0) {
            setIsBlocked(false);
            setBlockTimeRemaining(0);
            localStorage.removeItem('loginBlockTime');
            clearInterval(timer);
          } else {
            setBlockTimeRemaining(Math.ceil(remaining / 1000));
          }
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, []);
  
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });
  
  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      if (isBlocked) {
        throw new Error(`Too many storagempts. Try again in ${blockTimeRemaining} seconds.`);
      }
      
      // Check CAPTCHA if required
      if (showCaptcha && captchaValue !== '7A9X2') {
        throw new Error('Invalid CAPTCHA');
      }
      
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: data,
      });
      return response.json();
    },
    onMutate: () => {
      // Show optimistic UI immediately
      setShowOptimisticUI(true);
    },
    onSuccess: (data) => {
      // Reset storagempts on successful login
      setFailedAttempts(0);
      setShowCaptcha(false);
      setCaptchaValue('');
      localStorage.removeItem('loginFailedAttempts');
      localStorage.removeItem('loginBlockTime');
      login(data.user);
      toast({
        title: "Login Successful",
        description: `Welcome back to PulseCare, ${data.user.name}!`,
      });
      
      // Redirect based on user role and whether it's first login
      if (data.user.isFirstLogin) {
        navigate('/verify-phone');
      } else if (data.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      setShowOptimisticUI(false);
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      localStorage.setItem('loginFailedAttempts', newFailedAttempts.toString());
      
      if (newFailedAttempts >= 10) {
        // Block for 1 hour after 10 attempts
        const blockUntil = Date.now() + (60 * 60 * 100); // 1 hour
        localStorage.setItem('loginBlockTime', blockUntil.toString());
        setIsBlocked(true);
        setBlockTimeRemaining(3600);
        
        toast({
          title: "Account Temporarily Locked",
          description: "Too many failed login attempts. Account locked for 1 hour.",
          variant: "destructive",
        });
      } else if (newFailedAttempts >= 5) {
        setShowCaptcha(true);
        toast({
          title: "Login Failed",
          description: `${error.message || "Invalid credentials"}. CAPTCHA required after 3 storagempts.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: `${error.message || "Invalid credentials"}. ${5 - newFailedAttempts} attempts remaining.`,
          variant: "destructive",
        });
      }
    },
  });
  
  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };
  
  const handleForgotPassword = () => {
    setShowPasswordReset(true);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 mt-2">Sign in to your PulseCare account</p>
          </CardHeader>
          <CardContent>
            {/* Security Status Indicators */}
            {isBlocked && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium">Account Temporarily Locked</h4>
                    <p className="text-red-700 text-sm mt-1">
                      Too many failed login attempts. Try again in {formatTime(blockTimeRemaining)}.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {failedAttempts >= 3 && !isBlocked && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-800 font-medium">Security Warning</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      {5 - failedAttempts} login attempts remaining before account lockout.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username, Email or Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter username, email or phone" 
                          {...field} 
                          disabled={showOptimisticUI}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter your password"
                            {...field} 
                            disabled={showOptimisticUI}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={showOptimisticUI}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={showOptimisticUI}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Remember me</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary p-0 h-auto"
                    onClick={handleForgotPassword}
                    disabled={showOptimisticUI}
                  >
                    Forgot password?
                  </Button>
                </div>
                {/* CAPTCHA (after 3 storagempts) */}
                {showCaptcha && (
                  <div className="bg-gray-100 p-4 rounded-lg border">
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                      Verify you're human
                    </FormLabel>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-3 rounded border font-mono text-lg tracking-wider font-bold">
                        7A9X2
                      </div>
                      <Input
                        placeholder="Enter CAPTCHA"
                        value={captchaValue}
                        onChange={(e) => setCaptchaValue(e.target.value)}
                        className="flex-1"
                        disabled={showOptimisticUI}
                      />
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary text-white hover:bg-red-700"
                  disabled={loginMutation.isPending || isBlocked || showOptimisticUI}
                >
                  {showOptimisticUI || loginMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 inline-block" />
                      Signing In...
                    </>
                  ) : isBlocked ? (
                    `Locked - Try again in ${formatTime(blockTimeRemaining)}`
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/register">
                  <Button variant="link" className="text-primary p-0 h-auto">
                    Register as Donor
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Password Reset Modal */}
        <PasswordResetModal 
          open={showPasswordReset} 
          onOpenChange={setShowPasswordReset} 
        />
      </div>
    </div>
  );
}