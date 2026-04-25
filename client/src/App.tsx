// src/App.tsx
import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import EmergencyModal from "@/components/EmergencyModal";
import { useState, useEffect } from "react";

// Pages
import Home from "@/components/Home";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import ProfilePage from "@/pages/ProfilePage";
import Search from "@/pages/Search";
import Admin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import Settings from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import Analytics from "@/pages/Analytics";
import Appointments from "@/pages/Appointments";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsPage from "@/pages/terms";
import VerificationPage from './pages/verification';
import HelpCenterPage from './pages/help';
import NotFound from "@/pages/not-found";
import Logout from "@/components/admin/Logout";
import AboutUsPage from '@/pages/about-us'; 


// Define types for the ProtectedRoute props
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

// Protected Route Component with proper types
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setLocation("/login");
      return;
    }

    if (user.isAdmin && location === '/profile') {
      setLocation("/admin/dashboard");
      return;
    }

    if (adminOnly && !user.isAdmin) {
      setLocation("/");
      return;
    }
  }, [user, isLoading, adminOnly, setLocation, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
      </div>
    );
  }

  if (!user || (adminOnly && !user.isAdmin) || (user.isAdmin && location === '/profile')) {
    return null;
  }

  return <>{children}</>;
};

// Admin Dashboard Route Component
const AdminDashboardRoute: React.FC = () => (
  <ProtectedRoute adminOnly={true}>
    <AdminDashboard />
  </ProtectedRoute>
);

// Logout Route Component
const LogoutRoute: React.FC = () => (
  <ProtectedRoute adminOnly={true}>
    <Logout />
  </ProtectedRoute>
);

// Enhanced Scroll to top component
const ScrollToTop = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    };
    
    scrollToTop();
    const timer = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  return null;
};

function AppRoutes() {
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  
  return (
    <Layout onEmergencyClick={() => setEmergencyModalOpen(true)}>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about-us" component={AboutUsPage} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/admin-login" component={AdminLogin} />
        
        {/* Protected profile routes */}
        <Route path="/profile">
          {() => (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/profile/:id">
          {() => (
            <ProtectedRoute>
              <ProfilePage /> 
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/search" component={Search} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/settings" component={Settings} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/verification" component={VerificationPage} />
        <Route path="/help" component={HelpCenterPage} />
        <Route path="/terms" component={TermsPage} />

        {/* ========== ADMIN ROUTES — ALL render AdminDashboard ========== */}
        <Route path="/admin" component={Admin} />
        <Route path="/admin/dashboard" component={AdminDashboardRoute} />
        <Route path="/admin/donor-management" component={AdminDashboardRoute} />
        <Route path="/admin/inventory" component={AdminDashboardRoute} />
        <Route path="/admin/emergency-blood-request" component={AdminDashboardRoute} />
        <Route path="/admin/analytics" component={AdminDashboardRoute} />
        <Route path="/admin/appointments" component={AdminDashboardRoute} />
        <Route path="/admin/reactivation-request" component={AdminDashboardRoute} />
        <Route path="/admin/verification-request" component={AdminDashboardRoute} />
        <Route path="/admin/activity-log" component={AdminDashboardRoute} />
        <Route path="/admin/settings" component={AdminDashboardRoute} />
        <Route path="/admin/logout" component={LogoutRoute} />

        {/* Catch-all must be last */}
        <Route component={NotFound} />
      </Switch>
      <EmergencyModal
        open={emergencyModalOpen}
        onOpenChange={setEmergencyModalOpen}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="pulsecare-ui-theme">
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <WouterRouter>
                <AppRoutes />
              </WouterRouter>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}