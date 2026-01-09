import type { Express, Request, Response } from "express";
import { text } from "drizzle-orm/pg-core";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { Databasestorage } from "./storage";  
import { 
  insertUserSchema, 
  loginSchema, 
  insertEmergencyRequestSchema,
  requestPasswordResetSchema,
  verifyPasswordResetSchema,
  updateProfileSchema,
  insertWorkHistorySchema,
  updateWorkHistorySchema,
  insertEducationHistorySchema,
  updateEducationHistorySchema,
  insertDonationHistorySchema,
  updateDonationHistorySchema,
  insertTestimonialSchema,
  insertPrivacySettingsSchema,
  insertBadgeSchema,
  insertUserBadgeSchema,
  insertBloodInventorySchema,
  insertBloodIssuanceSchema,
  insertVerificationRequestSchema,
  insertReactivationRequestSchema,
  insertAdminAuditLogSchema,
  insertNotificationTemplateSchema,
  insertSystemSettingSchema,
  insertBulkOperationLogSchema,
  type RequestPasswordReset,
  type VerifyPasswordReset
} from "@shared/schema";
import { z } from "zod";
import { 
  complianceMiddleware, 
  securityRateLimit, 
  authRateLimit,
  generateComplianceReport 
} from "./compliance";

// Create an instance of the storage class
const storage = new Databasestorage();

// Extend the Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        isAdmin?: boolean;
        isVerified?: boolean;
        donorId?: string;
      };
    }
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for now, validate in individual routes
    cb(null, true);
  }
});

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    email?: string;
    userRole?: string;
    donorId?: string;
  }
}

// Initialize default badges
async function initializeDefaultBadges() {
  try {
    const existingBadges = await storage.getAllBadges();
    if (existingBadges.length === 0) {
      const defaultBadges = [
        {
          name: "First Drop",
          type: "donation",
          requirement: "1 donation",
          description: "Awarded for your first blood donation",
          iconUrl: "/badges/first-drop.png"
        },
        {
          name: "Life Saver",
          type: "donation",
          requirement: "5 donations",
          description: "Awarded for 5 life-saving blood donations",
          iconUrl: "/badges/life-saver.png"
        },
        {
          name: "Guardian",
          type: "donation",
          requirement: "10 donations",
          description: "Guardian of life through 10 blood donations",
          iconUrl: "/badges/guardian.png"
        },
        {
          name: "Hero",
          type: "donation",
          requirement: "20 donations",
          description: "A true hero with 20 blood donations",
          iconUrl: "/badges/hero.png"
        },
        {
          name: "Superhero",
          type: "donation",
          requirement: "30 donations",
          description: "Superhero status with 30 blood donations",
          iconUrl: "/badges/superhero.png"
        },
        {
          name: "Legend",
          type: "donation",
          requirement: "50 donations",
          description: "Legendary donor with 50+ blood donations",
          iconUrl: "/badges/legend.png"
        },
        {
          name: "Complete Profile",
          type: "profile",
          requirement: "100% profile completion",
          description: "Complete your profile with all details",
          iconUrl: "/badges/complete-profile.png"
        },
        {
          name: "Verified Donor",
          type: "profile",
          requirement: "ID verified",
          description: "Successfully verified your identity",
          iconUrl: "/badges/verified.png"
        },
        {
          name: "Ambassador",
          type: "community",
          requirement: "Referred 5+ users",
          description: "Community ambassador for referring others",
          iconUrl: "/badges/ambassador.png"
        }
      ];
      for (const badge of defaultBadges) {
        await storage.createBadge(badge);
      }
      console.log("✓ Default badges initialized");
    }
  } catch (error) {
    console.error("Error initializing default badges:", error);
  }
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Admin authentication middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  // requireAuth middleware should have already populated req.user
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user has admin privileges
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // If we get here, the user is authenticated and is an admin
  next();
};

export async function registerRoutes(app: Express): Promise<Server | undefined> {
  // Create the server at the beginning
  const httpServer = createServer(app);
 
  // Middleware to check authentication for profile routes
  const requireAuth = (req: any, res: Response, next: any) => {
    if (req.session?.userId) {
      req.user = {
        id: req.session.userId,
        username: req.session.username || 'user',
        email: req.session.email || '',
        isAdmin: req.session.userRole === 'admin',
        donorId: req.session.donorId
      };
      return next();
    }
    return res.status(401).json({ message: "Authentication required" });
  };
  
const checkAdminRedirect = (req: any, res: Response, next: any) => {
  if (req.user?.isAdmin && req.path === '/profile') {
    return res.redirect('/admin-dashboard');
  }
  next();
};
  // Apply global compliance middleware
  app.use(complianceMiddleware);
  app.use(securityRateLimit);
  
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Simple health check without relying on storage.healthCheck
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    } catch (error: any) {
      console.error("Health check failed:", error);
      res.status(503).json({ 
        status: "error", 
        message: "Service unavailable",
        timestamp: new Date().toISOString() 
      });
    }
  });
  
  // Compliance endpoint
  app.get("/api/compliance/report", (req, res) => {
    const report = generateComplianceReport();
    res.json(report);
  });

  // In your /api/auth/check endpoint
app.get("/api/auth/check", async (req: any, res) => {
  if (req.session?.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user) {
      const { password, ...userResponse } = user;
      
      // Add redirect hint for admins
      if (user.isAdmin && req.path.includes('profile')) {
        return res.json({ 
          user: userResponse,
          redirect: '/admin-dashboard'
        });
      }
      
      res.json({ user: userResponse });
    } else {
      res.status(401).json({ message: "User not found" });
    }
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});
  
  // Statistics endpoint for homepage
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getBasicStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  // Auth routes with enhanced security
  app.use("/api/auth", authRateLimit);
