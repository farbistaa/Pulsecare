import { Heart, Phone, Mail, MapPin, Shield, ArrowUp, Users, Activity, Star } from 'lucide-react';
import { Link } from 'wouter';
import pulsecareLogoUrl from "../assets/PulseCareLogo.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      {/* Increased padding from py-3 to py-4 (16px to 20px) */}
      <div className="container mx-auto px-4 py-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* About Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Link href="/">
                <img 
                  src={pulsecareLogoUrl} 
                  alt="PulseCare - Blood & Donor Management System Logo" 
                  className="h-14 w-auto object-contain" 
                  loading="lazy"
                />
              </Link>
            </div>
            <h4 className="text-lg font-semibold text-white">About PulseCare</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting blood donors with recipients through intelligent matching, 
              real-time alerts, and secure communication across Bangladesh.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Shield className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>HIPAA Compliant • AES-256 Encrypted</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full text-xs">GDPR Compliant</span>
              <span className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full text-xs">HIPAA Secure</span>
              <span className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full text-xs">WHO Guidelines</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/search" 
                  className="text-gray-300 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Find Donors
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  className="text-gray-300 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Become a Donor
                </Link>
              </li>
              <li>
                <Link 
                  href="/verification" 
                  className="text-gray-300 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Verification
                </Link>
              </li>
              <li>
                <Link 
                  href="/help" 
                  className="text-gray-300 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-gray-300 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-300 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a 
                  href="https://forms.gle/2jWhM44TXW9g3g7n8"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Feedback & Support
                </a>
              </li>
            </ul>
          </div>
          
    {/* Services */}
<div className="space-y-4">
  <h4 className="text-lg font-semibold text-white">Services</h4>
  <ul className="space-y-3">
    <li>
      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-default">
        Blood Donor Registration
      </span>
    </li>
    <li>
      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-default">
        Donor Registration & Management
      </span>
    </li>
    <li>
      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-default">
        Request Blood From Nearby Donors
      </span>
    </li>
    <li>
      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-default">
        Emergency Blood Requests
      </span>
    </li>
    <li>
      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-default">
        Intelligent Donor-Recipient Matching
      </span>
    </li>
    <li>
      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-default">
        Real-Time Notifications & Alerts
      </span>
    </li>
    <li>
      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-default">
      </span>
    </li>
    <li>
      <span className="text-gray-300 hover:text-white transition-colors text-sm cursor-default">
        Verified and Professional Blood Donors
      </span>
    </li>
  </ul>
</div>

          
          {/* Contact Us */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <div className="space-y-4">
              {/* Official Phone Number */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Phone</p>
                  <a 
                    href="tel:+8801567860719"
                    className="text-sm text-gray-300 hover:text-white transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                    aria-label="Call PulseCare at +880 1567 860 719"
                  >
                    +880 1567 860 719
                  </a>
                </div>
              </div>
              
              {/* Official Email */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Email</p>
                  <a 
                    href="mailto:farbistaa@gmail.com"
                    className="text-sm text-gray-300 hover:text-white transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded break-all"
                    aria-label="Email PulseCare at farbistaa@gmail.com"
                  >
                    farbistaa@gmail.com
                  </a>
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Location</p>
                  <p className="text-sm text-gray-300">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>
            
            {/* Emergency Contact */}
            <div className="bg-blue-800 border border-blue-700 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">Emergency Hotline</p>
                  <p className="text-xs text-gray-300 mb-2">Available 24/7 for urgent blood requests</p>
                  <a 
                    href="tel:999"
                    className="text-lg font-bold text-gray-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    aria-label="Call emergency hotline 999"
                  >
                    999
                  </a>
                  <p className="text-xs text-gray-300 mt-1">(National Emergency)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright & Back to Top */}
        <div className="border-t border-blue-800 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-400 text-center md:text-left">
              <p>© 2025 PulseCare. All rights reserved.</p>
              <p className="mt-1">
                Compliant with GDPR, HIPAA & Bangladesh Digital Security Act 2018 • Following WHO Guidelines
              </p>
            </div>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 hover:bg-blue-700 text-white hover:text-gray-100 transition-colors border border-blue-700 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900"
              title="Back to Top"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;