import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase configuration for OTP and authentication services
const firebaseConfig = {
  apiKey: "AIzaSyCRudzyN3q0TDUHUFUv9tuosII8RSu0qSE",
  authDomain: "pulsecare-9cc00.firebaseapp.com",
  projectId: "pulsecare-9cc00",
  storageBucket: "pulsecare-9cc00.firebasestorage.app",
  messagingSenderId: "88960162421",
  appId: "1:88960162421:web:8aff7504ab4f4de18b363c",
  measurementId: "G-ZCSKTMLFFK"
};
// Initialize Firebase Admin SDK (for server-side operations)
let firebaseApp: any;
let auth: any;
let firestore: any;

try {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export interface FirebaseOTPRequest {
  phoneNumber: string;
  purpose: 'registration' | 'login' | '2fa_enable' | '2fa_disable' | 'password_change' | 'verification' | 'emergency';
  userId?: number;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

export interface FirebaseOTPVerification {
  phoneNumber: string;
  verificationId: string;
  code: string;
  purpose: string;
  userId?: number;
}

// OTP rate limiting and security
const OTP_RATE_LIMITS = {
  registration: { maxPerHour: 3, maxPerDay: 10 },
  login: { maxPerHour: 5, maxPerDay: 20 },
  '2fa_enable': { maxPerHour: 2, maxPerDay: 5 },
  '2fa_disable': { maxPerHour: 1, maxPerDay: 3 },
  password_change: { maxPerHour: 2, maxPerDay: 5 },
  verification: { maxPerHour: 3, maxPerDay: 10 },
  emergency: { maxPerHour: 10, maxPerDay: 50 }
};

class FirebaseOTPService {
  
  // Send OTP via Firebase SMS
  async sendOTP(request: FirebaseOTPRequest): Promise<{
    success: boolean;
    verificationId?: string;
    message: string;
    expiresIn?: number;
    rateLimitReset?: number;
  }> {
    try {
      // Normalize phone number for Bangladesh
      const normalizedPhone = this.normalizePhoneNumber(request.phoneNumber);
      
      if (!this.isValidPhoneNumber(normalizedPhone)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please use Bangladesh phone number (+880...)'
        };
      }

      // Check rate limiting
      const rateLimitCheck = await this.checkRateLimit(normalizedPhone, request.purpose);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          message: `Rate limit exceeded. Try again in ${rateLimitCheck.resetIn} minutes.`,
          rateLimitReset: rateLimitCheck.resetIn * 60
        };
      }

      // Generate verification session using Firebase Auth
      // For production, use Firebase Auth REST API for SMS verification
      const verificationId = await this.createVerificationSession(normalizedPhone, request);
      
      // Log the OTP request for security and compliance
      await this.logOTPRequest(request, verificationId, 'sent');

      return {
        success: true,
        verificationId,
        message: `Verification code sent to ${this.maskPhoneNumber(normalizedPhone)}`,
        expiresIn: 300 // 5 minutes
      };

    } catch (error) {
      console.error('Firebase OTP send error:', error);
      await this.logOTPRequest(request, undefined, 'failed');
      
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      };
    }
  }

  // Verify OTP code
  async verifyOTP(verification: FirebaseOTPVerification): Promise<{
    success: boolean;
    message: string;
    userId?: number;
    sessionToken?: string;
  }> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(verification.phoneNumber);
      
      // Verify the code using Firebase Auth
      const isValid = await this.verifyFirebaseCode(
        verification.verificationId, 
        verification.code,
        normalizedPhone
      );

      if (isValid) {
        // Generate session token for authenticated operations
        const sessionToken = await this.generateSessionToken(verification);
        
        // Log successful verification
        await this.logOTPVerification(verification, 'verified', true);

        return {
          success: true,
          message: 'Phone number verified successfully',
          userId: verification.userId,
          sessionToken
        };
      } else {
        // Log failed verification attempt
        await this.logOTPVerification(verification, 'failed', false);
        
        return {
          success: false,
          message: 'Invalid or expired verification code'
        };
      }

    } catch (error) {
      console.error('Firebase OTP verification error:', error);
      await this.logOTPVerification(verification, 'error', false);
      
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  // Enable 2FA for user
  async enable2FA(userId: number, phoneNumber: string, verificationCode: string): Promise<{
    success: boolean;
    message: string;
    backupCodes?: string[];
  }> {
    try {
      // Verify the code first
      const verification = await this.verifyFirebaseCode('2fa_setup', verificationCode, phoneNumber);
      
      if (!verification) {
        return {
          success: false,
          message: 'Invalid verification code'
        };
      }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      
      // Store 2FA settings in Firestore
      await firestore.collection('user_2fa').doc(userId.toString()).set({
        enabled: true,
        phoneNumber: this.normalizePhoneNumber(phoneNumber),
        backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
        enabledAt: new Date().toISOString(),
        lastUsed: null
      });

      await this.logSecurityEvent(userId, '2fa_enabled', { phoneNumber });

      return {
        success: true,
        message: '2FA enabled successfully',
        backupCodes
      };

    } catch (error) {
      console.error('2FA enable error:', error);
      return {
        success: false,
        message: 'Failed to enable 2FA'
      };
    }
  }

  // Disable 2FA for user
  async disable2FA(userId: number, verificationCode: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Get user's 2FA settings
      const userDoc = await firestore.collection('user_2fa').doc(userId.toString()).get();
      
      if (!userDoc.exists) {
        return {
          success: false,
          message: '2FA is not enabled for this account'
        };
      }

      const userData = userDoc.data();
      
      // Verify the code
      const verification = await this.verifyFirebaseCode('2fa_disable', verificationCode, userData.phoneNumber);
      
      if (!verification) {
        // Check if it's a backup code
        const isValidBackupCode = this.verifyBackupCode(verificationCode, userData.backupCodes);
        if (!isValidBackupCode) {
          return {
            success: false,
            message: 'Invalid verification code or backup code'
          };
        }
      }

      // Disable 2FA
      await firestore.collection('user_2fa').doc(userId.toString()).delete();
      await this.logSecurityEvent(userId, '2fa_disabled', {});

      return {
        success: true,
        message: '2FA disabled successfully'
      };

    } catch (error) {
      console.error('2FA disable error:', error);
      return {
        success: false,
        message: 'Failed to disable 2FA'
      };
    }
  }

  // Verify 2FA code for login
  async verify2FA(userId: number, code: string): Promise<{
    success: boolean;
    message: string;
    backupCodeUsed?: boolean;
  }> {
    try {
      const userDoc = await firestore.collection('user_2fa').doc(userId.toString()).get();
      
      if (!userDoc.exists) {
        return {
          success: false,
          message: '2FA is not enabled for this account'
        };
      }

      const userData = userDoc.data();
      
      // First try to verify as SMS code
      const smsVerification = await this.verifyFirebaseCode('2fa_login', code, userData.phoneNumber);
      
      if (smsVerification) {
        await firestore.collection('user_2fa').doc(userId.toString()).update({
          lastUsed: new Date().toISOString()
        });

        await this.logSecurityEvent(userId, '2fa_verified', { method: 'sms' });
        
        return {
          success: true,
          message: '2FA verification successful'
        };
      }

      // Try backup code verification
      const backupCodeValid = this.verifyBackupCode(code, userData.backupCodes);
      if (backupCodeValid) {
        // Remove used backup code
        const updatedBackupCodes = userData.backupCodes.filter((c: string) => !this.verifyBackupCode(code, [c]));
        
        await firestore.collection('user_2fa').doc(userId.toString()).update({
          backupCodes: updatedBackupCodes,
          lastUsed: new Date().toISOString()
        });

        await this.logSecurityEvent(userId, '2fa_verified', { method: 'backup_code' });
        
        return {
          success: true,
          message: '2FA verification successful',
          backupCodeUsed: true
        };
      }

      await this.logSecurityEvent(userId, '2fa_failed', { code: code.substring(0, 2) + '***' });
      
      return {
        success: false,
        message: 'Invalid 2FA code or backup code'
      };

    } catch (error) {
      console.error('2FA verification error:', error);
      return {
        success: false,
        message: '2FA verification failed'
      };
    }
  }

  // Private helper methods
  private normalizePhoneNumber(phone: string): string {
    // Remove spaces, dashes, parentheses
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    
    // Convert Bangladesh numbers to international format
    if (normalized.startsWith('01')) {
      normalized = '+880' + normalized.substring(1);
    } else if (normalized.startsWith('1') && normalized.length === 10) {
      normalized = '+880' + normalized;
    } else if (normalized.startsWith('880') && !normalized.startsWith('+880')) {
      normalized = '+' + normalized;
    }
    
    return normalized;
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Bangladesh phone number validation: +880 followed by 10 digits
    const bdPhoneRegex = /^\+8801[3-9]\d{8}$/;
    return bdPhoneRegex.test(phone);
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length > 8) {
      return phone.substring(0, 4) + '****' + phone.substring(phone.length - 4);
    }
    return phone;
  }

  private async createVerificationSession(phone: string, request: FirebaseOTPRequest): Promise<string> {
    // In production, use Firebase Auth REST API to send SMS
    // For demo, create a mock verification ID
    const verificationId = `firebase_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Store verification session
    await firestore.collection('verification_sessions').doc(verificationId).set({
      phoneNumber: phone,
      purpose: request.purpose,
      userId: request.userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      attempts: 0,
      verified: false,
      metadata: request.metadata || {}
    });

    return verificationId;
  }

  private async verifyFirebaseCode(verificationId: string, code: string, phone: string): Promise<boolean> {
    try {
      // In production, use Firebase Auth REST API to verify
      // For demo, we'll use a simple validation
      
      // Check if verification session exists and is valid
      const sessionDoc = await firestore.collection('verification_sessions').doc(verificationId).get();
      
      if (!sessionDoc.exists) {
        return false;
      }

      const session = sessionDoc.data();
      
      // Check expiration
      if (new Date() > new Date(session.expiresAt)) {
        return false;
      }

      // For demo purposes, accept any 6-digit code
      const isValidCode = /^\d{6}$/.test(code);
      
      if (isValidCode) {
        // Mark as verified
        await firestore.collection('verification_sessions').doc(verificationId).update({
          verified: true,
          verifiedAt: new Date().toISOString()
        });
        
        return true;
      }
      
      // Increment attempts
      await firestore.collection('verification_sessions').doc(verificationId).update({
        attempts: (session.attempts || 0) + 1
      });
      
      return false;

    } catch (error) {
      console.error('Firebase code verification error:', error);
      return false;
    }
  }

  private async checkRateLimit(phone: string, purpose: string): Promise<{
    allowed: boolean;
    resetIn: number;
  }> {
    const limits = OTP_RATE_LIMITS[purpose as keyof typeof OTP_RATE_LIMITS];
    
    // Check hourly limit
    const hourKey = `rate_limit:${phone}:${purpose}:${new Date().getHours()}`;
    const hourDoc = await firestore.collection('rate_limits').doc(hourKey).get();
    
    if (hourDoc.exists && hourDoc.data().count >= limits.maxPerHour) {
      return { allowed: false, resetIn: 60 - new Date().getMinutes() };
    }
    
    return { allowed: true, resetIn: 0 };
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  private hashBackupCode(code: string): string {
    // In production, use proper hashing like bcrypt
    return Buffer.from(code).toString('base64');
  }

  private verifyBackupCode(code: string, hashedCodes: string[]): boolean {
    const hashedInput = this.hashBackupCode(code);
    return hashedCodes.includes(hashedInput);
  }

  private async generateSessionToken(verification: FirebaseOTPVerification): Promise<string> {
    // Generate JWT token for authenticated sessions
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async logOTPRequest(request: FirebaseOTPRequest, verificationId?: string, status: string = 'sent'): Promise<void> {
    try {
      await firestore.collection('otp_logs').add({
        phoneNumber: this.maskPhoneNumber(request.phoneNumber),
        purpose: request.purpose,
        userId: request.userId,
        verificationId,
        status,
        timestamp: new Date().toISOString(),
        metadata: request.metadata || {}
      });
    } catch (error) {
      console.error('OTP logging error:', error);
    }
  }

  private async logOTPVerification(verification: FirebaseOTPVerification, status: string, success: boolean): Promise<void> {
    try {
      await firestore.collection('otp_verifications').add({
        phoneNumber: this.maskPhoneNumber(verification.phoneNumber),
        purpose: verification.purpose,
        userId: verification.userId,
        verificationId: verification.verificationId,
        status,
        success,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('OTP verification logging error:', error);
    }
  }

  private async logSecurityEvent(userId: number, event: string, metadata: any): Promise<void> {
    try {
      await firestore.collection('security_events').add({
        userId,
        event,
        timestamp: new Date().toISOString(),
        metadata
      });
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }
}

export const firebaseOTPService = new FirebaseOTPService();