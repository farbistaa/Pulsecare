import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginSchema, type LoginRequest } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LogIn, 
  Eye, 
  EyeOff, 
  Shield, 
  Mail, 
  Phone, 
  Loader,
  KeyRound
} from 'lucide-react';

// Schema for Forgot Password Flow
const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or Phone is required"),
});

// Schema for Reset Password with Strong Validation
const resetPasswordSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain at least one capital letter")
    .regex(/[a-z]/, "Must contain at least one small letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password Strength Calculator
const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score += 25;
  if (password.match(/[a-z]/)) score += 25;
  if (password.match(/[A-Z]/)) score += 25;
  if (password.match(/[!@#$%^&*(),.?":{}|<>]/)) score += 25;
  return score;
};

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, login, isAdmin } = useAuth();
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

  // Security States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Forgot Password Dialog States
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [resetStep, setResetStep] = useState<'identify' | 'verify'>('identify');
  const [resetToken, setResetToken] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Forms
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const forgotForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' }
  });

  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' }
  });

  // Watch password changes for strength meter
  const watchedPassword = resetForm.watch("newPassword");
  
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(watchedPassword));
  }, [watchedPassword]);

  // Redirect Logic
  useEffect(() => {
    if (isAuthenticated) {
      // We are logged in. Redirect immediately.
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Security Logic (Local Storage checks for rate limiting)
  useEffect(() => {
    const savedAttempts = localStorage.getItem('loginFailedAttempts');
    const savedBlockTime = localStorage.getItem('loginBlockTime');
    
    if (savedAttempts) {
      const attempts = parseInt(savedAttempts);
      setFailedAttempts(attempts);
      if (attempts >= 3) setShowCaptcha(true);
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

  const checkSecurity = () => {
    if (isBlocked) {
      throw new Error(`Too many attempts. Try again in ${blockTimeRemaining} seconds.`);
    }
    if (showCaptcha && captchaValue !== '7A9X2') {
      throw new Error('Invalid CAPTCHA. Please enter the code shown.');
    }
  };

  const handleAuthError = (error: any) => {
    console.error("Auth error:", error);
    let message = "Authentication failed. Please try again.";

    if (error.message) {
      message = error.message;
    }

    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);
    localStorage.setItem('loginFailedAttempts', newFailedAttempts.toString());

    if (newFailedAttempts >= 10) {
      const blockUntil = Date.now() + (60 * 60 * 1000);
      localStorage.setItem('loginBlockTime', blockUntil.toString());
      setIsBlocked(true);
      setBlockTimeRemaining(3600);
      message = "Too many failed attempts. Account locked for 1 hour.";
    } else if (newFailedAttempts >= 3) {
      setShowCaptcha(true);
    }

    toast({ title: "Authentication Failed", description: message, variant: "destructive" });
  };

  const resetSecurity = () => {
    setFailedAttempts(0);
    setShowCaptcha(false);
    setCaptchaValue('');
    localStorage.removeItem('loginFailedAttempts');
    localStorage.removeItem('loginBlockTime');
  };

  // Unified Login Handler for both Email and Phone tabs
  const handleLogin = async (data: LoginRequest) => {
    try {
      checkSecurity();
      setIsProcessing(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.user) {
        resetSecurity();
        
        login(result.user);

        toast({ 
          title: "Login Successful", 
          description: `Welcome back, ${result.user.fullName || result.user.username}!` 
        });
        
        // The useEffect hook above will handle the redirection immediately after login updates state.
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Forgot Password Logic ---

  const handleOpenForgot = () => {
    setShowForgotDialog(true);
    setResetStep('identify');
    forgotForm.reset();
    resetForm.reset();
    setPasswordStrength(0);
  };

  const handleRequestReset = async (data: { identifier: string }) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setResetToken(result.token);
        setResetStep('verify');
        toast({ 
          title: "OTP Sent", 
          description: "OTP has been sent. Please check your email (including Spam folder) or messaging app." 
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyReset = async (data: { otp: string; newPassword: string; confirmPassword: string }) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/auth/verify-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          otp: data.otp,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword
        })
      });

      const result = await res.json();

      if (res.ok) {
        toast({ title: "Success", description: "Password reset successfully. Please login." });
        setShowForgotDialog(false);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };


  return (
    <>
      {/* Custom CSS for Background Animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(80px, -120px) scale(1.2); }
          66% { transform: translate(-80px, 80px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Background Layer */}
      <div className="fixed inset-0 z-[-20] overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-0 w-full h-full filter blur-3xl">
          <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-primary/50 rounded-full animate-blob"></div>
          <div className="absolute -top-20 -left-40 w-[800px] h-[800px] bg-blue-400/50 rounded-full animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-purple-400/40 rounded-full animate-blob animation-delay-4000"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808002_1px,transparent_1px),linear-gradient(to_bottom,#80808002_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative min-h-screen flex flex-col">
        <div className="flex flex-col items-center justify-center px-4 py-8 pb-24 z-10">
          <div className="w-full max-w-md">
            
            <Card className="
              relative 
              backdrop-blur-xl 
              bg-white/40 
              border 
              border-white/20
              rounded-3xl
              shadow-2xl
              text-slate-800
              overflow-hidden
              p-6
            ">
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl"></div>
              
              <CardHeader className="text-center space-y-1 pt-0 pb-4 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-tr from-primary to-red-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <LogIn className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">Welcome Back</CardTitle>
                <p className="text-slate-600 text-sm font-medium">Sign in to your PulseCare account</p>
              </CardHeader>
              
              <CardContent className="pt-0 pb-0 relative z-10">
                {/* Security Alerts */}
                {isBlocked && (
                  <div className="bg-red-500/10 border border-red-300/30 backdrop-blur-sm rounded-xl p-3 mb-4 shadow-sm">
                    <div className="flex items-start">
                      <Shield className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-red-900 font-semibold text-xs">Account Temporarily Locked</h4>
                        <p className="text-red-800/80 text-xs mt-0.5">Try again in {formatTime(blockTimeRemaining)}.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {failedAttempts >= 3 && !isBlocked && (
                  <div className="bg-amber-500/10 border border-amber-300/30 backdrop-blur-sm rounded-xl p-3 mb-4 shadow-sm">
                    <div className="flex items-start">
                      <Shield className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-amber-900 font-semibold text-xs">Security Warning</h4>
                        <p className="text-amber-800/80 text-xs mt-0.5">
                          {failedAttempts} failed attempts. {10 - failedAttempts} remaining.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="flex justify-between w-full rounded-full bg-slate-300/70 backdrop-blur-sm p-2 h-12 mb-5 px-4">
                    <TabsTrigger 
                      value="email" 
                      className="rounded-full w-fit px-4 flex items-center justify-center gap-2 text-sm text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-white/50"
                    >
                      <Mail className="w-4 h-4" /> Email
                    </TabsTrigger>
                    <TabsTrigger 
                      value="phone" 
                      className="rounded-full w-fit px-4 flex items-center justify-center gap-2 text-sm text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-white/50"
                    >
                      <Phone className="w-4 h-4" /> Phone
                    </TabsTrigger>
                  </TabsList>

                  {/* EMAIL LOGIN TAB */}
                  <TabsContent value="email">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="identifier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Email or Username</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text" 
                                  placeholder="you@example.com" 
                                  {...field} 
                                  disabled={isProcessing || isBlocked}
                                  className="h-11 bg-white/30 border-slate-200/50 focus:bg-white/50 focus:border-primary focus:ring-primary placeholder:text-slate-400 transition-colors rounded-lg text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-red-600 text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••"
                                    {...field} 
                                    disabled={isProcessing || isBlocked}
                                    className="h-11 bg-white/30 border-slate-200/50 focus:bg-white/50 focus:border-primary focus:ring-primary placeholder:text-slate-400 transition-colors rounded-lg text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isProcessing}
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-600 text-xs" />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center justify-between pt-1">
                          <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isProcessing || isBlocked}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-slate-300 bg-white/50"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm text-slate-800">Remember me</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <span 
                            onClick={handleOpenForgot}
                            className="text-sm text-primary cursor-pointer hover:underline font-semibold transition-colors hover:text-red-700"
                          >
                            Forgot password?
                          </span>
                        </div>

                        {showCaptcha && (
                          <div className="bg-slate-100/80 backdrop-blur p-3 rounded-xl border border-slate-200/50 shadow-inner mt-2">
                            <p className="text-xs text-slate-600 mb-1.5 font-medium">Prove you are human:</p>
                            <div className="flex items-center space-x-2">
                              <div className="bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-sm tracking-widest font-bold text-primary select-none shadow-inner">
                                7A9X2
                              </div>
                              <Input
                                placeholder="Code"
                                value={captchaValue}
                                onChange={(e) => setCaptchaValue(e.target.value.toUpperCase())}
                                className="flex-1 h-9 bg-white/80 text-sm font-bold tracking-wider"
                                disabled={isProcessing}
                                maxLength={5}
                              />
                            </div>
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-primary to-red-600 text-white hover:opacity-90 shadow-lg shadow-primary/30 transition-all duration-200 h-11 mt-2 font-semibold text-sm rounded-xl"
                          disabled={isProcessing || isBlocked}
                        >
                          {isProcessing ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            <>
                              <LogIn className="w-4 h-4 mr-2" />
                              Sign In
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  {/* PHONE LOGIN TAB */}
                  <TabsContent value="phone">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="identifier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Phone Number</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel" 
                                  placeholder="01XXXXXXXXX" 
                                  {...field} 
                                  disabled={isProcessing || isBlocked}
                                  className="h-11 bg-white/30 border-slate-200/50 focus:bg-white/50 focus:border-primary focus:ring-primary placeholder:text-slate-400 transition-colors rounded-lg text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-red-600 text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••"
                                    {...field} 
                                    disabled={isProcessing || isBlocked}
                                    className="h-11 bg-white/30 border-slate-200/50 focus:bg-white/50 focus:border-primary focus:ring-primary placeholder:text-slate-400 transition-colors rounded-lg text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isProcessing}
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-600 text-xs" />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center justify-between pt-1">
                          <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isProcessing || isBlocked}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-slate-300 bg-white/50"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm text-slate-800">Remember me</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <span 
                            onClick={handleOpenForgot}
                            className="text-sm text-primary cursor-pointer hover:underline font-semibold transition-colors hover:text-red-700"
                          >
                            Forgot password?
                          </span>
                        </div>

                        {showCaptcha && (
                          <div className="bg-slate-100/80 backdrop-blur p-3 rounded-xl border border-slate-200/50 shadow-inner mt-2">
                             <p className="text-xs text-slate-600 mb-1.5 font-medium">Prove you are human:</p>
                             <div className="flex items-center space-x-2">
                               <div className="bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-sm tracking-widest font-bold text-primary select-none shadow-inner">
                                 7A9X2
                               </div>
                               <Input
                                 placeholder="Code"
                                 value={captchaValue}
                                 onChange={(e) => setCaptchaValue(e.target.value.toUpperCase())}
                                 className="flex-1 h-9 bg-white/80 text-sm font-bold tracking-wider"
                                 disabled={isProcessing}
                                 maxLength={5}
                               />
                             </div>
                           </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-primary to-red-600 text-white hover:opacity-90 shadow-lg shadow-primary/30 transition-all duration-200 h-11 mt-2 font-semibold text-sm rounded-xl"
                          disabled={isProcessing || isBlocked}
                        >
                          {isProcessing ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            <>
                              <LogIn className="w-4 h-4 mr-2" />
                              Sign In
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex flex-col items-center justify-center pt-6 relative z-10 border-t border-slate-200/50 mt-4">
                <p className="text-slate-500 text-sm">
                  Don't have an account?{' '}
                  <Link href="/register">
                    <Button variant="link" className="text-primary p-0 h-auto font-bold text-sm hover:text-red-700">
                      Register as Donor
                    </Button>
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl text-slate-800 rounded-2xl">
          <DialogHeader className="pt-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <KeyRound className="w-5 h-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {resetStep === 'identify' 
                ? "Enter your email or phone number to receive a reset code."
                : "A OTP has been sent to your registered phone and Email."
              }
            </DialogDescription>
          </DialogHeader>
          
          {resetStep === 'identify' ? (
            <Form {...forgotForm}>
              <form onSubmit={forgotForm.handleSubmit(handleRequestReset)} className="space-y-4 pb-2">
                <FormField
                  control={forgotForm.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Enter Email or Phone number" 
                          {...field} 
                          disabled={isProcessing}
                          className="bg-white/30 border-slate-200/50 focus:bg-white/50 placeholder:text-slate-400 rounded-lg h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-red-700 text-white shadow-lg shadow-primary/30 rounded-xl h-11" disabled={isProcessing}>
                  {isProcessing ? <Loader className="w-5 h-5 animate-spin mr-2" /> : null}
                  Send Reset Code
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleVerifyReset)} className="space-y-4 pb-2">
                
                <FormField
                  control={resetForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-medium">OTP Code</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="Enter 6-digit code" 
                          maxLength={6}
                          value={field.value || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            resetForm.setValue('otp', val, { shouldValidate: true });
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          disabled={isProcessing}
                          className="text-center text-xl tracking-widest bg-white/30 border-slate-200/50 focus:bg-white/50 rounded-lg h-12"
                          inputMode="numeric"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-medium">New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          disabled={isProcessing}
                          className="bg-white/30 border-slate-200/50 focus:bg-white/50 rounded-lg h-11"
                        />
                      </FormControl>
                      
                      {watchedPassword && (
                        <div className="mt-2 space-y-2">
                           <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                             <div 
                               className={`h-full transition-all duration-300 rounded-full ${getStrengthColor(passwordStrength)}`} 
                               style={{ width: `${passwordStrength}%` }}
                             />
                           </div>
                           <p className={`text-xs font-medium ${
                             passwordStrength <= 25 ? 'text-red-500' : 
                             passwordStrength <= 50 ? 'text-orange-500' : 
                             passwordStrength <= 75 ? 'text-yellow-600' : 'green-500'
                           }`}>
                             {passwordStrength <= 25 ? "Weak" : 
                              passwordStrength <= 50 ? "Fair" : 
                              passwordStrength <= 75 ? "Good" : "Strong"}
                           </p>
                        </div>
                      )}

                      <FormDescription className="text-xs text-slate-500">
                        Must contain Capital, Small letter, Special character, min 8 chars.
                      </FormDescription>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-medium">Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          disabled={isProcessing}
                          className="bg-white/30 border-slate-200/50 focus:bg-white/50 rounded-lg h-11"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-primary hover:bg-red-700 text-white shadow-lg shadow-primary/30 rounded-xl h-11" disabled={isProcessing}>
                  {isProcessing ? <Loader className="w-5 h-5 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}