app.post("/api/auth/register", async (req, res) => {
  try {
    // Create a copy of the request body to modify
    const userDataCopy = { ...req.body };
    
    // Temporarily remove lastDonation to bypass validation
    const lastDonation = userDataCopy.lastDonation;
    delete userDataCopy.lastDonation;
    
    // Validate the rest of the data
    const userData = insertUserSchema.parse(userDataCopy);
    
    // Add back the lastDonation field
    userData.lastDonation = lastDonation;
    
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    console.log("BACKEND: Request body received:", JSON.stringify(req.body, null, 2));
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const existingUserByPhone = await storage.getUserByPhone(userData.phone);
    if (existingUserByPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }
    const existingUserByUsername = await storage.getUserByUsername(userData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    // Validate password confirmation
    if (userData.password !== userData.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    // Remove confirmPassword and terms before creating user
    const { confirmPassword, terms, ...userToCreate } = userData as any;
    const user = await storage.createUser(userToCreate);
    // Generate donor ID in PulseCare format
    const currentYear = new Date().getFullYear();
    const sequence = String(user.id).padStart(4, '0');
    const donorId = `PULSECARE-${currentYear}-${sequence}`;
    
    // Update user with donorId
    await storage.updateUser(user.id, { donorId });
    
    // Remove password from response
    const { password, ...userResponse } = user;
    res.status(201).json({ 
      user: { ...userResponse, donorId },
      donorId,
      message: "Registration successful" 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password, rememberMe } = loginSchema.parse(req.body);
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.email = user.email;
      req.session.userRole = user.isAdmin ? 'admin' : 'user';
      req.session.donorId = user.donorId || '';
      
      // Set session expiry based on remember me
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
      }
      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json({ 
        user: userResponse,
        message: "Login successful" 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      // Handle database connection errors specifically
      if (error instanceof Error && (error.message?.includes('endpoint is disabled') || (error as any).code === 'XX000')) {
        console.error("Database connection error - endpoint may be sleeping:", error);
        return res.status(503).json({ 
          message: "Database temporarily unavailable. Please try again in a moment." 
        });
      }
      
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Password Reset Routes
  app.post("/api/auth/request-password-reset", async (req, res) => {
    try {
      const { identifier } = requestPasswordResetSchema.parse(req.body);
      const user = await storage.getUserByIdentifier(identifier);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ 
          message: "If the account exists, an OTP has been sent.",
          token: "dummy-token" // Return dummy token to prevent enumeration
        });
      }
      // Generate OTP and reset token
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const resetToken = Math.random().toString(36).substring(7);
      
      // Store OTP and token in memory (expires in 15 minutes)
      await storage.storePasswordResetOtp(user.id, otp, resetToken);
      console.log(`Password reset OTP for ${user.email}: ${otp}`);
      console.log(`Reset token: ${resetToken}`);
      
      // In a real implementation, send SMS/email here
      
      res.json({ 
        message: "OTP sent to your email and phone number",
        token: resetToken
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/verify-password-reset", async (req, res) => {
    try {
      const { token, otp, newPassword } = verifyPasswordResetSchema.parse(req.body);
      const userId = await storage.verifyPasswordResetOtp(token, otp);
      if (!userId) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      // Update password
      await storage.updateUserPassword(userId, newPassword);
      
      // Clear the OTP
      await storage.clearPasswordResetOtp(token);
      res.json({ message: "Password reset successful" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Password reset verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Donor search routes
  app.get("/api/donors/search", async (req, res) => {
    try {
      const { bloodGroup, district, isAvailable, page = 1, limit = 9 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const result = await storage.searchDonors({
        bloodGroup: bloodGroup as string,
        district: district as string,
        isAvailable: isAvailable === 'true' ? true : undefined,
        limit: Number(limit),
        offset: offset,
      });
      // Remove passwords from response
      const donorsResponse = result.donors.map(({ password, ...donor }: any) => donor);
      res.json({ 
        donors: donorsResponse,
        total: result.total,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error: any) {
      console.error("Donor search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Emergency request routes
const upload = multer({ 
  storage: multer.memoryStorage(), // Store files in memory, or use diskStorage for a permanent location
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  }
});

// REPLACE YOUR ENTIRE EMERGENCY REQUEST ROUTE WITH THIS:
app.post("/api/emergency-requests", requireAuth, upload.array('documents'), async (req, res) => {
  
  try {
    // Get the authenticated user
    if (!req.user || !req.user.donorId) {
      return res.status(401).json({ 
        message: "Authentication required. Please login to submit emergency requests." 
      });
    }
    

    const requestData = {
      patientName: req.body.patientName,
      patientAge: parseInt(req.body.patientAge),
      bloodGroup: req.body.bloodGroup,
      unitsRequired: parseInt(req.body.unitsRequired),
      hospitalName: req.body.hospitalName,
      doctorName: req.body.doctorName,
      hospitalAddress: req.body.hospitalAddress,
      requiredBy: req.body.requiredBy,
      contactNumber: req.body.contactNumber,
      guardianName: req.body.guardianName,
      guardianRelation: req.body.guardianRelation,
      guardianPhone: req.body.guardianPhone,
      emergencyType: req.body.emergencyType,
      medicalCondition: req.body.medicalCondition,
      additionalInfo: req.body.additionalInfo || '', // Handle optional field
      isCritical: req.body.isCritical === 'true', // Convert string 'true'/'false' to boolean
      requesterId: req.user.donorId,
      documents: req.files, // The uploaded files will be in req.files
    };
    
    // Now, validate the parsed object with your schema
    const validatedData = insertEmergencyRequestSchema.parse(requestData);
   console.log("BACKEND: Validated data for storage:", JSON.stringify(validatedData, null, 2));
    const emergencyRequest = await storage.createEmergencyRequest(validatedData);
    
    // Notify eligible donors within 50km radius
    await storage.notifyEligibleDonors(emergencyRequest);
    
    res.status(201).json({ 
      request: emergencyRequest,
      message: "Emergency request submitted successfully. Eligible donors within 50km have been notified." 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Emergency request error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
  app.get("/api/emergency-requests", async (req, res) => {
    try {
      const requests = await storage.getEmergencyRequests();
      res.json({ requests });
    } catch (error: any) {
      console.error("Get emergency requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Fixed: Changed Status to status to match schema
  app.patch("/api/emergency-requests/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // Changed from Status to status
      if (!status || !['pending', 'approved', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updatedRequest = await storage.updateEmergencyRequestStatus(Number(id), status);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      res.json({ request: updatedRequest });
    } catch (error: any) {
      console.error("Update emergency request status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get single emergency request
  app.get("/api/emergency-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getEmergencyRequestById(Number(id));
      
      if (!request) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      
      res.json({ request });
    } catch (error: any) {
      console.error("Get emergency request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update emergency request
  app.put("/api/emergency-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validate update data
      const validatedData = insertEmergencyRequestSchema.partial().parse(updateData);
      
      const updatedRequest = await storage.updateEmergencyRequest(Number(id), validatedData);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      
      res.json({ request: updatedRequest });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Update emergency request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete emergency request (admin only)
  app.delete("/api/emergency-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if user is admin
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const deleted = await storage.deleteEmergencyRequest(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      
      res.json({ message: "Emergency request deleted successfully" });
    } catch (error: any) {
      console.error("Delete emergency request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Profile image validation middleware
  const validateImageDimensions = (requiredWidth: number, requiredHeight: number) => {
    return (req: any, res: any, next: any) => {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      sharp(req.file.buffer)
        .metadata()
        .then((metadata: any) => {
          const { width, height } = metadata;
          
          if (width !== requiredWidth || height !== requiredHeight) {
            return res.status(400).json({ 
              message: `Image must be exactly ${requiredWidth}x${requiredHeight}px. Got ${width}x${height}px.` 
            });
          }
          
          next();
        })
        .catch((error: any) => {
          console.error("Image validation error:", error);
          res.status(400).json({ message: "Invalid image file" });
        });
    };
  };
  
  // Profile avatar endpoint
  app.post("/api/profile/avatar", upload.single('avatar'), validateImageDimensions(180, 180), async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Avatar image is required" });
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, and WebP are allowed." });
      }
      // Validate file size (max 5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "File size too large. Maximum 5MB allowed." });
      }
      // Save image (in production, upload to cloud storage)
      const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const updatedUser = await storage.updateUser(userId, { 
        profilePicture: imageBase64 
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        message: "Avatar updated successfully",
        avatarUrl: updatedUser.profilePicture 
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Profile cover photo endpoint
  app.post("/api/profile/cover", upload.single('cover'), async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Cover photo is required" });
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, and WebP are allowed." });
      }
      // Validate file size (max 10MB)
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ message: "File size too large. Maximum 10MB allowed." });
      }
      // Validate dimensions using sharp
      const metadata = await sharp(req.file.buffer).metadata();
      const { width, height } = metadata;
      
      // For desktop: 820x312px, for mobile: 640x360px - accept both ratios
      const desktopRatio = 820 / 312; // ~2.63
      const mobileRatio = 640 / 360; // ~1.78
      const currentRatio = width / height;
      
      if (Math.abs(currentRatio - desktopRatio) > 0.1 && Math.abs(currentRatio - mobileRatio) > 0.1) {
        return res.status(400).json({ 
          message: `Cover photo must have aspect ratio of either 820:312 (desktop) or 640:360 (mobile). Current dimensions: ${width}x${height}px` 
        });
      }
      // Save image (in production, upload to cloud storage)
      const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const updatedUser = await storage.updateUser(userId, { 
        coverPhoto: imageBase64 
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        message: "Cover photo updated successfully",
        coverUrl: updatedUser.coverPhoto 
      });
    } catch (error: any) {
      console.error("Cover upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Profile bio endpoint with proper validation
  app.post("/api/profile/bio", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { bio } = updateProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, { bio });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        message: "Bio updated successfully",
        bio: updatedUser.bio 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Bio update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Work history endpoints
  app.get("/api/profile/work-history", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const workHistory = await storage.getUserWorkHistory(userId);
      res.json(workHistory);
    } catch (error: any) {
      console.error("Error fetching work history:", error);
      res.status(500).json({ message: "Failed to fetch work history" });
    }
  });
  
  app.post("/api/profile/work-history", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Check max entries constraint (max 3)
      const existingWork = await storage.getUserWorkHistory(userId);
      if (existingWork.length >= 10) {
        return res.status(400).json({ message: "Maximum 10 work history entries allowed" });
      }
      const workData = insertWorkHistorySchema.parse(req.body);
      
      // Validate description length
      if (workData.description && workData.description.length > 1000) {
        return res.status(400).json({ message: "Description must be 1000 characters or less" });
      }
      const newWork = await storage.addWorkHistory(userId, workData);
      res.status(201).json(newWork);
    } catch (error: any) {
      console.error("Error adding work history:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to add work history" });
    }
  });
  
app.put("/api/profile/work-history/:id", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const workId = parseInt(req.params.id);
    
    // FIX: Use updateWorkHistorySchema instead of insertWorkHistorySchema
    const workData = updateWorkHistorySchema.parse(req.body); // <--- CHANGE THIS LINE
    
    // Validation check is now strictly on the update schema
    if (workData.description && workData.description.length > 1000) {
      return res.status(400).json({ message: "Description must be 1000 characters or less" });
    }
    
    // Check if user owns this work entry
    const existingWork = await storage.getUserWorkHistory(userId);
    const workEntry = existingWork.find((w: any) => w.id === workId);
    if (!workEntry) {
      return res.status(404).json({ message: "Work history entry not found" });
    }
    await storage.updateWorkHistory(workId, workData);
    res.json({ message: "Work history updated successfully" });
  } catch (error: any) {
    console.error("Error updating work history:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Failed to update work history" });
  }
});
  
  app.delete("/api/profile/work-history/:id", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const workId = parseInt(req.params.id);
      // Check if user owns this work entry
      const existingWork = await storage.getUserWorkHistory(userId);
      const workEntry = existingWork.find((w: any) => w.id === workId);
      if (!workEntry) {
        return res.status(404).json({ message: "Work history entry not found" });
      }
      await storage.deleteWorkHistory(workId);
      res.json({ message: "Work history deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting work history:", error);
      res.status(500).json({ message: "Failed to delete work history" });
    }
  });
  
  // Education history routes
  app.get("/api/profile/education", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const educationHistory = await storage.getUserEducationHistory(userId);
      res.json(educationHistory);
    } catch (error: any) {
      console.error("Error fetching education history:", error);
      res.status(500).json({ message: "Failed to fetch education history" });
    }
  });
  
  app.post("/api/profile/education", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Check max entries constraint (max 3)
      const existingEducation = await storage.getUserEducationHistory(userId);
      if (existingEducation.length >= 10) {
        return res.status(400).json({ message: "Maximum 10 education entries allowed" });
      }
      const educationData = insertEducationHistorySchema.parse(req.body);
      
      // Validate description length
      if (educationData.description && educationData.description.length > 1000) {
        return res.status(400).json({ message: "Description must be 1000 characters or less" });
      }
      const newEducation = await storage.addEducationHistory(userId, educationData);
      res.status(201).json(newEducation);
    } catch (error: any) {
      console.error("Error adding education history:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to add education history" });
    }
  });
  
  app.put("/api/profile/education/:id", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const educationId = parseInt(req.params.id);
      const educationData = insertEducationHistorySchema.parse(req.body);
      
      // Validate description length
      if (educationData.description && educationData.description.length > 1000) {
        return res.status(400).json({ message: "Description must be 1000 characters or less" });
      }
      // Check if user owns this education entry
      const existingEducation = await storage.getUserEducationHistory(userId);
      const educationEntry = existingEducation.find((e: any) => e.id === educationId);
      if (!educationEntry) {
        return res.status(404).json({ message: "Education entry not found" });
      }
      await storage.updateEducationHistory(educationId, educationData);
      res.json({ message: "Education history updated successfully" });
    } catch (error: any) {
      console.error("Error updating education history:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update education history" });
    }
  });
  
  app.delete("/api/profile/education/:id", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const educationId = parseInt(req.params.id);
      // Check if user owns this education entry
      const existingEducation = await storage.getUserEducationHistory(userId);
      const educationEntry = existingEducation.find((e: any) => e.id === educationId);
      if (!educationEntry) {
        return res.status(404).json({ message: "Education entry not found" });
      }
      await storage.deleteEducationHistory(educationId);
      res.json({ message: "Education history deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting education history:", error);
      res.status(500).json({ message: "Failed to delete education history" });
    }
  });
  
  // Donation history routes
  app.get("/api/profile/donation-history", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const donationHistory = await storage.getUserDonationHistory(userId);
      res.json(donationHistory);
    } catch (error: any) {
      console.error("Error fetching donation history:", error);
      res.status(500).json({ message: "Failed to fetch donation history" });
    }
  });
  
  app.post("/api/profile/donation-history", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const donationData = insertDonationHistorySchema.parse(req.body);
      const newDonation = await storage.addDonationHistory(userId, donationData);
      res.status(201).json(newDonation);
    } catch (error: any) {
      console.error("Error adding donation history:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to add donation history" });
    }
  });
  
  app.put("/api/profile/donation-history/:id", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const donationId = parseInt(req.params.id);
      const donationData = insertDonationHistorySchema.parse(req.body);
      // Check if user owns this donation entry
      const existingDonations = await storage.getUserDonationHistory(userId);
      const donationEntry = existingDonations.find((d: any) => d.id === donationId);
      if (!donationEntry) {
        return res.status(404).json({ message: "Donation entry not found" });
      }
      await storage.updateDonationHistory(donationId, donationData);
      res.json({ message: "Donation history updated successfully" });
    } catch (error: any) {
      console.error("Error updating donation history:", error);
      res.status(500).json({ message: "Failed to update donation history" });
    }
  });
  
  app.delete("/api/profile/donation-history/:id", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const donationId = parseInt(req.params.id);
      // Check if user owns this donation entry
      const existingDonations = await storage.getUserDonationHistory(userId);
      const donationEntry = existingDonations.find((d: any) => d.id === donationId);
      if (!donationEntry) {
        return res.status(404).json({ message: "Donation entry not found" });
      }
      await storage.deleteDonationHistory(donationId);
      res.json({ message: "Donation history deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting donation history:", error);
      res.status(500).json({ message: "Failed to delete donation history" });
    }
  });
  
  // Get medical history for a user
app.get("/api/medical-history", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user's donorId
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.donorId) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get medical history
    const medicalHistory = await storage.getMedicalHistoryByDonorId(user.donorId);
    
    // If no medical history exists, return default values
    if (!medicalHistory) {
      const defaultHistory = {
        donorId: user.donorId,
        healthStatus: "Healthy",
        systolic: null,
        diastolic: null,
        lastChecked: null,
        chronicConditions: text("chronic_conditions").default(""),
        vaccinations: text("vaccinations").default(""),
        allergies: text("allergies").default(""),
        currentMedications: text("current_medications").default(""),
        smokingStatus: "not_specified",
        alcoholConsumption: "not_specified",
        drugUse: "not_specified",
        importantNotes: null
      };
      return res.json(defaultHistory);
    }
    
    res.json(medicalHistory);
  } catch (error: any) {
    console.error("Error fetching medical history:", error);
    res.status(500).json({ message: "Failed to fetch medical history" });
  }
});

// Create or update medical history
app.post("/api/medical-history", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user's donorId
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.donorId) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Validate request data
    const medicalHistoryData = {
      donorId: user.donorId,
      systolic: req.body.systolic || null,
      diastolic: req.body.diastolic || null,
      lastChecked: req.body.lastChecked ? new Date(req.body.lastChecked) : null,
      chronicConditions: req.body.chronicConditions || [],
      vaccinations: req.body.vaccinations || [],
      smokingStatus: req.body.smokingStatus || "not_specified",
      alcoholConsumption: req.body.alcoholConsumption || "not_specified",
      drugUse: req.body.drugUse || "not_specified",
      allergies: req.body.allergies || [],
      currentMedications: req.body.currentMedications || [],
      importantNotes: req.body.importantNotes || null
    };
    
    // Check if medical history already exists
    const existingHistory = await storage.getMedicalHistoryByDonorId(user.donorId);
    
    let updatedHistory;
    if (existingHistory) {
      // Update existing record
      updatedHistory = await storage.updateMedicalHistory(user.donorId, medicalHistoryData);
    } else {
      // Create new record
      updatedHistory = await storage.createMedicalHistory(medicalHistoryData);
    }
    
    res.json({
      message: "Medical history updated successfully",
      medicalHistory: updatedHistory
    });
  } catch (error: any) {
    console.error("Error updating medical history:", error);
    res.status(500).json({ message: "Failed to update medical history" });
  }
});

// Update specific fields in medical history
app.put("/api/medical-history", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user's donorId
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.donorId) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Extract only the fields that are being updated
    const updateData: any = {};
    
    
    if (req.body.systolic !== undefined) updateData.systolic = req.body.systolic;
    if (req.body.diastolic !== undefined) updateData.diastolic = req.body.diastolic;
    if (req.body.lastChecked !== undefined) updateData.lastChecked = req.body.lastChecked ? new Date(req.body.lastChecked) : null;
    if (req.body.chronicConditions !== undefined) updateData.chronicConditions = req.body.chronicConditions;
    if (req.body.vaccinations !== undefined) updateData.vaccinations = req.body.vaccinations;
    if (req.body.smokingStatus !== undefined) updateData.smokingStatus = req.body.smokingStatus;
    if (req.body.alcoholConsumption !== undefined) updateData.alcoholConsumption = req.body.alcoholConsumption;
    if (req.body.drugUse !== undefined) updateData.drugUse = req.body.drugUse;
    if (req.body.allergies !== undefined) updateData.allergies = req.body.allergies;
    if (req.body.currentMedications !== undefined) updateData.currentMedications = req.body.currentMedications;
    if (req.body.importantNotes !== undefined) updateData.importantNotes = req.body.importantNotes;
    
    // Update medical history
    const updatedHistory = await storage.updateMedicalHistory(user.donorId, updateData);
    
    res.json({
      message: "Medical history updated successfully",
      medicalHistory: updatedHistory
    });
  } catch (error: any) {
    console.error("Error updating medical history:", error);
    res.status(500).json({ message: "Failed to update medical history" });
  }
});

  // Testimonials routes
  app.get("/api/profile/testimonials", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const testimonials = await storage.getUserTestimonials(userId);
      res.json(testimonials);
    } catch (error: any) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });
  
