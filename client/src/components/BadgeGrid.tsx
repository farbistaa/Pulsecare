import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Filter, Share2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BadgeCard } from "./BadgeCard";
import { BadgeShareModal } from "./BadgeShareModal";
import { useToast } from "@/hooks/use-toast";
import Loader from 'ui/Loader';

interface BadgeGridProps {
  userId: number;
  isOwnProfile?: boolean;
}

interface BadgeData {
  badgeId: number;
  name: string;
  description: string;
  type: string;
  requirement: string;
  iconUrl: string;
  earned: boolean;
  earnedAt?: string;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ userId, isOwnProfile = false }) => {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'earned' | 'donation' | 'profile' | 'community'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserBadges();
  }, [userId]);

  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/badges/${userId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges);
        setTotalEarned(data.totalEarned);
      } else if (response.status === 401) {
        toast({
          title: "Please login",
          description: "You need to be logged in to view badges",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast({
        title: "Error",
        description: "Failed to load badges. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (badgeId: number) => {
    try {
      const response = await fetch(`/api/badges/share/${userId}/${badgeId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const shareData = await response.json();
        const badge = badges.find(b => b.badgeId === badgeId);
        setSelectedBadge({...badge!, shareData});
        setShareModalOpen(true);
      } else {
        throw new Error('Failed to generate share data');
      }
    } catch (error) {
      console.error('Error sharing badge:', error);
      toast({
        title: "Error",
        description: "Failed to share badge. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFilteredBadges = () => {
    switch (filter) {
      case 'earned':
        return badges.filter(b => b.earned);
      case 'donation':
        return badges.filter(b => b.type === 'donation');
      case 'profile':
        return badges.filter(b => b.type === 'profile');
      case 'community':
        return badges.filter(b => b.type === 'community');
      default:
        return badges;
    }
  };

  const getProgressForBadge = (badge: BadgeData) => {
    // Mock progress calculation - in real app, this would come from the API
    if (badge.earned) return 100;
    
    const requirement = parseInt(badge.requirement) || 0;
    if (badge.type === 'donation') {
      return Math.min((totalEarned / requirement) * 100, 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Loader />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full">
            <Trophy size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isOwnProfile ? 'Your' : 'User'} Badges
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {totalEarned} of {badges.length} badges earned
            </p>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-yellow-500"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: totalEarned / badges.length }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{
                strokeDasharray: 2 * Math.PI * 30,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {Math.round((totalEarned / badges.length) * 100)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="earned">Earned</TabsTrigger>
          <TabsTrigger value="donation">Donation</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            layout
          >
            <AnimatePresence>
              {getFilteredBadges().map((badge, index) => (
                <motion.div
                  key={badge.badgeId}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BadgeCard
                    badge={badge}
                    onShare={isOwnProfile ? handleShare : undefined}
                    showProgress={!badge.earned}
                    progress={getProgressForBadge(badge)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {getFilteredBadges().length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 mb-4">
                <Star size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No badges found
              </h3>
              <p className="text-gray-500">
                {filter === 'earned' 
                  ? "No badges earned yet. Keep donating to unlock achievements!"
                  : "No badges in this category yet."
                }
              </p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Badge Share Modal */}
      <BadgeShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        badge={selectedBadge}
      />
    </div>
  );
};