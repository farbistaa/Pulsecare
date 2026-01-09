import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Mail, Phone, Save, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";
import Loader from 'ui/Loader';

interface PrivacySettingsProps {
  onSettingsUpdate?: () => void;
}

interface PrivacyData {
  shareEmail: boolean;
  sharePhone: boolean;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onSettingsUpdate }) => {
  const [settings, setSettings] = useState<PrivacyData>({
    shareEmail: true,
    sharePhone: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/privacy-settings', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          shareEmail: data.shareEmail,
          sharePhone: data.sharePhone
        });
      } else if (response.status === 401) {
        toast({
          title: "Please login",
          description: "You need to be logged in to manage privacy settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof PrivacyData, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setHasChanges(false);
        toast({
          title: "Success",
          description: "Privacy settings updated successfully"
        });
        onSettingsUpdate?.();
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to save privacy settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loader />
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-blue-600" size={20} />
            Privacy Settings
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control what information is visible to other users when they view your profile
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Privacy Setting */}
          <motion.div
            className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-800"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Mail size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Label className="text-sm font-medium">Share Email Address</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Allow other users to see your email address on your profile
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings.shareEmail ? (
                <Eye size={16} className="text-green-600" />
              ) : (
                <EyeOff size={16} className="text-gray-400" />
              )}
              <Switch
                checked={settings.shareEmail}
                onCheckedChange={(checked) => updateSetting('shareEmail', checked)}
              />
            </div>
          </motion.div>

          {/* Phone Privacy Setting */}
          <motion.div
            className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-800"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <Phone size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <Label className="text-sm font-medium">Share Phone Number</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Allow other users to see your phone number on your profile
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings.sharePhone ? (
                <Eye size={16} className="text-green-600" />
              ) : (
                <EyeOff size={16} className="text-gray-400" />
              )}
              <Switch
                checked={settings.sharePhone}
                onCheckedChange={(checked) => updateSetting('sharePhone', checked)}
              />
            </div>
          </motion.div>

          {/* Information Alert */}
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              When contact sharing is disabled, other users will only see an internal messaging option 
              to contact you through the platform. Your privacy is our priority.
            </AlertDescription>
          </Alert>

          {/* Save Button */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </motion.div>
          )}

          {/* Current Status Summary */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Current Visibility Status</h4>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                settings.shareEmail 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                Email: {settings.shareEmail ? 'Visible' : 'Hidden'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                settings.sharePhone 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                Phone: {settings.sharePhone ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};