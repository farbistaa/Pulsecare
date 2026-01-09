import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, Key, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TwoFactorAuthProps {
  className?: string;
}

export default function TwoFactorAuth({ className = '' }: TwoFactorAuthProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<'status' | 'setup' | 'verify'>('status');
  const [qrCodeURL, setQrCodeURL] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedCodes, setCopiedCodes] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status', {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setIs2FAEnabled(data.enabled || false);
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  const generateSecret = () => {
    // Generate a base32 secret for demonstration
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const startSetup = () => {
    const newSecret = generateSecret();
    const newBackupCodes = generateBackupCodes();
    
    setSecret(newSecret);
    setBackupCodes(newBackupCodes);
    setCopiedCodes(new Array(newBackupCodes.length).fill(false));
    
    // Generate QR code URL for authenticator apps
    const appName = 'PulseCare';
    const userEmail = 'user@example.com'; // Get from user context
    const qrUrl = `otpauth://totp/${appName}:${userEmail}?secret=${newSecret}&issuer=${appName}`;
    setQrCodeURL(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`);
    
    setSetupStep('setup');
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });

      if (response.ok) {
        // Enable 2FA
        await fetch('/api/auth/2fa/enable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret, backupCodes })
        });

        setIs2FAEnabled(true);
        setSetupStep('status');
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setIs2FAEnabled(false);
        setSetupStep('status');
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    const newCopiedCodes = [...copiedCodes];
    newCopiedCodes[index] = true;
    setCopiedCodes(newCopiedCodes);
    
    setTimeout(() => {
      const resetCodes = [...newCopiedCodes];
      resetCodes[index] = false;
      setCopiedCodes(resetCodes);
    }, 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <AnimatePresence mode="wait">
        {setupStep === 'status' && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {is2FAEnabled ? (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <Shield className="h-5 w-5 text-gray-500" />
                  )}
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  {is2FAEnabled 
                    ? "Your account is protected with two-factor authentication"
                    : "Add an extra layer of security to your account"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg ${is2FAEnabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {is2FAEnabled ? "2FA is enabled" : "2FA is disabled"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {is2FAEnabled 
                          ? "Your account requires a verification code in addition to your password"
                          : "Enable 2FA to secure your account with an authenticator app"
                        }
                      </p>
                    </div>
                    <Button
                      onClick={is2FAEnabled ? disable2FA : startSetup}
                      variant={is2FAEnabled ? "destructive" : "default"}
                      disabled={loading}
                    >
                      {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {setupStep === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Set up Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Scan the QR code with your authenticator app and enter the verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="inline-block p-4 bg-white rounded-lg border shadow-sm">
                    <img 
                      src={qrCodeURL} 
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Scan this QR code with Google Authenticator, Authy, or any TOTP app
                  </p>
                </div>

                <div>
                  <Label>Manual entry secret:</Label>
                  <Input 
                    value={secret} 
                    readOnly 
                    className="font-mono text-center"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use this if you can't scan the QR code
                  </p>
                </div>

                <div>
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center font-mono text-lg"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSetupStep('status')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={verifyAndEnable}
                    disabled={loading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {loading ? "Verifying..." : "Verify & Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup Codes</CardTitle>
                <CardDescription>
                  Save these backup codes in a safe place. Each code can only be used once.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                    >
                      <span className="font-mono text-sm">{code}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyBackupCode(code, index)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedCodes[index] ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Store these codes securely - they won't be shown again!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}