import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  LogIn, 
  UserPlus, 
  Phone, 
  Mail, 
  MessageCircle, 
  Shield, 
  Clock, 
  MapPin,
  Heart,
  Star,
  AlertTriangle,
  CheckCircle2,
  Send,
  EyeOff
} from 'lucide-react';
import type { User } from '@shared/schema';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor?: User;
}

export default function ContactModal({ open, onOpenChange, donor }: ContactModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'message' | 'request'>('details');
  const [messageText, setMessageText] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'emergency'>('medium');
  
  // Refs for tab panel IDs
  const detailsPanelRef = useRef<HTMLDivElement>(null);
  const messagePanelRef = useRef<HTMLDivElement>(null);
  const requestPanelRef = useRef<HTMLDivElement>(null);

  // Check eligibility using comprehensive medical guidelines
  const checkDonorEligibility = (donor: User, user: User) => {
    // Basic eligibility check - age, weight, donation interval
    const age = new Date().getFullYear() - new Date(donor.dateOfBirth).getFullYear();
    if (age < 18 || age > 60 || donor.weight < 50) return false;
    
    // 120-day interval between donations per WHO guidelines
    if (donor.lastDonationDate) {
      const daysSinceLastDonation = Math.floor((Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastDonation < 120) return false;
    }
    
    return true;
  };
  
  const isEligible = donor && user ? checkDonorEligibility(donor, user) : false;
  
  // Enhanced privacy-aware state
  const [privacyAwareProfile, setPrivacyAwareProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [contactsHidden, setContactsHidden] = useState(false);
  
  // Fetch privacy-aware profile when modal opens
  useEffect(() => {
    if (open && donor && isAuthenticated) {
      fetchPrivacyAwareProfile();
    }
  }, [open, donor?.id, isAuthenticated]);
  
  const fetchPrivacyAwareProfile = async () => {
    if (!donor) return;
    
    try {
      setProfileLoading(true);
      const response = await fetch(`/api/profile/${donor.id}/privacy-aware`, {
        credentials: 'include'
      });
      if (response.ok) {
        const profile = await response.json();
        setPrivacyAwareProfile(profile);
        
        // Check if contact details are hidden
        const emailHidden = !profile.user?.email;
        const phoneHidden = !profile.user?.phone;
        setContactsHidden(emailHidden && phoneHidden);
      }
    } catch (error) {
      console.error('Error fetching privacy-aware profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { recipientId: number; content: string }) => {
      return await apiRequest('/api/messages/send', {
        method: 'POST',
        body: { receiverId: data.recipientId, message: data.content },
      });
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "The donor will receive your message notification.",
      });
      setMessageText('');
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Contact request mutation
  const contactRequestMutation = useMutation({
    mutationFn: async (data: { donorId: number; reason: string; urgency: string }) => {
      return await apiRequest('/api/contact-requests', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Contact request sent",
        description: "Your request has been logged and the donor will be notified.",
      });
      setRequestReason('');
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Failed to send request",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !donor) return;
    
    sendMessageMutation.mutate({
      recipientId: donor.id,
      content: messageText.trim(),
    });
  };
  
  const handleContactRequest = () => {
    if (!requestReason.trim() || !donor) return;
    
    contactRequestMutation.mutate({
      donorId: donor.id,
      reason: requestReason.trim(),
      urgency: urgencyLevel,
    });
  };
  
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${label} copied`,
        description: "Copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  // --- Accessibility and Tab Logic ---
  const tabs = [
    { id: 'details', label: 'Contact Details', icon: Phone },
    { id: 'message', label: 'Send Message', icon: MessageCircle },
    { id: 'request', label: 'Blood Request', icon: Heart },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let nextIndex = -1;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    setActiveTab(tabs[nextIndex].id as 'details' | 'message' | 'request');
  };
  
  if (isAuthenticated && donor) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative pr-0 sm:pr-8">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={donor.profilePicture || undefined} alt={donor.fullName} />
                  <AvatarFallback className="text-xs">{donor.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">{donor.fullName}</span>
                    {donor.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-normal">
                    {donor.bloodGroup} • {donor.district}, {donor.upazila}
                  </p>
                </div>
              </div>
              <Button 
                asChild 
                size="sm" 
                className="bg-red-600 text-white hover:bg-[#8C1007] transition-colors duration-300 w-full sm:w-auto absolute -bottom-12 right-0 sm:relative sm:bottom-auto sm:right-auto z-10"
              >
                <Link to={`/profile/${donor.id}`}>View Profile</Link>
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {/* Eligibility Banner */}
          {!isEligible && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 text-sm">Eligibility Notice</h4>
                  <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                    This donor may not be eligible to donate at this time due to recent donation history or medical guidelines.
                    Contact them to confirm current availability.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Accessible Tab Navigation with 3D Animation */}
          <div className="bg-gray-50 rounded-xl p-2 mt-16 sm:mt-6" role="tablist" aria-label="Contact options" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-3 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${tab.id}-panel`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.id as 'details' | 'message' | 'request')}
                    className={`group relative flex flex-col items-center justify-center px-4 py-4 rounded-lg font-medium text-sm transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 ${
                      isActive
                        ? 'bg-white text-red-600 shadow-lg border border-red-100 transform -translate-y-1 motion-reduce:transform-none motion-reduce:shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 transition-colors duration-200 ${
                      isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <span className="text-center">{tab.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-red-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Contact Details Tab */}
          {activeTab === 'details' && (
            <div ref={detailsPanelRef} role="tabpanel" id="details-panel" tabIndex={0} className="space-y-4 mt-6 outline-none">
              {/* Privacy Notice */}
              {contactsHidden && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-800 text-sm">Privacy Protected</h4>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        This donor has chosen to keep their contact details private. 
                        You can still reach them through our secure internal messaging system.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {/* Phone Display */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Phone</p>
                        {privacyAwareProfile?.user?.phone ? (
                          <a 
                            href={`tel:${privacyAwareProfile.user.phone}`}
                            className="font-semibold text-sm sm:text-base text-blue-600 hover:underline truncate"
                            aria-label={`Call ${donor.fullName} at ${privacyAwareProfile.user.phone}`}
                          >
                            {privacyAwareProfile.user.phone}
                          </a>
                        ) : (
                          <p className="font-semibold text-gray-400 italic text-sm">Hidden for privacy</p>
                        )}
                      </div>
                    </div>
                    {!privacyAwareProfile?.user?.phone && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 ml-2">
                        <EyeOff className="w-3 h-3" />
                        <span className="hidden sm:inline">Private</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Email Display */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Email</p>
                        {privacyAwareProfile?.user?.email ? (
                          <a 
                            href={`mailto:${privacyAwareProfile.user.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm truncate text-blue-600 hover:underline"
                            aria-label={`Send an email to ${donor.fullName} at ${privacyAwareProfile.user.email}`}
                          >
                            {privacyAwareProfile.user.email}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Hidden for privacy</p>
                        )}
                      </div>
                    </div>
                    {!privacyAwareProfile?.user?.email && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 ml-2">
                        <EyeOff className="w-3 h-3" />
                        <span className="hidden sm:inline">Private</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Secure Messaging Option */}
                  {contactsHidden && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800 font-medium">Secure Messaging</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab('message')}
                          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Send a secure message through our platform
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-gray-600">Location</p>
                    </div>
                    <p className="font-semibold text-sm sm:text-base">{donor.district}</p>
                    <p className="text-sm text-gray-600">{donor.upazila}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate" title={donor.address}>{donor.address}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-gray-600">Donation Stats</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Donations:</span>
                      <span className="font-semibold">{donor.donationCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="font-semibold">{(donor.rating || 0) / 10}</span>
                      </div>
                    </div>
                    {donor.lastDonationDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Donation:</span>
                        <span className="font-semibold text-xs">
                          {new Date(donor.lastDonationDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 text-sm">GDPR & Privacy Compliance</h4>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1">
                      Contact information is shared with your consent. All communications are logged for transparency and safety. 
                      You can request data deletion at any time through your profile settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Message Tab */}
          {activeTab === 'message' && (
            <div ref={messagePanelRef} role="tabpanel" id="message-panel" tabIndex={0} className="space-y-4 mt-6 outline-none">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Send a message to {donor.fullName}
                </label>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Hi! I need blood donation for an emergency. Could you please help?"
                  className="min-h-[120px] text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {messageText.length}/500 characters
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Message Guidelines</span>
                </div>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <li>• Be respectful and specific about your need</li>
                  <li>• Include urgency level and location details</li>
                  <li>• Donor will receive notification within 5 minutes</li>
                  <li>• All messages are monitored for safety</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Request Tab */}
          {activeTab === 'request' && (
            <div ref={requestPanelRef} role="tabpanel" id="request-panel" tabIndex={0} className="space-y-4 mt-6 outline-none">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Reason for Blood Request
                </label>
                <Textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Please describe your blood donation requirement (surgery, emergency, etc.)"
                  className="min-h-[100px] text-sm"
                  maxLength={300}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['low', 'medium', 'high', 'emergency'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={urgencyLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUrgencyLevel(level)}
                      className={`capitalize text-xs sm:text-sm ${
                        level === 'emergency' ? 'border-red-300 text-red-700' : ''
                      } ${level === 'high' ? 'border-orange-300 text-orange-700' : ''}`}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2 text-sm">Request Processing</h4>
                <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
                  <li>• Your request will be logged with timestamp</li>
                  <li>• Donor receives immediate notification</li>
                  <li>• Follow-up reminders sent if no response in 2 hours</li>
                  <li>• Request expires after 24 hours for privacy</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleContactRequest}
                  disabled={!requestReason.trim() || contactRequestMutation.isPending}
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {contactRequestMutation.isPending ? 'Sending...' : 'Send Request'}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle>Contact Donor</DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 text-sm">
              Please login to view donor contact details and make requests.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full bg-primary text-white hover:bg-red-700" onClick={() => onOpenChange(false)}>
                <LogIn className="w-4 h-4 mr-2" />
                Login to Continue
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Register New Account
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}