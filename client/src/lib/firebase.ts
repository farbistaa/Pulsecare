import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  type User,
  type Auth,
  type ConfirmationResult,
  type UserCredential,
  type ApplicationVerifier
} from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCRudzyN3q0TDUHUFUv9tuosII8RSu0qSE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pulsecare-9cc00.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pulsecare-9cc00",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pulsecare-9cc00.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "88960162421",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:88960162421:web:8aff7504ab4f4de18b363c"
};

// Initialize Firebase (singleton pattern)
let app: ReturnType<typeof initializeApp> | null = null;
let auth: Auth | null = null;

export function getFirebaseApp() {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

// Export auth for external use
export { auth };

// Declare global grecaptcha type
declare global {
  interface Window {
    grecaptcha: {
      reset: (widgetId?: number) => void;
    };
  }
}

/**
 * Phone Authentication Service
 */
export class PhoneAuthService {
  private auth: Auth;
  private confirmationResult: ConfirmationResult | null = null;
  private recaptchaVerifier: ApplicationVerifier | null = null;

  constructor() {
    this.auth = getFirebaseAuth();
  }

  /**
   * Initialize invisible reCAPTCHA
   */
  initRecaptcha(buttonId: string = 'phone-sign-in-button'): ApplicationVerifier {
    // Clean up existing verifier
    if (this.recaptchaVerifier) {
      try {
        (this.recaptchaVerifier as RecaptchaVerifier).clear();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    const verifier = new RecaptchaVerifier(this.auth, buttonId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified');
      }
    });

    this.recaptchaVerifier = verifier;
    return verifier;
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<{
    success: boolean;
    message: string;
    verificationId?: string;
  }> {
    try {
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      console.log('Sending OTP to:', formattedPhone);
      
      // Initialize reCAPTCHA if not already done
      if (!this.recaptchaVerifier) {
        this.initRecaptcha();
      }

      // Send verification code via Firebase
      this.confirmationResult = await signInWithPhoneNumber(
        this.auth,
        formattedPhone,
        this.recaptchaVerifier!
      );

      return {
        success: true,
        message: `OTP sent to ${this.maskPhoneNumber(formattedPhone)}`,
        verificationId: this.confirmationResult.verificationId
      };

    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Reset reCAPTCHA on error
      this.resetRecaptcha();

      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(otp: string): Promise<{
    success: boolean;
    message: string;
    user?: User;
    idToken?: string;
    isNewUser?: boolean;
  }> {
    try {
      if (!this.confirmationResult) {
        return {
          success: false,
          message: 'No OTP request found. Please request a new OTP.'
        };
      }

      // Verify the OTP with Firebase
      const result: UserCredential = await this.confirmationResult.confirm(otp);
      const user = result.user;

      // Get ID token for server verification
      const idToken = await user.getIdToken();

      // Check if this is a new user (safely access additionalUserInfo)
      const isNewUser = (result as any).additionalUserInfo?.isNewUser || false;

      return {
        success: true,
        message: 'Phone number verified successfully!',
        user,
        idToken,
        isNewUser
      };

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get current user's ID token
   */
  async getCurrentUserToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  /**
   * Sign out current user
   */
  async signOutUser(): Promise<void> {
    await signOut(this.auth);
    this.confirmationResult = null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Reset reCAPTCHA
   */
  private resetRecaptcha(): void {
    if (this.recaptchaVerifier) {
      try {
        (this.recaptchaVerifier as RecaptchaVerifier).render().then((widgetId) => {
          if (typeof window !== 'undefined' && window.grecaptcha) {
            window.grecaptcha.reset(widgetId);
          }
        }).catch(() => {});
      } catch (e) {
        // Ignore errors
      }
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove spaces, dashes, parentheses
    let formatted = phone.replace(/[\s\-\(\)]/g, '');
    
    // Bangladesh number formatting
    if (formatted.startsWith('01')) {
      formatted = '+880' + formatted.substring(1);
    } else if (formatted.startsWith('1') && formatted.length === 10) {
      formatted = '+880' + formatted;
    } else if (formatted.startsWith('880') && !formatted.startsWith('+880')) {
      formatted = '+' + formatted;
    } else if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }

  /**
   * Mask phone number for display
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length > 8) {
      return phone.substring(0, 5) + '****' + phone.substring(phone.length - 3);
    }
    return phone;
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/invalid-phone-number': 'Invalid phone number format. Please use format: +8801XXXXXXXXX',
      'auth/missing-phone-number': 'Phone number is required',
      'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
      'auth/user-disabled': 'This account has been disabled. Contact support.',
      'auth/invalid-verification-code': 'Invalid OTP code. Please try again.',
      'auth/code-expired': 'OTP has expired. Please request a new one.',
      'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
      'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
      'auth/missing-verification-code': 'Please enter the OTP code',
      'auth/invalid-verification-id': 'Invalid verification. Please start over.',
      'auth/session-expired': 'Session expired. Please start over.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };

    return messages[code] || 'An error occurred. Please try again.';
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      try {
        (this.recaptchaVerifier as RecaptchaVerifier).clear();
      } catch (e) {}
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

// Export singleton instance
export const phoneAuthService = new PhoneAuthService();

// Export types
export type { User };