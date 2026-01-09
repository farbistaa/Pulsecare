import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Users,
  Search,
  UserPlus,
  Clock,
  MapPin,
  Award,
  Shield,
  Activity,
  Droplet,
  Zap,
  Star,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Globe,
  Lightbulb
} from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

// Enhanced Typing Effect with Surprise Elements
const TypingEffect = ({ texts }: { texts: string[] }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showSurprise, setShowSurprise] = useState(false);

  useEffect(() => {
    const typeText = () => {
      const fullText = texts[currentTextIndex];
      if (isTyping) {
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        } else {
          setIsTyping(false);
          setShowSurprise(true);
          setTimeout(() => {
            setShowSurprise(false);
            setTimeout(() => setIsTyping(false), 2000);
          }, 1000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsTyping(true);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    };
    const timer = setTimeout(typeText, isTyping ? 150 : 75);
    return () => clearTimeout(timer);
  }, [currentText, isTyping, currentTextIndex, texts]);

  return (
    <div className="relative whitespace-nowrap">
      <span className="gradient-text">{currentText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="ml-1 text-red-500"
      >
        |
      </motion.span>
      <AnimatePresence>
        {showSurprise && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="absolute -top-8 -right-8"
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Interactive Achievement Counter with Gamification
const AchievementCounter = ({ end, label, icon: Icon, color, delay = 0 }: {
  end: number;
  label: string;
  icon: any;
  color: string;
  delay?: number;
}) => {
  // Extract color from background gradient string for background overlay
  const getGradientColors = (colorStr: string) => {
    if (colorStr.includes('blue')) return 'from-blue-500/10 to-blue-600/10';
    if (colorStr.includes('red')) return 'from-red-500/10 to-red-600/10';
    if (colorStr.includes('green')) return 'from-green-500/10 to-green-600/10';
    if (colorStr.includes('orange')) return 'from-orange-500/10 to-orange-600/10';
    return 'from-gray-500/10 to-gray-600/10';
  };

  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [achieved, setAchieved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const increment = end / (duration / 50);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        setAchieved(true);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 50);
    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="group bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColors(color)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <motion.div
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${color} rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
          animate={achieved ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
        </motion.div>
        <motion.div
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"
          animate={achieved ? {
            background: `linear-gradient(135deg, ${color.includes('blue') ? '#2563EB' : color.includes('red') ? '#DC2626' : color.includes('green') ? '#059669' : '#D97706'}, ${color.includes('blue') ? '#1D4ED8' : color.includes('red') ? '#B91C1C' : color.includes('green') ? '#047857' : '#B45309'})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          } : {}}
        >
          {count.toLocaleString()}
        </motion.div>
        <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

// Professional Feature Card with Consistent Sizing
const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
      }}
      transition={{ duration: 0.6, type: "spring" }}
      className="relative group"
    >
      <motion.div
        className="bg-white rounded-xl p-4 sm:p-6 cursor-pointer relative overflow-hidden shadow-lg min-h-[180px] sm:min-h-[200px] md:min-h-[220px] flex flex-col"
        whileHover={{
          scale: 1.02,
          rotateX: 2,
          rotateY: 2,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Background Gradient Animation */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${feature.color}30 0%, ${feature.color}20 100%)`
          }}
        />
        {/* Professional Icon */}
        <motion.div
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${feature.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300`}
        >
          <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
        </motion.div>
        {/* Content */}
        <div className="relative z-10 text-center flex-1 flex flex-col">
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900">
            {feature.title}
          </h3>
          <p className="text-gray-600 leading-relaxed text-xs sm:text-sm flex-1">
            {feature.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ImmersiveHome() {
  const { scrollY } = useScroll();
  
  // COMMENT: We're keeping the scrollY hook for other potential uses, but removing the immersive effect from the hero gradient
  
  const typingTexts = [
    "Find blood donors instantly in your area.",
    "Every drop of blood can save a life.",
    "Donate blood, give hope, save lives.",
    "Connecting donors and patients in real-time.",
    "Your donation today is someone's tomorrow."
  ];

  const { data: stats } = useQuery({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    },
  });

  const features = [
    {
      icon: UserPlus,
      title: "Instant Registration",
      description: "Join our verified donor network in minutes with smart verification",
      bgColor: "bg-gradient-to-br from-red-500 to-red-600",
      color: "#DC2626"
    },
    {
      icon: Zap,
      title: "Real-Time Matching",
      description: "AI-powered donor matching based on location and blood compatibility",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      color: "#2563EB"
    },
    {
      icon: Shield,
      title: "Medical Safety",
      description: "HIPAA compliant platform following WHO blood safety guidelines",
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      color: "#059669"
    },
    {
      icon: Globe,
      title: "Emergency Alerts",
      description: "Instant notifications for critical blood requests in your area",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      color: "#D97706"
    },
    {
      icon: Globe,
      title: "Nationwide Network",
      description: "Connected across all 64 districts of Bangladesh",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      color: "#7C3AED"
    },
    {
      icon: Award,
      title: "Impact Tracking",
      description: "Track your donation history and see lives you've helped save",
      bgColor: "bg-gradient-to-br from-pink-500 to-pink-600",
      color: "#DB2777"
    },
    {
      icon: Lightbulb,
      title: "Smart Insights",
      description: "Predictive analytics for blood demand and supply optimization",
      bgColor: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      color: "#F59E0B"
    },
    {
      icon: Heart,
      title: "Community Care",
      description: "Building stronger communities through compassionate giving",
      bgColor: "bg-gradient-to-br from-rose-500 to-rose-600",
      color: "#E11D48"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 overflow-hidden">
     
      {/* 
        COMMENT: Hero Section
        - Now has a transparent background to show the fixed gradient underneath
        - Removed all parallax/immersive effects
        - Content scrolls normally
        - Added padding to ensure content is properly positioned
      */}
    <motion.div
  className="relative min-h-screen flex items-center justify-center px-4 py-12 sm:py-16 md:py-20 mesh-gradient"
>
  {/* Animated Background Elements */}
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-red-300 rounded-full opacity-20"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 5,
          repeat: Infinity,
          delay: Math.random() * 5,
        }}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Main Heading with Enhanced Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8 leading-tight"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <TypingEffect texts={typingTexts} />
          </motion.h1>
          
          {/* Enhanced Tagline with Pulsing Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8 sm:mb-12"
          >
            <motion.div
              className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6"
              animate={{
                opacity: [1, 0.7, 1],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center pulse-glow"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current" />
              </motion.div>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Every Pulse Counts
              </p>
            </motion.div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium px-4">
              Bangladesh's most intelligent blood donation ecosystem connecting verified donors with those in need through real-time matching and predictive analytics
            </p>
          </motion.div>
          
          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
          >
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full sm:w-auto"
              >
                <Button
                  size="default"
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-medium px-6 sm:px-8 py-3 text-sm sm:text-base rounded-lg shadow-lg transition-all duration-300 w-full sm:w-auto"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Register as Donor
                </Button>
              </motion.div>
            </Link>
            <Link href="/search">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full sm:w-auto"
              >
                <Button
                  size="default"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-medium px-6 sm:px-8 py-3 text-sm sm:text-base rounded-lg shadow-lg transition-all duration-300 w-full sm:w-auto"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Find Donors
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
        
        {/* COMMENT: Removed the hero-to-section transition effect that was at the bottom */}
      </motion.div>
      
      {/* COMMENT: Rest of the page content starts here */}
      
      {/* Interactive Statistics with Gamification */}
      <motion.section
        className="py-8 sm:py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 gradient-text">
              Real Impact, Real Heroes
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Join thousands of verified heroes making a difference across Bangladesh
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            viewport={{ once: true }}
          >
            <AchievementCounter
              end={parseInt(stats?.totalUsers) || 2000}
              label="Registered Users"
              icon={Users}
              color="bg-gradient-to-tr from-blue-500 to-blue-600"
              delay={200}
            />
            <AchievementCounter
              end={parseInt(stats?.availableDonors) || 1564}
              label="Available Donors"
              icon={Heart}
              color="bg-gradient-to-tr from-red-500 to-red-600"
              delay={400}
            />
            <AchievementCounter
              end={parseInt(stats?.totalDonations) || 800}
              label="Successful Donations"
              icon={Award}
              color="bg-gradient-to-tr from-green-500 to-green-600"
              delay={600}
            />
            <AchievementCounter
              end={parseInt(stats?.totalEmergencyRequests) || 100}
              label="Emergency Requests"
              icon={Zap}
              color="bg-gradient-to-tr from-orange-500 to-orange-600"
              delay={800}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* How PulseCare Works Section */}
      <motion.section
        className="py-8 sm:py-12 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              How <span className="gradient-text">PulseCare</span> Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Simple, secure, and efficient blood donation process designed for maximum impact
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  duration: 0.6
                }
              }
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.6, type: "spring" }}
              className="group bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">1. Search as Guest</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Browse available donors instantly without registration. Use smart filters for blood group, location, and availability.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.6, type: "spring" }}
              className="group bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">2. Register & Verify</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Create your verified donor profile with medical information, location, and availability preferences for secure donations.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.6, type: "spring" }}
              className="group bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">3. Connect & Save</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Get matched with compatible recipients, schedule appointments, and track your life-saving impact in the community.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose PulseCare Section - Enhanced with Loader Effect */}
      <motion.section
        className="py-16 sm:py-20 md:py-32 bg-gradient-to-br from-red-50 via-white to-blue-50 relative overflow-hidden min-h-[600px]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Enhanced Loading Animation Background with Multiple Layers */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/15 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: 1
          }}
        />
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose <span className="gradient-text">PulseCare</span>?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Experience the future of blood donation with intelligent features designed for maximum impact
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  duration: 0.8
                }
              }
            }}
          >
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Blood Group Compatibility Section */}
      <motion.section
        className="py-8 sm:py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Blood Group <span className="gradient-text">Compatibility</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Understanding blood type compatibility is crucial for safe donations. Learn who can donate to whom.
            </p>
          </motion.div>
          
          {/* Compatibility Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Donor Compatibility */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Who Can Donate</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { donor: 'O-', recipients: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], isUniversal: true },
                  { donor: 'O+', recipients: ['O+', 'A+', 'B+', 'AB+'] },
                  { donor: 'A-', recipients: ['A-', 'A+', 'AB-', 'AB+'] },
                  { donor: 'A+', recipients: ['A+', 'AB+'] },
                  { donor: 'B-', recipients: ['B-', 'B+', 'AB-', 'AB+'] },
                  { donor: 'B+', recipients: ['B+', 'AB+'] },
                  { donor: 'AB-', recipients: ['AB-', 'AB+'] },
                  { donor: 'AB+', recipients: ['AB+'] },
                ].map((item, index) => (
                  <motion.div
                    key={item.donor}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`p-3 sm:p-4 rounded-lg border-2 hover:shadow-md transition-all duration-300 ${
                      item.isUniversal
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:border-green-300'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          item.isUniversal ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {item.donor}
                        </span>
                        {item.isUniversal && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium whitespace-nowrap">
                            Universal Donor
                          </span>
                        )}
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-600 mb-1">Can donate to:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.recipients.map((recipient) => (
                            <span key={recipient} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {recipient}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Recipient Compatibility */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Who Can Receive</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { recipient: 'AB+', donors: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], isUniversal: true },
                  { recipient: 'AB-', donors: ['O-', 'A-', 'B-', 'AB-'] },
                  { recipient: 'A+', donors: ['O-', 'O+', 'A-', 'A+'] },
                  { recipient: 'A-', donors: ['O-', 'A-'] },
                  { recipient: 'B+', donors: ['O-', 'O+', 'B-', 'B+'] },
                  { recipient: 'B-', donors: ['O-', 'B-'] },
                  { recipient: 'O+', donors: ['O-', 'O+'] },
                  { recipient: 'O-', donors: ['O-'] },
                ].map((item, index) => (
                  <motion.div
                    key={item.recipient}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`p-3 sm:p-4 rounded-lg border-2 hover:shadow-md transition-all duration-300 ${
                      item.isUniversal
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          item.isUniversal ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {item.recipient}
                        </span>
                        {item.isUniversal && (
                          <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-medium whitespace-nowrap">
                            Universal Recipient
                          </span>
                        )}
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-600 mb-1">Can receive from:</p>
                        <div className="flex flex-wrap gap-1 justify-start sm:justify-end">
                          {item.donors.map((donor) => (
                            <span key={donor} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {donor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Quick Facts */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Important Facts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-bold text-green-800 mb-2 text-sm sm:text-base">O- Universal Donor</h4>
                <p className="text-xs sm:text-sm text-green-700 leading-tight">Can donate to all blood types in emergencies</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">AB+ Universal Recipient</h4>
                <p className="text-xs sm:text-sm text-purple-700">Can receive from all blood types</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">Safe Donation</h4>
                <p className="text-xs sm:text-sm text-blue-700">Always verify compatibility before donation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action with Celebration Effects */}
      <motion.section
        className="py-12 sm:py-16 bg-gradient-to-r from-red-600 via-red-700 to-red-800 relative overflow-hidden"
        whileInView={{ opacity: 1 }}
        initial={{ opacity: 0.8 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            viewport={{ once: true }}
          >
            Ready to Save Lives?
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg text-red-50 mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join our community of heroes making a difference every day across Bangladesh
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/register">
              <Button
                size="default"
                className="bg-white text-red-700 hover:bg-red-50 font-medium px-6 py-3 text-sm sm:text-base rounded-lg shadow-lg transition-all duration-300 w-full sm:w-auto"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Your Journey
              </Button>
            </Link>
            <Link href="/search">
              <Button
                size="default"
                className="bg-red-600 text-white hover:bg-red-700 font-medium px-6 py-3 text-sm sm:text-base rounded-lg shadow-lg transition-all duration-300 w-full sm:w-auto"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Find Donors Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}