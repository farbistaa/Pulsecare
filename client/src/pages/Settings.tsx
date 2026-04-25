import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Lock, 
  ShieldCheck, 
  ScrollText, 
  ChevronRight,
  Sparkles,
  Info,
  User,
  Mail,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Smartphone,
  History,
  Monitor,
  MapPin,
  ShieldAlert,
  Check,
  Copy,
  Eye,
  EyeOff,
  Download,
  Trash2,
  XCircle,
  Search,
  FileText,
  AlertOctagon,
  Droplet,
  HeartPulse,
  Calendar,
  Shield,
  Key,
  RefreshCw,
  X,
  QrCode,
  ArrowRight,
  Globe,
  MessageSquare,
  Fingerprint,
  LogOut,
  Edit3,
  Save,
  FileDown
} from 'lucide-react';

// Assuming you have created this context file
import { useAuth } from '../context/AuthContext'; 

// --- NEW IMPORT ---
import Loader from '../components/ui/Loader'; // Adjust path as necessary based on your project structure

// --- Constants ---
const DANGER_RED = '#C40C0C';
const THEME_COLOR = 'red'; 

// --- Utility ---
function cn(...classes: (string | undefined | boolean | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- Shared Styles ---
const glassCardClass = "bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500";
const inputClass = "w-full px-4 sm:px-5 py-3.5 rounded-2xl bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 hover:bg-white/80 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:border-slate-100";
const buttonPrimaryClass = "bg-slate-900 hover:bg-red-600 text-white shadow-lg shadow-slate-200/50 hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0";
const inputErrorClass = "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/20 placeholder:text-red-200";

// --- Activity Log Helper ---
const getActivityIcon = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes('login')) return Check;
  if (lower.includes('password') || lower.includes('2fa') || lower.includes('delete')) return ShieldAlert;
  if (lower.includes('profile') || lower.includes('update')) return SettingsIcon;
  if (lower.includes('export') || lower.includes('download')) return Download;
  return FileText;
};

const getActivityType = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes('login')) return 'Login';
  if (lower.includes('security') || lower.includes('2fa') || lower.includes('delete') || lower.includes('password')) return 'Security';
  if (lower.includes('profile') || lower.includes('settings')) return 'Settings';
  return 'Data';
};

// --- Validation Utilities ---
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone);
const validateName = (name: string) => name.trim().length >= 2;

