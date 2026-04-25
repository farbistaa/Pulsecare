// src/components/admin/Logout.tsx
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  LogOut,
  Shield,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

interface LogoutProps {
  onClose?: () => void;
  isDarkMode?: boolean;
}

const Logout = ({ onClose, isDarkMode = false }: LogoutProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoggingOut && onClose) {
        onClose();
      }
    },
    [isLoggingOut, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: 'Logged Out Successfully',
        description: 'You have been safely logged out of the system.',
      });
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'There was an issue logging out. Please try again.',
        variant: 'destructive',
      });
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoggingOut && onClose) {
      onClose();
    }
  };

  // Modern UX Glassmorphism: High opacity (90%) for readability, heavy blur for the aesthetic
  const glassCardStyles = isDarkMode
    ? "bg-slate-900/90 border border-slate-700/50 text-white"
    : "bg-white/90 border border-gray-200/50 text-slate-900";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 10000 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleBackdropClick}
      >
        {/* Soft blurred backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Glassmorphism Modal Container - Strictly Centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative w-full max-w-md"
        >
          <Card
            className={`shadow-2xl overflow-hidden ${glassCardStyles}`}
            style={{
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Close Button */}
            {onClose && (
              <button
                onClick={handleCancel}
                disabled={isLoggingOut}
                className={`absolute top-4 right-4 z-10 rounded-full p-1.5 transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <CardHeader className="text-center pb-2 pt-8 px-6">
<div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-red-600 shadow-lg shadow-red-600/30">
  <LogOut className="w-7 h-7 text-white" fill="currentColor" />
</div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Confirm Logout
              </CardTitle>
              <CardDescription className={`text-base mt-1.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Are you sure you want to log out of your admin account?
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8">
              <div className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'
              }`}>
                <div className="flex items-start space-x-3">
                  <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-800'
                    }`}>
                      Security Reminder
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-blue-300/70' : 'text-blue-600'
                    }`}>
                      Make sure to save any unsaved work before logging out.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoggingOut}
                  className={`flex-1 font-medium ${
                    isDarkMode 
                      ? 'border-slate-600 hover:bg-slate-800 text-slate-200' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>
              </div>

              {isLoggingOut && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${
                    isDarkMode ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    Please wait while we securely log you out...
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Logout;