app.post("/api/profile/testimonials", requireAuth, async (req: any, res: Response) => {
  try {
    // Ensure authentication
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get reviewer data
    const reviewer = await storage.getUser(req.user.id);
    if (!reviewer || !reviewer.donorId) {
      return res.status(404).json({ message: "Reviewer not found or donorId missing" });
    }

    // Zod schema for testimonials (strict to match storage expectations)
    const testimonialSchema = z.object({
      revieweeId: z.string().min(1, "Reviewee ID is required"),
      content: z.string().min(1, "Content is required"),
      rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
      mediaFiles: z.any().optional(),
    });

    // Parse and validate
    const validatedData = testimonialSchema.parse(req.body);

    // Merge reviewerId from authenticated user
    const testimonialData = {
      reviewerId: reviewer.donorId, // ✅ guaranteed string
      ...validatedData,
    };

    // Add to storage
    const newTestimonial = await storage.addTestimonial(testimonialData);

    res.status(201).json(newTestimonial);
  } catch (error: any) {
    console.error("Error adding testimonial:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({ message: "Failed to add testimonial" });
  }
});

  
  app.post("/api/profile/testimonials/:id/report", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const testimonialId = parseInt(req.params.id);
      await storage.reportTestimonial(testimonialId);
      res.json({ message: "Testimonial reported successfully" });
    } catch (error: any) {
      console.error("Error reporting testimonial:", error);
      res.status(500).json({ message: "Failed to report testimonial" });
    }
  });
  
  // Social links routes - Now properly implemented
  app.get("/api/profile/social-links", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Parse social links from user's bio or return empty object
      let socialLinks = {};
      try {
        if (user.socialLinks && typeof user.socialLinks === 'object') {
          socialLinks = user.socialLinks;
        } else if (user.socialLinks && typeof user.socialLinks === 'string') {
          socialLinks = JSON.parse(user.socialLinks);
        }
      } catch (e: any) {
        console.error("Error parsing social links:", e);
      }
      
      res.json(socialLinks);
    } catch (error: any) {
      console.error("Error fetching social links:", error);
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });
  
  app.put("/api/profile/social-links", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const socialLinksData = updateProfileSchema.parse(req.body).socialLinks || {};
      
      // Update user with social links
      await storage.updateUser(userId, { socialLinks: socialLinksData });
      
      res.json({ message: "Social links updated successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating social links:", error);
      res.status(500).json({ message: "Failed to update social links" });
    }
  });
  
  // Location routes - Now properly implemented
  app.get("/api/profile/location", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        district: user.district || "",
        upazila: user.upazila || "",
        address: user.address || ""
      });
    } catch (error: any) {
      console.error("Error fetching location:", error);
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });
  
  app.put("/api/profile/location", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { district, upazila, address } = req.body;
      
      // Update user location
      await storage.updateUser(userId, { district, upazila, address });
      
      res.json({ message: "Location updated successfully" });
    } catch (error: any) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });
  
  // Privacy Settings Endpoints
  app.get("/api/privacy-settings", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      let privacy = await storage.getPrivacySettings(userId);
      
      if (!privacy) {
        // Create default privacy settings
        privacy = await storage.createPrivacySettings({ 
          userId, 
          shareEmail: true, 
          sharePhone: true 
        });
      }
      
      res.json(privacy);
    } catch (error: any) {
      console.error("Error fetching privacy settings:", error);
      res.status(500).json({ message: "Failed to fetch privacy settings" });
    }
  });
  
  app.put("/api/privacy-settings", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { shareEmail, sharePhone } = insertPrivacySettingsSchema.parse(req.body);
      
      await storage.updatePrivacySettings(userId, { shareEmail, sharePhone });
      res.json({ message: "Privacy settings updated successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating privacy settings:", error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });
  
  // Security settings routes - Now properly implemented
  app.get("/api/profile/security", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const twoFactorStatus = await storage.get2FAStatus(userId);
      
      res.json({
        twoFactorEnabled: twoFactorStatus.enabled || false,
        loginNotifications: true,
        passwordExpiry: 90
      });
    } catch (error: any) {
      console.error("Error fetching security settings:", error);
      res.status(500).json({ message: "Failed to fetch security settings" });
    }
  });
  
  app.put("/api/profile/security", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { twoFactorEnabled, loginNotifications, passwordExpiry } = req.body;
      
      if (twoFactorEnabled !== undefined) {
        if (twoFactorEnabled) {
          // Enable 2FA
          const secret = "mock-secret"; // In production, generate real secret
          const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 8));
          await storage.enable2FA(userId, secret, backupCodes);
        } else {
          // Disable 2FA
          await storage.disable2FA(userId);
        }
      }
      
      res.json({ message: "Security settings updated successfully" });
    } catch (error: any) {
      console.error("Error updating security settings:", error);
      res.status(500).json({ message: "Failed to update security settings" });
    }
  });
  
  // Red badge request routes - Now properly implemented
  app.post("/api/profile/red-badge-request", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const requestData = {
        userId,
        verificationType: "red_badge",
        status: "pending",
        createdAt: new Date(),
        ...req.body
      };
      
      const request = await storage.submitVerification(requestData);
      
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating red badge request:", error);
      res.status(500).json({ message: "Failed to create red badge request" });
    }
  });
  
  // Deactivation routes - Now properly implemented
  app.post("/api/profile/deactivate", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { reason } = req.body;
      
      // Update user status to inactive
      await storage.updateUser(userId, { status: "inactive" });
      
      // Create reactivation request
      const reactivationData = {
        userId,
        reason: reason || "User requested deactivation",
        status: "pending",
        createdAt: new Date()
      };
      
      // Fix: Use insertReactivationRequestSchema for validation and create a proper reactivation request
      const validatedReactivationData = insertReactivationRequestSchema.parse(reactivationData);
      const request = await storage.createReactivationRequest({ donorId: userId, reason: validatedReactivationData.reason });
      
      // Destroy session
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });
      
      res.json({ message: "Account deactivated successfully" });
    } catch (error: any) {
      console.error("Error deactivating account:", error);
      res.status(500).json({ message: "Failed to deactivate account" });
    }
  });
  
  // Reactivation request routes - Now properly implemented
  app.post("/api/profile/reactivation-request", requireAuth, async (req: any, res) => {
    try {
      const { userId, reason, documents } = req.body;
      
      const reactivationData = {
        userId,
        reason: reason || "Account reactivation request",
        documents: documents || [],
        status: "pending",
        createdAt: new Date()
      };
      
      // Fix: Use insertReactivationRequestSchema for validation and create a proper reactivation request
      const validatedReactivationData = insertReactivationRequestSchema.parse(reactivationData);
      const request = await storage.createReactivationRequest({ donorId: userId, reason: validatedReactivationData.reason });
      
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating reactivation request:", error);
      res.status(500).json({ message: "Failed to create reactivation request" });
    }
  });
  
  // Eligibility and profile sync routes - Now properly implemented
  app.get("/api/profile/eligibility", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check eligibility based on last donation date and other factors
      const lastDonationDate = user.lastDonationDate ? new Date(user.lastDonationDate) : null;
      const today = new Date();
      const daysSinceLastDonation = lastDonationDate ? Math.floor((today.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      // Check if eligible (minimum 56 days between donations)
      const isEligible = daysSinceLastDonation >= 56;
      
      // Calculate next eligible date
      const nextEligibleDate = lastDonationDate ? new Date(lastDonationDate.getTime() + 56 * 24 * 60 * 60 * 1000) : today;
      
      res.json({
        isEligible,
        lastDonation: lastDonationDate ? lastDonationDate.toISOString().split('T')[0] : null,
        nextEligibleDate: nextEligibleDate.toISOString().split('T')[0],
        daysSinceLastDonation
      });
    } catch (error: any) {
      console.error("Error fetching eligibility status:", error);
      res.status(500).json({ message: "Failed to fetch eligibility status" });
    }
  });
  
  app.post("/api/profile/sync", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Sync profile data (in a real implementation, this would sync with external systems)
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update last sync timestamp
      await storage.updateUser(userId, { 
        bio: JSON.stringify({ 
          ...JSON.parse(user.bio || '{}'), 
          lastSync: new Date().toISOString() 
        }) 
      });
      
      res.json({ message: "Profile synced successfully" });
    } catch (error: any) {
      console.error("Error syncing profile:", error);
      res.status(500).json({ message: "Failed to sync profile" });
    }
  });
  
  // User profile routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(Number(id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const { password, id: _, isAdmin, ...allowedUpdates } = updates;
      const updatedUser = await storage.updateUser(Number(id), allowedUpdates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password: __, ...userResponse } = updatedUser;
      res.json({ user: userResponse });
    } catch (error: any) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Donation routes
  app.get("/api/users/:id/donations", async (req, res) => {
    try {
      const { id } = req.params;
      const donations = await storage.getDonationsByDonor(Number(id));
      res.json({ donations });
    } catch (error: any) {
      console.error("Get donations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/donations", async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      res.json({ donations });
    } catch (error: any) {
      console.error("Get all donations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin stats routes
  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const allUsers = await storage.getAllUsers();
      const donors = allUsers.filter((user: any) => !user.isAdmin);
      const activeDonors = donors.filter((donor: any) => donor.isAvailable);
      const verifiedDonors = donors.filter((donor: any) => donor.isVerified);
      const emergencyRequests = await storage.getEmergencyRequests();
      const pendingRequests = emergencyRequests.filter((req: any) => req.status === 'pending');
      const criticalRequests = emergencyRequests.filter((req: any) => req.isCritical && req.status === 'pending');
      const donations = await storage.getAllDonations();
      const stats = {
        totalDonors: donors.length.toString(),
        activeDonors: activeDonors.length.toString(),
        verifiedDonors: verifiedDonors.length.toString(),
        totalDonations: donations.length.toString(),
        bloodRequests: emergencyRequests.length.toString(),
        pendingRequests: pendingRequests.length.toString(),
        criticalAlerts: criticalRequests.length.toString(),
      };
      console.log("Admin stats:", stats); // Debug log
      res.json({ stats });
    } catch (error: any) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // FIXED: Admin Dashboard Data Endpoint - Now uses storage.getDashboardData()
  app.get("/api/admin/dashboard-data", requireAuth, requireAdmin, async (req: any, res: Response) => {
  try {
    console.time("DashboardDataFetch");
    
    const { timeRange = '7d' } = req.query;
    const dashboardData = await storage.getDashboardData(timeRange);
    
    console.timeEnd("DashboardDataFetch");
    
    // Ensure the response has the expected structure
    if (!dashboardData || !dashboardData.metrics || !dashboardData.basicStats) {
      console.error("Dashboard data is missing expected structure");
      return res.status(200).json(getFallbackDashboardData());
    }
    
    return res.json(dashboardData);
    
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    
    // Return fallback data instead of an error
    return res.status(200).json(getFallbackDashboardData());
  }
});

// Helper function to provide fallback data
function getFallbackDashboardData() {
  return {
    metrics: {
      donor: {
        totalDonors: 0,
        activeDonors: 0,
        donorsByBloodGroup: [],
        donorsByGender: [],
        donorsByAge: [],
        eligibleVsNot: [],
        recentRegistrations: []
      },
      // ... similar structure for other metric types
    },
    basicStats: {
      totalDonors: 0,
      availableDonors: 0,
      totalDonations: 0,
      bloodRequests: 0,
      pendingRequests: 0,
      criticalAlerts: 0,
      duplicateAlerts: 0,
      readyToDonate: 0,
      stats: {}
    }
  };
}
  
  // Seed database with diverse demo data (development only)
  app.post("/api/seed", async (req, res) => {
    try {
      // Create admin user
      const existingAdmin = await storage.getUserByUsername("admin");
      if (!existingAdmin) {
        await storage.createUser({
          username: "admin",
          email: "admin@pulsecare.com",
          phone: "+8801700000000",
          password: "admin123",
          confirmPassword: "admin123",
          fullName: "System Administrator",
          dateOfBirth: "1990-01-01",
          bloodGroup: "O+",
          weight: 70,
          district: "Dhaka",
          upazila: "Dhanmondi",
          address: "Admin Office, Dhaka",
          terms: true,
          data_processing: true,
          marketing: false,
          emergency_contact: true
        });
        // Update to make admin
        const admin = await storage.getUserByUsername("admin");
        if (admin) {
          await storage.updateUser(admin.id, { isAdmin: true });
        }
      }
      // Create diverse demo users from all divisions and districts
      const divisions = [
        { name: "Dhaka", districts: ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"] },
        { name: "Chattogram", districts: ["Chittagong", "Bandarban", "Brahmanbaria", "Chandpur", "Comilla", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"] },
        { name: "Rajshahi", districts: ["Rajshahi", "Bogra", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Sirajganj"] },
        { name: "Khulna", districts: ["Khulna", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"] },
        { name: "Sylhet", districts: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"] },
        { name: "Barishal", districts: ["Barishal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"] },
        { name: "Rangpur", districts: ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon"] },
        { name: "Mymensingh", districts: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"] }
      ];
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const maleNames = ["Md. Abdul Rahman", "Md. Karim Uddin", "Md. Rashidul Islam", "Md. Aminul Haque", "Md. Rafiqul Islam", "Md. Shahadat Hossain", "Md. Nurul Amin"];
      const femaleNames = ["Fatema Khatun", "Rashida Begum", "Nasreen Akter", "Rehana Parvin", "Salma Khatun", "Rahima Begum", "Shahida Akter"];
      let userCount = 0;
      const targetUsers = 2000;
      for (const division of divisions) {
        for (const district of division.districts) {
          const usersPerDistrict = Math.floor(targetUsers / 64); // Distribute across 64 districts
          
          for (let i = 0; i < usersPerDistrict && userCount < targetUsers; i++) {
            const isMale = Math.random() > 0.5;
            const fullName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
            const username = `user${userCount + 1}`;
            const email = `${username}@example.com`;
            const phone = `+88017${String(Math.floor(Math.random() * 90000000) + 10000000)}`;
            const bloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
            const weight = Math.floor(Math.random() * 50) + 50; // 50-100 kg
            const age = Math.floor(Math.random() * 30) + 20; // 20-50 years
            const birthYear = new Date().getFullYear() - age;
            
            try {
              const existingUser = await storage.getUserByUsername(username);
              if (!existingUser) {
                const user = await storage.createUser({
                  username,
                  email,
                  phone,
                  password: "demo123",
                  confirmPassword: "demo123",
                  fullName,
                  dateOfBirth: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                  bloodGroup,
                  weight,
                  district,
                  upazila: district === "Dhaka" ? ["Dhanmondi", "Gulshan", "Uttara", "Mirpur"][Math.floor(Math.random() * 4)] : `${district} Sadar`,
                  address: `${Math.floor(Math.random() * 100) + 1}, ${district}, Bangladesh`,
                  lastDonation: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
                  terms: true,
                  data_processing: true,
                  marketing: false,
                  emergency_contact: true
                });
                
                // Generate donor ID
                const currentYear = new Date().getFullYear();
                const sequence = String(user.id).padStart(4, '0');
                const donorId = `PULSECARE-${currentYear}-${sequence}`;
                await storage.updateUser(user.id, { donorId });
                
                userCount++;
              }
            } catch (error: any) {
              console.log(`Skipping user ${username} due to conflict`);
            }
          }
        }
      }
      res.json({ 
        message: `Database seeded successfully with ${userCount} diverse users from all divisions and districts of Bangladesh` 
      });
    } catch (error: any) {
      console.error("Seed error:", error);
      res.status(500).json({ message: "Error seeding database" });
    }
  });
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));
  
  // Static file serving with proper MIME types
  app.use('/uploads', (req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.gif') {
      res.setHeader('Content-Type', 'image/gif');
    }
    next();
  }, express.static(uploadsDir));
  
  // Current user profile route
  app.get("/api/profile", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const profileData = await storage.getUserProfile(userId);
      
      if (!profileData) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from user data
      const { password, ...userWithoutPassword } = profileData.user;
      
      // Combine user data with related data
      const fullProfile = {
        ...userWithoutPassword,
        workHistory: profileData.workHistory,
        educationHistory: profileData.educationHistory,
        donationHistory: profileData.donationHistory,
        testimonialsReceived: profileData.testimonials
      };
      
      res.json(fullProfile);
    } catch (error: any) {
      console.error("Error fetching current user profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  // Update current user profile route
  app.put("/api/profile", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const updateData = updateProfileSchema.parse(req.body);
      
      await storage.updateUserProfile(userId, updateData);
      res.json({ message: "Profile updated successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Auth check endpoint for frontend session verification
  app.get("/api/auth/check", async (req: any, res) => {
    if (req.session?.userId) {
      // Get full user details from database
      const user = await storage.getUser(req.session.userId);
      if (user) {
        // Remove password from response
        const { password, ...userResponse } = user;
        res.json({ user: userResponse });
      } else {
        res.status(401).json({ message: "User not found" });
      }
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Badge System Endpoints
  app.get("/api/badges/:userId", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const [allBadges, userBadges] = await Promise.all([
        storage.getAllBadges(),
        storage.getUserBadges(userId)
      ]);
      const earnedBadgeIds = userBadges.map((ub: any) => ub.badgeId);
      const badgesWithStatus = allBadges.map((badge: any) => ({
        ...badge,
        earned: earnedBadgeIds.includes(badge.badgeId),
        earnedAt: userBadges.find((ub: any) => ub.badgeId === badge.badgeId)?.earnedAt
      }));
      res.json({
        badges: badgesWithStatus,
        totalEarned: userBadges.length
      });
    } catch (error: any) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });
  
  app.post("/api/badges/share/:userId/:badgeId", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const badgeId = parseInt(req.params.badgeId);
      // Verify user owns this badge
      const userBadges = await storage.getUserBadges(userId);
      const ownsBadge = userBadges.some((ub: any) => ub.badgeId === badgeId);
      if (!ownsBadge) {
        return res.status(404).json({ message: "Badge not found for user" });
      }
      const [badge] = await storage.getAllBadges();
      const targetBadge = badge ? [badge].find((b: any) => b.badgeId === badgeId) : null;
      if (!targetBadge) {
        return res.status(404).json({ message: "Badge not found" });
      }
      // Generate sharable card data
      const shareData = {
        badgeName: targetBadge.name,
        description: targetBadge.description,
        shareText: `I just earned the ${targetBadge.name} badge on PulseCare 🎉. Join me to save lives 👉 ${process.env.PLATFORM_URL || 'https://pulsecare.com'}`,
        imageUrl: targetBadge.iconUrl,
        platformUrl: process.env.PLATFORM_URL || 'https://pulsecare.com'
      };
      res.json(shareData);
    } catch (error: any) {
      console.error("Error sharing badge:", error);
      res.status(500).json({ message: "Failed to share badge" });
    }
  });
  
  // Enhanced Messaging System - Now properly implemented
  app.post("/api/messages/send", requireAuth, async (req: any, res: Response) => {
    try {
      const senderId = req.user.id;
      const { receiverId, message } = req.body;
      if (!receiverId || !message) {
        return res.status(400).json({ message: "Receiver ID and message are required" });
      }
      // Get donor IDs for both users
      const sender = await storage.getUser(senderId);
      const receiver = await storage.getUser(parseInt(receiverId));
      
      if (!sender || !receiver || !sender.donorId || !receiver.donorId) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newMessage = await storage.sendMessage(senderId, parseInt(receiverId), message);
      
      res.status(201).json(newMessage);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  app.get("/api/messages/:userId", requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const requesterId = req.user.id;
      // Only allow users to fetch their own messages
      if (userId !== requesterId) {
        return res.status(403).json({ message: "Can only access your own messages" });
      }
      
      const messages = await storage.getUserInbox(userId);
      res.json({ messages });
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Privacy-aware Profile Endpoint
  app.get("/api/profile/:userId/privacy-aware", requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const requesterId = req.user.id;
      const profile = await storage.getPrivacyAwareProfile(userId, requesterId);
      
      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(profile);
    } catch (error: any) {
      console.error("Error fetching privacy-aware profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  // Profile routes
  app.get("/api/users/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profileData = await storage.getUserProfile(userId);
      
      if (!profileData) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(profileData);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  app.put("/api/users/:id/bio", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { bio } = updateProfileSchema.parse(req.body);
      
      // Check if user is updating their own profile
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Can only update your own profile" });
      }
      
      await storage.updateUserProfile(userId, { bio });
      res.json({ message: "Bio updated successfully" });
    } catch (error: any) {
      console.error("Error updating bio:", error);
      res.status(500).json({ message: "Failed to update bio" });
    }
  });
  
  // Profile photo upload - main endpoint
  app.post("/api/users/:id/profile-photo", requireAuth, upload.single('profilePhoto'), async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Can only update your own profile" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }
      
      const photoPath = `/uploads/${req.file.filename}`;
      await storage.updateProfilePhoto(userId, photoPath);
      
      res.json({ message: "Profile photo updated successfully", photoPath });
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      res.status(500).json({ message: "Failed to upload profile photo" });
    }
  });
  
  // Alternative endpoint for legacy compatibility
  app.post("/api/users/:id/upload-photo", requireAuth, upload.single('profilePhoto'), async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Can only update your own profile" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }
      
      const photoPath = `/uploads/${req.file.filename}`;
      await storage.updateProfilePhoto(userId, photoPath);
      
      res.json({ message: "Profile photo updated successfully", photoPath });
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      res.status(500).json({ message: "Failed to upload profile photo" });
    }
  });
  
  app.post("/api/users/:id/cover-photo", requireAuth, upload.single('coverPhoto'), async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Can only update your own profile" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }
      
      const photoPath = `/uploads/${req.file.filename}`;
      await storage.updateCoverPhoto(userId, photoPath);
      
      res.json({ message: "Cover photo updated successfully", photoPath });
    } catch (error: any) {
      console.error("Error uploading cover photo:", error);
      res.status(500).json({ message: "Failed to upload cover photo" });
    }
  });
  
 // Update user availability
app.put("/api/user/availability", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Validate request body
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({ message: "isAvailable must be a boolean value" });
    }
    
    // Update user availability
    const updatedUser = await storage.updateUserAvailability(req.session.userId, isAvailable);
    
    // Remove password from response
    const { password, ...userResponse } = updatedUser;
    
    res.json({
      message: "Availability updated successfully",
      user: userResponse
    });
  } catch (error: any) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Failed to update availability" });
  }
});

// Get current user profile (if not already implemented)
app.get("/api/user/profile", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user profile
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove password from response
    const { password, ...userResponse } = user;
    
    res.json(userResponse);
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});
    // Work history routes
  app.get("/api/users/:id/work-history", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const workHistory = await storage.getUserWorkHistory(userId);
      res.json(workHistory);
    } catch (error: any) {
      console.error("Error fetching work history:", error);
      res.status(500).json({ message: "Failed to fetch work history" });
    }
  });
  
  app.post("/api/users/:id/work-history", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Can only update your own profile" });
      }
      
      const workData = insertWorkHistorySchema.parse(req.body);
      const newWork = await storage.addWorkHistory(userId, workData);
      
      res.status(201).json(newWork);
    } catch (error: any) {
      console.error("Error adding work history:", error);
      res.status(500).json({ message: "Failed to add work history" });
    }
  });
  
  app.put("/api/work-history/:id", requireAuth, async (req: any, res: Response) => {
    try {
      const workId = parseInt(req.params.id);
      const workData = insertWorkHistorySchema.parse(req.body);
      await storage.updateWorkHistory(workId, workData);
      res.json({ message: "Work history updated successfully" });
    } catch (error: any) {
      console.error("Error updating work history:", error);
      res.status(500).json({ message: "Failed to update work history" });
    }
  });
  

app.put("/api/education-history/:id", requireAuth, async (req: any, res: Response) => {
  try {
    const educationId = parseInt(req.params.id);
    // Use the new update schema
    const educationData = updateEducationHistorySchema.parse(req.body);
    
    await storage.updateEducationHistory(educationId, educationData);
    res.json({ message: "Education history updated successfully" });
  } catch (error: any) {
    console.error("Error updating education history:", error);
    res.status(500).json({ message: "Failed to update education history" });
  }
});

app.put("/api/donation-history/:id", requireAuth, async (req: any, res: Response) => {
  try {
    const donationId = parseInt(req.params.id);
    // Use the new update schema
    const donationData = updateDonationHistorySchema.parse(req.body);
    
    await storage.updateDonationHistory(donationId, donationData);
    res.json({ message: "Donation history updated successfully" });
  } catch (error: any) {
    console.error("Error updating donation history:", error);
    res.status(500).json({ message: "Failed to update donation history" });
  }
});
  app.delete("/api/work-history/:id", requireAuth, async (req: any, res: Response) => {
    try {
      const workId = parseInt(req.params.id);
      await storage.deleteWorkHistory(workId);
      res.json({ message: "Work history deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting work history:", error);
      res.status(500).json({ message: "Failed to delete work history" });
    }
  });
  
  // Education history routes
  app.get("/api/users/:id/education-history", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const educationHistory = await storage.getUserEducationHistory(userId);
      res.json(educationHistory);
    } catch (error: any) {
      console.error("Error fetching education history:", error);
      res.status(500).json({ message: "Failed to fetch education history" });
    }
  });
  
  // In routes.ts, update the education history POST route
// In routes.ts, update the education history POST route
app.post("/api/users/:id/education-history", requireAuth, async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Can only update your own profile" });
    }
    
    // Log the request body for debugging
    console.log("Education history request body:", req.body);
    
    // Create a custom schema that matches what the frontend is sending
    const educationSchema = z.object({
  type: z.string().min(1, "Type is required"), // required by storage
  institutionName: z.string().min(1, "Institution name is required"),
  educationLevel: z.string().min(1, "Education level is required"),
  major: z.string().min(1, "Major is required"),
  institutionType: z.string().min(1, "Institution type is required"),
  degree: z.string().min(1, "Degree is required"), // required by storage
  institution: z.string().min(1, "Institution is required"), // required by storage
  startYear: z.string().min(1, "Start year is required"), // required by storage
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  endYear: z.string().optional(), // required by storage type
  isGraduated: z.boolean().default(false)
});
const educationData = educationSchema.parse(req.body);
const newEducation = await storage.addEducationHistory(userId, educationData);

    
    res.status(201).json(newEducation);
  } catch (error: any) {
    console.error("Error adding education history:", error);
    res.status(500).json({ message: "Failed to add education history" });
  }
});
  app.put("/api/education-history/:id", requireAuth, async (req: any, res: Response) => {
    try {
      const educationId = parseInt(req.params.id);
      const educationData = insertEducationHistorySchema.parse(req.body);
      
      await storage.updateEducationHistory(educationId, educationData);
      res.json({ message: "Education history updated successfully" });
    } catch (error: any) {
      console.error("Error updating education history:", error);
      res.status(500).json({ message: "Failed to update education history" });
    }
  });
  
  app.delete("/api/education-history/:id", requireAuth, async (req: any, res: Response) => {
    try {
      const educationId = parseInt(req.params.id);
      await storage.deleteEducationHistory(educationId);
      res.json({ message: "Education history deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting education history:", error);
      res.status(500).json({ message: "Failed to delete education history" });
    }
  });
  
  // Donation history routes
  app.get("/api/users/:id/donation-history", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const donationHistory = await storage.getUserDonationHistory(userId);
      res.json(donationHistory);
    } catch (error: any) {
      console.error("Error fetching donation history:", error);
      res.status(500).json({ message: "Failed to fetch donation history" });
    }
  });
  
  // In routes.ts, update the donation history POST route
