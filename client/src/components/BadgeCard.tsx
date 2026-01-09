import React from "react";
import { motion } from "framer-motion";
import { Badge, Star, Trophy, Shield, Award, Crown, Sparkles } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

interface BadgeCardProps {
  badge: {
    badgeId: number;
    name: string;
    description: string;
    type: string;
    requirement: string;
    iconUrl: string;
    earned: boolean;
    earnedAt?: string;
  };
  onShare?: (badgeId: number) => void;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  progress?: number;
}

const getBadgeIcon = (name: string) => {
  const iconName = name.toLowerCase();
  if (iconName.includes('first')) return Badge;
  if (iconName.includes('life')) return Star;
  if (iconName.includes('guardian')) return Shield;
  if (iconName.includes('hero')) return Trophy;
  if (iconName.includes('super')) return Crown;
  if (iconName.includes('legend')) return Sparkles;
  return Award;
};

const getBadgeColor = (type: string, earned: boolean) => {
  const colors = {
    donation: earned ? 'from-red-500 to-pink-500' : 'from-gray-400 to-gray-500',
    profile: earned ? 'from-blue-500 to-cyan-500' : 'from-gray-400 to-gray-500',
    community: earned ? 'from-green-500 to-emerald-500' : 'from-gray-400 to-gray-500',
  };
  return colors[type as keyof typeof colors] || colors.donation;
};

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  onShare,
  size = "md",
  showProgress = false,
  progress = 0
}) => {
  const IconComponent = getBadgeIcon(badge.name);
  const gradientColors = getBadgeColor(badge.type, badge.earned);
  
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-40",
    lg: "w-40 h-48"
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${sizeClasses[size]} cursor-pointer`}
    >
      <Card 
        className={`
          h-full w-full border-2 transition-all duration-300 overflow-hidden
          ${badge.earned 
            ? 'border-yellow-300 shadow-lg shadow-yellow-200/50 bg-gradient-to-br from-yellow-50 to-white' 
            : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white'
          }
        `}
      >
        <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center">
          {/* Badge Icon */}
          <motion.div
            className={`
              p-3 rounded-full bg-gradient-to-br ${gradientColors} text-white mb-2
              ${badge.earned ? 'shadow-lg' : 'opacity-50'}
            `}
            whileHover={{ rotate: 5 }}
            animate={badge.earned ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <IconComponent size={iconSizes[size]} />
          </motion.div>

          {/* Badge Info */}
          <div className="flex-1">
            <h3 className={`font-bold text-xs ${size === 'lg' ? 'text-sm' : ''} ${badge.earned ? 'text-gray-800' : 'text-gray-500'}`}>
              {badge.name}
            </h3>
            {size !== 'sm' && (
              <p className={`text-xs mt-1 ${badge.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                {badge.requirement}
              </p>
            )}
          </div>

          {/* Earned Date */}
          {badge.earned && badge.earnedAt && size === 'lg' && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}

          {/* Progress Bar */}
          {showProgress && !badge.earned && (
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          )}

          {/* Share Button */}
          {badge.earned && onShare && size !== 'sm' && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onShare(badge.badgeId);
              }}
            >
              Share
            </Button>
          )}
        </CardContent>

        {/* Sparkle Animation for Earned Badges */}
        {badge.earned && (
          <>
            <motion.div
              className="absolute top-1 left-1 text-yellow-400"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute top-1 right-1 text-yellow-400"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-1 left-1 text-yellow-400"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-1 right-1 text-yellow-400"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            >
              ✨
            </motion.div>
          </>
        )}
      </Card>
    </motion.div>
  );
};