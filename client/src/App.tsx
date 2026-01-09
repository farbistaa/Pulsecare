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
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import EnhancedLogin from "@/pages/EnhancedLogin";
import AdminLogin from "@/pages/AdminLogin";
import ProfilePage from "@/pages/ProfilePage"; // This is for viewing any user's profile
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
import Logout from "@/components/admin/Logout"; // Import Logout component

// Define types for the ProtectedRoute props
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

// Protected Route Component with proper types
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setLocation("/login");
      return;
    }

    if (adminOnly && !user.isAdmin) {
      setLocation("/");
      return;
    }
  }, [user, isLoading, adminOnly, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || (adminOnly && !user.isAdmin)) {
    return null; // Will redirect in the useEffect
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
    // Set scroll restoration to manual to prevent browser from restoring scroll position
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    
    // Scroll to top with smooth behavior
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    };
    
    // Initial scroll to top
    scrollToTop();
    
    // Add a small delay to ensure smooth scrolling works properly
    const timer = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  return null;
};

// Renamed your custom Router to AppRoutes to avoid conflict
// In your AppRoutes function, update the profile routes:
function AppRoutes() {
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  
  return (
    <Layout onEmergencyClick={() => setEmergencyModalOpen(true)}>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={EnhancedLogin} />
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
          {() => ( // Remove params from here
            <ProtectedRoute>
              <ProfilePage /> 
            </ProtectedRoute>
          )}
        </Route>
        
        <Route path="/search" component={Search} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin-dashboard" component={AdminDashboardRoute} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/verification" component={VerificationPage} />
        <Route path="/help" component={HelpCenterPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/admin/logout" component={LogoutRoute} />
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
              {/* Wrap all routes inside Wouter Router */}
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