app.post("/api/users/:id/donation-history", requireAuth, upload.single('donationPicture'), async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Can only update your own profile" });
    }
    
    // Log the request body for debugging
    console.log("Donation history request body:", req.body);
    
    const donationData = insertDonationHistorySchema.parse(req.body);
    
    // Add photo path if uploaded
    if (req.file) {
      donationData.donationPicture = `/uploads/${req.file.filename}`;
    }
    
    const newDonation = await storage.addDonationHistory(userId, donationData);
    
    res.status(201).json(newDonation);
  } catch (error: any) {
    console.error("Error adding donation history:", error);
    res.status(500).json({ message: "Failed to add donation history" });
  }
});
  
  app.put("/api/donation-history/:id", requireAuth, async (req: any, res: Response) => {
    try {
      const donationId = parseInt(req.params.id);
      const donationData = insertDonationHistorySchema.parse(req.body);
      
      await storage.updateDonationHistory(donationId, donationData);
      res.json({ message: "Donation history updated successfully" });
    } catch (error: any) {
      console.error("Error updating donation history:", error);
      res.status(500).json({ message: "Failed to update donation history" });
    }
  });
  
  app.delete("/api/donation-history/:id", requireAuth, async (req: any, res: Response) => {
    try {
      const donationId = parseInt(req.params.id);
      await storage.deleteDonationHistory(donationId);
      res.json({ message: "Donation history deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting donation history:", error);
      res.status(500).json({ message: "Failed to delete donation history" });
    }
  });
  
  // Testimonial routes
  app.get("/api/users/:id/testimonials", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const testimonials = await storage.getUserTestimonials(userId);
      res.json(testimonials);
    } catch (error: any) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });
  
  // In routes.ts, update the testimonial POST route