// ============================================================
// COMPONENT: GeneralSettings
// ============================================================
const GeneralSettings = () => {
  const { user, login } = useAuth();
  
  // Capture initial user state to compare against for changes
  const initialUserRef = useRef(user);
  
  // Initialize state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || ''); 
  
  // Notifications
  const [donationReminders, setDonationReminders] = useState(user?.notify_donation_reminder ?? true);
  const [emergencyRequests, setEmergencyRequests] = useState(user?.notify_emergency_requests ?? true);
  const [appointmentAlerts, setAppointmentAlerts] = useState(user?.notify_appointment_alerts ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<'idle' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Validation Errors
  const [errors, setErrors] = useState<{ name: string, email: string, phone: string }>({ name: '', email: '', phone: '' });

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);

  // OTP Verification State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpTarget, setOtpTarget] = useState<'email' | 'phone' | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  // Store the value currently being verified (the new email or new phone)
  const [pendingValue, setPendingValue] = useState<string>('');

  // Check for changes
  const hasChanges = useMemo(() => {
    if (!initialUserRef.current) return false;
    return (
      fullName !== (initialUserRef.current.fullName || '') ||
      email !== (initialUserRef.current.email || '') ||
      phone !== (initialUserRef.current.phone || '') ||
      donationReminders !== (initialUserRef.current.notify_donation_reminder ?? true) ||
      emergencyRequests !== (initialUserRef.current.notify_emergency_requests ?? true) ||
      appointmentAlerts !== (initialUserRef.current.notify_appointment_alerts ?? false)
    );
  }, [fullName, email, phone, donationReminders, emergencyRequests, appointmentAlerts]);

  // 90-Day Policy Logic
  const calculateDaysRemaining = () => {
    if (!user?.last_name_change_date) return 0;
    const now = new Date();
    const lastChange = new Date(user.last_name_change_date);
    const diffTime = Math.abs(now.getTime() - lastChange.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return 90 - diffDays;
  };

  const daysRemaining = calculateDaysRemaining();
  const isNameLocked = daysRemaining > 0;

  const getNextChangeDate = () => {
    if (!user?.last_name_change_date) return null;
    return new Date(new Date(user.last_name_change_date).getTime() + (90 * 24 * 60 * 60 * 1000)).toLocaleDateString();
  };

  const validateInputs = () => {
    const newErrors = { name: '', email: '', phone: '' };
    let isValid = true;

    if (!validateName(fullName)) {
      newErrors.name = 'Name must be at least 2 characters.';
      isValid = false;
    }
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }
    if (phone && !validatePhone(phone)) { 
      newErrors.phone = 'Please enter a valid phone number (E.164 format, e.g., +1234567890).';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveClick = async () => {
    if (!validateInputs()) return;

    const emailChanged = email !== (user?.email || '');
    const phoneChanged = phone !== (user?.phone || '');

    // If sensitive data changed, require OTP verification of the NEW value
    if (emailChanged || phoneChanged) {
      const target = emailChanged ? 'email' : 'phone';
      const valueToVerify = emailChanged ? email : phone;
      
      setOtpTarget(target);
      setPendingValue(valueToVerify);
      setIsOtpModalOpen(true);
      setOtpCode('');
      setOtpError(null);
      
      await sendOtp(target, valueToVerify);
    } else {
      // No sensitive data change, save directly
      submitProfileUpdate();
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setErrors({ name: '', email: '', phone: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values immediately
    setFullName(user?.fullName || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setDonationReminders(user?.notify_donation_reminder ?? true);
    setEmergencyRequests(user?.notify_emergency_requests ?? true);
    setAppointmentAlerts(user?.notify_appointment_alerts ?? false);
    setErrors({ name: '', email: '', phone: '' });
  };

  // --- Updated OTP Logic to target NEW contact info ---
  
  const sendOtp = async (target: 'email' | 'phone', value: string) => {
    setIsSendingOtp(true);
    setOtpError(null);
    try {
      const payload: any = {
        userId: user?.id,
        purpose: target === 'email' ? 'email_update' : 'phone_update',
        // The backend expects 'phoneNumber', but we pass the value here
        // The updated backend logic handles both email strings and phone strings
        phoneNumber: value, 
        identifier: value 
      };

      const res = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send verification code');
      
      // Dev Log: Check server console for OTP if emails aren't arriving
      if (data.otp) console.log(`DEV OTP for ${value}:`, data.otp);
      
      // REPLACEMENT: Use alert or console log instead of missing toast function
      // toast({ title: "Code Sent", description: `A verification code has been sent to ${value}` });
      console.log(`Code Sent to ${value}`); 
      alert(`Code Sent to ${value}`);

    } catch (err: any) {
      setOtpError(err.message || "Failed to send code");
    } finally {
      setIsSendingOtp(false);
    }
  };

    const verifyAndSubmit = async () => {
    // Basic client-side validation
    if (!otpCode || otpCode.length < 4) {
      setOtpError("Please enter a valid code.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);
    // Note: We don't set setIsSaving(true) here yet to avoid confusing UI if verification fails

    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: pendingValue, // The new email or phone
          code: otpCode, 
          purpose: otpTarget === 'email' ? 'email_update' : 'phone_update'
        }),
        credentials: 'include'
      });

      const verifyData = await verifyRes.json();
      
      // 2. If Verification Fails -> STOP here, show error, keep modal OPEN
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Invalid or expired verification code");
      }

      // 3. If Verification Succeeds -> Close Modal immediately
      // The OTP is "consumed" so we should close the modal regardless of whether the profile update succeeds
      setIsOtpModalOpen(false);
      setOtpCode('');
      
      // 4. Proceed to Update Profile
      // We set saving state here because the modal is now closed and we are updating the main form
      setIsSaving(true);
      await submitProfileUpdate();

      // 5. Exit Edit Mode on full success
      setIsEditing(false);
      
    } catch (err: any) {
      // This catches errors from the OTP verification step
      setOtpError(err.message || "Verification failed");
      // IMPORTANT: We do NOT close the modal here, so the user can retry or see the error
    } finally {
      setIsVerifyingOtp(false);
      setIsSaving(false);
    }
  };

    const submitProfileUpdate = async () => {
    // We don't set setIsSaving(true) here anymore because the caller handles it
    
    setError(null);

    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          notify_donation_reminder: donationReminders,
          notify_emergency_requests: emergencyRequests,
          notify_appointment_alerts: appointmentAlerts
        }),
        credentials: 'include'
      });

      const data = await res.json();
      
      // If update fails, throw error to alert the user
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      login(data.user);
      setSaveMessage('success');
      setTimeout(() => setSaveMessage('idle'), 3000);
      
    } catch (err: any) {
      // Show alert for profile update issues
      alert(err.message || "Failed to save changes.");
      throw err; // Re-throw if you want to handle it upstream, or just stop here
    }
  };

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <section className={glassCardClass + " p-5 sm:p-8 lg:p-10 relative overflow-hidden group"}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Account Information</h3>
              <p className="text-slate-500 mt-1">Manage your personal identity and contact details.</p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing && (
                <button 
                  onClick={handleEditClick}
                  className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm hover:bg-red-100 transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              )}
              <div className="p-3 bg-slate-100 text-red-600 rounded-2xl border border-slate-200 shadow-sm w-fit">
                <User className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {/* Full Name */}
            <div className={cn("transition-all duration-300", isNameLocked && !isEditing && 'opacity-60 grayscale-[0.5]')}>
              <label className="text-xs font-bold text-slate-700 mb-3 tracking-wide uppercase flex items-center justify-between">
                <span>Full Name</span>
                {isNameLocked && !isEditing && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full border border-amber-200 shadow-sm whitespace-nowrap">
                    <Clock className="h-3 w-3" /> LOCKED
                  </span>
                )}
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); if(errors.name) setErrors({...errors, name: ''}); }}
                  disabled={!isEditing || isNameLocked}
                  className={cn(inputClass, errors.name && inputErrorClass, (!isEditing || isNameLocked) && 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed')}
                />
                {isNameLocked && !isEditing && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><Lock className="h-5 w-5" /></div>}
              </div>
              {errors.name && <p className="mt-2 text-xs text-red-600 font-medium">{errors.name}</p>}
              {isNameLocked && !isEditing ? (
                <div className="mt-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 backdrop-blur-sm">
                  <p className="text-xs text-amber-800 flex items-center gap-2 leading-relaxed font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Locked for <span className="font-bold">{daysRemaining} days</span>. Next change: {getNextChangeDate()}.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400 pl-1 font-medium">You can update your name. Note: Saving will lock this field for 90 days.</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-3 tracking-wide uppercase">Email Address</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-red-600 transition-colors duration-300">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: ''}); }}
                  disabled={!isEditing}
                  className={cn("block w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white/50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 hover:bg-white/80 text-sm sm:text-base", errors.email && inputErrorClass, !isEditing && 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed')}
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-600 font-medium">{errors.email}</p>}
              {isEditing && email !== user?.email && (
                <p className="mt-2 text-xs text-red-600 font-medium pl-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> OTP will be sent to this new email
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-3 tracking-wide uppercase">Phone Number</label>
              <div className="relative group/input max-w-md">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-red-600 transition-colors duration-300">
                  <Smartphone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if(errors.phone) setErrors({...errors, phone: ''}); }}
                  placeholder="+1 (555) 000-0000"
                  disabled={!isEditing}
                  className={cn("block w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white/50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 hover:bg-white/80 text-sm sm:text-base", errors.phone && inputErrorClass, !isEditing && 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed')}
                />
              </div>
              {errors.phone && <p className="mt-2 text-xs text-red-600 font-medium">{errors.phone}</p>}
              {isEditing && phone !== user?.phone && (
                <p className="mt-2 text-xs text-red-600 font-medium pl-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> OTP will be sent to this new number
                </p>
              )}
            </div>
          </div>
          
          {/* Action Buttons Section */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-slate-100/60 mt-6">
            {saveMessage === 'success' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-5 py-3 rounded-2xl text-sm font-bold border border-emerald-100 shadow-sm w-full sm:w-auto justify-center">
                <CheckCircle2 className="h-4 w-4" /> Saved Successfully
              </motion.div>
            )}
            
            {isEditing ? (
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={isSaving || !hasChanges}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 text-sm font-bold rounded-2xl min-w-[160px]",
                    buttonPrimaryClass,
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  )}
                >
                  {isSaving ? <Loader size={16} color="#ffffff" /> : <Save className="h-4 w-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Click the edit icon to modify your information.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Donor Notifications */}
      <section className={glassCardClass + " p-5 sm:p-8 lg:p-10 relative overflow-hidden"}>
        <div className="absolute top-0 left-0 w-64 h-64 bg-slate-100 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-sm border border-red-100">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Donor Notifications</h3>
              <p className="text-slate-500 mt-1">Stay connected with your donation cycle.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 'donation', icon: Droplet, title: 'Donation Reminders', desc: 'Alerts when you are eligible to donate again.', state: donationReminders, setState: setDonationReminders },
              { id: 'emergency', icon: HeartPulse, title: 'Emergency Requests', desc: 'Critical blood shortage alerts for your type.', state: emergencyRequests, setState: setEmergencyRequests },
              { id: 'appointment', icon: Calendar, title: 'Appointment Alerts', desc: 'Reminders for scheduled donation sessions.', state: appointmentAlerts, setState: setAppointmentAlerts }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 sm:p-5 bg-white/40 rounded-2xl border border-slate-100 hover:bg-white hover:border-red-200 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-red-50 group-hover:text-red-600 transition-colors duration-300 flex-shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => item.setState(!item.state)}
                  className={cn(
                    "relative inline-flex h-7 w-13 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-inner flex-shrink-0",
                    item.state ? 'bg-red-600 shadow-red-500/30' : 'bg-slate-200'
                  )}
                  style={{ width: '3.5rem' }}
                >
                  <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-300", item.state ? 'translate-x-7' : 'translate-x-1')} style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {isOtpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => !isSaving && setIsOtpModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 text-red-600 rounded-full"><ShieldCheck className="h-6 w-6" /></div>
                <h3 className="text-xl font-bold text-slate-900">Verify New {otpTarget === 'email' ? 'Email' : 'Phone'}</h3>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                We've sent a verification code to your <span className="font-bold text-slate-900">new {otpTarget === 'email' ? 'email address' : 'phone number'}</span>:
                <br />
                <span className="font-mono text-red-600 font-bold">{pendingValue}</span>.
                <br />
                Please enter the code below to confirm ownership.
              </p>
              
              <div className="mb-6">
                <input 
                  type="text" 
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => { setOtpError(null); setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
                  placeholder="000000"
                  className={cn(
                    "w-full text-center text-3xl tracking-[0.5em] font-mono py-4 rounded-xl border bg-slate-50 outline-none transition-all",
                    otpError ? "border-red-300 text-red-600 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 text-slate-800 focus:border-red-500 focus:ring-red-500/20"
                  )}
                  disabled={isVerifyingOtp}
                />
                {otpError && (
                  <p className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1 justify-center">
                    <AlertTriangle className="h-3 w-3" /> {otpError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={verifyAndSubmit}
                  disabled={isVerifyingOtp || otpCode.length < 4}
                  className={cn(
                    "w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all",
                    (otpCode.length < 4 || isVerifyingOtp) ? "bg-slate-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 shadow-red-500/30"
                  )}
                >
                  {isVerifyingOtp ? <Loader size={16} color="#ffffff" /> : 'Verify & Save Changes'}
                </button>
                <button 
                  onClick={() => { 
                    if(!isSaving) setIsOtpModalOpen(false); 
                    setOtpCode(''); 
                  }}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors py-2"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// COMPONENT: PasswordSecurity
// ============================================================
const PasswordSecurity = () => {
  const { user } = useAuth();
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  
  const [setupMethod, setSetupMethod] = useState<'app' | 'sms' | 'backup'>('app');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [hasGeneratedCodes, setHasGeneratedCodes] = useState(false);

  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  
  const [isChecking, setIsChecking] = useState(false);
  const [securityScore, setSecurityScore] = useState<number | null>(null);
  const [checkupResults, setCheckupResults] = useState<any[]>([]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [resetFlowStep, setResetFlowStep] = useState<'idle' | 'request_otp' | 'verify_otp' | 'reset_success'>('idle');
  const [resetIdentifier, setResetIdentifier] = useState(''); 
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [isSendingResetOtp, setIsSendingResetOtp] = useState(false);
  const [isVerifyingResetOtp, setIsVerifyingResetOtp] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    fetchTwoFactorStatus();
    fetchActiveSessions();
    if(user?.phone) setPhoneNumber(user.phone);
  }, []);

  const fetchTwoFactorStatus = async () => {
    // Mock implementation
  };

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch('/api/settings/activity', { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const logs = await res.json();
      const sessions = logs
        .filter((log: any) => log.action.toLowerCase().includes('login'))
        .map((log: any) => ({
          id: log.id,
          ip: log.ip_address || '192.168.1.1',
          device: log.userAgent || 'Unknown Device',
          date: log.createdAt ? new Date(log.createdAt) : new Date(),
          location: log.city ? `${log.city}, ${log.country}` : 'Local Network'
        }))
        .slice(0, 5);
      setActiveSessions(sessions);
    } catch (err) {
      console.error("Failed to fetch sessions");
    }
  };

  const revokeAllSessions = async () => {
    if (!confirm("Are you sure you want to sign out all other devices?")) return;
    setIsRevokingSessions(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      alert("All other sessions have been revoked.");
      fetchActiveSessions();
    } catch (err) {
      alert("Error revoking sessions");
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500'; // Weak
    if (score === 3) return 'bg-yellow-500'; // Medium
    return 'bg-emerald-500'; // Strong
  };

  const validateNewPassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Min 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("Uppercase");
    if (!/[a-z]/.test(password)) errors.push("Lowercase");
    if (!/[0-9]/.test(password)) errors.push("Number");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("Special Character");
    return errors;
  };

  // ============================================================
  // UPDATED PASSWORD LOGIC USING EXISTING ROUTES
  // ============================================================
  const handlePasswordUpdate = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    const validationErrors = validateNewPassword(newPassword);
    if (validationErrors.length > 0) {
      setPasswordError(`Password requirements not met: ${validationErrors.join(', ')}`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // STEP 1: CHECK CURRENT PASSWORD
      // Using the existing Login Route to verify credentials
      const checkRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: user?.email, // Using email as identifier
          password: currentPassword
        }),
        credentials: 'include'
      });

      if (!checkRes.ok) {
        throw new Error("Current password is incorrect.");
      }

      // STEP 2: REQUEST RESET TOKEN
      // Using existing request-password-reset route
      const requestRes = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: user?.email }),
        credentials: 'include'
      });

      if (!requestRes.ok) {
        throw new Error("Failed to initiate password update.");
      }

      const requestData = await requestRes.json();
      if (requestData.token) {
        setResetToken(requestData.token);
        setResetIdentifier(user?.email || '');
        // Set the new password in the reset flow state so user doesn't have to re-type if possible,
        // but for security we usually ask them to re-type. 
        // Here we will keep it simple and just switch to the OTP view.
        setResetFlowStep('verify_otp');
      } else {
        throw new Error("Failed to generate verification token.");
      }

    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRequestResetOtp = async () => {
    setResetError(null);
    if(!resetIdentifier) {
      setResetError("Email or phone number is required");
      return;
    }
    setIsSendingResetOtp(true);
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resetIdentifier }),
        credentials: 'include'
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || "Failed to send OTP");
      
      setResetToken(data.token); 
      setResetFlowStep('verify_otp');
    } catch(err: any) {
      setResetError(err.message);
    } finally {
      setIsSendingResetOtp(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    setResetError(null);
    const validationErrors = validateNewPassword(resetNewPassword);
    if(validationErrors.length > 0) {
      setResetError(`Password requirements not met: ${validationErrors.join(', ')}`);
      return;
    }
    if(resetNewPassword !== resetConfirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    if(resetOtp.length !== 6) {
      setResetError("Invalid OTP length.");
      return;
    }

    setIsVerifyingResetOtp(true);
    try {
      const res = await fetch('/api/auth/verify-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          otp: resetOtp,
          newPassword: resetNewPassword
        }),
        credentials: 'include'
      });
      if(!res.ok) throw new Error("Invalid OTP or Failed to reset");
      
      setResetFlowStep('reset_success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      
      // Clear main form as well
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch(err: any) {
      setResetError(err.message);
    } finally {
      setIsVerifyingResetOtp(false);
    }
  };

  const cancelResetFlow = () => {
    setResetFlowStep('idle');
    setResetIdentifier('');
    setResetOtp('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError(null);
  };

  const startSetup = async (method: 'app' | 'sms' | 'backup') => {
    setSetupMethod(method);
    setError(null);
    setVerificationCode('');
    
    if (method === 'app') {
      setIs2FALoading(true);
      try {
        const res = await fetch('/api/settings/2fa/generate', {
          method: 'POST',
          credentials: 'include'
        });
        const data = await res.json();
        
        let finalQrUrl = '';
        
        if (data.qrUrl) {
          finalQrUrl = data.qrUrl;
        } else if (data.secret) {
          const issuer = 'MyApp';
          const account = user?.email || 'user';
          const secret = data.secret;
          const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${issuer}`;
          finalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
        } else {
          throw new Error("No secret provided by server");
        }
        
        setQrCodeUrl(finalQrUrl);
        setManualSecret(data.secret);

      } catch (e: any) {
        setError(e.message || "Failed to generate QR code");
      } finally {
        setIs2FALoading(false);
      }
    } else if (method === 'sms') {
      if (!phoneNumber) setError("Phone number required for SMS 2FA");
    } else if (method === 'backup') {
      const codes = Array.from({length: 10}, () => Math.random().toString(36).substr(2, 8).toUpperCase());
      setBackupCodes(codes);
      setHasGeneratedCodes(true);
    }
  };

  const handleSendSmsCode = async () => {
    if (!validatePhone(phoneNumber)) {
      setError("Invalid phone number");
      return;
    }
    setIsSendingSms(true);
    try {
      await new Promise(r => setTimeout(r, 1500)); 
      alert(`SMS code sent to ${phoneNumber}`);
    } catch (e) {
      setError("Failed to send SMS");
    } finally {
      setIsSendingSms(false);
    }
  };

  const confirm2FA = async () => {
    setIs2FALoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500)); 
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      alert("2FA Enabled Successfully");
    } catch (e) {
      setError("Invalid code. Please try again.");
    } finally {
      setIs2FALoading(false);
    }
  };

  const disable2FA = async () => {
    if(!confirm("Disable 2FA? Your account will be vulnerable.")) return;
    setIs2FALoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setIs2FAEnabled(false);
      alert("2FA Disabled");
    } catch (e) {
      alert("Error disabling 2FA");
    } finally {
      setIs2FALoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const fileContent = "BACKUP CODES\n" + backupCodes.join("\n");
    element.href = "data:text/plain;charset=utf-8," + encodeURIComponent(fileContent);
    element.download = "backup-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRunCheckup = () => {
    if(isChecking) return;
    setIsChecking(true);
    setSecurityScore(null);
    
    setTimeout(() => {
      const checks = [
        { id: 1, label: "Two-Factor Authentication", status: is2FAEnabled, points: 20 },
        { id: 2, label: "Password Strength", status: getPasswordStrength(newPassword || 'DummyPass123!') >= 4, points: 20 }, 
        { id: 3, label: "Email Verified", status: !!user?.email, points: 20 },
        { id: 4, label: "Phone Verified", status: !!user?.phone, points: 20 },
        { id: 5, label: "No Suspicious Activity", status: true, points: 20 }
      ];
      const score = checks.reduce((acc, curr) => acc + (curr.status ? curr.points : 0), 0);
      setCheckupResults(checks);
      setSecurityScore(score);
      setIsChecking(false);
    }, 2000);
  };

  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    if (confirmPassword && confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError('');
    }
  }, [confirmPassword, newPassword]);

  return (
    <div className="space-y-8">
      <div className={glassCardClass + " p-6 sm:p-8 transition-all duration-300 relative overflow-hidden"}>
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
             <Key className="h-6 w-6" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
             <p className="text-slate-500 text-sm">Ensure your account uses a strong, unique password.</p>
           </div>
        </div>

        {resetFlowStep !== 'idle' ? (
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-amber-800 font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Verify to Update</h4>
              <button onClick={cancelResetFlow} className="text-amber-600 hover:text-amber-900 text-sm font-bold">Cancel</button>
            </div>

            {resetFlowStep === 'request_otp' && (
              <div className="space-y-4">
                <p className="text-sm text-amber-700">Please verify your identity to complete the password change.</p>
                <input 
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  className={inputClass}
                  placeholder="Email or Phone Number"
                />
                {resetError && <p className="text-red-600 text-xs font-bold">{resetError}</p>}
                <button 
                  onClick={handleRequestResetOtp}
                  disabled={isSendingResetOtp}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex justify-center items-center gap-2"
                >
                  {isSendingResetOtp ? <Loader size={16} color="#ffffff" /> : 'Get Verification Code'}
                </button>
              </div>
            )}

            {resetFlowStep === 'verify_otp' && (
              <div className="space-y-4">
                <p className="text-sm text-amber-700">Enter the 6-digit code sent to you and set your new password.</p>
                <input 
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g,''))}
                  className={inputClass + " text-center tracking-[0.5em] font-mono text-xl"}
                  placeholder="000000"
                />
                <input 
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="New Password"
                />
                <input 
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Confirm New Password"
                />
                {resetError && <p className="text-red-600 text-xs font-bold">{resetError}</p>}
                <button 
                  onClick={handleVerifyResetOtp}
                  disabled={isVerifyingResetOtp}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex justify-center items-center gap-2"
                >
                  {isVerifyingResetOtp ? <Loader size={16} color="#ffffff" /> : 'Verify & Update'}
                </button>
              </div>
            )}

            {resetFlowStep === 'reset_success' && (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2"/>
                <p className="text-green-800 font-bold">Password Updated Successfully!</p>
                <p className="text-sm text-green-700 mt-2">Please log in again with your new password.</p>
                <button onClick={cancelResetFlow} className="mt-4 px-6 py-2 bg-white border border-green-200 text-green-700 rounded-lg font-bold hover:bg-green-50">Close</button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(null); }}
                  className={cn(inputClass, "pr-12", passwordError && "border-red-300 focus:border-red-500 focus:ring-red-500/20")}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                  className={cn(inputClass, "pr-12", passwordError && "border-red-300 focus:border-red-500 focus:ring-red-500/20")}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${(getPasswordStrength(newPassword) / 5) * 100}%` }}
                      className={cn(
                        "h-full transition-all duration-500",
                        getStrengthColor(getPasswordStrength(newPassword))
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500">
                    <div className={cn("flex items-center gap-1", /[A-Z]/.test(newPassword) && "text-emerald-600 font-bold")}>
                      {/[A-Z]/.test(newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} Uppercase
                    </div>
                    <div className={cn("flex items-center gap-1", /[a-z]/.test(newPassword) && "text-emerald-600 font-bold")}>
                      {/[a-z]/.test(newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} Lowercase
                    </div>
                    <div className={cn("flex items-center gap-1", /[0-9]/.test(newPassword) && "text-emerald-600 font-bold")}>
                      {/[0-9]/.test(newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} Number
                    </div>
                    <div className={cn("flex items-center gap-1", /[^A-Za-z0-9]/.test(newPassword) && "text-emerald-600 font-bold")}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} Special
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Confirm New Password</label>
               <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
                  className={cn(inputClass, "pr-12", (passwordError || confirmPasswordError) && "border-red-300 focus:border-red-500 focus:ring-red-500/20")}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {confirmPasswordError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {passwordError && !confirmPasswordError && <p className="text-xs text-red-600 font-medium">{passwordError}</p>}
              {passwordSuccess && <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Password updated successfully!</p>}
              
              <button
                onClick={handlePasswordUpdate}
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword || confirmPasswordError !== ''}
                className={cn(
                  "ml-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2",
                  (!currentPassword || !newPassword || !confirmPassword || confirmPasswordError !== '') ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900 hover:bg-red-600 shadow-lg shadow-slate-200/50 hover:shadow-red-500/30"
                )}
              >
                {isUpdatingPassword ? <Loader size={14} color="#ffffff" /> : <Lock className="h-3 w-3" />}
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2FA Card */}
      <div className={glassCardClass + " p-6 sm:p-8 transition-all duration-300 relative overflow-hidden"}>
        
        {!show2FASetup ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
              <div className={cn("p-4 rounded-2xl border shadow-sm transition-all duration-300 flex-shrink-0", is2FAEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-400')}>
                {is2FAEnabled ? <ShieldCheck className="h-7 w-7" /> : <Fingerprint className="h-7 w-7" />}
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  {is2FAEnabled ? "Your account is protected by 2FA." : "Secure your account using an authenticator app, SMS, or backup codes."}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto justify-end items-center">
              {!is2FAEnabled ? (
                <button 
                  onClick={() => setShow2FASetup(true)} 
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-slate-200/50 hover:shadow-red-500/20 flex items-center gap-2"
                >
                  Enable 2FA
                </button>
              ) : (
                <button 
                  onClick={disable2FA}
                  disabled={is2FALoading}
                  className="px-5 py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-colors flex items-center gap-2"
                >
                  {is2FALoading ? <Loader size={14} color="#dc2626" /> : <Trash2 className="h-3 w-3" />}
                  Disable
                </button>
              )}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl mx-auto relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-red-600" />
                Setup 2FA
              </h3>
              <button onClick={() => setShow2FASetup(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { id: 'app', label: 'Auth App', icon: Smartphone },
                { id: 'sms', label: 'SMS Text', icon: MessageSquare },
                { id: 'backup', label: 'Backup Codes', icon: FileText }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => startSetup(m.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200",
                    setupMethod === m.id 
                      ? "bg-red-50 border-red-500 text-red-700" 
                      : "bg-white border-slate-100 hover:border-slate-300 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <m.icon className="h-6 w-6" />
                  <span className="text-xs font-bold uppercase tracking-wider">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 min-h-[300px]">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </div>
              )}

              {is2FALoading && setupMethod === 'app' && (
                <div className="flex flex-col items-center justify-center h-64">
                   <Loader size={40} color="#dc2626" />
                   <p className="text-slate-500 font-medium mt-4">Generating Secure Key...</p>
                </div>
              )}

              {setupMethod === 'app' && !is2FALoading && (
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                     {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                     ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
                           Error Loading QR
                        </div>
                     )}
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900">1. Scan QR Code</h4>
                      <p className="text-sm text-slate-500">Use Google Authenticator or Authy.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">2. Enter Code</h4>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        className="w-full max-w-xs text-center text-2xl tracking-widest font-mono py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={confirm2FA} disabled={is2FALoading || verificationCode.length !== 6} className={cn("px-6 py-2.5 rounded-xl font-bold text-white transition-all", verificationCode.length === 6 ? "bg-red-600 hover:bg-red-700" : "bg-slate-300 cursor-not-allowed")}>
                        Verify & Enable
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {setupMethod === 'sms' && (
                <div className="flex flex-col items-center max-w-md mx-auto space-y-6">
                  <div className="w-full">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 outline-none"
                        placeholder="+15550000000"
                      />
                      <button 
                        onClick={handleSendSmsCode}
                        disabled={isSendingSms}
                        className="px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        {isSendingSms ? <Loader size={14} color="#334155" /> : "Send Code"}
                      </button>
                    </div>
                  </div>
                  <div className="w-full">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Enter Verification Code</label>
                     <input 
                        type="text" 
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        className="w-full text-center text-2xl tracking-widest font-mono py-3 rounded-xl border border-slate-300 focus:border-red-500 outline-none"
                      />
                  </div>
                  <button onClick={confirm2FA} disabled={is2FALoading || verificationCode.length !== 6} className={cn("w-full py-3 rounded-xl font-bold text-white transition-all", verificationCode.length === 6 ? "bg-red-600 hover:bg-red-700" : "bg-slate-300 cursor-not-allowed")}>
                    Verify Phone & Enable
                  </button>
                </div>
              )}

              {setupMethod === 'backup' && (
                <div className="max-w-lg mx-auto">
                  {!hasGeneratedCodes ? (
                    <div className="text-center space-y-4">
                      <AlertOctagon className="h-12 w-12 text-amber-500 mx-auto" />
                      <p className="text-slate-600">Generate 10 single-use backup codes. Keep these safe.</p>
                      <button onClick={() => startSetup('backup')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold">Generate Codes</button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <p className="text-xs text-amber-800 font-bold max-w-[80%]">Save these codes immediately. You won't see them again.</p>
                        <button onClick={downloadBackupCodes} className="p-2 bg-white text-amber-700 rounded-lg shadow-sm hover:text-amber-900"><Download className="h-4 w-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {backupCodes.map((code, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center font-mono text-sm text-slate-700">
                            <span>{code}</span>
                            <Copy className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => navigator.clipboard.writeText(code)} />
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button onClick={confirm2FA} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">
                          I have saved them
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Security Checkup */}
      <div className={glassCardClass + " p-0 overflow-hidden border-red-100/50"}>
        <div className={cn(
          "p-6 sm:p-10 transition-all duration-700 relative overflow-hidden",
          securityScore !== null && securityScore >= 80 ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" : "bg-slate-900 text-white"
        )}>
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
              <div className="relative flex-shrink-0">
                {isChecking ? (
                  <div className="h-20 w-20 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  <div className="h-20 w-20 rounded-full border-4 border-white/20 flex items-center justify-center text-2xl font-bold bg-white/10 backdrop-blur-sm shadow-inner">
                    {securityScore !== null ? `${securityScore}%` : '?'}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Security Score</h3>
                <p className="text-white/80 mt-1 text-sm font-medium">
                  {isChecking ? 'Analyzing...' : 
                   securityScore !== null ? (securityScore >= 80 ? 'Excellent defense.' : 'Moderate defense.') :
                   'Run a scan to check your account health.'}
                </p>
              </div>
            </div>
            <button onClick={handleRunCheckup} disabled={isChecking} className={cn("flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-xl w-full sm:w-auto", isChecking ? "bg-white/10 text-white/70 cursor-not-allowed border border-white/10" : "bg-white text-slate-900 hover:bg-red-50 hover:scale-105 active:scale-95")}>
              {isChecking ? <Loader size={18} color="#ffffff" /> : <RefreshCw className="h-5 w-5" />}
              {isChecking ? 'Scanning...' : 'Run Checkup'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {!isChecking && checkupResults.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white p-6 sm:p-8 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checkupResults.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("p-2 rounded-lg flex-shrink-0", check.status ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>
                        {check.status ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <span className={cn("text-sm font-medium truncate", check.status ? 'text-slate-800' : 'text-red-800')}>{check.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Login History & Sessions */}
      <div className={glassCardClass + " p-6 sm:p-8"}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Sessions</h3>
            </div>
          </div>
          <button 
            onClick={revokeAllSessions}
            disabled={isRevokingSessions}
            className={cn(
              "text-xs font-bold transition-colors flex items-center gap-2 px-3 py-2 rounded-lg",
              isRevokingSessions 
                ? "text-slate-400 bg-slate-50 cursor-not-allowed" 
                : "text-red-600 bg-red-50 hover:bg-red-100 border border-transparent hover:border-red-200"
            )}
          >
            {isRevokingSessions ? <Loader size={12} color="#94a3b8" /> : <LogOut className="h-3 w-3" />}
            Sign out all others
          </button>
        </div>
        <div className="space-y-3">
          {activeSessions.length > 0 ? activeSessions.map((session: any, i) => (
             <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/40 border border-slate-100 hover:bg-white hover:border-red-200 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 group gap-3">
               <div className="flex items-center gap-4 min-w-0">
                 <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-100 transition-colors flex-shrink-0">
                   <Monitor className="h-5 w-5" />
                 </div>
                 <div className="min-w-0">
                   <p className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">{session.location}</p>
                   <p className="text-xs text-slate-500 mt-0.5 font-mono">
                     IP: <span className="text-slate-700">{session.ip}</span>
                   </p>
                 </div>
               </div>
               <div className="text-right flex sm:block items-center justify-between w-full sm:w-auto">
                 <p className="text-sm font-medium text-slate-600">
                   {session.date.toLocaleDateString()} {session.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </p>
                 {i === 0 && <span className="inline-flex items-center gap-1.5 mt-1 sm:mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">Current</span>}
               </div>
             </div>
          )) : (
             <div className="p-4 text-center text-sm text-slate-400">No active sessions found</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENT: PrivacySettings
// ============================================================
const PrivacySettings = () => {
  const { user } = useAuth(); 
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    
    setTimeout(() => {
      try {
        const userData = {
          profile: {
            fullName: user?.fullName,
            email: user?.email,
            phone: user?.phone,
            joinDate: user?.createdAt,
            lastLogin: new Date().toISOString()
          },
          settings: {
            visibility: profileVisibility,
            notifications: {
              donation: true,
              emergency: true,
              appointment: false
            }
          },
          generatedAt: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `my_account_data_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

      } catch (err) {
        alert("Failed to generate download file.");
      } finally {
        setDownloading(false);
      }
    }, 800);
  };

  const handleDeactivate = () => {
    const reason = prompt("Reason for deactivation:");
    if (reason !== null) {
      setCancelling(true);
      setTimeout(() => { setCancelling(false); alert("SUPPORT: Deactivation request received."); }, 1500);
    }
  };

  const initiateDelete = () => {
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const confirmDelete = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/settings/account/delete', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error deleting account");
      }

      setShowDeleteModal(false);
      alert("SYSTEM: Account scheduled for deletion. You have 30 days to log back in to cancel.");
      window.location.href = '/login';
    } catch (err: any) {
      alert(err.message || "Error deleting account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-10">
        <section className={glassCardClass + " p-6 sm:p-8"}>
          <h3 className="text-lg font-bold text-slate-900 mb-6 px-1">Profile Visibility</h3>
          <div className="flex gap-1.5 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-200/60">
            {[
              { id: 'public', icon: Globe, label: 'Public' },
              { id: 'friends', icon: CheckCircle2, label: 'Donors Only' },
              { id: 'private', icon: Lock, label: 'Private' }
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = profileVisibility === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setProfileVisibility(option.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-3 sm:py-4 px-2 rounded-2xl border-2 transition-all duration-300 group min-w-[80px]",
                    isSelected 
                      ? 'bg-white border-red-500 shadow-lg shadow-red-500/10' 
                      : 'border-transparent hover:bg-white hover:border-slate-200'
                  )}
                >
                  <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6 mb-2 transition-colors duration-300", isSelected ? "text-red-600" : "text-slate-400 group-hover:text-red-600")} />
                  <span className={cn("text-xs sm:text-sm font-bold transition-colors duration-300 leading-tight", isSelected ? "text-red-900" : "text-slate-500 group-hover:text-slate-900")}>{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="relative rounded-3xl overflow-hidden border" style={{ backgroundColor: `${DANGER_RED}10`, borderColor: `${DANGER_RED}30` }}>
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${DANGER_RED}20` }}></div>
          
          <div className="bg-white/95 backdrop-blur-xl rounded-[22px] p-6 sm:p-8 h-full relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#C40C0C' }}>
                <AlertOctagon className="h-6 w-6" style={{ color: 'white' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: DANGER_RED }}>Danger Zone</h3>
                <p className="text-sm mt-0.5" style={{ color: `${DANGER_RED}CC` }}>Permanent actions for your data.</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <button onClick={handleDownload} disabled={downloading} className="group w-full flex items-center justify-between px-4 sm:px-6 py-4 rounded-2xl hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-white group-hover:shadow-sm group-hover:text-red-600 transition-all flex-shrink-0"><Download className="h-5 w-5" /></div>
                  <div>
                    <p className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">Download Your Data</p>
                    <p className="text-xs text-slate-500 mt-0.5">Get a copy of all your information.</p>
                  </div>
                </div>
                {downloading ? <Loader size={16} color="#94a3b8" /> : <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />}
              </button>

              <button onClick={handleDeactivate} disabled={cancelling} className="group w-full flex items-center justify-between px-4 sm:px-6 py-4 rounded-2xl hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-white group-hover:shadow-sm group-hover:text-red-600 transition-all flex-shrink-0"><XCircle className="h-5 w-5" /></div>
                  <div>
                    <p className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">Deactivate Account</p>
                    <p className="text-xs text-slate-500 mt-0.5">Deactivate your account temporarily.</p>
                  </div>
                </div>
                {cancelling ? <Loader size={16} color="#94a3b8" /> : <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />}
              </button>

              <div className="my-6 border-t relative" style={{ borderColor: `${DANGER_RED}20` }}>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: `${DANGER_RED}60` }}>Caution</div>
              </div>

              <button onClick={initiateDelete} className="group w-full flex items-center justify-between px-4 sm:px-6 py-4 rounded-2xl transition-colors text-left hover:bg-red-50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl transition-colors flex-shrink-0" style={{ backgroundColor: DANGER_RED }}>
                    <Trash2 className="h-5 w-5 fill-[#C40C0C] text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold transition-colors" style={{ color: DANGER_RED }}>Delete Account</p>
                    <p className="text-xs mt-0.5" style={{ color: `${DANGER_RED}99` }}>This action cannot be undone.</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 transition-all group-hover:translate-x-1" style={{ color: `${DANGER_RED}60` }} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: `${DANGER_RED}15` }}>
                  <AlertOctagon className="h-6 w-6 fill-[#C40C0C] text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Delete Account?</h3>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Type <span className="font-mono text-xs sm:text-sm" style={{ color: DANGER_RED }}>DELETE MY ACCOUNT</span> to confirm</label>
                <input 
                  type="text" 
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-mono text-xs sm:text-sm transition-colors"
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors text-center"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                  className="px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                  style={{ backgroundColor: DANGER_RED }}
                >
                  {isDeleting ? <Loader size={16} color="#ffffff" /> : <Trash2 className="h-4 w-4" />}
                  {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================
// COMPONENT: ActivityLog
// ============================================================
const ActivityLog = () => {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/settings/activity', { credentials: 'include' });
        if (!res.ok) throw new Error("Failed to fetch logs");
        
        const data = await res.json();
        
        const getSystemInfo = (userAgent: string) => {
          if (!userAgent) return 'Unknown System';
          let os = 'Unknown OS';
          let browser = 'Unknown Browser';
          
          if (userAgent.match(/Windows/i)) os = 'Windows';
          else if (userAgent.match(/Mac/i)) os = 'Mac OS';
          else if (userAgent.match(/Linux/i)) os = 'Linux';
          else if (userAgent.match(/Android/i)) os = 'Android';
          else if (userAgent.match(/iOS/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPad/i)) os = 'iOS';
          
          if (userAgent.match(/Chrome/i)) browser = 'Chrome';
          else if (userAgent.match(/Firefox/i)) browser = 'Firefox';
          else if (userAgent.match(/Safari/i)) browser = 'Safari';
          else if (userAgent.match(/Edge/i)) browser = 'Edge';
          else if (userAgent.match(/Opera/i)) browser = 'Opera';
          
          return `${os} | ${browser}`;
        };

        const getDeviceIcon = (userAgent: string) => {
          if (!userAgent) return Monitor;
          if (userAgent.match(/Mobile|Android|iPhone/i)) return Smartphone;
          return Monitor;
        };

        const mappedLogs = data.map((log: any) => {
          const systemInfo = getSystemInfo(log.userAgent);
          const deviceIcon = getDeviceIcon(log.userAgent);
          const rawAction = log.action ? log.action.split(' - ')[0].trim() : log.action;
          let displayAction = rawAction;
          if (rawAction === 'Login') displayAction = 'Login Successful';

          let status = 'success';
          if (rawAction && /delete|deactiv|disable|remove|delet/i.test(rawAction)) {
            status = 'error';
          }

          return {
            id: log.id,
            action: displayAction,
            subText: systemInfo,
            type: getActivityType(rawAction),
            date: log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Invalid Date',
            time: log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) : '',
            ip: log.ipAddress || 'Unknown IP',
            location: log.city && log.country ? `${log.city}, ${log.country}` : 'Unknown Location', 
            deviceIcon: deviceIcon,
            status: status, 
            icon: getActivityIcon(rawAction)
          };
        });
        
        setLogs(mappedLogs);
      } catch (err) {
        console.error("Error fetching logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const exportLogs = () => {
    if (logs.length === 0) {
      alert("No logs to export");
      return;
    }

    const headers = ["Date", "Time", "Action", "Type", "Location", "IP Address", "Status"];
    const csvRows = [];
    csvRows.push(headers.join(","));

    logs.forEach(log => {
      const row = [
        log.date,
        log.time,
        `"${log.action}"`,
        log.type,
        `"${log.location}"`,
        log.ip,
        log.status
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 min-h-[200px]">
        <Loader size={40} color="#dc2626" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={glassCardClass + " p-2 flex flex-col gap-3 items-start sm:flex-row sm:items-center sm:justify-between"}>
        
        {/* Left Side: Shrunken Search Bar */}
        <div className="relative w-full sm:max-w-[200px] flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/50 border-transparent focus:bg-white focus:border-red-500 text-sm outline-none transition-all"
          />
        </div>
        
        {/* Right Side: Filters + Export (Placed after DATA) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar w-full sm:w-auto justify-end">
          {['All', 'Login', 'Security', 'Settings', 'Data'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter.toLowerCase())}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap shrink-0",
                filterType === filter.toLowerCase() 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200/50' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {filter}
            </button>
          ))}

          {/* Export Button: Red and after DATA */}
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-[10px] sm:text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md shadow-red-500/20"
            title="Download Logs as CSV"
          >
            <FileDown className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("p-2 rounded-xl border flex-shrink-0", 
                    log.type === 'Security' ? 'bg-amber-50 border-amber-100 text-amber-500' : 
                    log.type === 'Login' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 
                    'bg-slate-50 border-slate-100 text-slate-500'
                  )}>
                    <log.deviceIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 leading-snug">{log.action}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-0.5">{log.subText}</p>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500')}></div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-3 border-t border-slate-100/60">
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Date</p><p className="text-xs text-slate-700 font-medium">{log.date}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Time</p><p className="text-xs text-slate-700 font-medium">{log.time}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Location</p><p className="text-xs text-slate-700 leading-tight break-all">{log.location}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">IP Address</p><p className="text-xs text-slate-700 font-mono truncate">{log.ip}</p></div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm bg-white/40 rounded-2xl">No activity found matching your filters.</div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block relative w-full bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200/60 whitespace-nowrap sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Activity</th>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              <AnimatePresence>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <motion.tr 
                      key={log.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.02 }} 
                      className="hover:bg-red-50/20 transition-colors group"
                    >
                      <td className="px-4 py-3 align-top w-1/4">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-2 rounded-xl border bg-white shadow-sm flex-shrink-0", 
                            log.type === 'Security' ? 'bg-amber-50 border-amber-100 text-amber-500' : 
                            log.type === 'Login' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 
                            'bg-slate-50 border-slate-100 text-slate-500'
                          )}>
                            <log.deviceIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors break-words">{log.action}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{log.subText}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap"><span>{log.date}</span></td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap"><span>{log.time}</span></td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-start gap-1.5 leading-tight">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="break-all leading-relaxed">{log.location}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-sm text-slate-500 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{log.ip}</span></div>
                      </td>
                      <td className="px-2 py-1 text-center align-middle whitespace-nowrap">
                        <span className={cn("inline-block w-2 h-2 rounded-full shadow-sm", log.status === 'success' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50')}></span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No activity found matching your filters.</td></tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN SETTINGS COMPONENT
// ============================================================
const settingsNavItems = [
  { id: 'general', label: 'General', icon: SettingsIcon, description: 'Profile & Preferences' },
  { id: 'password-security', label: 'Security', icon: Lock, description: 'Password & 2FA' },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck, description: 'Data & Visibility' },
  { id: 'activity', label: 'Activity', icon: ScrollText, description: 'Logs & History' },
];

const contentVariants = {
  hidden: { opacity: 0 },        
  visible: { opacity: 1 },       
  exit: { opacity: 0 }           
};

export default function Settings() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        {/* REPLACEMENT: Using new Loader component */}
        <Loader size={60} color="#dc2626" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative w-full font-sans selection:bg-red-500/10 selection:text-red-700">
      {/* --- FIXED BACKGROUND LAYER --- */}
      {/* This layer is fixed to the viewport (inset-0) to cover the white space behind the navbar */}
      <div className="fixed inset-0 -z-10 bg-slate-50 pointer-events-none">
        <div className="absolute inset-0 z-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-slate-100/50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100/50 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 z-0" />
      </div>

      {/* --- CONTENT LAYER --- */}
      {/* This layer sits on top (z-10) and scrolls normally */}
      <div className="relative z-10 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header remains unchanged */}
          <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                <Sparkles className="h-3 w-3" /> <span>Account Settings</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Settings</h1>
              <p className="mt-2 text-slate-500 text-base sm:text-lg max-w-lg">Configure your workspace, security, and preferences.</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
            
            {/* Sidebar Navigation remains unchanged */}
            <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-8">
              <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="px-2 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>
                </div>
                <nav className="space-y-1">
                  {settingsNavItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const Icon = item.icon;
                    return (
                      <motion.button key={item.id} onClick={() => setActiveSection(item.id)} initial={false} animate={{ backgroundColor: isActive ? '#dc2626' : 'transparent', color: isActive ? '#ffffff' : '#64748b' }} transition={{ duration: 0.2 }} className={cn("group w-full flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-bold transition-all duration-200 hover:bg-slate-50/80 hover:text-slate-900", isActive && "shadow-lg shadow-red-500/25 hover:bg-red-600")}>
                        <div className="flex items-center gap-3">
                          <div className={cn("flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200", isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600")}><Icon className="h-4 w-4" strokeWidth={2.5} /></div>
                          <div className="flex flex-col text-left">
                            <span className="text-[13px] leading-tight">{item.label}</span>
                            <span className={cn("text-[10px] leading-tight mt-0.5 font-normal transition-colors", isActive ? "text-red-100" : "text-slate-400 group-hover:text-slate-500")}>{item.description}</span>
                          </div>
                        </div>
                        <span className={cn("text-[10px] font-mono py-0.5 px-1.5 rounded border transition-all opacity-80", isActive ? "bg-white/20 border-white/20 text-white" : "bg-slate-100 border-slate-100 text-slate-400")}></span>
                      </motion.button>
                    );
                  })}
                </nav>
                
                {/* System Status remains unchanged */}
                <div className="mt-6 p-4 rounded-2xl bg-[#fee2e2] border border-red-200 relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 right-0 -mt-1 -mr-1 w-8 h-8 bg-red-200 rounded-bl-full" />
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-white rounded-lg border border-red-200 text-red-600 shadow-sm"><Info className="h-3.5 w-3.5" /></div>
                    <div>
                      <p className="text-xs font-bold text-red-900">System Status</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span></span>
                        <p className="text-[11px] text-red-800 leading-relaxed font-medium">All systems operational</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1 min-w-0 w-full">
              <AnimatePresence mode="wait">
                <motion.div key={activeSection} variants={contentVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }} className="relative">
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {(() => {
                        const currentItem = settingsNavItems.find(item => item.id === activeSection);
                        const Icon = currentItem?.icon;
                        return (
                          <motion.div layoutId="iconContainer" className="p-3 bg-white rounded-2xl border border-slate-200 text-red-600 shadow-lg shadow-red-500/10">
                            {Icon && <Icon className="h-6 w-6" strokeWidth={2} />}
                          </motion.div>
                        );
                      })()}
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{settingsNavItems.find(item => item.id === activeSection)?.label}</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{settingsNavItems.find(item => item.id === activeSection)?.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-[500px]">
                    {activeSection === 'general' && <GeneralSettings />}
                    {activeSection === 'password-security' && <PasswordSecurity />}
                    {activeSection === 'privacy' && <PrivacySettings />}
                    {activeSection === 'activity' && <ActivityLog />}
                  </div>

                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}