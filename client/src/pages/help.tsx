import { useState, useEffect } from 'react';
import { 
  HelpCircle, Search, Mail, Phone, MessageSquare, BookOpen, 
  Users, Heart, Shield, AlertTriangle, ChevronRight,
  FileText, MapPin, Zap, Star
} from 'lucide-react';

import { Link } from 'wouter';

const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Fix white space by removing all default margins and adjusting parent spacing
  useEffect(() => {
    // Reset html and body margins
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Find and remove margin/padding from parent layout wrappers
    const mainElements = document.querySelectorAll('main, [class*="container"], [class*="wrapper"], [class*="content"]');
    mainElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      
      // CRITICAL FIX: Do not remove padding from elements inside a footer.
      // This prevents the script from stripping the Footer's top padding.
      if (htmlEl.closest('footer')) return;

      if (htmlEl.offsetTop === 0 || htmlEl.parentElement === document.body || htmlEl.parentElement?.tagName === 'HTML') {
        htmlEl.style.marginTop = '0';
        htmlEl.style.paddingTop = '0';
      }
    });

    return () => {
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      mainElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        // Restore styles on cleanup, ignoring footer elements again
        if (htmlEl.closest('footer')) return;
        
        htmlEl.style.marginTop = '';
        htmlEl.style.paddingTop = '';
      });
    };
  }, []);

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle, color: 'text-gray-600' },
    { id: 'donor', name: 'For Donors', icon: Heart, color: 'text-red-600' },
    { id: 'recipient', name: 'For Recipients', icon: Users, color: 'text-blue-600' },
    { id: 'verification', name: 'Verification', icon: Shield, color: 'text-purple-600' },
    { id: 'technical', name: 'Technical', icon: FileText, color: 'text-green-600' },
    { id: 'emergency', name: 'Emergency', icon: AlertTriangle, color: 'text-yellow-600' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'donor',
      question: 'How do I register as a blood donor?',
      answer: 'To register as a blood donor, click on "Become a Donor" in the main menu, fill out the registration form with your personal details, medical history, and contact information. You will need to verify your email address and complete the health questionnaire. Once approved, your profile will be active in the system.'
    },
    {
      id: 2,
      category: 'donor',
      question: 'What are the eligibility criteria for blood donation?',
      answer: 'To be eligible for blood donation, you must: be at least 18 years old, weigh at least 50kg, be in good health, not have any chronic illnesses, not have donated blood in the last 3 months, and not have any risk factors for transmissible diseases. Specific medications and travel history may also affect eligibility.'
    },
    {
      id: 3,
      category: 'recipient',
      question: 'How do I request blood for a patient?',
      answer: 'To request blood, log in to your account and click on "Find Donors" or "Emergency Requests". Fill out the blood request form with patient details, required blood type, quantity needed, urgency level, and hospital information. The system will match you with compatible donors in your area.'
    },
    {
      id: 4,
      category: 'recipient',
      question: 'Is there a cost for requesting blood through PulseCare?',
      answer: 'No, PulseCare is a free platform that connects blood donors with recipients. However, there may be costs associated with blood processing and testing at the hospital or blood bank where the donation takes place. These costs are handled by the medical facility, not PulseCare.'
    },
    {
      id: 5,
      category: 'verification',
      question: 'Why should I get verified on PulseCare?',
      answer: 'Verification increases your credibility and trust in the system. Verified donors are prioritized in matching algorithms, and verified recipients are more likely to receive quick responses. Verification also helps prevent fraud and ensures the safety of all users in the blood donation network.'
    },
    {
      id: 6,
      category: 'verification',
      question: 'What documents do I need for verification?',
      answer: 'For donor verification, you need a valid government-issued ID, proof of address, and medical clearance if applicable. For hospital verification, you need registration certificates, medical licenses, and authorization documents. For organizations, you need proof of non-profit status and organizational documents.'
    },
    {
      id: 7,
      category: 'technical',
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on "Forgot Password" on the login page. Enter your registered email address, and we will send you a password reset link. Follow the instructions in the email to create a new password. If you don\'t receive the email, check your spam folder or contact support.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'Is PulseCare available as a mobile app?',
      answer: 'Yes, PulseCare is available as a mobile app for both iOS and Android devices. You can download it from the App Store or Google Play Store. The mobile app offers all the features of the web platform with additional convenience for on-the-go access and push notifications.'
    },
    {
      id: 9,
      category: 'emergency',
      question: 'What should I do in case of a blood emergency?',
      answer: 'In case of a blood emergency, first call local emergency services (999 in Bangladesh). Then, log in to PulseCare and submit an emergency blood request with the highest urgency level. The system will immediately alert available donors in your area. You should also contact nearby hospitals directly.'
    },
    {
      id: 10,
      category: 'emergency',
      question: 'How quickly can I get blood through PulseCare in an emergency?',
      answer: 'In emergency situations, PulseCare can typically connect you with available donors within 30-60 minutes, depending on your location and blood type requirements. However, actual blood availability and transfusion time depend on the hospital\'s processes and blood bank operations.'
    }
  ];

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: Mail,
      action: 'support@pulsecare.bd',
      link: 'mailto:support@pulsecare.bd',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      icon: Phone,
      action: '+880 1567 860 719',
      link: 'tel:+8801567860719',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageSquare,
      action: 'Start Chat',
      link: '#',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Visit Office',
      description: 'In-person support available',
      icon: MapPin,
      action: 'Dhaka, Bangladesh',
      link: '#',
      color: 'bg-red-100 text-red-600'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 -mt-4 pb-12" 
      style={{ marginTop: '-16px' }}
    >
      {/* Header - Covers top edge */}
      <header 
        className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 px-4 shadow-lg relative"
        style={{ marginTop: '-16px' }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-110">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Help Center</h1>
                <p className="text-gray-300 mt-1">Find answers and get support</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white py-8 px-4 shadow-sm">
        <div className="container mx-auto max-w-4xl">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-600" />
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                onMouseEnter={() => setHoveredCard(category.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 relative overflow-hidden ${
                  selectedCategory === category.id
                    ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`p-3 rounded-lg bg-white shadow-sm ${category.color} transition-transform duration-300 ${
                    hoveredCard === category.id ? 'scale-110' : ''
                  }`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-8 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-red-600" />
            Frequently Asked Questions
          </h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No results found. Try a different search term or category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div 
                  key={faq.id} 
                  className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
                  >
                    <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
                    <ChevronRight 
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                        expandedFAQ === faq.id ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 animate-fadeIn">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="py-12 px-4 bg-gradient-to-br from-red-50 to-red-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Still Need Help?
            </h2>
            <p className="text-gray-600">Our support team is here to assist you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactOptions.map((option, index) => (
              <a
                key={index}
                href={option.link}
                onMouseEnter={() => setHoveredCard(`contact-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-red-50 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className={`w-14 h-14 rounded-xl ${option.color} flex items-center justify-center mb-4 transition-transform duration-300 ${
                  hoveredCard === `contact-${index}` ? 'scale-110' : ''
                }`}>
                  <option.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                <div className="flex items-center text-red-600 font-medium text-sm">
                  <span>{option.action}</span>
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-red-600" />
                User Guides
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group">
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Donor Registration Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group">
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Blood Request Process
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group">
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Verification Steps
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Safety & Policies
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy-policy" className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group">
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group">
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2 group">
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Blood Safety Guidelines
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default HelpCenterPage;