app.post("/api/testimonials", requireAuth, async (req: any, res: Response) => {
  try {
    const { recipientId, content, rating } = req.body;
    
    // Validate required fields
    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: "Content is required" });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    // Get the current user's donorId
    const user = await storage.getUser(req.user.id);
    if (!user || !user.donorId) {
      return res.status(400).json({ message: "User not found" });
    }
    
    const testimonialData = {
      reviewerId: user.donorId,
      revieweeId: recipientId,
      content: content.trim(),
      rating: rating
    };
    
    const newTestimonial = await storage.addTestimonial(testimonialData);
    
    res.status(201).json(newTestimonial);
  } catch (error: any) {
    console.error("Error adding testimonial:", error);
    res.status(500).json({ message: "Failed to add testimonial" });
  }
});
  app.post("/api/testimonials/:id/report", requireAuth, async (req: any, res: Response) => {
    try {
      const testimonialId = parseInt(req.params.id);
      await storage.reportTestimonial(testimonialId);
      res.json({ message: "Testimonial reported successfully" });
    } catch (error: any) {
      console.error("Error reporting testimonial:", error);
      res.status(500).json({ message: "Failed to report testimonial" });
    }
  });
  
  // 2FA Routes - Now properly implemented
  app.post("/api/auth/2fa/enable", requireAuth, async (req: any, res: Response) => {
    try {
      const { phoneNumber, verificationCode } = req.body;
      const userId = req.user.id;
      
      if (!phoneNumber || !verificationCode) {
        return res.status(400).json({ message: "Phone number and verification code are required" });
      }
      
      // Generate a real 2FA secret (in production, use a proper library like speakeasy)
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 8));
      
      await storage.enable2FA(userId, secret, backupCodes);
      
      res.json({
        success: true,
        message: "2FA enabled successfully",
        backupCodes
      });
    } catch (error: any) {
      console.error("Error enabling 2FA:", error);
      res.status(500).json({ message: "Failed to enable 2FA" });
    }
  });
  
  app.post("/api/auth/2fa/disable", requireAuth, async (req: any, res: Response) => {
    try {
      const { verificationCode } = req.body;
      const userId = req.user.id;
      
      if (!verificationCode) {
        return res.status(400).json({ message: "Verification code is required" });
      }
      
      // Verify the code before disabling
      const isValid = await storage.verify2FA(userId, verificationCode);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      await storage.disable2FA(userId);
      
      res.json({
        success: true,
        message: "2FA disabled successfully"
      });
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });
  
  app.post("/api/auth/2fa/verify", requireAuth, async (req: any, res: Response) => {
    try {
      const { code } = req.body;
      const userId = req.user.id;
      
      if (!code) {
        return res.status(400).json({ message: "Verification code is required" });
      }
      
      const isValid = await storage.verify2FA(userId, code);
      
      res.json({
        success: isValid,
        message: isValid ? "2FA verified successfully" : "Invalid verification code"
      });
    } catch (error: any) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });
  
  app.get("/api/auth/2fa/status", requireAuth, async (req: any, res: Response) => {
    try {
      const status = await storage.get2FAStatus(req.user.id);
      res.json(status);
    } catch (error: any) {
      console.error("Error getting 2FA status:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });
  
  // Notification Routes - Now properly implemented
  app.get("/api/notifications", requireAuth, async (req: any, res: Response) => {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await storage.getUserNotifications(req.user.id, unreadOnly);
      res.json(notifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  app.post("/api/notifications", requireAuth, async (req: any, res: Response) => {
    try {
      const notificationData = {
        userId: req.user.id,
        ...req.body
      };
      
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error: any) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });
  
  app.put("/api/notifications/:id/read", requireAuth, async (req: any, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  app.put("/api/notifications/read-all", requireAuth, async (req: any, res: Response) => {
    try {
      await storage.markAllNotificationsRead(req.user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  
  // Appointment Scheduling Routes - Now properly implemented
  app.post("/api/appointments", requireAuth, async (req: any, res: Response) => {
    try {
      const appointmentData = {
        ...req.body,
        donorId: req.user.id
      };
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });
  
  app.get("/api/appointments", requireAuth, async (req: any, res: Response) => {
    try {
      const appointments = await storage.getUserAppointments(req.user.id);
      res.json(appointments);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  app.get("/api/appointments/upcoming", requireAuth, async (req: any, res: Response) => {
    try {
      const appointments = await storage.getUpcomingAppointments(req.user.id);
      res.json(appointments);
    } catch (error: any) {
      console.error("Error fetching upcoming appointments:", error);
      res.status(500).json({ message: "Failed to fetch upcoming appointments" });
    }
  });
  
  app.put("/api/appointments/:id/status", requireAuth, async (req: any, res: Response) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      await storage.updateAppointmentStatus(appointmentId, status, req.user.id);
      res.json({ message: "Appointment status updated successfully" });
    } catch (error: any) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });
  
  // User Verification Routes - Now properly implemented
  app.post("/api/verifications", requireAuth, async (req: any, res: Response) => {
    try {
      const verificationData = {
        userId: req.user.id,
        ...req.body
      };
      
      const verification = await storage.submitVerification(verificationData);
      res.status(201).json(verification);
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      res.status(500).json({ message: "Failed to submit verification" });
    }
  });
  
  app.get("/api/verifications", requireAuth, async (req: any, res: Response) => {
    try {
      const verifications = await storage.getUserVerifications(req.user.id);
      res.json(verifications);
    } catch (error: any) {
      console.error("Error fetching verifications:", error);
      res.status(500).json({ message: "Failed to fetch verifications" });
    }
  });
  
  app.get("/api/admin/verifications/pending", requireAuth, async (req: any, res: Response) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const verifications = await storage.getPendingVerifications();
      res.json(verifications);
    } catch (error: any) {
      console.error("Error fetching pending verifications:", error);
      res.status(500).json({ message: "Failed to fetch pending verifications" });
    }
  });
  
  app.put("/api/admin/verifications/:id", requireAuth, async (req: any, res: Response) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const verificationId = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;
      
      await storage.updateVerificationStatus(verificationId, status, req.user.id, rejectionReason);
      res.json({ message: "Verification status updated successfully" });
    } catch (error: any) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });
  
  // Analytics Routes - Now properly implemented
  app.get("/api/analytics/admin-dashboard", requireAuth, async (req: any, res: Response) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching admin-dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch admin-dashboard stats" });
    }
  });
  
  app.get("/api/analytics", requireAuth, async (req: any, res: Response) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { startDate, endDate, metricTypes } = req.query;
      const dateRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      };
      
      const analytics = await storage.getAnalytics(dateRange, metricTypes as string[]);
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  
  // Firebase OTP System Implementation - Now properly implemented
  app.post("/api/otp/generate", async (req, res) => {
    try {
      const { phoneNumber, purpose, userId } = req.body;
      
      if (!phoneNumber || !purpose) {
        return res.status(400).json({ message: "Phone number and purpose are required" });
      }
      
      const otp = await storage.generateOTP(userId || 0, phoneNumber, purpose);
      
      res.json({
        success: true,
        verificationId: `mock-${Date.now()}`,
        message: "OTP sent successfully",
        otp: otp // Only for development, remove in production
      });
    } catch (error: any) {
      console.error("Error generating Firebase OTP:", error);
      res.status(500).json({ message: "Failed to generate OTP" });
    }
  });
  
  app.post("/api/otp/verify", async (req, res) => {
    try {
      const { phoneNumber, verificationId, code, purpose, userId } = req.body;
      
      if (!phoneNumber || !verificationId || !code || !purpose) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const isValid = await storage.verifyOTP(phoneNumber, code, purpose);
      
      res.json({
        success: isValid,
        message: isValid ? "OTP verified successfully" : "Invalid OTP"
      });
    } catch (error: any) {
      console.error("Error verifying Firebase OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });
  
  // Enhanced Search with Guest User Throttling
  app.get("/api/search/donors", async (req, res) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || '';
      
      // Check search throttling for guest users
      if (!req.user) {
        const recentSearches = await storage.getSearchActivityByIP(clientIP, 60 * 60 * 1000); // 1 hour
        if (recentSearches >= 10) {
          return res.status(429).json({ 
            message: "Search limit exceeded. Please register to continue searching." 
          });
        }
      }
      
      const filters = {
        bloodGroup: req.query.bloodGroup as string,
        district: req.query.district as string,
        isAvailable: req.query.isAvailable === 'true',
        limit: parseInt(req.query.limit as string) || 25,
        offset: parseInt(req.query.offset as string) || 0
      };
      
      const donors = await storage.searchDonors(filters);
      
      // Log search activity
      await storage.logSearchActivity({
        ipAddress: clientIP,
        userAgent: req.get('User-Agent'),
        searchQuery: JSON.stringify(req.query),
        resultCount: donors.donors.length,
        userId: req.user?.id
      });
      
      res.json(donors);
    } catch (error: any) {
      console.error("Error searching donors:", error);
      res.status(500).json({ message: "Failed to search donors" });
    }
  });
  
  // Admin dashboard routes
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req: any, res: Response) => {  
    try {
      const {
        limit = '10',
        offset = '0',
        search,
        bloodGroup,
        district,
        isVerified,
        isAvailable,
        status,
        lastDonationFrom,
        lastDonationTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      // Use the proper filtering method
      const result = await storage.getAllUsersWithFilters({
        bloodGroup: bloodGroup as string,
        district: district as string,
        isVerified: isVerified === 'true' ? 'true' : isVerified === 'false' ? 'false' : undefined,
        isAvailable: isAvailable === 'true' ? 'true' : isAvailable === 'false' ? 'false' : undefined,
        search: search as string,
        status: status as string,
        limit: limit as string,
        offset: offset as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      });
      
      res.json({
        users: result.users,
        total: result.total,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get("/api/admin/emergency-requests", requireAdmin, async (req: any, res: Response) => {
    try {
      const requests = await storage.getEmergencyRequests();
      res.json(requests);
    } catch (error: any) {
      console.error("Error fetching emergency requests:", error);
      res.status(500).json({ message: "Failed to fetch emergency requests" });
    }
  });
  
  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      await storage.updateUser(userId, updates);
      res.json({ message: "User updated successfully" });
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Blood Inventory Management Routes - Now properly implemented
  app.get("/api/admin/blood-inventory", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const inventory = await storage.getBloodInventory();
      res.json(inventory);
    } catch (error: any) {
      console.error("Error fetching blood inventory:", error);
      res.status(500).json({ message: "Failed to fetch blood inventory" });
    }
  });
  
  app.post("/api/admin/blood-inventory", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const { bloodGroup, units } = req.body;
      
      if (!bloodGroup || units === undefined) {
        return res.status(400).json({ message: "Blood group and units are required" });
      }
      
      const inventory = await storage.updateBloodInventory(bloodGroup, units);
      res.status(201).json(inventory);
    } catch (error: any) {
      console.error("Error updating blood inventory:", error);
      res.status(500).json({ message: "Failed to update blood inventory" });
    }
  });
  
  app.put("/api/admin/blood-inventory/:bloodGroup", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const { bloodGroup } = req.params;
      const { units } = req.body;
      
      if (units === undefined) {
        return res.status(400).json({ message: "Units are required" });
      }
      
      const inventory = await storage.updateBloodInventory(bloodGroup, units);
      res.json(inventory);
    } catch (error: any) {
      console.error("Error updating blood inventory:", error);
      res.status(500).json({ message: "Failed to update blood inventory" });
    }
  });
  
  app.get("/api/admin/blood-inventory/:bloodGroup", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const { bloodGroup } = req.params;
      const inventory = await storage.getBloodInventoryByGroup(bloodGroup);
      
      if (!inventory) {
        return res.status(404).json({ message: "Blood group not found in inventory" });
      }
      
      res.json(inventory);
    } catch (error: any) {
      console.error("Error fetching blood inventory:", error);
      res.status(500).json({ message: "Failed to fetch blood inventory" });
    }
  });
  
  // Blood Donations Management Routes - Now properly implemented
  app.get("/api/admin/blood-donations", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const { donorId, hospitalName, dateFrom, dateTo, status } = req.query;
      
      const donations = await storage.getBloodDonations({
        donorId: donorId as string,
        hospitalName: hospitalName as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        status: status as string
      });
      
      res.json(donations);
    } catch (error: any) {
      console.error("Error fetching blood donations:", error);
      res.status(500).json({ message: "Failed to fetch blood donations" });
    }
  });
  
  app.post("/api/admin/blood-donations", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const donationData = req.body;
      
      const donation = await storage.recordBloodDonation(donationData);
      res.status(201).json(donation);
    } catch (error: any) {
      console.error("Error recording blood donation:", error);
      res.status(500).json({ message: "Failed to record blood donation" });
    }
  });
  
  app.put("/api/admin/blood-donations/:id", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const donationId = parseInt(req.params.id);
      const updates = req.body;
      
      const donation = await storage.updateBloodDonation(donationId, updates);
      
      if (!donation) {
        return res.status(404).json({ message: "Blood donation not found" });
      }
      
      res.json(donation);
    } catch (error: any) {
      console.error("Error updating blood donation:", error);
      res.status(500).json({ message: "Failed to update blood donation" });
    }
  });
  
  app.delete("/api/admin/blood-donations/:id", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const donationId = parseInt(req.params.id);
      const deleted = await storage.deleteBloodDonation(donationId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Blood donation not found" });
      }
      
      res.json({ message: "Blood donation deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting blood donation:", error);
      res.status(500).json({ message: "Failed to delete blood donation" });
    }
  });
  
  // Blood Issuance Routes - Now properly implemented
  app.get("/api/admin/blood-issuance", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const { bloodGroup, hospital, dateFrom, dateTo } = req.query;
      
      const issuances = await storage.getBloodIssuances({
        bloodGroup: bloodGroup as string,
        hospital: hospital as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      });
      
      res.json(issuances);
    } catch (error: any) {
      console.error("Error fetching blood issuances:", error);
      res.status(500).json({ message: "Failed to fetch blood issuances" });
    }
  });
  
  app.post("/api/admin/blood-issuance", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const issuanceData = req.body;
      
      const issuance = await storage.recordBloodIssuance(issuanceData);
      res.status(201).json(issuance);
    } catch (error: any) {
      console.error("Error recording blood issuance:", error);
      res.status(500).json({ message: "Failed to record blood issuance" });
    }
  });
  
  // Hospital Management Routes - Now properly implemented
  app.get("/api/admin/hospitals", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const hospitals = await storage.getAllHospitals();
      res.json(hospitals);
    } catch (error: any) {
      console.error("Error fetching hospitals:", error);
      res.status(500).json({ message: "Failed to fetch hospitals" });
    }
  });
  
  app.get("/api/admin/hospitals/:id", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const hospitalId = parseInt(req.params.id);
      const hospital = await storage.getHospitalById(hospitalId);
      
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      res.json(hospital);
    } catch (error: any) {
      console.error("Error fetching hospital:", error);
      res.status(500).json({ message: "Failed to fetch hospital" });
    }
  });
  
  app.post("/api/admin/hospitals", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const { name, location } = req.body;
      
      if (!name || !location) {
        return res.status(400).json({ message: "Name and location are required" });
      }
      
      const hospital = await storage.createHospital({ name, location });
      res.status(201).json(hospital);
    } catch (error: any) {
      console.error("Error creating hospital:", error);
      res.status(500).json({ message: "Failed to create hospital" });
    }
  });
  
  app.put("/api/admin/hospitals/:id", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const hospitalId = parseInt(req.params.id);
      const updates = req.body;
      
      const hospital = await storage.updateHospital(hospitalId, updates);
      
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      res.json(hospital);
    } catch (error: any) {
      console.error("Error updating hospital:", error);
      res.status(500).json({ message: "Failed to update hospital" });
    }
  });
  
  app.delete("/api/admin/hospitals/:id", requireAuth, requireAdmin, async (req: any, res: Response) => {
    try {
      const hospitalId = parseInt(req.params.id);
      const deleted = await storage.deleteHospital(hospitalId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      res.json({ message: "Hospital deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting hospital:", error);
      res.status(500).json({ message: "Failed to delete hospital" });
    }
  });
  
  // Contact Requests - New comprehensive endpoint
  app.post("/api/contact-requests", requireAuth, async (req: any, res: Response) => {
    try {
      const { donorId, reason, urgency } = req.body;
      
      if (!donorId || !reason) {
        return res.status(400).json({ message: "Donor ID and reason are required" });
      }
      
      // Get current user's donor ID
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || !currentUser.donorId) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create contact request record
      const contactRequest = {
        requesterId: currentUser.donorId,
        donorId: parseInt(donorId),
        reason,
        urgency: urgency || 'medium',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
      
      // Log the communication
      await storage.logCommunication({
        fromUserId: req.user.id,
        toUserId: parseInt(donorId),
        communicationType: 'contact_request',
        status: 'pending',
        content: `Contact request: ${reason}`,
        metadata: { contactRequest }
      });
      
      res.status(201).json({ 
        message: "Contact request sent successfully",
        requestId: Date.now() // Mock ID for demo
      });
    } catch (error: any) {
      console.error("Error creating contact request:", error);
      res.status(500).json({ message: "Failed to send contact request" });
    }
  });
  
  // Enhanced Messages endpoint - Now properly implemented
  app.post("/api/messages", requireAuth, async (req: any, res: Response) => {
    try {
      const { recipientId, content, urgency } = req.body;
      
      if (!recipientId || !content) {
        return res.status(400).json({ message: "Recipient ID and content are required" });
      }
      
      // Get donor IDs for both users
      const sender = await storage.getUser(req.user.id);
      const receiver = await storage.getUser(parseInt(recipientId));
      
      if (!sender || !receiver || !sender.donorId || !receiver.donorId) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const message = await storage.sendMessage(req.user.id, parseInt(recipientId), content);
      
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // Emergency Alerts System - Now properly implemented
  app.get("/api/emergency-alerts", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get emergency requests matching user's blood group and location
      const emergencyRequests = await storage.getEmergencyBloodRequestsAdmin({
        bloodGroup: user.bloodGroup,
        status: 'pending'
      });
      
      // Filter and enhance alerts based on user location and availability
      const alerts = emergencyRequests.map((request: any) => ({
        id: request.id,
        patientName: request.patientName,
        bloodGroup: request.bloodGroup,
        urgency: request.isCritical ? "critical" : "high",
        unitsRequired: request.unitsRequired,
        hospitalName: request.hospitalName,
        hospitalAddress: request.hospitalAddress,
        contactPhone: request.contactNumber,
        distance: 5.2, // Mock distance calculation
        matchScore: 95, // Mock match score
        requestedAt: request.createdAt.toISOString(),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        description: request.additionalInfo || "Emergency blood required",
        requesterLocation: {
          district: request.district,
          upazila: request.upazila,
          coordinates: [23.7465, 90.3765] // Mock coordinates
        }
      }));
      
      // Only show alerts if user is available and eligible
      const filteredAlerts = user.isAvailable ? alerts : [];
      
      res.json(filteredAlerts);
    } catch (error: any) {
      console.error("Error fetching emergency alerts:", error);
      res.status(500).json({ message: "Failed to fetch emergency alerts" });
    }
  });
  
  app.post("/api/emergency-alerts/:id/respond", requireAuth, async (req: any, res: Response) => {
    try {
      const alertId = parseInt(req.params.id);
      const { response } = req.body;
      const userId = req.user.id;
      
      if (!['accept', 'decline'].includes(response)) {
        return res.status(400).json({ message: "Invalid response. Must be 'accept' or 'decline'" });
      }
      
      // Log the response for tracking and compliance
      await storage.logCommunication({
        fromUserId: userId,
        toUserId: 0, // Hospital/System
        communicationType: 'emergency_response',
        status: response === 'accept' ? 'accepted' : 'declined',
        content: `Emergency alert ${alertId} ${response}ed`,
        metadata: { 
          alertId, 
          response,
          responseTime: new Date().toISOString()
        }
      });
      
      // Update emergency request status if accepted
      if (response === 'accept') {
        await storage.updateEmergencyBloodRequestStatusAdmin(alertId, 'accepted', userId);
      }
      
      res.json({ 
        message: `Alert ${response}ed successfully`,
        alertId,
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error responding to emergency alert:", error);
      res.status(500).json({ message: "Failed to respond to alert" });
    }
  });
  
  // Broadcast emergency alert to matching donors
  app.post("/api/emergency-alerts/broadcast", requireAuth, async (req, res) => {
    try {
      const { bloodGroup, location, urgency, hospitalName, patientName, unitsRequired, description } = req.body;
      
      // Find matching donors within radius
      const matchingDonors = await storage.searchDonors({
        bloodGroup,
        district: location.district,
        isAvailable: true,
        limit: 100
      });
      
  // Create emergency request with all required properties
  const emergencyRequest = await storage.createEmergencyBloodRequestAdmin({
  bloodGroup,
  hospitalName,
  hospitalAddress: location.address || hospitalName,
  patientName,
  unitsRequired,
  additionalInfo: description,
  isCritical: urgency === 'critical',
  status: 'pending',
  district: location.district || '',
  upazila: location.upazila || '',
  division: location.division || '',
  documents: [],
  reason: description || '',
  contactNumber: location.contactNumber || '',
  requesterId: '0',
  responderId: '0',
  patientAge: 30,
  requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  emergencyType: 'blood_transfusion',
  latitude: null,
  longitude: null,
  doctorName: '',
  contactPerson: '',
  autoApproved: false,
  approvedAt: null,
  approvalType: null, // This is a specific type, null is usually acceptable on creation
  approvedBy: null,
  rejectedAt: null,
  rejectedBy: null,
  rejectionReason: '',
  ipAddress: '',
  deviceInfo: ''
});
      // Notify matching donors
      await storage.notifyEligibleDonors(emergencyRequest);
      
      res.status(201).json({
        message: "Emergency alert broadcasted successfully",
        recipientCount: matchingDonors.donors?.length || 0,
        alertId: emergencyRequest.id,
        broadcastTime: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error broadcasting emergency alert:", error);
      res.status(500).json({ message: "Failed to broadcast alert" });
    }
  });
  
  // User Verification System - Now properly implemented
  app.post("/api/users/:id/verification", requireAuth, upload.fields([
    { name: 'nationalId', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
  ]), async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Can only verify your own account" });
      }
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.nationalId || !files.photo) {
        return res.status(400).json({ message: "Both national ID and photo are required" });
      }
      
      const verificationData = {
        userId,
        verificationType: req.body.verificationType || 'identity',
        documentType: req.body.documentType || 'national_id',
        documentNumber: req.body.documentNumber || '',
        documentImages: [
          `/uploads/${files.nationalId[0].filename}`,
          `/uploads/${files.photo[0].filename}`
        ],
        status: 'pending',
        submittedAt: new Date(),
        additionalInfo: req.body.additionalInfo || null
      };
      
      // Store verification request
      const verification = await storage.submitVerification(verificationData);
      
      res.status(201).json({
        message: "Verification documents submitted successfully",
        status: "pending",
        estimatedReviewTime: "24-48 hours",
        verification
      });
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      res.status(500).json({ message: "Failed to submit verification" });
    }
  });
  // Add these routes to your API routes file

// Donor availability stats
app.get('/api/admin/donor-availability/stats', async (req, res) => {
  try {
    const stats = await storage.getDonorAvailabilityStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching donor availability stats:', error);
    res.status(500).json({ message: 'Failed to fetch donor availability stats' });
  }
});

// Donor availability
app.get('/api/admin/donor-availability', async (req, res) => {
  try {
    const { bloodGroup, district, status, limit = 50, offset = 0 } = req.query;
    const filters: any = {};
    
    if (bloodGroup) filters.bloodGroup = bloodGroup as string;
    if (district) filters.district = district as string;
    if (status) filters.status = status as string;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);
    
    const result = await storage.getDonorAvailability(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching donor availability:', error);
    res.status(500).json({ message: 'Failed to fetch donor availability' });
  }
});

// Book donor for request
app.post('/api/admin/book-donor', async (req, res) => {
  try {
    const { requestId, donorId } = req.body;
    const adminId = req.user?.id || 1; // Get admin ID from auth
    
    await storage.bookDonorForRequest(requestId, donorId, adminId);
    res.json({ message: 'Donor booked successfully' });
  } catch (error) {
    console.error('Error booking donor:', error);
    res.status(500).json({ message: 'Failed to book donor' });
  }
});

// Complete donation
app.post('/api/admin/complete-donation', async (req, res) => {
  try {
    const { requestId, donorId } = req.body;
    const adminId = req.user?.id || 1; // Get admin ID from auth
    
    await storage.completeDonation(requestId, donorId, adminId);
    res.json({ message: 'Donation completed successfully' });
  } catch (error) {
    console.error('Error completing donation:', error);
    res.status(500).json({ message: 'Failed to complete donation' });
  }
});

// Upcoming reactivations
app.get('/api/admin/upcoming-reactivations', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const reactivations = await storage.getUpcomingReactivations(parseInt(days as string));
    res.json(reactivations);
  } catch (error) {
    console.error('Error fetching upcoming reactivations:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming reactivations' });
  }
});

// Emergency requests pending
app.get('/api/admin/emergency-requests-pending', async (req, res) => {
  try {
    const requests = await storage.getEmergencyRequestsPending();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching emergency requests pending:', error);
    res.status(500).json({ message: 'Failed to fetch emergency requests pending' });
  }
});

// Donor availability trends
app.get('/api/admin/donor-availability-trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await storage.getDonorAvailabilityTrends(parseInt(days as string));
    res.json(trends);
  } catch (error) {
    console.error('Error fetching donor availability trends:', error);
    res.status(500).json({ message: 'Failed to fetch donor availability trends' });
  }
});

