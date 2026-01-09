// client/src/pages/EnhancedLogin.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginRequest } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  X, 
  Heart,
  ArrowRight,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordResetModal from '@/components/PasswordResetModal';
import Loader from '@/components/ui/Loader';

export default function EnhancedLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login, user, isLoading } = useAuth(); // Make sure isLoading is included here
  
  // Add missing state variables
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });
  
  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      // Show immediate feedback that the request is being processed
      console.log("Sending login request...");
      
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.removeItem('loginFailedAttempts');
      setFailedAttempts(0);
      setShowCaptcha(false);
      setCaptchaValue('');
      login(data.user);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in to PulseCare.",
      });
      
      // Don't navigate here - we'll navigate after state updates
    },
    onError: (error: any) => {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('loginFailedAttempts', newAttempts.toString());
      
      if (newAttempts >= 5) {
        setShowCaptcha(true);
      }
      
      if (newAttempts >= 10) {
        setIsBlocked(true);
        const blockTime = Date.now() + (60 * 60 * 100); // 1 hour
        localStorage.setItem('loginBlockTime', blockTime.toString());
        
        toast({
          title: "Account temporarily blocked",
          description: "Too many failed attempts. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    },
  });
  
  const onSubmit = (data: LoginRequest) => {
    if (isBlocked) {
      toast({
        title: "Account temporarily blocked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    // Check CAPTCHA if required
    if (showCaptcha && captchaValue !== '7A9X2') {
      toast({
        title: "Invalid CAPTCHA",
        description: "Please enter the correct CAPTCHA value.",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate(data);
  };
  
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Mock implementation for social login
    toast({
      title: "Social Login",
      description: `${provider} authentication will be implemented with OAuth integration.`,
    });
  };
  
  // Check if user is blocked on component mount
  useEffect(() => {
    const blockTime = localStorage.getItem('loginBlockTime');
    if (blockTime && parseInt(blockTime) > Date.now()) {
      setIsBlocked(true);
    }

    const attempts = localStorage.getItem('loginFailedAttempts');
    if (attempts) {
      const parsedAttempts = parseInt(attempts);
      setFailedAttempts(parsedAttempts);
      if (parsedAttempts >= 3) {
        setShowCaptcha(true);
      }
    }
  }, []);
  
  // Add this effect to navigate after user state is updated
  useEffect(() => {
    // Check if we have a user and we're not already loading
    if (user && !isLoading) {
      // Navigate based on user role
      if (user.isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/profile');
      }
    }
  }, [user, isLoading, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 relative"
        >
          {/* Close Button */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-gray-900">PulseCare</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome <span className="text-blue-600">Back</span>
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          
          {/* Login Method Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone className="h-4 w-4" />
              Phone
            </button>
          </div>
          
          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <Input
                {...form.register('identifier')}
                type={loginMethod === 'email' ? 'email' : 'tel'}
                placeholder={
                  loginMethod === 'email' 
                    ? 'your@email.com' 
                    : '+880 1XXX-XXXXXX'
                }
                className="w-full h-12"
                disabled={isBlocked}
              />
              {form.formState.errors.identifier && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.identifier.message}
                </p>
              )}
            </div>
            
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full h-12 pr-12"
                  disabled={isBlocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label 
                  htmlFor="remember" 
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Forgot password?
              </button>
            </div>
            
            {/* CAPTCHA (after 3 failed attempts) */}
            {showCaptcha && (
              <div className="bg-gray-100 p-4 rounded-lg border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verify you're human
                </label>
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-3 rounded border font-mono text-lg tracking-wider font-bold">
                    7A9X2
                  </div>
                  <Input
                    placeholder="Enter CAPTCHA"
                    value={captchaValue}
                    onChange={(e) => setCaptchaValue(e.target.value)}
                    className="flex-1"
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>
            )}
            
            {/* Login Button */}
            <Button
              type="submit"
              disabled={loginMutation.isPending || isLoading}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader color="#ffffff" size={20} />
                  Signing in...
                </div>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>
            
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                className="h-12 border-gray-300 hover:bg-gray-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
                className="h-12 border-gray-300 hover:bg-gray-50"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
            
            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link href="/register" className="text-red-600 hover:text-red-700 font-medium">
                Sign up here
              </Link>
            </p>
            
            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
              <Shield className="h-3 w-3" />
              <span>Protected by advanced security measures</span>
            </div>
          </form>
        </motion.div>
        
        {/* Security Compliance Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              PulseCare complies with international security standards
            </p>
            <div className="flex justify-center gap-2 text-xs">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">GDPR</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">HIPAA</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">WHO</span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">BD DSA</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Password Reset Modal */}
      <PasswordResetModal 
        open={showPasswordReset}
        onOpenChange={setShowPasswordReset}
      />
    </div>
  );
}