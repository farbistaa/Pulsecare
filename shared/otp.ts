// OTP (One-Time Password) system for secure operations
// Implements 6-digit numeric OTPs with expiration and rate limiting

export interface OTPRequest {
  identifier: string; // phone number or email
  purpose: 'registration' | 'login' | 'password_reset' | 'profile_update' | 'sensitive_operation' | 'emergency_verification';
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface OTPVerification {
  identifier: string;
  code: string;
  purpose: string;
  userId?: number;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds until expiration
  rateLimitReset?: number; // seconds until rate limit resets
}

// OTP configuration based on purpose
export const OTP_CONFIG = {
  registration: {
    length: 6,
    expiryMinutes: 10,
    maxAttempts: 3,
    rateLimitMinutes: 1, // 1 minute between requests
    maxDailyRequests: 10
  },
  login: {
    length: 6,
    expiryMinutes: 5,
    maxAttempts: 3,
    rateLimitMinutes: 2,
    maxDailyRequests: 10
  },
  password_reset: {
    length: 6,
    expiryMinutes: 15,
    maxAttempts: 3,
    rateLimitMinutes: 1,
    maxDailyRequests: 5
  },
  profile_update: {
    length: 6,
    expiryMinutes: 10,
    maxAttempts: 3,
    rateLimitMinutes: 2,
    maxDailyRequests: 5
  },
  sensitive_operation: {
    length: 8,
    expiryMinutes: 5,
    maxAttempts: 2,
    rateLimitMinutes: 5,
    maxDailyRequests: 3
  },
  emergency_verification: {
    length: 4,
    expiryMinutes: 30,
    maxAttempts: 5,
    rateLimitMinutes: 0, // No rate limit for emergencies
    maxDailyRequests: 50
  }
} as const;

// Generate OTP code
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  
  return otp;
}

// Validate identifier format
export function validateIdentifier(identifier: string, type: 'phone' | 'email'): boolean {
  if (type === 'phone') {
    // Bangladesh phone number format: +880 followed by 10 digits
    const phoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    return phoneRegex.test(identifier.replace(/[\s\-]/g, ''));
  } else if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(identifier);
  }
  
  return false;
}

// Normalize identifier (remove spaces, dashes, etc.)
export function normalizeIdentifier(identifier: string): string {
  // For phone numbers, remove spaces, dashes, and standardize format
  if (/^\+?880|^0?1[3-9]/.test(identifier)) {
    let phone = identifier.replace(/[\s\-\(\)]/g, '');
    
    // Convert to international format
    if (phone.startsWith('01')) {
      phone = '+880' + phone.substring(1);
    } else if (phone.startsWith('1') && phone.length === 10) {
      phone = '+880' + phone;
    } else if (phone.startsWith('880') && !phone.startsWith('+880')) {
      phone = '+' + phone;
    }
    
    return phone;
  }
  
  // For emails, convert to lowercase and trim
  if (identifier.includes('@')) {
    return identifier.toLowerCase().trim();
  }
  
  return identifier;
}

// Check if OTP is expired
export function isOTPExpired(createdAt: Date, expiryMinutes: number): boolean {
  const now = new Date();
  const expiryTime = new Date(createdAt.getTime() + (expiryMinutes * 60 * 1000));
  return now > expiryTime;
}

// Generate secure OTP message based on purpose
export function generateOTPMessage(otp: string, purpose: string): string {
  const messages = {
    registration: `Welcome to PulseCare! Your verification code is ${otp}. This code will expire in 10 minutes. Never share this code with anyone.`,
    login: `Your PulseCare login verification code is ${otp}. This code will expire in 5 minutes. If you didn't request this, please ignore.`,
    password_reset: `Your PulseCare password reset code is ${otp}. This code will expire in 15 minutes. If you didn't request this, please secure your account.`,
    profile_update: `Your PulseCare profile update verification code is ${otp}. This code will expire in 10 minutes.`,
    sensitive_operation: `PulseCare Security Alert: Your verification code is ${otp}. This code will expire in 5 minutes. Only use this for the operation you initiated.`,
    emergency_verification: `EMERGENCY: PulseCare verification code ${otp}. Valid for 30 minutes. This is for emergency blood request verification.`
  };
  
  return messages[purpose as keyof typeof messages] || 
         `Your PulseCare verification code is ${otp}. Keep this code secure and don't share it with anyone.`;
}

// Rate limiting helper functions
export function getRateLimitKey(identifier: string, purpose: string): string {
  return `otp_rate_limit:${purpose}:${normalizeIdentifier(identifier)}`;
}

export function getDailyLimitKey(identifier: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `otp_daily_limit:${today}:${normalizeIdentifier(identifier)}`;
}

// Security logging for OTP operations
export interface OTPSecurityLog {
  identifier: string;
  purpose: string;
  action: 'generated' | 'verified' | 'failed' | 'expired' | 'rate_limited';
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  attempts?: number;
  metadata?: Record<string, any>;
}

export function createSecurityLog(
  identifier: string,
  purpose: string,
  action: OTPSecurityLog['action'],
  success: boolean,
  metadata?: Record<string, any>
): OTPSecurityLog {
  return {
    identifier: normalizeIdentifier(identifier),
    purpose,
    action,
    success,
    timestamp: new Date(),
    metadata: {
      ...metadata,
      // Add additional security context
      identifierType: identifier.includes('@') ? 'email' : 'phone'
    }
  };
}

// Fraud detection patterns
export function detectSuspiciousActivity(logs: OTPSecurityLog[]): {
  isSuspicious: boolean;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  const reasons: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  // Check for rapid requests from same identifier
  const recentLogs = logs.filter(log => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return log.timestamp > fiveMinutesAgo;
  });
  
  if (recentLogs.length > 10) {
    reasons.push('Excessive OTP requests in short timeframe');
    riskLevel = 'high';
  }
  
  // Check for multiple failed verification attempts
  const failedAttempts = logs.filter(log => 
    log.action === 'failed' && 
    log.timestamp > new Date(Date.now() - 15 * 60 * 1000)
  ).length;
  
  if (failedAttempts > 5) {
    reasons.push('Multiple failed verification attempts');
    riskLevel = riskLevel === 'high' ? 'critical' : 'high';
  }
  
  // Check for requests from multiple IP addresses
  const uniqueIPs = new Set(recentLogs.map(log => log.metadata?.ipAddress).filter(Boolean));
  if (uniqueIPs.size > 3) {
    reasons.push('Requests from multiple IP addresses');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }
  
  const isSuspicious = reasons.length > 0;
  
  return {
    isSuspicious,
    reasons,
    riskLevel
  };
}

// Compliance and audit helpers
export function getOTPAuditTrail(identifier: string, purpose: string): {
  identifier: string;
  purpose: string;
  requestedAt: Date;
  expiresAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  attempts: number;
  ipAddresses: string[];
} {
  // This would be implemented with actual database queries
  // For now, returning a type-safe structure
  return {
    identifier: normalizeIdentifier(identifier),
    purpose,
    requestedAt: new Date(),
    expiresAt: new Date(),
    verified: false,
    attempts: 0,
    ipAddresses: []
  };
}

// GDPR compliance - data retention
export function shouldRetainOTPData(log: OTPSecurityLog): boolean {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Retain fraud/security related logs for longer
  if (log.action === 'failed' || log.metadata?.suspicious) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return log.timestamp > ninetyDaysAgo;
  }
  
  // Regular OTP logs - 30 days retention
  return log.timestamp > thirtyDaysAgo;
}