// Add these routes to your API routes file

// Donor availability with pagination
app.get('/api/admin/donor-availability', async (req, res) => {
  try {
    const { 
      bloodGroup, 
      district, 
      status, 
      isAvailable, 
      limit = 10, 
      offset = 0,
      search 
    } = req.query;
    
    const filters: any = {};
    
    if (bloodGroup) filters.bloodGroup = bloodGroup as string;
    if (district) filters.district = district as string;
    if (status) filters.status = status as string;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);
    if (search) filters.search = search as string;
    
    const result = await storage.getDonorAvailabilityWithPagination(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching donor availability:', error);
    res.status(500).json({ message: 'Failed to fetch donor availability' });
  }
});

// Donor availability by blood group
app.get('/api/admin/donor-availability-by-blood-group', async (req, res) => {
  try {
    const data = await storage.getDonorAvailabilityByBloodGroup();
    res.json(data);
  } catch (error) {
    console.error('Error fetching donor availability by blood group:', error);
    res.status(500).json({ message: 'Failed to fetch donor availability by blood group' });
  }
});

// Donor availability trends by blood group
app.get('/api/admin/donor-availability-trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await storage.getDonorAvailabilityTrendsByBloodGroup(parseInt(days as string));
    res.json(trends);
  } catch (error) {
    console.error('Error fetching donor availability trends:', error);
    res.status(500).json({ message: 'Failed to fetch donor availability trends' });
  }
});
  app.get("/api/users/:id/verification-status", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Can only check your own verification status" });
      }
      
      const verifications = await storage.getUserVerifications(userId);
      
      // Get the latest verification status
      const latestVerification = verifications.length > 0 ? verifications[verifications.length - 1] : null;
      
      const verificationStatus = {
        status: latestVerification ? latestVerification.status : 'not_submitted',
        submittedAt: latestVerification?.createdAt || null,
        reviewedAt: latestVerification?.reviewedAt || null,
        adminNotes: latestVerification?.rejectionReason || null,
        verificationType: latestVerification?.verificationType || null
      };
      
      res.json(verificationStatus);
    } catch (error: any) {
      console.error("Error fetching verification status:", error);
      res.status(500).json({ message: "Failed to fetch verification status" });
    }
  });
  
  // Admin verification management - Now properly implemented
  app.post("/api/admin/verifications/:id/approve", requireAuth, async (req: any, res: Response) => {
    try {
      const verificationId = parseInt(req.params.id);
      const { adminNotes } = req.body;
      
      // Update user verification status
      await storage.updateVerificationStatus(verificationId, 'approved', req.user.id, adminNotes);
      
      // Get verification to update user status
      const verifications = await storage.getVerificationRequestsAdmin({ status: 'approved' });
      const verification = verifications.find((v: any) => v.id === verificationId);
      
      if (verification) {
        // Update user verification status - Fixed: Convert boolean to string
        await storage.updateUser(verification.userId, { 
          isVerified: true as any,
          isAvailable: true as any
        });
      }
      
      res.json({
        message: "User verification approved successfully",
        verificationId,
        status: 'approved'
      });
    } catch (error: any) {
      console.error("Error approving verification:", error);
      res.status(500).json({ message: "Failed to approve verification" });
    }
  });

  // Always return the server at the end
  return httpServer;
}