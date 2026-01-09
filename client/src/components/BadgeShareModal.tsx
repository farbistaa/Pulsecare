import React from "react";
import { motion } from "framer-motion";
import { X, Share2, Copy, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface BadgeShareModalProps {
  open: boolean;
  onClose: () => void;
  badge: {
    badgeId: number;
    name: string;
    description: string;
    type: string;
    shareData?: {
      badgeName: string;
      description: string;
      shareText: string;
      imageUrl: string;
      platformUrl: string;
    };
  } | null;
}

export const BadgeShareModal: React.FC<BadgeShareModalProps> = ({
  open,
  onClose,
  badge
}) => {
  const { toast } = useToast();

  if (!badge || !badge.shareData) return null;

  const shareData = badge.shareData;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareText);
      toast({
        title: "Copied!",
        description: "Share text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareData.shareText);
    const encodedUrl = encodeURIComponent(shareData.platformUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={20} />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badge Preview Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-2xl">🏆</span>
                </motion.div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {shareData.badgeName}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {shareData.description}
                </p>
                
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  PulseCare Achievement
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Share Text Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "{shareData.shareText}"
            </p>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Share on</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center gap-2 justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Facebook size={16} />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center gap-2 justify-center text-blue-400 border-blue-200 hover:bg-blue-50"
              >
                <Twitter size={16} />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center gap-2 justify-center text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <Linkedin size={16} />
                LinkedIn
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center gap-2 justify-center text-green-600 border-green-200 hover:bg-green-50"
              >
                <MessageCircle size={16} />
                WhatsApp
              </Button>
            </div>

            <Button
              variant="secondary"
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2 justify-center"
            >
              <Copy size={16} />
              Copy Share Text
            </Button>
          </div>

          {/* Close Button */}
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};